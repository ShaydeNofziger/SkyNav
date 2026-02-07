# SkyNav Domain Models

## Overview

This document describes the core domain models for the SkyNav API and their relationships. The models are designed to support the MVP features: dropzone directory, user management, trip planning, and travel mode.

## Models

### 1. DropZone

Represents a skydiving dropzone with operational information, location data, and facility details.

**Key Fields:**
- `id` (string): Unique identifier (format: `dz-{guid}`)
- `name` (string): Official dropzone name
- `location` (GeoLocation): GPS coordinates in GeoJSON format
- `address` (Address): Physical address
- `facilities` (Facilities): Aircraft, altitude, amenities
- `isActive` (boolean): Operational status

**Cosmos DB:**
- Container: `dropzones`
- Partition Key: `/id`

**Usage:**
- Core entity for the dropzone directory
- Referenced by TravelSegment for trip planning
- Can be favorited by users

---

### 2. User

Represents a user in the SkyNav system with authentication, profile, and preferences.

**Key Fields:**
- `id` (string): Azure AD B2C subject ID
- `email` (string): User's email address
- `roles` (UserRole[]): User's roles (user, admin)
- `profile` (UserProfile): Display name, bio, skydiving info
- `preferences` (UserPreferences): Settings and preferences
- `favoriteDropzoneIds` (string[]): List of favorite DZ IDs

**Cosmos DB:**
- Container: `users`
- Partition Key: `/id`

**Usage:**
- Authentication and authorization
- Profile management
- Favorites collection
- Ownership of trips

---

### 3. Trip

Represents a planned or completed trip to one or more dropzones.

**Key Fields:**
- `id` (string): Unique identifier (format: `trip-{guid}`)
- `userId` (string): Owner of the trip
- `name` (string): User-defined trip name
- `status` (TripStatus): planned, in_progress, completed, cancelled
- `startDate` / `endDate` (string): Trip date range
- `segments` (TravelSegment[]): Visits to dropzones
- `checklist` (ChecklistItem[]): Preparation checklist

**Cosmos DB:**
- Container: `trips`
- Partition Key: `/userId`

**Usage:**
- Trip planning and management
- Travel mode preparation
- Embedding travel segments for atomic updates

---

### 4. TravelSegment

Represents a single visit to a dropzone within a trip.

**Key Fields:**
- `id` (string): Unique identifier within trip (format: `seg-{guid}`)
- `dropzoneId` (string): Reference to DropZone
- `dropzoneName` (string): Denormalized for display
- `arrivalDate` / `departureDate` (string): Visit dates
- `plannedJumpCount` / `actualJumpCount` (number): Jump planning
- `jumpTypes` (JumpType[]): Types of jumps (fun, coaching, etc.)
- `accommodation` (Accommodation): Lodging details

**Data Model:**
- Embedded within Trip documents
- Not a separate container

**Usage:**
- Detailed visit planning
- Jump goal tracking
- Accommodation management

---

## Model Relationships

```
┌─────────────────────────────────────────────────────────────────┐
│                     DOMAIN MODEL RELATIONSHIPS                   │
└─────────────────────────────────────────────────────────────────┘

┌──────────────┐              ┌──────────────┐
│   DropZone   │              │     User     │
│              │              │              │
│ - id         │◀─────────────│ - id         │
│ - name       │   favorites  │ - email      │
│ - location   │              │ - roles      │
│ - facilities │              │ - profile    │
│ - address    │              │ - preferences│
└──────────────┘              │ - favoriteIds│
       ▲                      └──────────────┘
       │                             │
       │                             │ owns (1:N)
       │ references                  │
       │                             ▼
       │                      ┌──────────────┐
       │                      │     Trip     │
       │                      │              │
       │                      │ - id         │
       │                      │ - userId     │
       │                      │ - name       │
       │                      │ - status     │
       │                      │ - dates      │
       │                      │ - segments[] │
       │                      │ - checklist[]│
       │                      └──────────────┘
       │                             │
       │                             │ contains (1:N)
       │                             │ (embedded)
       │                             ▼
       │                   ┌──────────────────┐
       └───────────────────│ TravelSegment    │
                           │                  │
                           │ - id             │
                           │ - dropzoneId     │
                           │ - dates          │
                           │ - jumpPlanning   │
                           │ - accommodation  │
                           │ - notes          │
                           └──────────────────┘
```

## Relationship Details

### User → DropZone (Many-to-Many via Favorites)

- **Type:** Many-to-Many
- **Implementation:** User stores array of `favoriteDropzoneIds`
- **Rationale:** Simple implementation for MVP; easy to query user's favorites
- **Query:** Get user → access `favoriteDropzoneIds` array
- **Alternative:** Separate `favorites` container if advanced querying needed

### User → Trip (One-to-Many)

- **Type:** One-to-Many (User owns multiple Trips)
- **Implementation:** Trip has `userId` field (partition key)
- **Rationale:** Efficient queries for user's trips (single partition)
- **Query:** Get trips for user → partition key query on `userId`

### Trip → TravelSegment (One-to-Many, Embedded)

- **Type:** One-to-Many (Trip contains multiple TravelSegments)
- **Implementation:** TravelSegments embedded in Trip document as array
- **Rationale:** 
  - Atomic updates (all segments updated together)
  - Simplified queries (no joins needed)
  - Typical trip has 1-5 segments (reasonable document size)
- **Trade-off:** Limited individual segment operations; acceptable for MVP

### TravelSegment → DropZone (Many-to-One)

- **Type:** Many-to-One (Multiple segments can reference same DropZone)
- **Implementation:** TravelSegment stores `dropzoneId` and denormalized `dropzoneName`
- **Rationale:**
  - Reference for full DZ details
  - Denormalized name for display without additional query
- **Query:** Get DZ details → secondary query using `dropzoneId`

---

## Data Access Patterns

### Primary Queries (Optimized)

1. **Get User by ID**
   - Container: `users`
   - Partition: `/id = {userId}`
   - Complexity: O(1) - single partition

2. **Get DropZone by ID**
   - Container: `dropzones`
   - Partition: `/id = {dropzoneId}`
   - Complexity: O(1) - single partition

3. **Get Trips for User**
   - Container: `trips`
   - Partition: `/userId = {userId}`
   - Complexity: O(1) - single partition query

4. **Get User's Favorites**
   - Get User by ID → access `favoriteDropzoneIds`
   - Batch query DropZones by IDs (cross-partition)
   - Complexity: O(n) where n = number of favorites

### Secondary Queries (Cross-Partition)

1. **List All DropZones**
   - Container: `dropzones`
   - Query: `SELECT * FROM dropzones WHERE isActive = true`
   - Complexity: Cross-partition scan

2. **Search DropZones by Location**
   - Container: `dropzones`
   - Query: `SELECT * FROM dropzones WHERE ST_DISTANCE(location, @point) < @radius`
   - Complexity: Cross-partition with geospatial index

3. **Search DropZones by Name**
   - Container: `dropzones`
   - Query: `SELECT * FROM dropzones WHERE CONTAINS(name, @searchTerm)`
   - Complexity: Cross-partition scan

---

## Denormalization Strategy

### Why Denormalize?

In NoSQL databases like Cosmos DB, denormalization reduces query complexity and improves performance by avoiding "joins."

### Denormalization in SkyNav

1. **TravelSegment.dropzoneName**
   - **Source:** DropZone.name
   - **Reason:** Display trip segments without querying DropZone
   - **Update Strategy:** Update when DropZone name changes (rare)

2. **Future Considerations:**
   - User display names in community notes (not yet implemented)
   - DZ location in search results (could denormalize coordinates)

---

## Container Design

### Partition Key Strategy

| Container | Partition Key | Rationale |
|-----------|---------------|-----------|
| `dropzones` | `/id` | Each DZ is own partition; simple model |
| `users` | `/id` | Each user is own partition; efficient user queries |
| `trips` | `/userId` | All trips for user in same partition |

**Rationale for Trip Partitioning:**
- User typically queries their own trips frequently
- Single-partition queries are fast and cheap
- User's trips are logically grouped

---

## Scalability Considerations

### Document Sizes

- **DropZone:** ~5-10 KB (small)
- **User:** ~2-5 KB (small)
- **Trip:** ~10-50 KB (small to medium, depends on segment count)
- **Cosmos DB Limit:** 2 MB per document

### Partition Growth

- **dropzones:** ~1,000-10,000 DZs globally (low partition count)
- **users:** Scales linearly with users (good distribution)
- **trips:** Multiple trips per user (good distribution)

### Future Optimizations

If scaling issues arise:
1. **Separate TravelSegments:** Move to own container with `/tripId` partition
2. **Optimize Favorites:** Use separate `favorites` container for complex queries
3. **Add Caching:** Cache frequently accessed DZ data (Redis)

---

## Validation and Type Safety

All models include TypeScript interfaces with:
- **Type guards:** `isDropZone()`, `isUser()`, `isTrip()`, `isTravelSegment()`
- **Strict typing:** Required vs optional fields
- **Enums:** For status, roles, jump types (compile-time safety)

---

## Related Documentation

- [ADR-003: Data Storage Approach](../../docs/adr/003-data-storage-approach.md)
- [Architecture Overview](../../docs/architecture.md)
- [API Documentation](../README.md)

---

**Last Updated:** February 7, 2026  
**Status:** ✅ Defined and Documented
