'use client';

import { useAuth } from "@/contexts/AuthContext";
import { EmptyState } from "@/components/EmptyState";
import { Container } from "@/components/Layout";
import { UserProfile } from "@/components/UserProfile";

export default function ProfilePage() {
  const { isAuthenticated, login } = useAuth();

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
            description="Please sign in to view and edit your profile."
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
        <UserProfile />
      </Container>
    </div>
  );
}
