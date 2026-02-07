# Trip API

## Overview

The Trip API allows authenticated users to create and manage their skydiving trips. Each trip can include multiple dropzone visits, dates, notes, and a preparation checklist.

## Authentication

All trip endpoints require authentication via JWT token in the `Authorization` header:

```
Authorization: Bearer <token>
```

Trips are scoped to the authenticated user - users can only access their own trips.

## Endpoints

### Create Trip

```
POST /api/trips
```

Creates a new trip for the authenticated user. The trip is created with a default preparation checklist and `planned` status.

#### Request Headers

| Header | Required | Description |
|--------|----------|-------------|
| `Authorization` | Yes | Bearer token from Azure AD B2C |
| `Content-Type` | Yes | Must be `application/json` |

#### Request Body

```json
{
  "name": "Arizona Boogie 2026",
  "description": "Annual trip to Arizona for boogie",
  "startDate": "2026-03-15",
  "endDate": "2026-03-22",
  "notes": "Remember to pack sunscreen!"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Yes | Trip name (e.g., "Arizona Boogie 2026") |
| `description` | string | No | Trip description |
| `startDate` | string | Yes | Trip start date (ISO 8601: YYYY-MM-DD) |
| `endDate` | string | Yes | Trip end date (ISO 8601: YYYY-MM-DD) |
| `notes` | string | No | User's trip notes |

#### Validation Rules

- `name`: Required, non-empty string
- `startDate`: Required, valid ISO 8601 date (YYYY-MM-DD)
- `endDate`: Required, valid ISO 8601 date (YYYY-MM-DD)
- `endDate` must not be before `startDate`

#### Response (201 Created)

```json
{
  "id": "trip-550e8400-e29b-41d4-a716-446655440000",
  "name": "Arizona Boogie 2026",
  "description": "Annual trip to Arizona for boogie",
  "status": "planned",
  "startDate": "2026-03-15",
  "endDate": "2026-03-22",
  "segments": [],
  "checklist": [
    {
      "id": "check-12345678-1234-1234-1234-123456789012",
      "label": "Reserve rigger inspection current",
      "completed": false,
      "order": 1
    },
    {
      "id": "check-12345678-1234-1234-1234-123456789013",
      "label": "Gear packed and ready",
      "completed": false,
      "order": 2
    },
    {
      "id": "check-12345678-1234-1234-1234-123456789014",
      "label": "Reviewed dropzone landing areas",
      "completed": false,
      "order": 3
    },
    {
      "id": "check-12345678-1234-1234-1234-123456789015",
      "label": "Reviewed local hazards and patterns",
      "completed": false,
      "order": 4
    },
    {
      "id": "check-12345678-1234-1234-1234-123456789016",
      "label": "Confirmed dropzone operating hours",
      "completed": false,
      "order": 5
    },
    {
      "id": "check-12345678-1234-1234-1234-123456789017",
      "label": "Checked weather forecast",
      "completed": false,
      "order": 6
    }
  ],
  "notes": "Remember to pack sunscreen!",
  "createdAt": "2026-02-07T21:45:00.000Z",
  "updatedAt": "2026-02-07T21:45:00.000Z"
}
```

#### Error Responses

**400 Bad Request** - Invalid request body

```json
{
  "error": "Invalid request",
  "message": "Trip name is required"
}
```

```json
{
  "error": "Invalid request",
  "message": "End date cannot be before start date"
}
```

**401 Unauthorized** - Missing or invalid JWT token

```json
{
  "error": "Unauthorized",
  "message": "Token validation failed: ..."
}
```

**500 Internal Server Error** - Server error

```json
{
  "error": "Internal server error",
  "message": "Error details..."
}
```

---

### Get Trip by ID

```
GET /api/trips/{id}
```

Retrieves a specific trip by ID. The trip must belong to the authenticated user.

#### Request Headers

| Header | Required | Description |
|--------|----------|-------------|
| `Authorization` | Yes | Bearer token from Azure AD B2C |

#### URL Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | Trip ID (format: `trip-{uuid}`) |

#### Response (200 OK)

```json
{
  "id": "trip-550e8400-e29b-41d4-a716-446655440000",
  "name": "Arizona Boogie 2026",
  "description": "Annual trip to Arizona for boogie",
  "status": "planned",
  "startDate": "2026-03-15",
  "endDate": "2026-03-22",
  "segments": [],
  "checklist": [
    {
      "id": "check-12345678-1234-1234-1234-123456789012",
      "label": "Reserve rigger inspection current",
      "completed": false,
      "order": 1
    }
  ],
  "notes": "Remember to pack sunscreen!",
  "createdAt": "2026-02-07T21:45:00.000Z",
  "updatedAt": "2026-02-07T21:45:00.000Z"
}
```

#### Error Responses

**400 Bad Request** - Missing trip ID

```json
{
  "error": "Invalid request",
  "message": "Trip ID is required"
}
```

**401 Unauthorized** - Missing or invalid JWT token

```json
{
  "error": "Unauthorized",
  "message": "Token validation failed: ..."
}
```

**404 Not Found** - Trip not found or doesn't belong to user

```json
{
  "error": "Trip not found",
  "message": "Trip with ID trip-... not found or does not belong to the authenticated user"
}
```

**500 Internal Server Error** - Server error

```json
{
  "error": "Internal server error",
  "message": "Error details..."
}
```

---

## Data Models

### TripDetailDTO

Full trip information returned by GET and POST endpoints.

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique trip identifier (format: `trip-{uuid}`) |
| `name` | string | Trip name |
| `description` | string \| undefined | Trip description |
| `status` | TripStatus | Trip status: `planned`, `in_progress`, `completed`, `cancelled` |
| `startDate` | string | Trip start date (ISO 8601: YYYY-MM-DD) |
| `endDate` | string | Trip end date (ISO 8601: YYYY-MM-DD) |
| `segments` | TravelSegment[] | Array of travel segments (dropzone visits) |
| `checklist` | ChecklistItem[] | Preparation checklist items |
| `notes` | string \| undefined | User's trip notes |
| `createdAt` | string | Creation timestamp (ISO 8601) |
| `updatedAt` | string | Last update timestamp (ISO 8601) |

### ChecklistItem

A single item in the trip preparation checklist.

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique checklist item ID |
| `label` | string | Checklist item text |
| `completed` | boolean | Whether the item is completed |
| `order` | number | Display order (1-based) |

### TripStatus

Enumeration of possible trip statuses:

- `planned` - Future trip, in planning phase
- `in_progress` - Currently happening
- `completed` - Past trip
- `cancelled` - Cancelled trip

### Default Checklist

New trips are created with the following default checklist items:

1. Reserve rigger inspection current
2. Gear packed and ready
3. Reviewed dropzone landing areas
4. Reviewed local hazards and patterns
5. Confirmed dropzone operating hours
6. Checked weather forecast

---

## Examples

### Create a Simple Trip

```bash
curl -X POST https://api.skynav.example.com/api/trips \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Weekend at Skydive Chicago",
    "startDate": "2026-05-15",
    "endDate": "2026-05-17"
  }'
```

### Create a Trip with All Fields

```bash
curl -X POST https://api.skynav.example.com/api/trips \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Arizona Boogie 2026",
    "description": "Annual spring boogie trip",
    "startDate": "2026-03-15",
    "endDate": "2026-03-22",
    "notes": "Remember to pack sunscreen and extra batteries for helmet cam!"
  }'
```

### Get a Specific Trip

```bash
curl https://api.skynav.example.com/api/trips/trip-550e8400-e29b-41d4-a716-446655440000 \
  -H "Authorization: Bearer <token>"
```

---

## Related Documentation

- [Architecture Overview](../architecture.md)
- [Domain Models](../../src/api/src/models/README.md)
- [DTOs](../../src/api/src/dtos/README.md)
- [Authentication](../AUTHENTICATION.md)

---

## Future Enhancements

The following features are planned for future releases:

- **GET /api/trips** - List all trips for the authenticated user with filtering
- **PUT /api/trips/{id}** - Update trip details
- **DELETE /api/trips/{id}** - Delete a trip
- **PATCH /api/trips/{id}/checklist** - Update checklist items
- **POST /api/trips/{id}/segments** - Add a travel segment (dropzone visit)
- **PUT /api/trips/{id}/segments/{segmentId}** - Update a travel segment
- **DELETE /api/trips/{id}/segments/{segmentId}** - Remove a travel segment

---

**Last Updated:** February 7, 2026  
**Status:** ✅ MVP Core Complete (Create & Read)
