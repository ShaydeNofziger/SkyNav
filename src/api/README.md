# SkyNav API

This directory contains the Azure Functions backend for SkyNav.

## Structure

The API will be organized into the following components:

- **Functions**: Azure Function HTTP triggers for API endpoints
- **Models**: Data models and TypeScript interfaces
- **Services**: Business logic and data access layer
- **Utils**: Shared utilities and helpers
- **Config**: Configuration and environment settings

## Technology Stack

- **Runtime**: Node.js 18+ / TypeScript
- **Framework**: Azure Functions v4
- **Database**: Azure Cosmos DB (SQL API)
- **Storage**: Azure Blob Storage
- **Authentication**: JWT-based with Azure AD B2C

## API Endpoints

### Dropzone Directory ✅
- `GET /api/dropzones` - List all dropzones (paginated)
- `GET /api/dropzones/:id` - Get dropzone details (Planned)

### Trip Management ✅
- `POST /api/trips` - Create a new trip
- `GET /api/trips/:id` - Get trip by ID

### User Management ✅
- `POST /api/users/provision` - Provision user on first login
- `GET /api/users/me` - Get user profile
- `PUT /api/users/me` - Update user profile

### Admin Management
- `POST /api/admin/dropzones` - Create dropzone
- `PUT /api/admin/dropzones/:id` - Update dropzone
- `DELETE /api/admin/dropzones/:id` - Delete dropzone
- `POST /api/admin/annotations` - Create map annotation
- `PUT /api/admin/annotations/:id` - Update annotation
- `DELETE /api/admin/annotations/:id` - Delete annotation

### Community Notes
- `POST /api/notes` - Submit community note
- `GET /api/notes/dropzone/:id` - Get approved notes for DZ
- `POST /api/admin/notes/:id/approve` - Approve note
- `POST /api/admin/notes/:id/reject` - Reject note

### User Favorites
- `GET /api/favorites` - Get user's favorite DZs
- `POST /api/favorites/:dzId` - Add DZ to favorites
- `DELETE /api/favorites/:dzId` - Remove from favorites

## Development Setup

```bash
# Install dependencies
npm install

# Start local Functions runtime
npm start

# Run tests
npm test

# Lint code
npm run lint
```

## Configuration

Local development requires a `local.settings.json` file (not committed to git):

```json
{
  "IsEncrypted": false,
  "Values": {
    "AzureWebJobsStorage": "UseDevelopmentStorage=true",
    "FUNCTIONS_WORKER_RUNTIME": "node",
    "COSMOS_DB_CONNECTION_STRING": "",
    "AZURE_MAPS_SUBSCRIPTION_KEY": "",
    "JWT_SECRET": ""
  }
}
```

## Testing

- Unit tests with Vitest
- Integration tests for API endpoints
- Test coverage target: ≥70% for business logic

---

**Status**: 🚧 Coming in Milestone 1 (Weeks 1-2)
