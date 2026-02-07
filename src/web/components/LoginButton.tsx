/**
 * Login Button Component
 * 
 * Handles user authentication (login/logout)
 */

'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';

export function LoginButton() {
  const { isAuthenticated, user, login, logout } = useAuth();
  const [isLoading, setIsLoading] = React.useState(false);

  const handleLogin = async () => {
    try {
      setIsLoading(true);
      await login();
    } catch (error) {
      console.error('Login failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      setIsLoading(true);
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isAuthenticated && user) {
    return (
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-700">
          {user.name || user.username || 'User'}
        </span>
        <button
          onClick={handleLogout}
          disabled={isLoading}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:bg-gray-300"
        >
          {isLoading ? 'Logging out...' : 'Logout'}
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={handleLogin}
      disabled={isLoading}
      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300"
    >
      {isLoading ? 'Logging in...' : 'Login'}
    </button>
  );
}
