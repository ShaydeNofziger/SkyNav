'use client';

import { LoginButton } from "@/components/LoginButton";
import { UserProfile } from "@/components/UserProfile";
import { useAuth } from "@/contexts/AuthContext";

export default function Home() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">SkyNav</h1>
          <LoginButton />
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!isAuthenticated ? (
          <div className="text-center py-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Welcome to SkyNav
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Your dropzone intelligence platform
            </p>
            <p className="text-gray-500">
              Please log in to access your profile and favorites
            </p>
          </div>
        ) : (
          <UserProfile />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 text-center text-gray-500 text-sm">
          <p>© 2026 SkyNav. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
