'use client';

import { EmptyState } from "@/components/EmptyState";
import { Container } from "@/components/Layout";

export default function DropzonesPage() {
  return (
    <div className="min-h-full bg-gray-50">
      <Container className="py-6 sm:py-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">
          Dropzone Directory
        </h1>
        
        <EmptyState
          icon={
            <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          }
          title="No Dropzones Yet"
          description="The dropzone directory is being populated. Check back soon to discover dropzones around the world with detailed information, maps, and safety data."
        />
      </Container>
    </div>
  );
}
