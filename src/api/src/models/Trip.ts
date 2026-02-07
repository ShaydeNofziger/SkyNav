/**
 * Trip Domain Model
 * 
 * Represents a planned or completed trip to one or more dropzones.
 * Supports the "Travel Mode" feature for trip planning and preparation.
 */

import { TravelSegment } from './TravelSegment';

/**
 * Trip status
 */
export enum TripStatus {
  PLANNED = 'planned',     // Future trip, in planning phase
  IN_PROGRESS = 'in_progress', // Currently happening
  COMPLETED = 'completed', // Past trip
  CANCELLED = 'cancelled', // Cancelled trip
}

/**
 * Trip preparation checklist item
 */
export interface ChecklistItem {
  id: string;
  label: string;
  completed: boolean;
  order: number;
}

/**
 * Main Trip domain model
 * Partition key: /userId
 * 
 * A trip represents a journey that may include one or more dropzones.
 * Each visit to a dropzone within the trip is represented by a TravelSegment.
 */
export interface Trip {
  // Cosmos DB identifier
  id: string; // Format: "trip-{guid}"
  
  // Ownership
  userId: string; // User ID who created this trip
  
  // Basic Information
  name: string; // User-defined trip name (e.g., "Arizona Boogie 2026")
  description?: string;
  
  // Status
  status: TripStatus;
  
  // Dates
  startDate: string; // ISO 8601 date (YYYY-MM-DD)
  endDate: string; // ISO 8601 date (YYYY-MM-DD)
  
  // Travel segments (visits to dropzones)
  // Note: In a more normalized model, these might be separate documents
  // For MVP, embedding provides simpler queries and atomic updates
  segments: TravelSegment[];
  
  // Trip preparation
  checklist: ChecklistItem[];
  notes?: string; // User's trip notes
  
  // Metadata
  createdAt: string; // ISO 8601 timestamp
  updatedAt: string; // ISO 8601 timestamp
}

/**
 * Default checklist items for a new trip
 */
export const DEFAULT_TRIP_CHECKLIST: Omit<ChecklistItem, 'id'>[] = [
  { label: 'Reserve rigger inspection current', completed: false, order: 1 },
  { label: 'Gear packed and ready', completed: false, order: 2 },
  { label: 'Reviewed dropzone landing areas', completed: false, order: 3 },
  { label: 'Reviewed local hazards and patterns', completed: false, order: 4 },
  { label: 'Confirmed dropzone operating hours', completed: false, order: 5 },
  { label: 'Checked weather forecast', completed: false, order: 6 },
];

/**
 * Type guard to check if an object is a valid Trip
 */
export function isTrip(obj: unknown): obj is Trip {
  const trip = obj as Trip;
  return (
    typeof trip === 'object' &&
    trip !== null &&
    typeof trip.id === 'string' &&
    trip.id.startsWith('trip-') &&
    typeof trip.userId === 'string' &&
    trip.userId.length > 0 &&
    typeof trip.name === 'string' &&
    trip.name.length > 0 &&
    Object.values(TripStatus).includes(trip.status) &&
    typeof trip.startDate === 'string' &&
    typeof trip.endDate === 'string' &&
    Array.isArray(trip.segments) &&
    Array.isArray(trip.checklist)
  );
}
