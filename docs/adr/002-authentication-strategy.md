# ADR-002: Authentication Strategy

**Status**: Accepted  
**Date**: 2026-02-07  
**Deciders**: Shayde Nofziger  
**Technical Story**: SkyNav User Authentication and Authorization

## Context

SkyNav requires user authentication for:
- Submitting community notes (requires account)
- Managing favorite dropzones (user-specific data)
- Admin console access (role-based access control)
- Audit logging (tracking who made changes)

Public features (browsing dropzones, viewing maps) remain accessible without authentication to maximize reach.

### Requirements

1. **Secure**: Industry-standard authentication protocols
2. **Low Maintenance**: Minimal custom security code
3. **Scalable**: Support thousands of users without performance degradation
4. **User-Friendly**: Simple login/signup flow
5. **Azure-Native**: Integrate seamlessly with Azure services
6. **Role-Based Access**: Support admin vs regular user roles
7. **Social Login**: Allow login with existing accounts (Google, Microsoft, etc.)
8. **Cost-Effective**: Free or low-cost for MVP user base

### Options Considered

1. **Azure AD B2C (Business-to-Consumer)**
2. **Auth0**
3. **Clerk**
4. **Custom JWT with Cosmos DB user store**

## Decision

We will use **Azure AD B2C** as the authentication provider.

## Rationale

### Why Azure AD B2C

1. **Azure Ecosystem Integration**
   - Native integration with Azure Functions
   - JWT tokens validated using Azure libraries
   - Managed identity for secure service communication
   - Application Insights integration for auth telemetry

2. **Built-in Features**
   - User registration and login flows
   - Password reset and email verification
   - Multi-factor authentication (MFA) ready
   - Social identity providers (Google, Microsoft, Facebook, GitHub)
   - Customizable user attributes and claims
   - Token management and refresh

3. **Security**
   - Microsoft-managed security updates
   - OWASP compliance
   - Automatic threat detection
   - DDoS protection
   - Regular security audits by Microsoft

4. **Scalability**
   - Handles millions of users
   - Global distribution
   - 99.9% SLA availability
   - Automatic scaling

5. **Cost**
   - **FREE** for up to 50,000 monthly active users (MAU)
   - $0.00325 per MAU after 50k (on premium tier)
   - MVP will stay in free tier indefinitely
   - No hidden costs for basic features

6. **Developer Experience**
   - Well-documented with samples
   - Active community support
   - JavaScript SDK for React integration
   - REST APIs for backend validation

7. **Compliance**
   - GDPR compliant
   - SOC 1, SOC 2, ISO 27001 certified
   - HIPAA compliant (if needed)
   - Data residency options

### Implementation Architecture

```
User Browser
    │
    ├─→ Login/Register → Azure AD B2C → JWT Token → Browser
    │
    └─→ API Request + Bearer Token
             │
             └─→ Azure Function
                    │
                    ├─→ Validate JWT (Azure SDK)
                    ├─→ Extract User Claims (ID, roles)
                    ├─→ Authorize Action
                    └─→ Execute Business Logic
```

### JWT Token Structure

```json
{
  "sub": "user-id-guid",
  "email": "jumper@example.com",
  "name": "John Jumper",
  "roles": ["user"] // or ["user", "admin"]
  "iat": 1234567890,
  "exp": 1234571490,
  "iss": "https://skynav.b2clogin.com/...",
  "aud": "skynav-api-client-id"
}
```

### Role-Based Access Control (RBAC)

- **User Role**: Default role for registered users
  - Submit community notes
  - Manage personal favorites
  - View all public content

- **Admin Role**: Privileged role for content managers
  - All user capabilities
  - Create/edit/delete dropzones
  - Create/edit/delete map annotations
  - Approve/reject community notes
  - Access audit logs

Roles stored as custom claims in Azure AD B2C and included in JWT tokens.

### Why NOT Auth0

Auth0 is a strong alternative with:
- Excellent developer experience
- Rich feature set
- Great documentation

However, it was not chosen because:
1. **Cost**: Free tier limited to 7,000 MAU (vs 50,000 for Azure AD B2C)
2. **Azure Integration**: Less native integration with Azure Functions
3. **Consistency**: Prefer single cloud vendor for simplified billing and support
4. **Learning Curve**: Developer already learning Azure ecosystem

**Note**: Auth0 would be preferred if:
- Multi-cloud strategy was required
- Advanced authentication flows needed immediately
- Team had existing Auth0 expertise

### Why NOT Clerk

Clerk offers modern, user-friendly auth, but:
1. **Cost**: Paid plans start at $25/month (vs free for B2C)
2. **Vendor Lock-in**: Smaller company with less certain longevity
3. **Azure Integration**: No native Azure integration
4. **Overkill**: Features like embeddable UI components not needed for API-first design

### Why NOT Custom JWT

Building custom authentication was considered but rejected because:
1. **Security Risk**: High likelihood of vulnerabilities in custom auth code
2. **Maintenance Burden**: Password hashing, token management, refresh logic, email verification
3. **Time Investment**: Would consume 1-2 weeks of MVP timeline
4. **Feature Gap**: No social login, MFA, password reset out-of-box
5. **Compliance**: GDPR, security audit requirements harder to meet

**Note**: Custom auth is only advisable for:
- Highly specialized authentication requirements
- Complete control over auth flow needed
- Existing mature auth infrastructure to build upon

## Consequences

### Positive

- **Zero Authentication Code**: No password storage, hashing, or token management
- **Production-Ready Security**: Enterprise-grade security from day one
- **Free at MVP Scale**: No authentication costs for first 50,000 users
- **Social Login**: Users can sign in with existing accounts
- **Future-Proof**: Can add MFA, passwordless, etc. without code changes
- **Audit Trail**: Authentication events logged automatically

### Negative

- **Azure Lock-in**: Switching to another auth provider requires significant refactoring
  - *Mitigation*: Abstract auth behind service interface; JWT tokens are portable
- **Customization Limits**: UI customization requires premium tier
  - *Mitigation*: Default UI is acceptable for MVP; customize later if needed
- **Learning Curve**: Azure AD B2C has complex configuration (policies, flows)
  - *Mitigation*: Well-documented; follow Microsoft quick-start guides
- **No Local Development**: Requires Azure tenant even for local dev
  - *Mitigation*: Use Azure AD B2C test tenant; mock JWT tokens for unit tests

### Technical Debt

- **Policy Configuration**: B2C policies configured via Azure Portal; should be codified in IaC
- **Token Refresh**: Need to implement refresh token flow for long-lived sessions
- **Role Management**: Admin role assignment currently manual; automate via admin API post-MVP

## Security Considerations

### Token Validation

All protected API endpoints must:
1. Verify JWT signature using Azure B2C public keys
2. Validate token expiration (`exp` claim)
3. Validate audience (`aud` claim matches API)
4. Validate issuer (`iss` claim matches B2C tenant)

### Token Lifecycle

- **Access Token**: Short-lived (1 hour), included in API requests
- **Refresh Token**: Long-lived (7 days), used to obtain new access tokens
- **Token Rotation**: Refresh tokens rotated on each use for security

### Session Management

- Frontend stores tokens in memory (React state) + httpOnly cookies
- No tokens in localStorage (XSS vulnerability)
- Automatic token refresh before expiration
- Logout clears all tokens and sessions

### Secrets Management

- B2C tenant ID, client ID, client secret stored in Azure Key Vault
- Function app accesses secrets via managed identity
- No secrets in code or configuration files

## Migration Path

If Azure AD B2C becomes insufficient:

1. **Auth0**: Migrate user database via export/import; update JWT validation
2. **Custom Solution**: Gradually replace B2C with custom auth; dual-auth period
3. **Azure AD (Enterprise)**: If pivoting to B2B model, upgrade to full Azure AD

## Alternatives Revisited

This decision will be revisited if:

1. **Cost exceeds $100/month**: Evaluate alternative pricing models
2. **Customization requirements**: If UI customization becomes critical
3. **Multi-cloud strategy**: If deploying to AWS/GCP in addition to Azure
4. **Advanced flows needed**: If WebAuthn, FIDO2, or complex flows required beyond B2C capabilities

## Implementation Checklist

- [ ] Create Azure AD B2C tenant
- [ ] Configure user flows (sign-up/sign-in)
- [ ] Register SkyNav application
- [ ] Configure API permissions and scopes
- [ ] Set up custom claims for roles
- [ ] Implement JWT validation middleware in Functions
- [ ] Integrate B2C SDK in Next.js frontend
- [ ] Test registration, login, token refresh flows
- [ ] Document admin role assignment process

## Related Decisions

- [ADR-001: Backend Technology Selection](./001-backend-technology.md) - Azure Functions validate JWT tokens
- [ADR-003: Data Storage Approach](./003-data-storage-approach.md) - User profiles stored in Cosmos DB

## References

- [Azure AD B2C Overview](https://learn.microsoft.com/en-us/azure/active-directory-b2c/overview)
- [Azure AD B2C Pricing](https://azure.microsoft.com/en-us/pricing/details/active-directory-b2c/)
- [JWT Best Practices](https://datatracker.ietf.org/doc/html/rfc8725)
- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)

---

**Revision History**
- 2026-02-07: Initial decision documented
