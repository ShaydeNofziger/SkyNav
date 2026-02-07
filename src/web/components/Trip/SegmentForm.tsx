'use client';

import { useState } from 'react';
import { CreateSegmentRequest } from '@/services/segmentService';

interface SegmentFormProps {
  onSubmit: (data: CreateSegmentRequest) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
  initialData?: Partial<CreateSegmentRequest>;
}

type SegmentType = 'flight' | 'drive' | 'lodging';

export function SegmentForm({ onSubmit, onCancel, isSubmitting = false, initialData }: SegmentFormProps) {
  const [segmentType, setSegmentType] = useState<SegmentType>(initialData?.type || 'flight');
  const [formData, setFormData] = useState({
    startDate: initialData?.startDate || '',
    endDate: initialData?.endDate || '',
    notes: initialData?.notes || '',
    // Flight
    airline: initialData?.flightDetails?.airline || '',
    flightNumber: initialData?.flightDetails?.flightNumber || '',
    flightConfirmation: initialData?.flightDetails?.confirmationCode || '',
    departureAirport: initialData?.flightDetails?.departureAirport || '',
    arrivalAirport: initialData?.flightDetails?.arrivalAirport || '',
    // Drive
    startLocation: initialData?.driveDetails?.startLocation || '',
    endLocation: initialData?.driveDetails?.endLocation || '',
    estimatedDistance: initialData?.driveDetails?.estimatedDistance?.toString() || '',
    // Lodging
    lodgingName: initialData?.lodgingDetails?.name || '',
    lodgingAddress: initialData?.lodgingDetails?.address || '',
    lodgingConfirmation: initialData?.lodgingDetails?.confirmationCode || '',
    // Jump planning
    dropzoneId: initialData?.dropzoneId || '',
    plannedJumpCount: initialData?.plannedJumpCount?.toString() || '',
    jumpGoals: initialData?.jumpGoals || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate
    const newErrors: Record<string, string> = {};
    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required';
    }
    if (!formData.endDate) {
      newErrors.endDate = 'End date is required';
    }
    if (formData.startDate && formData.endDate && formData.endDate < formData.startDate) {
      newErrors.endDate = 'End date must be after start date';
    }

    // Type-specific validation
    if (segmentType === 'flight') {
      if (!formData.departureAirport) {
        newErrors.departureAirport = 'Departure airport is required';
      }
      if (!formData.arrivalAirport) {
        newErrors.arrivalAirport = 'Arrival airport is required';
      }
    } else if (segmentType === 'drive') {
      if (!formData.startLocation) {
        newErrors.startLocation = 'Start location is required';
      }
      if (!formData.endLocation) {
        newErrors.endLocation = 'End location is required';
      }
    } else if (segmentType === 'lodging') {
      if (!formData.lodgingName) {
        newErrors.lodgingName = 'Lodging name is required';
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Build submission data
    const submitData: CreateSegmentRequest = {
      type: segmentType,
      startDate: formData.startDate,
      endDate: formData.endDate,
      notes: formData.notes || undefined,
    };

    if (segmentType === 'flight') {
      submitData.flightDetails = {
        departureAirport: formData.departureAirport,
        arrivalAirport: formData.arrivalAirport,
        airline: formData.airline || undefined,
        flightNumber: formData.flightNumber || undefined,
        confirmationCode: formData.flightConfirmation || undefined,
      };
    } else if (segmentType === 'drive') {
      submitData.driveDetails = {
        startLocation: formData.startLocation,
        endLocation: formData.endLocation,
        estimatedDistance: formData.estimatedDistance ? parseInt(formData.estimatedDistance) : undefined,
      };
    } else if (segmentType === 'lodging') {
      submitData.lodgingDetails = {
        name: formData.lodgingName,
        address: formData.lodgingAddress || undefined,
        confirmationCode: formData.lodgingConfirmation || undefined,
      };
    }

    if (formData.plannedJumpCount) {
      submitData.plannedJumpCount = parseInt(formData.plannedJumpCount);
    }
    if (formData.jumpGoals) {
      submitData.jumpGoals = formData.jumpGoals;
    }

    onSubmit(submitData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Segment Type Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Segment Type *
        </label>
        <div className="grid grid-cols-3 gap-3">
          {(['flight', 'drive', 'lodging'] as SegmentType[]).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setSegmentType(type)}
              disabled={isSubmitting}
              className={`px-4 py-3 rounded-lg border-2 text-sm font-medium transition-colors ${
                segmentType === type
                  ? 'border-blue-600 bg-blue-50 text-blue-700'
                  : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
              }`}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Dates */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
            Start Date *
          </label>
          <input
            type="date"
            id="startDate"
            value={formData.startDate}
            onChange={(e) => {
              setFormData({ ...formData, startDate: e.target.value });
              setErrors({ ...errors, startDate: '' });
            }}
            className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${
              errors.startDate
                ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
            }`}
            disabled={isSubmitting}
          />
          {errors.startDate && <p className="mt-1 text-sm text-red-600">{errors.startDate}</p>}
        </div>

        <div>
          <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
            End Date *
          </label>
          <input
            type="date"
            id="endDate"
            value={formData.endDate}
            onChange={(e) => {
              setFormData({ ...formData, endDate: e.target.value });
              setErrors({ ...errors, endDate: '' });
            }}
            className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${
              errors.endDate
                ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
            }`}
            disabled={isSubmitting}
          />
          {errors.endDate && <p className="mt-1 text-sm text-red-600">{errors.endDate}</p>}
        </div>
      </div>

      {/* Flight-specific fields */}
      {segmentType === 'flight' && (
        <div className="space-y-4 p-4 bg-blue-50 rounded-lg">
          <h3 className="text-sm font-semibold text-gray-900">Flight Details</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="departureAirport" className="block text-sm font-medium text-gray-700">
                Departure Airport *
              </label>
              <input
                type="text"
                id="departureAirport"
                value={formData.departureAirport}
                onChange={(e) => {
                  setFormData({ ...formData, departureAirport: e.target.value });
                  setErrors({ ...errors, departureAirport: '' });
                }}
                placeholder="e.g., PHX"
                className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${
                  errors.departureAirport
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                }`}
                disabled={isSubmitting}
              />
              {errors.departureAirport && <p className="mt-1 text-sm text-red-600">{errors.departureAirport}</p>}
            </div>
            <div>
              <label htmlFor="arrivalAirport" className="block text-sm font-medium text-gray-700">
                Arrival Airport *
              </label>
              <input
                type="text"
                id="arrivalAirport"
                value={formData.arrivalAirport}
                onChange={(e) => {
                  setFormData({ ...formData, arrivalAirport: e.target.value });
                  setErrors({ ...errors, arrivalAirport: '' });
                }}
                placeholder="e.g., LAX"
                className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${
                  errors.arrivalAirport
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                }`}
                disabled={isSubmitting}
              />
              {errors.arrivalAirport && <p className="mt-1 text-sm text-red-600">{errors.arrivalAirport}</p>}
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label htmlFor="airline" className="block text-sm font-medium text-gray-700">
                Airline
              </label>
              <input
                type="text"
                id="airline"
                value={formData.airline}
                onChange={(e) => setFormData({ ...formData, airline: e.target.value })}
                placeholder="e.g., Southwest"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                disabled={isSubmitting}
              />
            </div>
            <div>
              <label htmlFor="flightNumber" className="block text-sm font-medium text-gray-700">
                Flight Number
              </label>
              <input
                type="text"
                id="flightNumber"
                value={formData.flightNumber}
                onChange={(e) => setFormData({ ...formData, flightNumber: e.target.value })}
                placeholder="e.g., WN1234"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                disabled={isSubmitting}
              />
            </div>
            <div>
              <label htmlFor="flightConfirmation" className="block text-sm font-medium text-gray-700">
                Confirmation
              </label>
              <input
                type="text"
                id="flightConfirmation"
                value={formData.flightConfirmation}
                onChange={(e) => setFormData({ ...formData, flightConfirmation: e.target.value })}
                placeholder="ABC123"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                disabled={isSubmitting}
              />
            </div>
          </div>
        </div>
      )}

      {/* Drive-specific fields */}
      {segmentType === 'drive' && (
        <div className="space-y-4 p-4 bg-green-50 rounded-lg">
          <h3 className="text-sm font-semibold text-gray-900">Drive Details</h3>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label htmlFor="startLocation" className="block text-sm font-medium text-gray-700">
                Start Location *
              </label>
              <input
                type="text"
                id="startLocation"
                value={formData.startLocation}
                onChange={(e) => {
                  setFormData({ ...formData, startLocation: e.target.value });
                  setErrors({ ...errors, startLocation: '' });
                }}
                placeholder="e.g., Phoenix, AZ"
                className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${
                  errors.startLocation
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                }`}
                disabled={isSubmitting}
              />
              {errors.startLocation && <p className="mt-1 text-sm text-red-600">{errors.startLocation}</p>}
            </div>
            <div>
              <label htmlFor="endLocation" className="block text-sm font-medium text-gray-700">
                End Location *
              </label>
              <input
                type="text"
                id="endLocation"
                value={formData.endLocation}
                onChange={(e) => {
                  setFormData({ ...formData, endLocation: e.target.value });
                  setErrors({ ...errors, endLocation: '' });
                }}
                placeholder="e.g., Eloy, AZ"
                className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${
                  errors.endLocation
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                }`}
                disabled={isSubmitting}
              />
              {errors.endLocation && <p className="mt-1 text-sm text-red-600">{errors.endLocation}</p>}
            </div>
            <div>
              <label htmlFor="estimatedDistance" className="block text-sm font-medium text-gray-700">
                Estimated Distance (miles)
              </label>
              <input
                type="number"
                id="estimatedDistance"
                value={formData.estimatedDistance}
                onChange={(e) => setFormData({ ...formData, estimatedDistance: e.target.value })}
                placeholder="e.g., 75"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                disabled={isSubmitting}
              />
            </div>
          </div>
        </div>
      )}

      {/* Lodging-specific fields */}
      {segmentType === 'lodging' && (
        <div className="space-y-4 p-4 bg-purple-50 rounded-lg">
          <h3 className="text-sm font-semibold text-gray-900">Lodging Details</h3>
          <div>
            <label htmlFor="lodgingName" className="block text-sm font-medium text-gray-700">
              Hotel/Property Name *
            </label>
            <input
              type="text"
              id="lodgingName"
              value={formData.lodgingName}
              onChange={(e) => {
                setFormData({ ...formData, lodgingName: e.target.value });
                setErrors({ ...errors, lodgingName: '' });
              }}
              placeholder="e.g., Holiday Inn Express"
              className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${
                errors.lodgingName
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                  : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
              }`}
              disabled={isSubmitting}
            />
            {errors.lodgingName && <p className="mt-1 text-sm text-red-600">{errors.lodgingName}</p>}
          </div>
          <div>
            <label htmlFor="lodgingAddress" className="block text-sm font-medium text-gray-700">
              Address
            </label>
            <input
              type="text"
              id="lodgingAddress"
              value={formData.lodgingAddress}
              onChange={(e) => setFormData({ ...formData, lodgingAddress: e.target.value })}
              placeholder="123 Main St, Eloy, AZ"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              disabled={isSubmitting}
            />
          </div>
          <div>
            <label htmlFor="lodgingConfirmation" className="block text-sm font-medium text-gray-700">
              Confirmation Code
            </label>
            <input
              type="text"
              id="lodgingConfirmation"
              value={formData.lodgingConfirmation}
              onChange={(e) => setFormData({ ...formData, lodgingConfirmation: e.target.value })}
              placeholder="ABC123"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              disabled={isSubmitting}
            />
          </div>
        </div>
      )}

      {/* Jump planning */}
      <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-sm font-semibold text-gray-900">Jump Planning (Optional)</h3>
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label htmlFor="plannedJumpCount" className="block text-sm font-medium text-gray-700">
              Planned Jump Count
            </label>
            <input
              type="number"
              id="plannedJumpCount"
              value={formData.plannedJumpCount}
              onChange={(e) => setFormData({ ...formData, plannedJumpCount: e.target.value })}
              placeholder="e.g., 10"
              min="0"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              disabled={isSubmitting}
            />
          </div>
          <div>
            <label htmlFor="jumpGoals" className="block text-sm font-medium text-gray-700">
              Jump Goals
            </label>
            <textarea
              id="jumpGoals"
              value={formData.jumpGoals}
              onChange={(e) => setFormData({ ...formData, jumpGoals: e.target.value })}
              rows={2}
              placeholder="What do you want to accomplish?"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              disabled={isSubmitting}
            />
          </div>
        </div>
      </div>

      {/* Notes */}
      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
          Notes
        </label>
        <textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          rows={3}
          placeholder="Any additional notes..."
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          disabled={isSubmitting}
        />
      </div>

      {/* Actions */}
      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {isSubmitting ? 'Saving...' : 'Add Segment'}
        </button>
      </div>
    </form>
  );
}
