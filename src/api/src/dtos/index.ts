/**
 * Data Transfer Objects (DTOs)
 * 
 * This module exports all DTOs used in the SkyNav API.
 * DTOs provide a clean separation between domain models and API contracts.
 */

// DropZone DTOs
export {
  DropZoneSummaryDTO,
  DropZoneDetailDTO,
  CreateDropZoneDTO,
  UpdateDropZoneDTO,
  DropZoneListResponseDTO,
  toDropZoneSummaryDTO,
  toDropZoneDetailDTO,
} from './DropZoneDTO';

// User DTOs
export {
  PublicUserProfileDTO,
  PrivateUserProfileDTO,
  UpdateUserProfileDTO,
  UpdateUserPreferencesDTO,
  UserFavoritesResponseDTO,
  toPublicUserProfileDTO,
  toPrivateUserProfileDTO,
} from './UserDTO';

// Trip DTOs
export {
  TripSummaryDTO,
  TripDetailDTO,
  CreateTripDTO,
  UpdateTripDTO,
  UpdateChecklistDTO,
  TripListResponseDTO,
  toTripSummaryDTO,
  toTripDetailDTO,
} from './TripDTO';

// TravelSegment DTOs
export {
  CreateTravelSegmentDTO,
  UpdateTravelSegmentDTO,
  TravelSegmentDetailDTO,
  toTravelSegmentDetailDTO,
} from './TravelSegmentDTO';
