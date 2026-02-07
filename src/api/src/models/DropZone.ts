/**
 * DropZone Domain Model
 * 
 * Represents a skydiving dropzone with operational information,
 * location data, and facility details.
 */

/**
 * Geographic location using GeoJSON Point format
 * Compatible with Azure Cosmos DB geospatial indexing
 */
export interface GeoLocation {
  type: 'Point';
  coordinates: [number, number]; // [longitude, latitude]
}

/**
 * Physical address information
 */
export interface Address {
  street?: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

/**
 * Dropzone facility information
 */
export interface Facilities {
  maxAltitude: number; // Maximum jump altitude in feet
  aircraft: string[]; // List of aircraft types (e.g., "Cessna 182", "Twin Otter")
  hasOnSiteRigger: boolean;
  hasBunkhouse: boolean;
  hasRentalGear: boolean;
  hasCafeteria: boolean;
  hasShowers: boolean;
}

/**
 * Operating hours for a dropzone
 */
export interface OperatingHours {
  [day: string]: {
    open: string; // Time in HH:MM format
    close: string; // Time in HH:MM format
  } | null; // null if closed that day
}

/**
 * Main DropZone domain model
 * Partition key: /id
 */
export interface DropZone {
  // Cosmos DB identifier
  id: string; // Format: "dz-{guid}"
  
  // Basic Information
  name: string;
  displayName?: string; // Optional marketing name
  description?: string;
  
  // Location
  location: GeoLocation;
  address: Address;
  landingAreaId?: string; // Reference to primary landing area
  
  // Contact
  phone?: string;
  email?: string;
  website?: string;
  
  // Facilities
  facilities: Facilities;
  
  // Operations
  operatingHours?: OperatingHours;
  isActive: boolean; // Whether DZ is currently operational
  
  // Metadata
  createdAt: string; // ISO 8601 timestamp
  updatedAt: string; // ISO 8601 timestamp
  createdBy: string; // User ID who created this record
  updatedBy?: string; // User ID who last updated this record
}

/**
 * Type guard to check if an object is a valid DropZone
 */
export function isDropZone(obj: unknown): obj is DropZone {
  const dz = obj as DropZone;
  return (
    typeof dz === 'object' &&
    dz !== null &&
    typeof dz.id === 'string' &&
    dz.id.startsWith('dz-') &&
    typeof dz.name === 'string' &&
    dz.name.length > 0 &&
    typeof dz.location === 'object' &&
    dz.location.type === 'Point' &&
    Array.isArray(dz.location.coordinates) &&
    dz.location.coordinates.length === 2 &&
    typeof dz.address === 'object' &&
    typeof dz.facilities === 'object' &&
    typeof dz.isActive === 'boolean'
  );
}
