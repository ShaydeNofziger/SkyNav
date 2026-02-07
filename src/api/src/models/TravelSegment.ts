/**
 * TravelSegment Domain Model
 * 
 * Represents a single visit to a dropzone within a trip.
 * Contains information about the planned visit, jump goals, and notes.
 */

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
 * Accommodation information for the segment
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
 * Embedded within Trip documents, representing a visit to a specific dropzone.
 * Not a separate Cosmos DB container - these are nested within Trip documents.
 */
export interface TravelSegment {
  // Identifier (unique within the trip)
  id: string; // Format: "seg-{guid}"
  
  // Dropzone reference
  dropzoneId: string; // Reference to DropZone.id
  dropzoneName?: string; // Denormalized for display (reduces queries)
  
  // Visit dates
  arrivalDate: string; // ISO 8601 date (YYYY-MM-DD)
  departureDate: string; // ISO 8601 date (YYYY-MM-DD)
  
  // Jump planning
  plannedJumpCount?: number;
  actualJumpCount?: number;
  jumpTypes: JumpType[];
  jumpGoals?: string; // User-defined goals (e.g., "Complete 10-way formations")
  
  // Accommodation
  accommodation?: Accommodation;
  
  // Notes and preparation
  notes?: string; // User's notes about this visit
  weatherNotes?: string;
  specialRequests?: string; // e.g., "Need rental rig"
  
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
    typeof segment.dropzoneId === 'string' &&
    segment.dropzoneId.startsWith('dz-') &&
    typeof segment.arrivalDate === 'string' &&
    typeof segment.departureDate === 'string' &&
    Array.isArray(segment.jumpTypes) &&
    typeof segment.completed === 'boolean'
  );
}
