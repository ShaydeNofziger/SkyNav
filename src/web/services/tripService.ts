/**
 * Trip API Service
 * 
 * Handles all trip-related API calls
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7071/api';

export enum TripStatus {
  PLANNED = 'planned',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface TripSummary {
  id: string;
  name: string;
  status: TripStatus;
  startDate: string;
  endDate: string;
  dropzoneCount: number;
  totalJumps: number;
  completedChecklistItems: number;
  totalChecklistItems: number;
}

export interface TravelSegment {
  id: string;
  type: 'flight' | 'drive' | 'lodging';
  startDate: string;
  endDate: string;
  flightDetails?: {
    airline?: string;
    flightNumber?: string;
    confirmationCode?: string;
    departureAirport: string;
    arrivalAirport: string;
  };
  driveDetails?: {
    startLocation: string;
    endLocation: string;
    estimatedDistance?: number;
    estimatedDuration?: number;
  };
  lodgingDetails?: {
    name: string;
    address?: string;
    confirmationCode?: string;
    checkInTime?: string;
    checkOutTime?: string;
  };
  dropzoneId?: string;
  dropzoneName?: string;
  plannedJumpCount?: number;
  actualJumpCount?: number;
  jumpTypes?: string[];
  jumpGoals?: string;
  notes?: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TripDetail {
  id: string;
  name: string;
  description?: string;
  status: TripStatus;
  startDate: string;
  endDate: string;
  segments: TravelSegment[];
  checklist: ChecklistItem[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTripRequest {
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
  notes?: string;
}

export interface UpdateTripRequest {
  name?: string;
  description?: string;
  status?: TripStatus;
  startDate?: string;
  endDate?: string;
  notes?: string;
}

export interface TripListResponse {
  trips: TripSummary[];
  totalCount: number;
  page: number;
  pageSize: number;
}

/**
 * List all trips for the authenticated user
 */
export async function listTrips(
  accessToken: string,
  options?: {
    status?: TripStatus;
    page?: number;
    pageSize?: number;
  }
): Promise<TripListResponse> {
  const params = new URLSearchParams();
  if (options?.status) params.append('status', options.status);
  if (options?.page) params.append('page', options.page.toString());
  if (options?.pageSize) params.append('pageSize', options.pageSize.toString());

  const url = `${API_BASE_URL}/trips${params.toString() ? `?${params.toString()}` : ''}`;
  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to list trips: ${response.statusText}`);
  }

  return await response.json();
}

/**
 * Get trip detail by ID
 */
export async function getTrip(accessToken: string, tripId: string): Promise<TripDetail> {
  const response = await fetch(`${API_BASE_URL}/trips/${tripId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to get trip: ${response.statusText}`);
  }

  return await response.json();
}

/**
 * Create a new trip
 */
export async function createTrip(
  accessToken: string,
  trip: CreateTripRequest
): Promise<TripDetail> {
  const response = await fetch(`${API_BASE_URL}/trips`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(trip),
  });

  if (!response.ok) {
    throw new Error(`Failed to create trip: ${response.statusText}`);
  }

  return await response.json();
}

/**
 * Update an existing trip
 */
export async function updateTrip(
  accessToken: string,
  tripId: string,
  updates: UpdateTripRequest
): Promise<TripDetail> {
  const response = await fetch(`${API_BASE_URL}/trips/${tripId}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updates),
  });

  if (!response.ok) {
    throw new Error(`Failed to update trip: ${response.statusText}`);
  }

  return await response.json();
}

/**
 * Delete a trip
 */
export async function deleteTrip(accessToken: string, tripId: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/trips/${tripId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to delete trip: ${response.statusText}`);
  }
}
