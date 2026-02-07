'use client';

import { useAuth } from "@/contexts/AuthContext";
import { EmptyState } from "@/components/EmptyState";
import { Container } from "@/components/Layout";
import { useRouter } from "next/navigation";

export default function TripsPage() {
  const { isAuthenticated, login } = useAuth();
  const router = useRouter();

  if (!isAuthenticated) {
    return (
      <div className="min-h-full bg-gray-50">
        <Container className="py-6 sm:py-8">
          <EmptyState
            icon={
              <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            }
            title="Sign In Required"
            description="Please sign in to view and manage your trip plans."
            action={{
              label: "Sign In",
              onClick: () => login(),
            }}
          />
        </Container>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-gray-50">
      <Container className="py-6 sm:py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            My Trips
          </h1>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
            + New Trip
          </button>
        </div>
        
        <EmptyState
          icon={
            <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
          }
          title="No Trips Yet"
          description="Start planning your next skydiving adventure. Create a trip to organize your travel, track dropzones you want to visit, and manage your itinerary."
          action={{
            label: "Create Your First Trip",
            onClick: () => {
              // TODO: Navigate to trip creation
              console.log("Create trip");
            },
          }}
        />
      </Container>
    </div>
  );
}
