# SkyNav - System Architecture

**Version**: 1.0  
**Last Updated**: February 7, 2026  
**Status**: Current

## Overview

SkyNav is a mobile-first progressive web application (PWA) designed to provide traveling skydivers with structured operational intelligence about unfamiliar dropzones. The system follows a modern, cloud-native architecture built on Azure's serverless platform.

## Architecture Principles

1. **Mobile-First**: All design decisions prioritize mobile user experience
2. **API-First**: Backend exposed as RESTful API enabling future integrations
3. **Serverless**: Cloud-native, auto-scaling infrastructure with pay-per-use economics
4. **Progressive Enhancement**: Core functionality works offline, enhanced features require connectivity
5. **Security by Default**: Authentication, authorization, and data validation at all layers

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Client Layer                              │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  React/Next.js PWA (TypeScript)                           │  │
│  │  - Responsive UI (Mobile-First)                           │  │
│  │  - Azure Maps SDK Integration                             │  │
│  │  - Service Worker (Offline Support)                       │  │
│  │  - JWT Token Management                                   │  │
│  └───────────────────────────────────────────────────────────┘  │
│                              │                                   │
│                          HTTPS/REST                              │
└──────────────────────────────┼───────────────────────────────────┘
                               │
┌──────────────────────────────┼───────────────────────────────────┐
│                        API Layer                                 │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  Azure Functions (Node.js/TypeScript)                     │  │
│  │  - HTTP Triggers (REST Endpoints)                         │  │
│  │  - JWT Validation Middleware                              │  │
│  │  - Business Logic Services                                │  │
│  │  - Input Validation & Sanitization                        │  │
│  └───────────────────────────────────────────────────────────┘  │
│                              │                                   │
└──────────────────────────────┼───────────────────────────────────┘
                               │
┌──────────────────────────────┼───────────────────────────────────┐
│                      Data & Services Layer                       │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │  Azure Cosmos   │  │  Azure Blob     │  │  Azure Maps     │ │
│  │  DB (SQL API)   │  │  Storage        │  │  Service        │ │
│  │  - Dropzones    │  │  - Images       │  │  - Geocoding    │ │
│  │  - Annotations  │  │  - Assets       │  │  - Map Tiles    │ │
│  │  - Notes        │  │                 │  │                 │ │
│  │  - Users        │  │                 │  │                 │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
│                                                                  │
│  ┌─────────────────┐  ┌─────────────────┐                      │
│  │  Azure AD B2C   │  │  Application    │                      │
│  │  - Auth         │  │  Insights       │                      │
│  │  - User Mgmt    │  │  - Monitoring   │                      │
│  └─────────────────┘  └─────────────────┘                      │
└──────────────────────────────────────────────────────────────────┘
```

## Mobile-First Web App

### Design Philosophy

SkyNav is built as a **Progressive Web Application (PWA)** rather than native mobile apps, providing:

- **Universal Access**: Single codebase works across iOS, Android, and desktop
- **No App Store Dependencies**: Direct deployment and updates without review delays
- **Lower Maintenance**: One codebase vs. three (web, iOS, Android)
- **Installability**: Can be "installed" to home screen like native apps
- **Offline Capability**: Service workers enable offline access to cached data

### Mobile-First Implementation

1. **Responsive Design**
   - Mobile viewport as primary design target
   - Touch-optimized UI controls
   - Bottom navigation for thumb-friendly access
   - Readable typography at small sizes

2. **Performance Optimization**
   - Lazy loading of components and routes
   - Image optimization and WebP format
   - Code splitting for faster initial load
   - Prefetching of critical data

3. **Offline-First Strategy**
   - Service worker caching of core assets
   - IndexedDB for local data persistence
   - Background sync for delayed submissions
   - Offline indicators and graceful degradation

4. **Progressive Enhancement**
   - Core content accessible without JavaScript
   - Enhanced interactions with JavaScript enabled
   - Fallback for unsupported features
   - Adaptive loading based on network conditions

### Technology Stack (Frontend)

- **Framework**: Next.js 14 (App Router)
- **UI Library**: React 18
- **Language**: TypeScript
- **Styling**: CSS Modules / Tailwind CSS
- **Maps**: Azure Maps SDK for Web
- **State**: React Context / Zustand
- **PWA**: next-pwa with service worker support

## API-First Backend

### Design Philosophy

The backend is designed as a **RESTful API** that:

- Decouples frontend from backend logic
- Enables future platform expansion (mobile apps, integrations)
- Facilitates independent testing and development
- Supports multiple clients with consistent interface

### API Architecture

1. **RESTful Principles**
   - Resource-based URLs (e.g., `/api/dropzones/{id}`)
   - HTTP methods for CRUD operations (GET, POST, PUT, DELETE)
   - Stateless request/response model
   - Standard HTTP status codes

2. **Endpoint Structure**
   ```
   /api
     /dropzones           # Public DZ directory
       GET /              # List/search dropzones
       GET /:id           # Get dropzone profile
     /notes               # Community contributions
       POST /             # Submit note
       GET /dropzone/:id  # Get approved notes
     /favorites           # User collections
       GET /              # Get favorites
       POST /:dzId        # Add favorite
       DELETE /:dzId      # Remove favorite
     /admin               # Admin operations (role-protected)
       POST /dropzones    # Create dropzone
       PUT /dropzones/:id # Update dropzone
       POST /notes/:id/approve  # Moderate notes
   ```

3. **API Versioning**
   - URL-based versioning (e.g., `/api/v1/...`)
   - Graceful deprecation path for breaking changes
   - Version negotiation via Accept headers (future)

4. **Security**
   - JWT-based authentication on protected endpoints
   - Role-based access control (RBAC)
   - Input validation and sanitization
   - Rate limiting to prevent abuse
   - CORS configuration for allowed origins

### Technology Stack (Backend)

- **Runtime**: Node.js 18+ / TypeScript
- **Platform**: Azure Functions v4 (HTTP Triggers)
- **Deployment**: Consumption Plan (serverless)
- **API Protocol**: REST over HTTPS
- **Authentication**: JWT tokens from Azure AD B2C

## Azure Hosting Model

### Serverless Architecture

SkyNav uses Azure's **serverless platform** for:

- **Zero Infrastructure Management**: No VMs, no patching, no capacity planning
- **Automatic Scaling**: Scales from zero to thousands of requests
- **Pay-Per-Use**: Cost only accrues during actual usage
- **Global Distribution**: CDN-backed frontend, region-based backend

### Azure Services

1. **Azure Static Web Apps**
   - Hosts Next.js frontend
   - Globally distributed via CDN
   - Automatic HTTPS/SSL certificates
   - Preview environments for PRs
   - Free tier suitable for MVP

2. **Azure Functions**
   - Serverless API backend
   - HTTP trigger functions
   - Consumption plan (pay per execution)
   - Integrated with Static Web Apps
   - Auto-scales based on demand

3. **Azure Cosmos DB**
   - NoSQL database (SQL API)
   - Serverless capacity mode
   - Automatic scaling and partitioning
   - Multi-region replication (future)
   - 99.99% SLA availability

4. **Azure Blob Storage**
   - Object storage for images and assets
   - Integrated CDN for fast delivery
   - Geo-redundant replication
   - Lifecycle management for cost optimization

5. **Azure Maps**
   - Mapping and geocoding services
   - Map tile rendering
   - Search and routing APIs
   - S0 pricing tier for MVP

6. **Azure AD B2C**
   - Identity and access management
   - Social login providers
   - JWT token issuance
   - User profile management
   - Free tier for up to 50,000 users

7. **Azure Application Insights**
   - Application performance monitoring
   - Real-time telemetry and logging
   - Dependency tracking
   - Custom metrics and alerts

### Deployment Model

```
Development → GitHub → GitHub Actions → Azure
                         │
                         ├─→ Build & Test
                         ├─→ Deploy to Preview (PRs)
                         └─→ Deploy to Production (main branch)
```

- **Infrastructure as Code**: Bicep/Terraform for reproducible deployments
- **CI/CD**: GitHub Actions for automated deployment
- **Environment Isolation**: Separate resources for dev/staging/prod
- **Preview Environments**: Automatic PR-based deployments

### Cost Model (MVP Estimate)

| Service | Tier | Estimated Monthly Cost |
|---------|------|----------------------|
| Static Web Apps | Free | $0 |
| Azure Functions | Consumption | $0-10 (1M free executions) |
| Cosmos DB | Serverless | $25-50 |
| Blob Storage | Standard | $1-5 |
| Azure Maps | S0 | $0-5 |
| AD B2C | Free | $0 (up to 50k users) |
| Application Insights | Pay-as-you-go | $0-5 (5GB free) |
| **Total** | | **$30-75/month** |

### Scaling Strategy

1. **Horizontal Scaling**
   - Functions scale out automatically (up to 200 instances)
   - Cosmos DB scales RU/s on-demand
   - Static content served from global CDN

2. **Vertical Scaling**
   - Not applicable in serverless model
   - Services auto-scale resources per request

3. **Geographic Distribution**
   - Multi-region deployment (post-MVP)
   - Cosmos DB geo-replication
   - Azure Front Door for global routing

## Data Flow

### Read Path (Public User)

```
User → Static Web App → CDN (cached) → Browser
User → API Request → Function → Cosmos DB → Response → Browser
User → Map Request → Azure Maps → Tiles → Browser
```

### Write Path (Authenticated User)

```
User → Login → Azure AD B2C → JWT Token → Browser
User → API Request + JWT → Function → Validate Token → Cosmos DB → Response
```

### Admin Path (Content Management)

```
Admin → Login → Azure AD B2C (admin role) → JWT Token
Admin → Admin API + JWT → Function → Validate Role → Cosmos DB → Response
Admin → Audit Log → Application Insights
```

## Security Architecture

### Authentication & Authorization

- **User Authentication**: Azure AD B2C with JWT tokens
- **API Authorization**: Bearer token validation on protected endpoints
- **Role-Based Access**: Admin role for content management functions
- **Token Lifecycle**: Short-lived access tokens, refresh token rotation

### Data Security

- **Encryption in Transit**: HTTPS/TLS 1.2+ for all communications
- **Encryption at Rest**: Azure-managed encryption for Cosmos DB and Blob Storage
- **Input Validation**: Schema validation for all API inputs
- **Output Sanitization**: XSS prevention on user-generated content
- **SQL Injection Prevention**: Parameterized queries via Cosmos DB SDK

### Network Security

- **CORS**: Restricted origins for API access
- **Rate Limiting**: Per-user/IP rate limits on API endpoints
- **DDoS Protection**: Azure-provided DDoS protection
- **Secrets Management**: Azure Key Vault for sensitive configuration

## Monitoring & Observability

### Application Monitoring

- **Application Insights**: Request telemetry, exceptions, dependencies
- **Custom Metrics**: Business KPIs (DZ views, note submissions, favorites)
- **Distributed Tracing**: Request correlation across services
- **Real User Monitoring**: Client-side performance metrics

### Logging

- **Structured Logging**: JSON-formatted logs with correlation IDs
- **Log Levels**: ERROR, WARN, INFO, DEBUG
- **Log Retention**: 90 days in Application Insights
- **Log Analytics**: Kusto Query Language (KQL) for log analysis

### Alerts

- **Error Rate**: Alert on elevated error rates
- **Latency**: Alert on slow API response times
- **Availability**: Alert on service downtime
- **Quota**: Alert on approaching resource limits

## Architecture Decision Records (ADRs)

For detailed rationale behind key architectural decisions, see:

- [ADR-001: Backend Technology Selection](./adr/001-backend-technology.md)
- [ADR-002: Authentication Strategy](./adr/002-authentication-strategy.md)
- [ADR-003: Data Storage Approach](./adr/003-data-storage-approach.md)

## Future Considerations

### Post-MVP Enhancements

1. **Geographic Redundancy**: Multi-region Cosmos DB deployment
2. **CDN Optimization**: Azure Front Door for intelligent routing
3. **Caching Layer**: Redis Cache for frequently accessed data
4. **Real-Time Features**: SignalR for live updates (boogies, weather)
5. **Mobile Apps**: React Native apps for app store presence
6. **Search Enhancement**: Azure Cognitive Search for advanced queries

### Scalability Limits

- **Static Web Apps**: No practical limit (CDN-backed)
- **Azure Functions**: 200 instances max per region (can expand)
- **Cosmos DB**: Effectively unlimited in serverless mode
- **AD B2C**: 50 million users on premium tier

---

**Document Maintenance**

This document should be updated when:
- Major architectural changes are made
- New Azure services are introduced
- Significant technical decisions are finalized
- Performance characteristics materially change

**Related Documents**
- [SkyNav MVP Specification](../SkyNav%20MVP%20Specification.pdf)
- [API Documentation](./README.md#api-documentation-planned)
- [Infrastructure Guide](../infra/README.md)
- [Development Guide](./README.md#development-guide-planned)
