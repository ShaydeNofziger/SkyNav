/**
 * TravelSegment Domain Model
 * 
 * Represents travel logistics for a trip: flights, drives, or lodging.
 * Embedded within Trip documents.
 */

/**
 * Type of travel segment
 */
export enum TravelSegmentType {
  FLIGHT = 'flight',
  DRIVE = 'drive',
  LODGING = 'lodging',
}

/**
 * Type of jumps planned for this segment
 */
export enum JumpType {
  FUN = 'fun',               // Recreational jumping
  COACHING = 'coaching',     // Receiving coaching
  TRAINING = 'training',     // Specific skills training
  COMPETITION = 'competition', // Competition or event
  TANDEM = 'tandem',         // Tandem instruction
  AFF = 'aff',               // AFF instruction
  OTHER = 'other',           // Other type
}

/**
 * Flight details
 */
export interface FlightDetails {
  airline?: string;
  flightNumber?: string;
  departureAirport?: string;
  arrivalAirport?: string;
  confirmationNumber?: string;
}

/**
 * Drive details
 */
export interface DriveDetails {
  departureLocation?: string;
  arrivalLocation?: string;
  distance?: number; // in miles
  estimatedDuration?: number; // in hours
}

/**
 * Accommodation information for lodging segments
 */
export interface Accommodation {
  type: 'hotel' | 'bunkhouse' | 'camping' | 'other';
  name?: string;
  address?: string;
  confirmationNumber?: string;
  notes?: string;
}

/**
 * Main TravelSegment domain model
 * 
 * Embedded within Trip documents, representing travel logistics.
 * Not a separate Cosmos DB container - these are nested within Trip documents.
 */
export interface TravelSegment {
  // Identifier (unique within the trip)
  id: string; // Format: "seg-{guid}"
  
  // Type of travel segment
  type: TravelSegmentType;
  
  // Common fields
  startDate: string; // ISO 8601 date (YYYY-MM-DD) or datetime
  endDate: string; // ISO 8601 date (YYYY-MM-DD) or datetime
  
  // Type-specific details (only one will be populated based on type)
  flightDetails?: FlightDetails;
  driveDetails?: DriveDetails;
  lodgingDetails?: Accommodation;
  
  // Optional dropzone reference (for lodging near dropzones)
  dropzoneId?: string; // Reference to DropZone.id
  dropzoneName?: string; // Denormalized for display (reduces queries)
  
  // Jump planning (for dropzone-related segments)
  plannedJumpCount?: number;
  actualJumpCount?: number;
  jumpTypes?: JumpType[];
  jumpGoals?: string; // User-defined goals (e.g., "Complete 10-way formations")
  
  // Notes
  notes?: string; // User's notes about this segment
  
  // Status
  completed: boolean;
  
  // Metadata
  createdAt: string; // ISO 8601 timestamp
  updatedAt: string; // ISO 8601 timestamp
}

/**
 * Type guard to check if an object is a valid TravelSegment
 */
export function isTravelSegment(obj: unknown): obj is TravelSegment {
  const segment = obj as TravelSegment;
  return (
    typeof segment === 'object' &&
    segment !== null &&
    typeof segment.id === 'string' &&
    segment.id.startsWith('seg-') &&
    typeof segment.type === 'string' &&
    Object.values(TravelSegmentType).includes(segment.type as TravelSegmentType) &&
    typeof segment.startDate === 'string' &&
    typeof segment.endDate === 'string' &&
    typeof segment.completed === 'boolean'
  );
}
