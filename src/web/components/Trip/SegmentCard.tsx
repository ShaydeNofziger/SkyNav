'use client';

import { TravelSegment } from '@/services/tripService';

interface SegmentCardProps {
  segment: TravelSegment;
  onEdit?: (segment: TravelSegment) => void;
  onDelete?: (segmentId: string) => void;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

const segmentIcons = {
  flight: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
    </svg>
  ),
  drive: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
    </svg>
  ),
  lodging: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  ),
};

const segmentColors = {
  flight: 'bg-blue-50 border-blue-200',
  drive: 'bg-green-50 border-green-200',
  lodging: 'bg-purple-50 border-purple-200',
};

const segmentIconColors = {
  flight: 'text-blue-600',
  drive: 'text-green-600',
  lodging: 'text-purple-600',
};

export function SegmentCard({ segment, onEdit, onDelete }: SegmentCardProps) {
  return (
    <div className={`rounded-lg border-2 p-4 ${segmentColors[segment.type]}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div className={segmentIconColors[segment.type]}>
            {segmentIcons[segment.type]}
          </div>
          <span className="font-semibold text-gray-900 capitalize">
            {segment.type}
          </span>
        </div>
        {(onEdit || onDelete) && (
          <div className="flex space-x-2">
            {onEdit && (
              <button
                onClick={() => onEdit(segment)}
                className="text-gray-400 hover:text-gray-600"
                aria-label="Edit segment"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(segment.id)}
                className="text-gray-400 hover:text-red-600"
                aria-label="Delete segment"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            )}
          </div>
        )}
      </div>

      <div className="text-sm text-gray-600 mb-2">
        {formatDate(segment.startDate)} - {formatDate(segment.endDate)}
      </div>

      {segment.type === 'flight' && segment.flightDetails && (
        <div className="text-sm space-y-1">
          <div className="flex items-center text-gray-700">
            <span className="font-medium">{segment.flightDetails.departureAirport}</span>
            <svg className="w-4 h-4 mx-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
            <span className="font-medium">{segment.flightDetails.arrivalAirport}</span>
          </div>
          {segment.flightDetails.airline && (
            <div className="text-gray-600">
              {segment.flightDetails.airline}
              {segment.flightDetails.flightNumber && ` ${segment.flightDetails.flightNumber}`}
            </div>
          )}
          {segment.flightDetails.confirmationCode && (
            <div className="text-gray-500 text-xs">
              Confirmation: {segment.flightDetails.confirmationCode}
            </div>
          )}
        </div>
      )}

      {segment.type === 'drive' && segment.driveDetails && (
        <div className="text-sm space-y-1">
          <div className="text-gray-700">
            <div className="font-medium">{segment.driveDetails.startLocation}</div>
            <div className="flex items-center my-1">
              <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </div>
            <div className="font-medium">{segment.driveDetails.endLocation}</div>
          </div>
          {segment.driveDetails.estimatedDistance && (
            <div className="text-gray-600 text-xs">
              ~{segment.driveDetails.estimatedDistance} miles
            </div>
          )}
        </div>
      )}

      {segment.type === 'lodging' && segment.lodgingDetails && (
        <div className="text-sm space-y-1">
          <div className="font-medium text-gray-700">{segment.lodgingDetails.name}</div>
          {segment.lodgingDetails.address && (
            <div className="text-gray-600 text-xs">{segment.lodgingDetails.address}</div>
          )}
          {segment.lodgingDetails.confirmationCode && (
            <div className="text-gray-500 text-xs">
              Confirmation: {segment.lodgingDetails.confirmationCode}
            </div>
          )}
        </div>
      )}

      {segment.dropzoneName && (
        <div className="mt-2 pt-2 border-t border-gray-200">
          <div className="text-sm font-medium text-gray-700">
            📍 {segment.dropzoneName}
          </div>
          {segment.plannedJumpCount && (
            <div className="text-xs text-gray-600">
              {segment.plannedJumpCount} planned jumps
            </div>
          )}
        </div>
      )}

      {segment.notes && (
        <div className="mt-2 pt-2 border-t border-gray-200 text-sm text-gray-600">
          {segment.notes}
        </div>
      )}
    </div>
  );
}
