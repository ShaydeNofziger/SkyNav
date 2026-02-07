# Validation and Error Handling

This document describes the validation and error handling mechanisms implemented in the SkyNav application.

## Backend API Validation

### Centralized Error Responses

The API uses a centralized error response utility (`src/api/src/utils/errorResponse.ts`) that provides:

- **Consistent error format**: All error responses follow a standard structure with `error`, `message`, and optional `details` fields
- **User-friendly messages**: Error messages are written for end users, not developers
- **HTTP status codes**: Proper status codes (400, 401, 403, 404, 422, 500) for different error types

#### Available Error Response Functions

```typescript
// 400 Bad Request
badRequest(message: string, details?: Record<string, string>)

// 401 Unauthorized (with user-friendly auth messages)
unauthorized(message?: string)

// 403 Forbidden
forbidden(message?: string)

// 404 Not Found
notFound(message?: string)

// 422 Validation Error (with field-level details)
validationError(message: string, details?: Record<string, string>)

// 500 Internal Server Error
internalServerError(message?: string)

// Handle auth-specific errors
handleAuthError(error: Error)

// Parse and validate request body
parseRequestBody<T>(request, requiredFields?)
```

### Validation Utilities

The `src/api/src/utils/validation.ts` file provides reusable validation functions:

- **Date validation**: Format checking (YYYY-MM-DD) and range validation
- **Type-specific validation**: Flight, drive, and lodging details validation
- **Profile validation**: User profile field validation with type checking
- **Field validation**: String, number, email validation helpers

### Enhanced Authentication Error Messages

The authentication middleware now provides clear, actionable error messages:

- "Authentication token is missing or invalid. Please sign in again."
- "Your session has expired. Please sign in again."
- "Token format is invalid. Please sign in again."
- "Authentication service configuration is missing. Please contact support."

### Validated Endpoints

The following endpoints have enhanced validation:

1. **POST /api/trips** - Trip creation with date validation
2. **PUT /api/trips/{id}** - Trip updates with field validation
3. **POST /api/trips/{tripId}/segments** - Segment creation with:
   - Required field validation (type, dates)
   - Date format and range validation
   - Type-specific detail validation (flight/drive/lodging)
4. **PUT /api/trips/{tripId}/segments/{segmentId}** - Segment updates
5. **PUT /api/users/me** - User profile updates with:
   - Field type validation
   - Array validation for licenses and ratings
   - Number range validation for jump count

### Request Body Parsing

All endpoints that accept JSON bodies now handle parsing errors gracefully:

- Malformed JSON returns a 400 error with message: "Invalid JSON in request body"
- Missing required fields are identified with field-level error details
- Empty request bodies are rejected with clear messages

## Frontend Error Handling

### Error Parsing Utility

The `src/web/lib/apiErrors.ts` utility provides:

```typescript
// Parse API error responses and extract user-friendly messages
parseApiError(response: Response): Promise<string>

// Handle API responses with automatic error parsing
handleApiResponse<T>(response: Response): Promise<T>

// Get user-friendly error message for any error
getUserFriendlyErrorMessage(error: unknown): string

// Format validation errors for display
formatValidationErrors(details?: Record<string, string>): string[]
```

### Alert Component

A new `Alert` component (`src/web/components/Alert/Alert.tsx`) provides consistent error display:

- **Types**: error, warning, success, info
- **Features**: 
  - Title and message
  - Dismissible with onDismiss callback
  - Icon support
  - Tailwind CSS styling
  - Accessible (screen reader support)

#### Usage Example

```tsx
<Alert 
  type="error"
  title="Error"
  message="Failed to load trips. Please try again."
  onDismiss={() => setError(null)}
/>
```

### Enhanced Service Error Handling

All frontend API services now use the `handleApiResponse` utility:

- `tripService.ts` - All trip operations
- `userService.ts` - All user operations  
- `segmentService.ts` - All segment operations

### User-Friendly Error Messages

The frontend automatically converts error types to user-friendly messages:

- Network errors: "Unable to connect to the server. Please check your internet connection and try again."
- Auth errors: Uses backend messages (already user-friendly)
- Session expiry: "Your session has expired. Please sign in again."
- Generic errors: Displays the error message from the backend

## Validation Examples

### Creating a Trip

**Valid Request:**
```json
{
  "name": "Arizona Boogie 2024",
  "startDate": "2024-06-15",
  "endDate": "2024-06-20",
  "description": "Annual boogie trip"
}
```

**Invalid Request - Missing Name:**
```json
{
  "startDate": "2024-06-15",
  "endDate": "2024-06-20"
}
```

**Response:**
```json
{
  "error": "Bad Request",
  "message": "Trip name is required"
}
```

**Invalid Request - Bad Date Format:**
```json
{
  "name": "Arizona Boogie",
  "startDate": "06/15/2024",
  "endDate": "2024-06-20"
}
```

**Response:**
```json
{
  "error": "Bad Request",
  "message": "Invalid start date format (expected: YYYY-MM-DD)"
}
```

### Creating a Travel Segment

**Valid Flight Segment:**
```json
{
  "type": "flight",
  "startDate": "2024-06-15",
  "endDate": "2024-06-15",
  "flightDetails": {
    "departureAirport": "LAX",
    "arrivalAirport": "PHX",
    "airline": "Southwest",
    "flightNumber": "WN1234"
  }
}
```

**Invalid Flight Segment - Missing Airport:**
```json
{
  "type": "flight",
  "startDate": "2024-06-15",
  "endDate": "2024-06-15",
  "flightDetails": {
    "departureAirport": "LAX"
    // Missing arrivalAirport
  }
}
```

**Response:**
```json
{
  "error": "Validation Error",
  "message": "Invalid segment data",
  "details": {
    "arrivalAirport": "Arrival airport is required for flight segments"
  }
}
```

### Updating User Profile

**Valid Update:**
```json
{
  "displayName": "John Doe",
  "jumpCount": 150,
  "licenses": ["A", "B", "C"]
}
```

**Invalid Update - Bad Jump Count:**
```json
{
  "jumpCount": -5
}
```

**Response:**
```json
{
  "error": "Validation Error",
  "message": "Invalid profile data",
  "details": {
    "jumpCount": "Jump count must be a non-negative number"
  }
}
```

## Testing Error Handling

### Manual Testing Checklist

- [ ] Test creating a trip without required fields
- [ ] Test creating a trip with invalid date format
- [ ] Test creating a trip with end date before start date
- [ ] Test authentication with expired token
- [ ] Test authentication with missing token
- [ ] Test authentication with malformed token
- [ ] Test creating a flight segment without airport details
- [ ] Test updating profile with invalid jump count
- [ ] Test network error handling (disconnect network)
- [ ] Test malformed JSON in request body

### Expected Behaviors

1. **All validation errors** return 400 or 422 status with clear messages
2. **All auth errors** return 401 with actionable messages
3. **Not found errors** return 404 with resource-specific messages
4. **Server errors** return 500 with generic user-friendly message
5. **Frontend displays** all errors using the Alert component
6. **Network errors** show connection-specific messages
7. **Validation details** are formatted and displayed clearly

## Best Practices

### Backend

1. **Always validate** required fields before processing
2. **Use centralized utilities** for consistent error responses
3. **Provide specific messages** that help users understand what to fix
4. **Include field-level details** for validation errors
5. **Handle JSON parsing** errors separately from validation errors
6. **Don't expose** internal error details to users

### Frontend

1. **Always use** `handleApiResponse` for API calls
2. **Display errors** using the Alert component
3. **Make errors dismissible** when appropriate
4. **Provide context** in error titles
5. **Don't show** generic "An error occurred" without trying to parse the error first
6. **Log errors** to console for debugging

## Future Improvements

- Add client-side validation before API calls to provide instant feedback
- Implement field-level error display in forms
- Add retry logic for transient errors
- Implement error tracking/monitoring service
- Add localization support for error messages
- Create automated tests for validation scenarios
