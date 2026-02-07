/**
 * TravelSegment DTOs
 * 
 * Data Transfer Objects for TravelSegment-related API endpoints.
 */

import { TravelSegment, JumpType, Accommodation } from '../models/TravelSegment';

/**
 * Request DTO for creating a new travel segment
 */
export interface CreateTravelSegmentDTO {
  dropzoneId: string;
  arrivalDate: string;
  departureDate: string;
  plannedJumpCount?: number;
  jumpTypes: JumpType[];
  jumpGoals?: string;
  accommodation?: Accommodation;
  notes?: string;
  weatherNotes?: string;
  specialRequests?: string;
}

/**
 * Request DTO for updating an existing travel segment
 */
export interface UpdateTravelSegmentDTO {
  arrivalDate?: string;
  departureDate?: string;
  plannedJumpCount?: number;
  actualJumpCount?: number;
  jumpTypes?: JumpType[];
  jumpGoals?: string;
  accommodation?: Accommodation;
  notes?: string;
  weatherNotes?: string;
  specialRequests?: string;
  completed?: boolean;
}

/**
 * Travel segment detail DTO (same as domain model for now)
 */
export interface TravelSegmentDetailDTO extends TravelSegment {}

/**
 * Map a domain TravelSegment model to a detail DTO
 */
export function toTravelSegmentDetailDTO(segment: TravelSegment): TravelSegmentDetailDTO {
  return { ...segment };
}
