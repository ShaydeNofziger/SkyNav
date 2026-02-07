# ADR-001: Backend Technology Selection

**Status**: Accepted  
**Date**: 2026-02-07  
**Deciders**: Shayde Nofziger  
**Technical Story**: SkyNav MVP Backend Architecture

## Context

SkyNav requires a backend API to serve dropzone data, manage user favorites, moderate community notes, and provide administrative capabilities. The backend must be:

- Quick to develop for MVP timeline (10-13 weeks)
- Cost-effective for initial low-traffic deployment
- Scalable for future growth
- Easy to maintain for a solo developer
- Compatible with Azure ecosystem

### Options Considered

1. **Azure Functions (Node.js/TypeScript)**
2. **.NET Web API (ASP.NET Core)**
3. **Python FastAPI on Azure App Service**
4. **Node.js Express on Azure App Service**

## Decision

We will use **Azure Functions with Node.js/TypeScript** as the backend technology.

## Rationale

### Why Azure Functions

1. **Serverless Architecture**
   - True pay-per-execution pricing (first 1M requests free)
   - Zero infrastructure management overhead
   - Automatic scaling from zero to high load
   - Ideal for MVP with uncertain traffic patterns

2. **Development Velocity**
   - Simple function-per-endpoint model
   - Minimal boilerplate compared to web frameworks
   - Hot reload during local development
   - Quick iteration cycles

3. **Azure Integration**
   - Native integration with Azure Static Web Apps
   - Built-in bindings for Cosmos DB, Blob Storage
   - Application Insights integration out-of-box
   - Managed identity for secure service access

4. **Cost Efficiency**
   - No idle costs (scales to zero)
   - Consumption plan: ~$0.20 per million executions
   - Estimated MVP cost: $0-10/month (vs $50-100+ for always-on App Service)

### Why Node.js/TypeScript

1. **Unified Language**
   - Same language as frontend (React/Next.js)
   - Shared type definitions between frontend/backend
   - Single npm ecosystem for dependencies
   - Easier context switching for solo developer

2. **JavaScript Ecosystem**
   - Rich npm package ecosystem
   - Excellent JSON handling (native to JavaScript)
   - Strong async/await support for I/O operations
   - Azure SDK fully supports Node.js

3. **TypeScript Benefits**
   - Compile-time type safety reduces bugs
   - Enhanced IDE support (IntelliSense, refactoring)
   - Better documentation through types
   - Easier to maintain as project grows

4. **Performance**
   - Non-blocking I/O ideal for API workloads
   - Fast startup times crucial for serverless
   - Efficient for JSON-heavy REST APIs
   - Node.js V8 engine highly optimized

### Why NOT .NET Web API

While .NET is a mature, performant platform, it was not chosen because:

1. **Language Context Switching**: Different language from frontend (TypeScript vs C#)
2. **Learning Curve**: Solo developer would need to maintain expertise in two ecosystems
3. **Cold Start**: .NET Functions have longer cold start times than Node.js (though improved in .NET 7+)
4. **Type Sharing**: Cannot directly share types between C# backend and TypeScript frontend
5. **MVP Speed**: Node.js/TypeScript offers faster iteration for MVP development

**Note**: .NET would be a strong choice for:
- Teams with existing .NET expertise
- Performance-critical scenarios requiring maximum throughput
- Complex business logic benefiting from C#'s type system
- Integration with existing .NET services

### Why NOT Python FastAPI

- Adds a third language to the stack (TypeScript, Python)
- Less native integration with Next.js frontend
- Azure Functions Python support less mature than Node.js
- No type sharing between frontend/backend

### Why NOT Express on App Service

- Always-on App Service costs ($50-100/month minimum)
- Manual scaling configuration required
- More infrastructure management overhead
- Less idiomatic Azure integration

## Consequences

### Positive

- **Faster MVP Development**: Unified language reduces cognitive load
- **Lower Initial Costs**: Serverless pricing ideal for low-traffic MVP
- **Automatic Scaling**: No capacity planning or scaling configuration needed
- **Type Safety**: Shared TypeScript types between frontend and backend
- **Rich Ecosystem**: npm packages for most common needs
- **Developer Experience**: Hot reload, debugging, testing all streamlined

### Negative

- **Cold Starts**: Functions may experience latency on first invocation after idle period
  - *Mitigation*: Implement keep-alive ping for critical endpoints post-MVP
- **Execution Time Limits**: Azure Functions limited to 5-10 minutes per execution
  - *Mitigation*: Not a concern for CRUD API endpoints; long-running jobs would use Durable Functions
- **Stateless Constraints**: Cannot maintain in-memory state across requests
  - *Mitigation*: Use Cosmos DB or Redis for state; aligns with scalable architecture
- **Vendor Lock-in**: Azure Functions architecture differs from other platforms
  - *Mitigation*: Business logic abstracted into services; minimal Azure-specific code

### Technical Debt

- **Migration Path**: If scale or requirements change, migration to .NET or containerized service is possible
- **Monitoring**: Need to instrument cold start metrics to validate performance
- **Connection Pooling**: Must manage Cosmos DB client connections carefully in serverless environment

## Alternatives Revisited

This decision will be revisited if:

1. **Cold starts become problematic**: Migrate to Premium Functions plan or Azure App Service
2. **Computational intensity increases**: .NET offers better CPU-bound performance
3. **Team composition changes**: If .NET experts join, consider gradual migration
4. **Cost exceeds expectations**: Evaluate reserved App Service plans vs consumption pricing

## Related Decisions

- [ADR-002: Authentication Strategy](./002-authentication-strategy.md) - Auth approach compatible with Azure Functions
- [ADR-003: Data Storage Approach](./003-data-storage-approach.md) - Cosmos DB bindings work well with Functions

## References

- [Azure Functions Overview](https://learn.microsoft.com/en-us/azure/azure-functions/)
- [Azure Functions Pricing](https://azure.microsoft.com/en-us/pricing/details/functions/)
- [Azure Functions Best Practices](https://learn.microsoft.com/en-us/azure/azure-functions/functions-best-practices)
- [TypeScript in Azure Functions](https://learn.microsoft.com/en-us/azure/azure-functions/functions-reference-node)

---

**Revision History**
- 2026-02-07: Initial decision documented
