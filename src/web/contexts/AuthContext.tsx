/**
 * Authentication Provider using MSAL
 */

'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  PublicClientApplication,
  AccountInfo,
  InteractionStatus,
} from '@azure/msal-browser';
import { MsalProvider, useMsal, useIsAuthenticated } from '@azure/msal-react';
import { msalConfig, loginRequest } from '@/lib/msalConfig';

// Initialize MSAL instance
const msalInstance = new PublicClientApplication(msalConfig);

interface AuthContextType {
  isAuthenticated: boolean;
  user: AccountInfo | null;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  getAccessToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Internal Auth Provider that uses MSAL hooks
 */
function AuthProviderInternal({ children }: { children: React.ReactNode }) {
  const { instance, accounts, inProgress } = useMsal();
  const isAuthenticated = useIsAuthenticated();
  const [user, setUser] = useState<AccountInfo | null>(null);

  useEffect(() => {
    if (accounts.length > 0) {
      setUser(accounts[0]);
    } else {
      setUser(null);
    }
  }, [accounts]);

  const login = async () => {
    try {
      await instance.loginPopup(loginRequest);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await instance.logoutPopup();
    } catch (error) {
      console.error('Logout failed:', error);
      throw error;
    }
  };

  const getAccessToken = async (): Promise<string | null> => {
    if (!user) {
      return null;
    }

    try {
      const response = await instance.acquireTokenSilent({
        scopes: loginRequest.scopes,
        account: user,
      });
      return response.accessToken;
    } catch (error) {
      console.error('Failed to acquire token silently:', error);
      
      // Fallback to interactive token acquisition
      try {
        const response = await instance.acquireTokenPopup({
          scopes: loginRequest.scopes,
          account: user,
        });
        return response.accessToken;
      } catch (popupError) {
        console.error('Failed to acquire token via popup:', popupError);
        return null;
      }
    }
  };

  const value: AuthContextType = {
    isAuthenticated,
    user,
    login,
    logout,
    getAccessToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Main Auth Provider component
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <MsalProvider instance={msalInstance}>
      <AuthProviderInternal>{children}</AuthProviderInternal>
    </MsalProvider>
  );
}

/**
 * Hook to access auth context
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
