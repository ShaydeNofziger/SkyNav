/**
 * TravelSegment DTOs
 * 
 * Data Transfer Objects for TravelSegment-related API endpoints.
 */

import { TravelSegment, TravelSegmentType, JumpType, Accommodation, FlightDetails, DriveDetails } from '../models/TravelSegment';

/**
 * Request DTO for creating a new travel segment
 */
export interface CreateTravelSegmentDTO {
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

/**
 * Request DTO for updating an existing travel segment
 */
export interface UpdateTravelSegmentDTO {
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
