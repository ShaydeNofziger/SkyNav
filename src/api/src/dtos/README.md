# Data Transfer Objects (DTOs)

## Overview

DTOs (Data Transfer Objects) provide a clean separation between internal domain models and the external API contract. They control what data is exposed to API clients and how it's structured.

## Purpose

1. **API Contract Stability**: DTOs insulate API clients from internal model changes
2. **Security**: Filter sensitive fields (e.g., user's email, internal metadata)
3. **Optimization**: Tailor response size for different use cases (summary vs detail)
4. **Versioning**: Allow API version evolution without changing domain models

## DTO Categories

### Request DTOs

Used for API input (POST, PUT, PATCH requests):
- `CreateDropZoneDTO`
- `UpdateDropZoneDTO`
- `UpdateUserProfileDTO`
- `UpdateUserPreferencesDTO`
- `CreateTripDTO`
- `UpdateTripDTO`
- `CreateTravelSegmentDTO`
- `UpdateTravelSegmentDTO`

### Response DTOs

Used for API output (GET requests):
- `DropZoneSummaryDTO` - Minimal info for list views
- `DropZoneDetailDTO` - Full info for detail views
- `PublicUserProfileDTO` - Public user information
- `PrivateUserProfileDTO` - Full user information (own profile only)
- `TripSummaryDTO` - Minimal info for list views
- `TripDetailDTO` - Full trip with segments and checklist

### Collection DTOs

Used for paginated list responses:
- `DropZoneListResponseDTO`
- `TripListResponseDTO`
- `UserFavoritesResponseDTO`

## DTO Design Patterns

### 1. Summary vs Detail Pattern

**Use Case:** List views need minimal data; detail views need full data.

**Example:**
```typescript
// List view: Lightweight, shows many items
DropZoneSummaryDTO {
  id, name, location, city, state, maxAltitude, aircraft
}

// Detail view: Complete information, shows one item
DropZoneDetailDTO {
  id, name, location, address, facilities, contact, ...
}
```

**Benefits:**
- Reduced payload size for list endpoints
- Faster response times
- Lower bandwidth consumption

---

### 2. Public vs Private Pattern

**Use Case:** Different data visibility based on authorization.

**Example:**
```typescript
// Public profile: Anyone can see
PublicUserProfileDTO {
  id, displayName, bio, licenses, ratings
}

// Private profile: Only the user can see
PrivateUserProfileDTO {
  email, roles, preferences, favoriteDropzoneIds, ...
}
```

**Benefits:**
- Privacy protection
- Clear authorization boundaries
- Prevents accidental data leaks

---

### 3. Create vs Update Pattern

**Use Case:** Different fields allowed during creation vs update.

**Example:**
```typescript
// Create: All fields required/allowed
CreateDropZoneDTO {
  name: string (required)
  location: GeoLocation (required)
  facilities: Facilities (required)
}

// Update: All fields optional (partial update)
UpdateDropZoneDTO {
  name?: string
  location?: GeoLocation
  facilities?: Facilities
}
```

**Benefits:**
- Enforces required fields at creation
- Allows partial updates
- Clear API semantics

---

## Mapping Functions

Each DTO includes mapping functions to convert between domain models and DTOs:

```typescript
// Domain Model → DTO
toDropZoneSummaryDTO(dropzone: DropZone): DropZoneSummaryDTO
toDropZoneDetailDTO(dropzone: DropZone): DropZoneDetailDTO
toPublicUserProfileDTO(user: User): PublicUserProfileDTO
toPrivateUserProfileDTO(user: User): PrivateUserProfileDTO
toTripSummaryDTO(trip: Trip): TripSummaryDTO
toTripDetailDTO(trip: Trip): TripDetailDTO
```

**Usage:**
```typescript
// In API handler
const dropzone: DropZone = await getDropZoneById(id);
const dto = toDropZoneDetailDTO(dropzone);
return { statusCode: 200, body: JSON.stringify(dto) };
```

---

## Field Denormalization in DTOs

Some DTOs include denormalized fields for convenience:

### DropZoneSummaryDTO

```typescript
{
  city: string,    // Denormalized from address.city
  state: string,   // Denormalized from address.state
  country: string, // Denormalized from address.country
  distance?: number // Calculated field (when searching by location)
}
```

**Rationale:** List views often need location info without full address structure.

### TripSummaryDTO

```typescript
{
  dropzoneCount: number,        // Calculated from segments.length
  totalJumps: number,           // Calculated from segments
  completedChecklistItems: number, // Calculated from checklist
}
```

**Rationale:** Aggregated metrics avoid client-side calculations.

---

## Validation

DTOs should be validated before use:

1. **Type Validation**: Ensured by TypeScript at compile time
2. **Business Validation**: Performed in service layer
3. **Schema Validation**: Can use libraries like Zod or Joi

**Example:**
```typescript
// Future: Add schema validation
import { z } from 'zod';

const CreateDropZoneSchema = z.object({
  name: z.string().min(1).max(100),
  location: z.object({
    type: z.literal('Point'),
    coordinates: z.tuple([z.number(), z.number()])
  }),
  // ... other fields
});

function validateCreateDropZone(dto: CreateDropZoneDTO) {
  return CreateDropZoneSchema.parse(dto);
}
```

---

## API Response Envelope

All API responses should use a consistent envelope:

```typescript
// Success Response
{
  success: true,
  data: DropZoneDetailDTO,
  metadata?: {
    timestamp: string,
    requestId: string
  }
}

// Error Response
{
  success: false,
  error: {
    code: string,
    message: string,
    details?: any
  }
}
```

**Note:** Envelope implementation is future work; DTOs define the `data` payload.

---

## Pagination

Collection DTOs include pagination metadata:

```typescript
interface DropZoneListResponseDTO {
  dropzones: DropZoneSummaryDTO[];
  totalCount: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}
```

**Standard Pagination Parameters:**
- `page`: Page number (1-indexed)
- `pageSize`: Items per page (default: 30, max: 100)
- `hasMore`: Whether more pages exist

---

## DTO Naming Conventions

| Suffix | Purpose | Example |
|--------|---------|---------|
| `SummaryDTO` | Minimal info for lists | `DropZoneSummaryDTO` |
| `DetailDTO` | Full info for detail view | `DropZoneDetailDTO` |
| `CreateDTO` | Input for creating | `CreateDropZoneDTO` |
| `UpdateDTO` | Input for updating | `UpdateDropZoneDTO` |
| `ResponseDTO` | Collection responses | `DropZoneListResponseDTO` |

---

## Future Enhancements

### API Versioning

Support multiple API versions with DTO versioning:

```typescript
// v1
dtos/v1/DropZoneDTO.ts

// v2 (breaking changes)
dtos/v2/DropZoneDTO.ts
```

### GraphQL Support

DTOs can serve as GraphQL type definitions:

```graphql
type DropZoneSummary {
  id: ID!
  name: String!
  location: GeoLocation!
  city: String!
  state: String!
}
```

### OpenAPI/Swagger

Generate OpenAPI specs from DTOs:

```yaml
components:
  schemas:
    DropZoneSummaryDTO:
      type: object
      properties:
        id:
          type: string
        name:
          type: string
```

---

## Related Documentation

- [Domain Models README](../models/README.md)
- [API Documentation](../README.md)
- [ADR-001: Backend Technology Selection](../../docs/adr/001-backend-technology.md)

---

**Last Updated:** February 7, 2026  
**Status:** ✅ Defined and Documented
