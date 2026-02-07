/**
 * User Profile Component
 * 
 * Displays and allows editing of user profile information
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getUserProfile, updateUserProfile, User } from '@/services/userService';

export function UserProfile() {
  const { isAuthenticated, getAccessToken } = useAuth();
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    displayName: '',
    firstName: '',
    lastName: '',
    homeDropzoneId: '',
    uspaNumber: '',
    jumpCount: 0,
  });

  useEffect(() => {
    if (isAuthenticated) {
      loadProfile();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = await getAccessToken();
      if (!token) {
        throw new Error('Failed to get access token');
      }

      const userProfile = await getUserProfile(token);
      setProfile(userProfile);
      setFormData({
        displayName: userProfile.profile.displayName || '',
        firstName: userProfile.profile.firstName || '',
        lastName: userProfile.profile.lastName || '',
        homeDropzoneId: userProfile.profile.homeDropzoneId || '',
        uspaNumber: userProfile.profile.uspaNumber || '',
        jumpCount: userProfile.profile.jumpCount || 0,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      const token = await getAccessToken();
      if (!token) {
        throw new Error('Failed to get access token');
      }

      const updates = {
        displayName: formData.displayName,
        firstName: formData.firstName,
        lastName: formData.lastName,
        homeDropzoneId: formData.homeDropzoneId || undefined,
        uspaNumber: formData.uspaNumber || undefined,
        jumpCount: formData.jumpCount > 0 ? formData.jumpCount : undefined,
      };

      const updatedProfile = await updateUserProfile(token, updates);
      setProfile(updatedProfile);
      setEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="p-4 text-center">
        <p className="text-gray-600">Please log in to view your profile</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-4 text-center">
        <p className="text-gray-600">Loading profile...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          <p className="font-bold">Error</p>
          <p>{error}</p>
          <button
            onClick={loadProfile}
            className="mt-2 text-sm underline"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="p-4 text-center">
        <p className="text-gray-600">Profile not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">User Profile</h2>
          {!editing && (
            <button
              onClick={() => setEditing(true)}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Edit Profile
            </button>
          )}
        </div>

        {!editing ? (
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <p className="text-gray-900">{profile.email}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Display Name</label>
              <p className="text-gray-900">{profile.profile.displayName || 'Not set'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">First Name</label>
              <p className="text-gray-900">{profile.profile.firstName || 'Not set'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Last Name</label>
              <p className="text-gray-900">{profile.profile.lastName || 'Not set'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">USPA Number</label>
              <p className="text-gray-900">{profile.profile.uspaNumber || 'Not set'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Jump Count</label>
              <p className="text-gray-900">{profile.profile.jumpCount || 0}</p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Display Name
              </label>
              <input
                type="text"
                value={formData.displayName}
                onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                First Name
              </label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Last Name
              </label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                USPA Number
              </label>
              <input
                type="text"
                value={formData.uspaNumber}
                onChange={(e) => setFormData({ ...formData, uspaNumber: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Jump Count
              </label>
              <input
                type="number"
                value={formData.jumpCount}
                onChange={(e) => setFormData({ ...formData, jumpCount: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                min="0"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300"
              >
                Save Changes
              </button>
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
