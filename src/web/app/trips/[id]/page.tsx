'use client';

import { useAuth } from "@/contexts/AuthContext";
import { Container } from "@/components/Layout";
import { SegmentCard, SegmentForm } from "@/components/Trip";
import { useState, useEffect } from "react";
import { getTrip, updateTrip, TripDetail, TripStatus } from "@/services/tripService";
import { createSegment, deleteSegment, CreateSegmentRequest } from "@/services/segmentService";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

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

export default function TripDetailPage() {
  const { isAuthenticated, login, getAccessToken } = useAuth();
  const params = useParams();
  const router = useRouter();
  const tripId = params.id as string;

  const [trip, setTrip] = useState<TripDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddSegment, setShowAddSegment] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated && tripId) {
      loadTrip();
    }
  }, [isAuthenticated, tripId]);

  const loadTrip = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = await getAccessToken();
      if (!token) {
        setError('Unable to get access token');
        return;
      }
      const tripData = await getTrip(token, tripId);
      setTrip(tripData);
    } catch (err) {
      console.error('Error loading trip:', err);
      setError('Failed to load trip. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSegment = async (data: CreateSegmentRequest) => {
    try {
      setIsSubmitting(true);
      setError(null);
      const token = await getAccessToken();
      if (!token) {
        setError('Unable to get access token');
        return;
      }
      await createSegment(token, tripId, data);
      setShowAddSegment(false);
      await loadTrip(); // Reload trip to show new segment
    } catch (err) {
      console.error('Error adding segment:', err);
      setError('Failed to add segment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteSegment = async (segmentId: string) => {
    if (!confirm('Are you sure you want to delete this segment?')) {
      return;
    }

    try {
      setError(null);
      const token = await getAccessToken();
      if (!token) {
        setError('Unable to get access token');
        return;
      }
      await deleteSegment(token, tripId, segmentId);
      await loadTrip(); // Reload trip to reflect deletion
    } catch (err) {
      console.error('Error deleting segment:', err);
      setError('Failed to delete segment. Please try again.');
    }
  };

  const handleToggleChecklist = async (itemId: string) => {
    if (!trip) return;

    try {
      const token = await getAccessToken();
      if (!token) return;

      // Toggle the checklist item
      const updatedChecklist = trip.checklist.map(item =>
        item.id === itemId ? { ...item, completed: !item.completed } : item
      );

      // Update locally first for instant feedback
      setTrip({ ...trip, checklist: updatedChecklist });

      // Note: We would need an updateChecklist endpoint for this
      // For now, we'll just update locally
    } catch (err) {
      console.error('Error updating checklist:', err);
      // Reload to get accurate state
      loadTrip();
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-full bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Please sign in to view this trip</p>
          <button
            onClick={() => login()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-full bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !trip) {
    return (
      <div className="min-h-full bg-gray-50">
        <Container className="py-6 sm:py-8">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error || 'Trip not found'}</p>
            <Link href="/trips" className="text-blue-600 hover:text-blue-700">
              ← Back to Trips
            </Link>
          </div>
        </Container>
      </div>
    );
  }

  const statusStyle = statusColors[trip.status];
  const sortedSegments = [...trip.segments].sort((a, b) => 
    new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
  );

  return (
    <div className="min-h-full bg-gray-50">
      <Container className="py-6 sm:py-8">
        {/* Header */}
        <div className="mb-6">
          <Link href="/trips" className="text-blue-600 hover:text-blue-700 text-sm mb-2 inline-block">
            ← Back to Trips
          </Link>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                {trip.name}
              </h1>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusStyle.bg} ${statusStyle.text}`}>
                  {statusStyle.label}
                </span>
                <span className="flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {formatDate(trip.startDate)} - {formatDate(trip.endDate)}
                </span>
              </div>
            </div>
          </div>
          {trip.description && (
            <p className="mt-3 text-gray-600">{trip.description}</p>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content - Timeline */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Travel Timeline</h2>
                <button
                  onClick={() => setShowAddSegment(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  + Add Segment
                </button>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              {sortedSegments.length === 0 ? (
                <div className="text-center py-12">
                  <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <p className="text-gray-600 mb-4">No travel segments yet</p>
                  <button
                    onClick={() => setShowAddSegment(true)}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    Add your first segment
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {sortedSegments.map((segment) => (
                    <SegmentCard
                      key={segment.id}
                      segment={segment}
                      onDelete={handleDeleteSegment}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar - Checklist & Notes */}
          <div className="space-y-6">
            {/* Checklist */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Checklist</h2>
              <div className="space-y-3">
                {trip.checklist.map((item) => (
                  <label key={item.id} className="flex items-start cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={item.completed}
                      onChange={() => handleToggleChecklist(item.id)}
                      className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className={`ml-3 text-sm ${item.completed ? 'text-gray-400 line-through' : 'text-gray-700'}`}>
                      {item.text}
                    </span>
                  </label>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="text-sm text-gray-500">
                  {trip.checklist.filter(i => i.completed).length} of {trip.checklist.length} completed
                </div>
              </div>
            </div>

            {/* Notes */}
            {trip.notes && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Notes</h2>
                <p className="text-sm text-gray-600 whitespace-pre-wrap">{trip.notes}</p>
              </div>
            )}

            {/* Stats */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Trip Stats</h2>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total Segments</span>
                  <span className="font-semibold text-gray-900">{trip.segments.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Planned Jumps</span>
                  <span className="font-semibold text-gray-900">
                    {trip.segments.reduce((sum, seg) => sum + (seg.plannedJumpCount || 0), 0)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Actual Jumps</span>
                  <span className="font-semibold text-gray-900">
                    {trip.segments.reduce((sum, seg) => sum + (seg.actualJumpCount || 0), 0)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>

      {/* Add Segment Modal */}
      {showAddSegment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Add Travel Segment</h2>
            <SegmentForm
              onSubmit={handleAddSegment}
              onCancel={() => setShowAddSegment(false)}
              isSubmitting={isSubmitting}
            />
          </div>
        </div>
      )}
    </div>
  );
}
