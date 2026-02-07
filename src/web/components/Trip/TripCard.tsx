'use client';

import Link from 'next/link';
import { TripSummary, TripStatus } from '@/services/tripService';

interface TripCardProps {
  trip: TripSummary;
}

const statusColors: Record<TripStatus, { bg: string; text: string; label: string }> = {
  [TripStatus.PLANNED]: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Planned' },
  [TripStatus.IN_PROGRESS]: { bg: 'bg-green-100', text: 'text-green-800', label: 'In Progress' },
  [TripStatus.COMPLETED]: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Completed' },
  [TripStatus.CANCELLED]: { bg: 'bg-red-100', text: 'text-red-800', label: 'Cancelled' },
};

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function TripCard({ trip }: TripCardProps) {
  const statusStyle = statusColors[trip.status];

  return (
    <Link
      href={`/trips/${trip.id}`}
      className="block bg-white rounded-lg shadow hover:shadow-md transition-shadow border border-gray-200"
    >
      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
            {trip.name}
          </h3>
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusStyle.bg} ${statusStyle.text}`}>
            {statusStyle.label}
          </span>
        </div>

        <div className="flex items-center text-sm text-gray-500 mb-4">
          <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span>{formatDate(trip.startDate)} - {formatDate(trip.endDate)}</span>
        </div>

        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-100">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{trip.dropzoneCount}</div>
            <div className="text-xs text-gray-500">Segments</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{trip.totalJumps}</div>
            <div className="text-xs text-gray-500">Jumps</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {trip.completedChecklistItems}/{trip.totalChecklistItems}
            </div>
            <div className="text-xs text-gray-500">Checklist</div>
          </div>
        </div>
      </div>
    </Link>
  );
}
