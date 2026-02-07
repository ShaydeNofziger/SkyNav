# Dropzone Directory API

## Overview

The Dropzone Directory API provides access to dropzone information with filtering and pagination capabilities. This is a public endpoint that does not require authentication.

## Endpoint

```
GET /api/dropzones
```

## Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `region` | string | No | - | Filter by state/region (e.g., "CA", "FL", "IL") |
| `country` | string | No | - | Filter by country code (e.g., "USA") |
| `isActive` | boolean | No | true | Filter by active status (true/false) |
| `page` | integer | No | 1 | Page number for pagination (min: 1) |
| `pageSize` | integer | No | 30 | Results per page (min: 1, max: 100) |

## Response Format

### Success Response (200 OK)

```json
{
  "dropzones": [
    {
      "id": "dz-00000000-0000-0000-0000-000000000001",
      "name": "Skydive Perris",
      "displayName": "Perris Valley Skydiving",
      "location": {
        "type": "Point",
        "coordinates": [-117.2156, 33.7636]
      },
      "city": "Perris",
      "state": "CA",
      "country": "USA",
      "maxAltitude": 13500,
      "aircraft": ["Twin Otter", "Skyvan", "King Air"],
      "seasonality": "Year-round operations, best weather April-October",
      "isActive": true
    }
  ],
  "totalCount": 8,
  "page": 1,
  "pageSize": 30,
  "hasMore": false
}
```

### Error Responses

#### 400 Bad Request
Invalid query parameters

```json
{
  "error": "Invalid page parameter",
  "message": "Page must be a positive integer"
}
```

#### 500 Internal Server Error
Server-side error

```json
{
  "error": "Internal server error",
  "message": "Error details..."
}
```

## Examples

### Get all active dropzones

```bash
curl https://api.skynav.example.com/api/dropzones
```

### Filter by region (California)

```bash
curl "https://api.skynav.example.com/api/dropzones?region=CA"
```

### Filter by country

```bash
curl "https://api.skynav.example.com/api/dropzones?country=USA"
```

### Get inactive dropzones

```bash
curl "https://api.skynav.example.com/api/dropzones?isActive=false"
```

### Pagination

```bash
# Get first page (30 results)
curl "https://api.skynav.example.com/api/dropzones?page=1&pageSize=30"

# Get second page
curl "https://api.skynav.example.com/api/dropzones?page=2&pageSize=30"
```

### Combined filters

```bash
# Get active dropzones in Florida with 10 results per page
curl "https://api.skynav.example.com/api/dropzones?region=FL&isActive=true&pageSize=10"
```

## Response Fields

### DropZoneSummaryDTO

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique dropzone identifier |
| `name` | string | Official dropzone name |
| `displayName` | string | Optional marketing name |
| `location` | GeoLocation | GPS coordinates (GeoJSON Point) |
| `city` | string | City name |
| `state` | string | State/province code |
| `country` | string | Country code |
| `maxAltitude` | number | Maximum jump altitude in feet |
| `aircraft` | string[] | List of aircraft types |
| `seasonality` | string | Seasonal operation notes |
| `isActive` | boolean | Whether DZ is currently operational |
| `distance` | number | Distance in meters (when searching by location) |

### GeoLocation Format

```json
{
  "type": "Point",
  "coordinates": [longitude, latitude]
}
```

Note: Coordinates are in **[longitude, latitude]** order (GeoJSON standard).

## Pagination

The API uses offset-based pagination:
- `page`: 1-based page number
- `pageSize`: Number of results per page (1-100)
- `hasMore`: Boolean indicating if more results are available
- `totalCount`: Total number of results matching the query

## Rate Limiting

Currently no rate limiting is enforced. This may change in production.

## CORS

The API supports CORS for web applications. Allowed origins will be configured based on deployment environment.

## Future Enhancements

- Location-based search (find dropzones near coordinates)
- Text search (search by name or description)
- Sorting options (by name, distance, altitude, etc.)
- Additional filters (altitude range, aircraft types, facilities)
- Geospatial queries (within radius, within bounding box)
