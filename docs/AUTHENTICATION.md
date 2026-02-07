# Authentication Implementation Guide

This document describes the authentication implementation for SkyNav using Azure AD B2C.

## Architecture

SkyNav uses Azure AD B2C (Business-to-Consumer) for authentication, which provides:
- User registration and login
- Password management (reset, change)
- JWT token-based authentication
- Social identity providers (Google, Microsoft, Facebook)
- Multi-factor authentication (MFA) support

### Authentication Flow

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│   Browser   │         │  Azure AD    │         │   Backend   │
│  (Next.js)  │         │     B2C      │         │  Functions  │
└──────┬──────┘         └──────┬───────┘         └──────┬──────┘
       │                       │                        │
       │ 1. Login Request      │                        │
       │──────────────────────>│                        │
       │                       │                        │
       │ 2. User Auth          │                        │
       │<─────────────────────>│                        │
       │                       │                        │
       │ 3. JWT Token          │                        │
       │<──────────────────────│                        │
       │                       │                        │
       │ 4. API Call + Token   │                        │
       │───────────────────────────────────────────────>│
       │                       │                        │
       │                       │ 5. Validate Token      │
       │                       │<───────────────────────│
       │                       │                        │
       │                       │ 6. Token Valid         │
       │                       │────────────────────────>│
       │                       │                        │
       │ 7. API Response       │                        │
       │<───────────────────────────────────────────────│
```

## Backend Implementation

### JWT Validation Middleware

Location: `/src/api/src/middleware/auth.ts`

The middleware validates JWT tokens from Azure AD B2C:
- Extracts token from Authorization header
- Fetches public signing keys from B2C JWKS endpoint
- Verifies token signature and claims
- Returns authenticated user context

Usage:
```typescript
import { validateToken } from '../middleware/auth';

export async function myFunction(request: HttpRequest, context: InvocationContext) {
  const user = await validateToken(request, context);
  // user.userId, user.email, user.name, user.roles
}
```

### User Service

Location: `/src/api/src/services/UserService.ts`

Manages user profiles in Cosmos DB:
- `getUserById()` - Fetch user by ID
- `getUserProfile()` - Get private user profile
- `createUserOnFirstLogin()` - Create user on first B2C login
- `updateUserProfile()` - Update user profile
- `updateUserPreferences()` - Update preferences
- `addFavoriteDropzone()` / `removeFavoriteDropzone()` - Manage favorites

### API Endpoints

#### POST `/api/users/provision`
Provisions user in Cosmos DB on first login.
- **Authentication**: Required (JWT Bearer token)
- **Request**: Empty body
- **Response**: User profile object

#### GET `/api/users/me`
Gets current user's profile.
- **Authentication**: Required (JWT Bearer token)
- **Response**: User profile object

#### PUT `/api/users/me`
Updates current user's profile.
- **Authentication**: Required (JWT Bearer token)
- **Request Body**:
  ```json
  {
    "displayName": "John Jumper",
    "firstName": "John",
    "lastName": "Jumper",
    "homeDropzoneId": "dropzone-id",
    "uspaNumber": "A12345",
    "jumpCount": 500,
    "licenses": ["A", "B", "C"],
    "ratings": ["Tandem Instructor"]
  }
  ```
- **Response**: Updated user profile

## Frontend Implementation

### MSAL Configuration

Location: `/src/web/lib/msalConfig.ts`

Configures Microsoft Authentication Library (MSAL) for B2C:
- Client ID and tenant configuration
- Known authorities
- Redirect URIs
- Token scopes

### Authentication Context

Location: `/src/web/contexts/AuthContext.tsx`

Provides authentication state and methods:
- `isAuthenticated` - Boolean indicating auth status
- `user` - Current user account info
- `login()` - Initiate login flow
- `logout()` - Logout current user
- `getAccessToken()` - Get access token for API calls

Usage:
```typescript
import { useAuth } from '@/contexts/AuthContext';

function MyComponent() {
  const { isAuthenticated, user, login, logout } = useAuth();
  
  return (
    <div>
      {isAuthenticated ? (
        <button onClick={logout}>Logout</button>
      ) : (
        <button onClick={login}>Login</button>
      )}
    </div>
  );
}
```

### User Service

Location: `/src/web/services/userService.ts`

Client-side API calls:
- `provisionUser()` - Provision user on first login
- `getUserProfile()` - Fetch user profile
- `updateUserProfile()` - Update user profile

### Components

#### LoginButton
Location: `/src/web/components/LoginButton.tsx`

Simple login/logout button that adapts based on auth state.

#### UserProfile
Location: `/src/web/components/UserProfile.tsx`

Displays and allows editing of user profile information.

## Configuration

### Backend Configuration

File: `/src/api/local.settings.json` (not committed)

Required environment variables:
```json
{
  "Values": {
    "COSMOS_DB_ENDPOINT": "https://your-cosmos.documents.azure.com:443/",
    "COSMOS_DB_KEY": "your-cosmos-key",
    "COSMOS_DB_DATABASE_NAME": "SkyNavDB",
    "AZURE_AD_B2C_TENANT_NAME": "your-tenant-name",
    "AZURE_AD_B2C_TENANT_ID": "your-tenant-id",
    "AZURE_AD_B2C_CLIENT_ID": "your-client-id",
    "AZURE_AD_B2C_POLICY_NAME": "B2C_1_signupsignin"
  }
}
```

### Frontend Configuration

File: `/src/web/.env.local` (not committed)

Required environment variables:
```env
NEXT_PUBLIC_API_URL=http://localhost:7071/api
NEXT_PUBLIC_B2C_TENANT_NAME=your-tenant-name
NEXT_PUBLIC_B2C_CLIENT_ID=your-client-id
NEXT_PUBLIC_B2C_POLICY_NAME=B2C_1_signupsignin
NEXT_PUBLIC_B2C_PASSWORD_RESET_POLICY=B2C_1_passwordreset
NEXT_PUBLIC_B2C_REDIRECT_URI=http://localhost:3000
```

## Azure AD B2C Setup

### 1. Create B2C Tenant

1. Go to [Azure Portal](https://portal.azure.com)
2. Create a new Azure AD B2C resource
3. Note your tenant name (e.g., `skynav.onmicrosoft.com`)

### 2. Register Application

1. In B2C tenant, go to "App registrations"
2. Click "New registration"
3. Set name: "SkyNav"
4. Set redirect URIs:
   - Web: `http://localhost:3000` (development)
   - Web: `https://your-production-domain.com` (production)
5. Note the Application (client) ID

### 3. Create User Flows

1. Go to "User flows"
2. Create "Sign up and sign in" flow:
   - Name: `B2C_1_signupsignin`
   - Identity providers: Email signup
   - User attributes: Email, Display Name
   - Application claims: Email, Display Name, User's Object ID
3. Create "Password reset" flow:
   - Name: `B2C_1_passwordreset`

### 4. Configure API Permissions

1. In app registration, go to "Expose an API"
2. Add scope: `user_impersonation`
3. Go to "API permissions"
4. Add permissions for OpenID Connect

### 5. Configure Custom Claims (Optional)

To add custom roles claim:
1. Go to B2C tenant settings
2. Configure custom attributes
3. Add to user flows
4. Include in token claims

## Security Considerations

### Token Validation

All API endpoints MUST validate JWT tokens:
1. Verify signature using B2C public keys
2. Check expiration (`exp` claim)
3. Validate audience (`aud` claim)
4. Validate issuer (`iss` claim)

### Token Storage

Frontend stores tokens securely:
- Access tokens in memory (React state)
- Refresh tokens in httpOnly cookies
- Never store in localStorage (XSS vulnerability)

### Role-Based Access Control

User roles stored in JWT claims:
- `user` - Standard registered user
- `admin` - Administrator with elevated privileges

Check roles in API endpoints:
```typescript
import { requireAdmin } from '../middleware/auth';

const user = await validateToken(request, context);
requireAdmin(user); // Throws error if not admin
```

## Testing

### Manual Testing

1. Start backend:
   ```bash
   cd src/api
   npm start
   ```

2. Start frontend:
   ```bash
   cd src/web
   npm run dev
   ```

3. Navigate to `http://localhost:3000`
4. Click "Login" button
5. Complete B2C authentication
6. Verify profile loads
7. Edit profile and save
8. Logout

### API Testing with cURL

```bash
# Get access token from B2C login, then:

# Provision user
curl -X POST http://localhost:7071/api/users/provision \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get profile
curl http://localhost:7071/api/users/me \
  -H "Authorization: Bearer YOUR_TOKEN"

# Update profile
curl -X PUT http://localhost:7071/api/users/me \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"displayName": "John Jumper"}'
```

## Troubleshooting

### "Token validation failed"

- Check B2C tenant configuration
- Verify JWKS endpoint is accessible
- Ensure tenant ID and policy name are correct

### "User not found" after login

- Call provision endpoint after first login
- Check Cosmos DB connection
- Verify user ID from B2C matches

### MSAL errors in browser

- Check redirect URI matches B2C configuration
- Verify client ID is correct
- Clear browser cache and cookies

### CORS errors

- Ensure API CORS settings allow frontend origin
- Check Authorization header is allowed

## Related Documentation

- [ADR-002: Authentication Strategy](../docs/adr/002-authentication-strategy.md)
- [Azure AD B2C Documentation](https://learn.microsoft.com/en-us/azure/active-directory-b2c/)
- [MSAL.js Documentation](https://github.com/AzureAD/microsoft-authentication-library-for-js)

## Future Enhancements

- Social login providers (Google, Microsoft, Facebook)
- Multi-factor authentication (MFA)
- Phone number verification
- Email verification enforcement
- Role management API
- Session timeout handling
- Token refresh automation
