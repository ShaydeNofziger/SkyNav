/**
 * Trip DTOs
 * 
 * Data Transfer Objects for Trip-related API endpoints.
 */

import { Trip, TripStatus, ChecklistItem } from '../models/Trip';
import { TravelSegment } from '../models/TravelSegment';

/**
 * Trip summary for list views
 */
export interface TripSummaryDTO {
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

/**
 * Full trip details
 */
export interface TripDetailDTO {
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

/**
 * Request DTO for creating a new trip
 */
export interface CreateTripDTO {
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
  notes?: string;
}

/**
 * Request DTO for updating an existing trip
 */
export interface UpdateTripDTO {
  name?: string;
  description?: string;
  status?: TripStatus;
  startDate?: string;
  endDate?: string;
  notes?: string;
}

/**
 * Request DTO for updating checklist items
 */
export interface UpdateChecklistDTO {
  checklist: ChecklistItem[];
}

/**
 * Response DTO for trip list endpoint
 */
export interface TripListResponseDTO {
  trips: TripSummaryDTO[];
  totalCount: number;
  page: number;
  pageSize: number;
}

/**
 * Map a domain Trip model to a summary DTO
 */
export function toTripSummaryDTO(trip: Trip): TripSummaryDTO {
  const completedItems = trip.checklist.filter(item => item.completed).length;
  const totalJumps = trip.segments.reduce((sum, seg) => sum + (seg.actualJumpCount || seg.plannedJumpCount || 0), 0);
  
  return {
    id: trip.id,
    name: trip.name,
    status: trip.status,
    startDate: trip.startDate,
    endDate: trip.endDate,
    dropzoneCount: trip.segments.length,
    totalJumps,
    completedChecklistItems: completedItems,
    totalChecklistItems: trip.checklist.length,
  };
}

/**
 * Map a domain Trip model to a detail DTO
 */
export function toTripDetailDTO(trip: Trip): TripDetailDTO {
  return {
    id: trip.id,
    name: trip.name,
    description: trip.description,
    status: trip.status,
    startDate: trip.startDate,
    endDate: trip.endDate,
    segments: trip.segments,
    checklist: trip.checklist,
    notes: trip.notes,
    createdAt: trip.createdAt,
    updatedAt: trip.updatedAt,
  };
}
