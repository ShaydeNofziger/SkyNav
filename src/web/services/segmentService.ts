/**
 * Travel Segment API Service
 * 
 * Handles all travel segment-related API calls
 */

import { TravelSegment } from './tripService';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7071/api';

export interface CreateSegmentRequest {
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
  plannedJumpCount?: number;
  jumpTypes?: string[];
  jumpGoals?: string;
  notes?: string;
}

export interface UpdateSegmentRequest {
  startDate?: string;
  endDate?: string;
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
  plannedJumpCount?: number;
  actualJumpCount?: number;
  jumpTypes?: string[];
  jumpGoals?: string;
  notes?: string;
  completed?: boolean;
}

/**
 * Create a new travel segment
 */
export async function createSegment(
  accessToken: string,
  tripId: string,
  segment: CreateSegmentRequest
): Promise<TravelSegment> {
  const response = await fetch(`${API_BASE_URL}/trips/${tripId}/segments`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(segment),
  });

  if (!response.ok) {
    throw new Error(`Failed to create segment: ${response.statusText}`);
  }

  return await response.json();
}

/**
 * Update a travel segment
 */
export async function updateSegment(
  accessToken: string,
  tripId: string,
  segmentId: string,
  updates: UpdateSegmentRequest
): Promise<TravelSegment> {
  const response = await fetch(`${API_BASE_URL}/trips/${tripId}/segments/${segmentId}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updates),
  });

  if (!response.ok) {
    throw new Error(`Failed to update segment: ${response.statusText}`);
  }

  return await response.json();
}

/**
 * Delete a travel segment
 */
export async function deleteSegment(
  accessToken: string,
  tripId: string,
  segmentId: string
): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/trips/${tripId}/segments/${segmentId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to delete segment: ${response.statusText}`);
  }
}

/**
 * Get a specific travel segment
 */
export async function getSegment(
  accessToken: string,
  tripId: string,
  segmentId: string
): Promise<TravelSegment> {
  const response = await fetch(`${API_BASE_URL}/trips/${tripId}/segments/${segmentId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to get segment: ${response.statusText}`);
  }

  return await response.json();
}
