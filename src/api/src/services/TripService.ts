/**
 * Trip service for managing trips in Cosmos DB
 */

import { CosmosClient, Container, SqlQuerySpec } from '@azure/cosmos';
import { randomUUID } from 'crypto';
import { Trip, TripStatus, ChecklistItem, DEFAULT_TRIP_CHECKLIST } from '../models/Trip';
import { TravelSegment, TravelSegmentType, FlightDetails, DriveDetails, Accommodation, JumpType } from '../models/TravelSegment';
import { TripSummaryDTO, TripDetailDTO, toTripSummaryDTO, toTripDetailDTO, CreateTripDTO } from '../dtos/TripDTO';

/**
 * Query options for listing trips
 */
export interface TripQueryOptions {
  userId: string; // Required - partition key
  status?: TripStatus; // Filter by status
  page?: number; // Page number (1-based)
  pageSize?: number; // Results per page
}

/**
 * Trip service for Cosmos DB operations
 */
export class TripService {
  private container: Container;

  constructor(cosmosClient: CosmosClient, databaseName: string) {
    const database = cosmosClient.database(databaseName);
    this.container = database.container('trips');
  }

  /**
   * Get trip by ID
   * 
   * @param tripId - Trip ID
   * @param userId - User ID (partition key)
   * @returns Trip object or null if not found
   */
  async getTripById(tripId: string, userId: string): Promise<Trip | null> {
    try {
      const { resource } = await this.container.item(tripId, userId).read<Trip>();
      return resource || null;
    } catch (error: any) {
      if (error.code === 404) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Get trip detail DTO by ID
   * 
   * @param tripId - Trip ID
   * @param userId - User ID (partition key)
   * @returns Trip detail DTO or null if not found
   */
  async getTripDetail(tripId: string, userId: string): Promise<TripDetailDTO | null> {
    const trip = await this.getTripById(tripId, userId);
    if (!trip) {
      return null;
    }
    return toTripDetailDTO(trip);
  }

  /**
   * List trips for a user with optional filtering
   * 
   * @param options - Query options for filtering and pagination
   * @returns Array of trip summary DTOs and pagination info
   */
  async listTrips(options: TripQueryOptions): Promise<{
    trips: TripSummaryDTO[];
    totalCount: number;
    page: number;
    pageSize: number;
  }> {
    const page = options.page || 1;
    const pageSize = options.pageSize || 30;
    const offset = (page - 1) * pageSize;

    // Build query - note that we're querying within a single partition (userId)
    let queryText = 'SELECT * FROM c WHERE c.userId = @userId';
    const parameters: any[] = [
      { name: '@userId', value: options.userId }
    ];

    // Filter by status if provided
    if (options.status) {
      queryText += ' AND c.status = @status';
      parameters.push({ name: '@status', value: options.status });
    }

    // Add ordering (most recent first)
    queryText += ' ORDER BY c.startDate DESC';

    // Build query spec
    const querySpec: SqlQuerySpec = {
      query: queryText,
      parameters
    };

    // Execute query
    const { resources: trips } = await this.container.items
      .query<Trip>(querySpec, { partitionKey: options.userId })
      .fetchAll();

    // Get total count
    const totalCount = trips.length;

    // Apply pagination manually (Cosmos DB serverless doesn't support OFFSET/LIMIT efficiently)
    // TODO: For production with large datasets, implement continuation token-based pagination
    // to reduce RU consumption and improve performance. This is acceptable for MVP since
    // individual users are unlikely to have hundreds of trips (partition scoped to userId).
    const paginatedTrips = trips.slice(offset, offset + pageSize);

    // Convert to DTOs
    const tripDTOs = paginatedTrips.map(trip => toTripSummaryDTO(trip));

    return {
      trips: tripDTOs,
      totalCount,
      page,
      pageSize
    };
  }

  /**
   * Create a new trip
   * 
   * @param userId - User ID (owner of the trip)
   * @param createDto - Trip creation data
   * @returns Created trip
   */
  async createTrip(userId: string, createDto: CreateTripDTO): Promise<Trip> {
    const now = new Date().toISOString();
    
    // Generate checklist items with IDs
    const checklist: ChecklistItem[] = DEFAULT_TRIP_CHECKLIST.map(item => ({
      ...item,
      id: `check-${randomUUID()}`
    }));

    // Create new trip
    const newTrip: Trip = {
      id: `trip-${randomUUID()}`,
      userId,
      name: createDto.name,
      description: createDto.description,
      status: TripStatus.PLANNED,
      startDate: createDto.startDate,
      endDate: createDto.endDate,
      segments: [],
      checklist,
      notes: createDto.notes,
      createdAt: now,
      updatedAt: now
    };

    // Save to database
    const { resource } = await this.container.items.create<Trip>(newTrip);
    if (!resource) {
      throw new Error('Failed to create trip');
    }
    
    return resource;
  }

  /**
   * Update an existing trip
   * 
   * @param tripId - Trip ID
   * @param userId - User ID (partition key)
   * @param updates - Partial trip updates
   * @returns Updated trip
   */
  async updateTrip(
    tripId: string,
    userId: string,
    updates: {
      name?: string;
      description?: string;
      status?: TripStatus;
      startDate?: string;
      endDate?: string;
      notes?: string;
    }
  ): Promise<Trip> {
    const trip = await this.getTripById(tripId, userId);
    if (!trip) {
      throw new Error('Trip not found');
    }

    // Track if dates are being updated for validation
    let startDate = trip.startDate;
    let endDate = trip.endDate;

    // Update fields
    if (updates.name !== undefined) {
      trip.name = updates.name;
    }
    if (updates.description !== undefined) {
      trip.description = updates.description;
    }
    if (updates.status !== undefined) {
      trip.status = updates.status;
    }
    if (updates.startDate !== undefined) {
      startDate = updates.startDate;
      trip.startDate = updates.startDate;
    }
    if (updates.endDate !== undefined) {
      endDate = updates.endDate;
      trip.endDate = updates.endDate;
    }
    if (updates.notes !== undefined) {
      trip.notes = updates.notes;
    }

    // Validate date range after updates
    const startDateObj = new Date(startDate);
    const endDateObj = new Date(endDate);
    if (endDateObj < startDateObj) {
      throw new Error('End date cannot be before start date');
    }

    // Update metadata
    trip.updatedAt = new Date().toISOString();

    // Save to database
    const { resource } = await this.container.items.upsert<Trip>(trip);
    if (!resource) {
      throw new Error('Failed to update trip');
    }
    
    return resource;
  }

  /**
   * Delete a trip
   * 
   * @param tripId - Trip ID
   * @param userId - User ID (partition key)
   */
  async deleteTrip(tripId: string, userId: string): Promise<void> {
    await this.container.item(tripId, userId).delete();
  }

  /**
   * Add a travel segment to a trip
   * 
   * @param tripId - Trip ID
   * @param userId - User ID (partition key)
   * @param segment - Travel segment to add
   * @returns Updated trip
   */
  async addTravelSegment(
    tripId: string,
    userId: string,
    segment: {
      type: TravelSegmentType;
      startDate: string;
      endDate: string;
      flightDetails?: FlightDetails;
      driveDetails?: DriveDetails;
      lodgingDetails?: Accommodation;
      dropzoneId?: string;
      plannedJumpCount?: number;
      jumpTypes?: JumpType[];
      jumpGoals?: string;
      notes?: string;
    }
  ): Promise<Trip> {
    const trip = await this.getTripById(tripId, userId);
    if (!trip) {
      throw new Error('Trip not found');
    }

    const now = new Date().toISOString();
    const newSegment: TravelSegment = {
      id: `seg-${randomUUID()}`,
      type: segment.type,
      startDate: segment.startDate,
      endDate: segment.endDate,
      flightDetails: segment.flightDetails,
      driveDetails: segment.driveDetails,
      lodgingDetails: segment.lodgingDetails,
      dropzoneId: segment.dropzoneId,
      dropzoneName: undefined, // Will be populated if dropzoneId is provided
      plannedJumpCount: segment.plannedJumpCount,
      actualJumpCount: undefined,
      jumpTypes: segment.jumpTypes,
      jumpGoals: segment.jumpGoals,
      notes: segment.notes,
      completed: false,
      createdAt: now,
      updatedAt: now,
    };

    // If dropzoneId is provided, we could fetch the dropzone name here
    // For MVP, we'll leave it undefined and populate it in the API function if needed

    trip.segments.push(newSegment);
    trip.updatedAt = now;

    const { resource } = await this.container.items.upsert<Trip>(trip);
    if (!resource) {
      throw new Error('Failed to add travel segment');
    }
    
    return resource;
  }

  /**
   * Update a travel segment in a trip
   * 
   * @param tripId - Trip ID
   * @param userId - User ID (partition key)
   * @param segmentId - Travel segment ID
   * @param updates - Partial segment updates
   * @returns Updated trip
   */
  async updateTravelSegment(
    tripId: string,
    userId: string,
    segmentId: string,
    updates: {
      startDate?: string;
      endDate?: string;
      flightDetails?: FlightDetails;
      driveDetails?: DriveDetails;
      lodgingDetails?: Accommodation;
      dropzoneId?: string;
      plannedJumpCount?: number;
      actualJumpCount?: number;
      jumpTypes?: JumpType[];
      jumpGoals?: string;
      notes?: string;
      completed?: boolean;
    }
  ): Promise<Trip> {
    const trip = await this.getTripById(tripId, userId);
    if (!trip) {
      throw new Error('Trip not found');
    }

    const segmentIndex = trip.segments.findIndex(s => s.id === segmentId);
    if (segmentIndex === -1) {
      throw new Error('Travel segment not found');
    }

    const segment = trip.segments[segmentIndex];
    const now = new Date().toISOString();

    // Update fields
    if (updates.startDate !== undefined) segment.startDate = updates.startDate;
    if (updates.endDate !== undefined) segment.endDate = updates.endDate;
    if (updates.flightDetails !== undefined) segment.flightDetails = updates.flightDetails;
    if (updates.driveDetails !== undefined) segment.driveDetails = updates.driveDetails;
    if (updates.lodgingDetails !== undefined) segment.lodgingDetails = updates.lodgingDetails;
    if (updates.dropzoneId !== undefined) segment.dropzoneId = updates.dropzoneId;
    if (updates.plannedJumpCount !== undefined) segment.plannedJumpCount = updates.plannedJumpCount;
    if (updates.actualJumpCount !== undefined) segment.actualJumpCount = updates.actualJumpCount;
    if (updates.jumpTypes !== undefined) segment.jumpTypes = updates.jumpTypes;
    if (updates.jumpGoals !== undefined) segment.jumpGoals = updates.jumpGoals;
    if (updates.notes !== undefined) segment.notes = updates.notes;
    if (updates.completed !== undefined) segment.completed = updates.completed;

    segment.updatedAt = now;
    trip.updatedAt = now;

    const { resource } = await this.container.items.upsert<Trip>(trip);
    if (!resource) {
      throw new Error('Failed to update travel segment');
    }
    
    return resource;
  }

  /**
   * Delete a travel segment from a trip
   * 
   * @param tripId - Trip ID
   * @param userId - User ID (partition key)
   * @param segmentId - Travel segment ID
   * @returns Updated trip
   */
  async deleteTravelSegment(
    tripId: string,
    userId: string,
    segmentId: string
  ): Promise<Trip> {
    const trip = await this.getTripById(tripId, userId);
    if (!trip) {
      throw new Error('Trip not found');
    }

    const segmentIndex = trip.segments.findIndex(s => s.id === segmentId);
    if (segmentIndex === -1) {
      throw new Error('Travel segment not found');
    }

    trip.segments.splice(segmentIndex, 1);
    trip.updatedAt = new Date().toISOString();

    const { resource } = await this.container.items.upsert<Trip>(trip);
    if (!resource) {
      throw new Error('Failed to delete travel segment');
    }
    
    return resource;
  }

  /**
   * Get a specific travel segment from a trip
   * 
   * @param tripId - Trip ID
   * @param userId - User ID (partition key)
   * @param segmentId - Travel segment ID
   * @returns Travel segment or null if not found
   */
  async getTravelSegment(
    tripId: string,
    userId: string,
    segmentId: string
  ): Promise<TravelSegment | null> {
    const trip = await this.getTripById(tripId, userId);
    if (!trip) {
      return null;
    }

    const segment = trip.segments.find(s => s.id === segmentId);
    return segment || null;
  }
}

/**
 * Create TripService instance from environment variables
 */
export const createTripService = (): TripService => {
  const endpoint = process.env.COSMOS_DB_ENDPOINT;
  const key = process.env.COSMOS_DB_KEY;
  const databaseName = process.env.COSMOS_DB_DATABASE_NAME || 'SkyNavDB';

  if (!endpoint || !key) {
    throw new Error('Cosmos DB configuration missing: COSMOS_DB_ENDPOINT and COSMOS_DB_KEY required');
  }

  const cosmosClient = new CosmosClient({ endpoint, key });
  return new TripService(cosmosClient, databaseName);
};
