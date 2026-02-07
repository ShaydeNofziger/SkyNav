/**
 * DropZone DTOs
 * 
 * Data Transfer Objects for DropZone-related API endpoints.
 * DTOs provide a clean separation between domain models and API contracts.
 */

import { DropZone, GeoLocation, Address, Facilities } from '../models/DropZone';

/**
 * DropZone summary for list views
 * Contains minimal information for directory browsing
 */
export interface DropZoneSummaryDTO {
  id: string;
  name: string;
  displayName?: string;
  location: GeoLocation;
  city: string;
  state: string;
  country: string;
  maxAltitude: number;
  aircraft: string[];
  isActive: boolean;
  distance?: number; // Distance in meters (when searching by location)
}

/**
 * Full DropZone details for profile view
 */
export interface DropZoneDetailDTO {
  id: string;
  name: string;
  displayName?: string;
  description?: string;
  location: GeoLocation;
  address: Address;
  phone?: string;
  email?: string;
  website?: string;
  facilities: Facilities;
  isActive: boolean;
  landingAreaId?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Request DTO for creating a new dropzone (admin only)
 */
export interface CreateDropZoneDTO {
  name: string;
  displayName?: string;
  description?: string;
  location: GeoLocation;
  address: Address;
  phone?: string;
  email?: string;
  website?: string;
  facilities: Facilities;
}

/**
 * Request DTO for updating an existing dropzone (admin only)
 */
export interface UpdateDropZoneDTO {
  name?: string;
  displayName?: string;
  description?: string;
  location?: GeoLocation;
  address?: Address;
  phone?: string;
  email?: string;
  website?: string;
  facilities?: Facilities;
  isActive?: boolean;
}

/**
 * Response DTO for dropzone list endpoint
 */
export interface DropZoneListResponseDTO {
  dropzones: DropZoneSummaryDTO[];
  totalCount: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

/**
 * Map a domain DropZone model to a summary DTO
 */
export function toDropZoneSummaryDTO(dropzone: DropZone, distance?: number): DropZoneSummaryDTO {
  return {
    id: dropzone.id,
    name: dropzone.name,
    displayName: dropzone.displayName,
    location: dropzone.location,
    city: dropzone.address.city,
    state: dropzone.address.state,
    country: dropzone.address.country,
    maxAltitude: dropzone.facilities.maxAltitude,
    aircraft: dropzone.facilities.aircraft,
    isActive: dropzone.isActive,
    distance,
  };
}

/**
 * Map a domain DropZone model to a detail DTO
 */
export function toDropZoneDetailDTO(dropzone: DropZone): DropZoneDetailDTO {
  return {
    id: dropzone.id,
    name: dropzone.name,
    displayName: dropzone.displayName,
    description: dropzone.description,
    location: dropzone.location,
    address: dropzone.address,
    phone: dropzone.phone,
    email: dropzone.email,
    website: dropzone.website,
    facilities: dropzone.facilities,
    isActive: dropzone.isActive,
    landingAreaId: dropzone.landingAreaId,
    createdAt: dropzone.createdAt,
    updatedAt: dropzone.updatedAt,
  };
}
