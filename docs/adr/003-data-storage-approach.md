# ADR-003: Data Storage Approach

**Status**: Accepted  
**Date**: 2026-02-07  
**Deciders**: Shayde Nofziger  
**Technical Story**: SkyNav Data Persistence Architecture

## Context

SkyNav requires persistent storage for:
- **Dropzone profiles**: Name, location, facilities, operational info
- **Map annotations**: Landing zones, hazards, pattern overlays (with geospatial data)
- **Community notes**: User-submitted tips and insights
- **User data**: Profiles, favorites, preferences
- **Audit logs**: Change tracking for admin actions

### Requirements

1. **Flexible Schema**: Data model may evolve during MVP development
2. **Geospatial Support**: Store and query geographic coordinates efficiently
3. **Scalability**: Support thousands of dropzones and millions of notes
4. **Performance**: Sub-100ms query response times for common operations
5. **Cost-Effective**: Low cost for MVP data volumes (5-10 DZs, 100-500 notes)
6. **Azure-Native**: Integrate seamlessly with Azure Functions
7. **JSON-Friendly**: Store nested documents without complex ORM mapping
8. **Global Distribution**: Support future multi-region deployment

### Data Characteristics

- **Read-Heavy**: 95% reads (browsing), 5% writes (notes, admin updates)
- **Document-Oriented**: Nested JSON structures (DZ profiles, annotations)
- **Relational Needs**: Minimal (no complex joins; denormalization acceptable)
- **Geospatial Queries**: Find dropzones near location, calculate distances
- **Consistency**: Strong consistency for writes, eventual consistency acceptable for reads

### Options Considered

1. **Azure Cosmos DB (SQL API)**
2. **Azure SQL Database**
3. **PostgreSQL on Azure (with PostGIS)**
4. **MongoDB on Azure**

## Decision

We will use **Azure Cosmos DB with SQL API** as the primary data store.

## Rationale

### Why Azure Cosmos DB

1. **Serverless Compatibility**
   - Serverless capacity mode (pay per request)
   - Automatic scaling with zero configuration
   - Scales to zero when unused (cost $0)
   - Perfect fit for serverless Azure Functions backend

2. **NoSQL Flexibility**
   - Schema-less JSON documents
   - Easily evolve data model during MVP
   - No migrations for adding optional fields
   - Store nested objects naturally (annotations within dropzones)

3. **Native Geospatial Support**
   - Built-in geographic indexing (GeoJSON)
   - Distance queries: "dropzones within 50 miles of lat/lng"
   - Spatial functions for point-in-polygon (hazard zones)
   - No extension installation required (unlike PostGIS)

4. **Performance**
   - Single-digit millisecond latency
   - Automatic indexing of all fields
   - Partition key strategy for efficient queries
   - SSD-backed storage

5. **Azure Integration**
   - First-class Azure Functions bindings
   - Built-in integration with Application Insights
   - Managed identity authentication
   - Cosmos DB change feed for real-time triggers

6. **Developer Experience**
   - JavaScript/TypeScript SDK
   - SQL-like query language (familiar syntax)
   - Local emulator for development
   - Excellent documentation and samples

7. **Global Distribution (Future)**
   - Multi-region replication ready
   - Configurable consistency levels
   - Automatic failover
   - Low-latency global reads

8. **Cost for MVP**
   - Serverless mode: pay per RU (request unit)
   - ~$0.25 per million reads
   - Estimated MVP cost: $25-50/month
   - No idle costs (unlike provisioned throughput)

### Data Model Design

#### Cosmos DB Containers

```
Database: SkyNavDB

Containers:
├── dropzones        (Partition Key: /id)
├── annotations      (Partition Key: /dropzoneId)
├── communityNotes   (Partition Key: /dropzoneId)
├── users            (Partition Key: /id)
└── auditLog         (Partition Key: /entityType)
```

#### Partition Strategy

**Dropzones**: Partitioned by `id` (GUID)
- Each dropzone is its own partition
- Enables single-partition queries for DZ profile
- ~5-10 DZs at launch → low partition count (acceptable)

**Annotations**: Partitioned by `dropzoneId`
- All annotations for a DZ co-located
- Efficient query: "Get all annotations for DZ"
- Cross-partition query needed: "Find annotations of type X" (rare)

**Community Notes**: Partitioned by `dropzoneId`
- All notes for a DZ co-located
- Efficient query: "Get approved notes for DZ"
- Admin "pending notes" query is cross-partition (low volume, acceptable)

**Users**: Partitioned by `id` (user ID from Azure AD B2C)
- Each user is its own partition
- Efficient query: "Get user by ID"
- "List all users" is cross-partition (admin only, rare)

**Audit Log**: Partitioned by `entityType` (dropzone, annotation, note)
- Balances query efficiency and partition distribution
- Query: "Get audit logs for dropzones" is single-partition
- Can query specific entity: "Get logs for DZ ID xyz" via filter

#### Example Documents

**Dropzone Document**:
```json
{
  "id": "dz-abc123",
  "name": "Skydive Perris",
  "location": {
    "type": "Point",
    "coordinates": [-117.2137, 33.7701]
  },
  "address": {
    "city": "Perris",
    "state": "CA",
    "zip": "92570",
    "country": "USA"
  },
  "facilities": {
    "maxAltitude": 18000,
    "aircraft": ["Skyvan", "Twin Otter"],
    "hasOnSiteRigger": true
  },
  "landingAreaId": "perris-main",
  "createdAt": "2026-01-15T10:00:00Z",
  "updatedAt": "2026-02-01T14:30:00Z"
}
```

**Annotation Document**:
```json
{
  "id": "ann-xyz789",
  "dropzoneId": "dz-abc123",
  "type": "hazard",
  "geometry": {
    "type": "Polygon",
    "coordinates": [[[-117.214, 33.771], [-117.213, 33.771], ...]]
  },
  "label": "Power lines",
  "description": "High-voltage lines, avoid at all costs",
  "severity": "critical",
  "createdBy": "admin-id",
  "createdAt": "2026-01-20T09:00:00Z"
}
```

**Community Note Document**:
```json
{
  "id": "note-def456",
  "dropzoneId": "dz-abc123",
  "userId": "user-ghi789",
  "content": "The staff is super friendly. Ask for Mike if you need a rental rig.",
  "status": "approved",
  "submittedAt": "2026-02-05T12:00:00Z",
  "reviewedBy": "admin-id",
  "reviewedAt": "2026-02-06T08:00:00Z"
}
```

### Why NOT Azure SQL Database

Azure SQL is a proven relational database, but:

1. **Schema Rigidity**: Requires migrations for schema changes; slows MVP iteration
2. **JSON Handling**: JSON support exists but less natural than document DB
3. **Geospatial**: Requires spatial data types and extensions; more complex
4. **Cost**: Minimum ~$5-15/month for smallest tier; serverless pricing less granular
5. **Serverless Fit**: Connection pooling needed for Functions (cold start issue)

**Note**: SQL would be preferred if:
- Complex multi-table joins were required
- ACID transactions across entities needed
- Relational integrity critical
- Team had strong SQL expertise

### Why NOT PostgreSQL with PostGIS

PostgreSQL + PostGIS is powerful for geospatial, but:

1. **Managed Service Gap**: Azure Database for PostgreSQL is always-on (no serverless)
2. **Cost**: Minimum $20-50/month; no pay-per-request option
3. **Extension Management**: PostGIS requires installation and updates
4. **Azure Integration**: Less native integration than Cosmos DB
5. **Operational Overhead**: More configuration and maintenance

**Note**: PostgreSQL would excel if:
- Complex geospatial operations (topology, routing) needed
- Open-source portability critical
- Advanced SQL features required

### Why NOT MongoDB on Azure

MongoDB is a mature NoSQL database with:
- Great document model
- Strong geospatial support
- Active ecosystem

However:

1. **Azure Cosmos DB is MongoDB-Compatible**: Cosmos DB has a MongoDB API
   - We chose SQL API for familiarity and consistency
   - MongoDB API is an alternative if needed
2. **Azure Cosmos DB Advantages**: Same benefits (serverless, integration) with SQL syntax
3. **Familiarity**: SQL API syntax more familiar than MongoDB query language for solo developer

**Note**: MongoDB API for Cosmos DB is viable alternative; SQL API chosen for SQL-like queries

## Consequences

### Positive

- **Rapid Development**: No schema migrations; add fields on-the-fly
- **Low Cognitive Load**: JSON documents match TypeScript interfaces
- **Geospatial Queries**: Built-in support for location-based features
- **Azure Functions Integration**: Input/output bindings reduce boilerplate
- **Cost Efficiency**: Serverless mode ideal for MVP traffic
- **Scalability**: Auto-scales to any load without configuration
- **Future-Proof**: Can add global replication as user base grows

### Negative

- **No Joins**: Requires denormalization and potential data duplication
  - *Mitigation*: Acceptable for read-heavy workloads; embed related data
- **Query Cost**: Cross-partition queries consume more RUs
  - *Mitigation*: Optimize partition key strategy; avoid frequent cross-partition queries
- **Consistency Trade-offs**: Eventual consistency in multi-region (post-MVP)
  - *Mitigation*: Use strong consistency for writes; acceptable for MVP
- **Vendor Lock-in**: Cosmos DB SQL API is Azure-specific
  - *Mitigation*: Abstract data access behind repository interfaces; portable business logic
- **Learning Curve**: RU model and partitioning strategy takes time to optimize
  - *Mitigation*: Start simple; optimize based on telemetry

### Technical Debt

- **Data Denormalization**: Some data duplication (e.g., dropzone name in notes)
  - Need update logic to propagate changes
  - Consider change feed triggers for consistency
- **Indexing Policy**: Default policy indexes all fields; may be inefficient
  - Optimize indexing based on query patterns post-launch
- **Partition Strategy**: May need to repartition if traffic patterns unexpected
  - Monitor partition utilization; plan migration path if needed

## Query Patterns

### Hot Paths (Optimized for Single-Partition Queries)

1. **Get Dropzone Profile**: `SELECT * FROM dropzones WHERE id = 'dz-abc123'`
2. **Get Annotations for DZ**: `SELECT * FROM annotations WHERE dropzoneId = 'dz-abc123'`
3. **Get Approved Notes for DZ**: `SELECT * FROM notes WHERE dropzoneId = 'dz-abc123' AND status = 'approved'`
4. **Get User Favorites**: `SELECT * FROM users WHERE id = 'user-xyz'`

### Acceptable Cross-Partition Queries

1. **List All Dropzones**: `SELECT * FROM dropzones` (with pagination)
2. **Search Dropzones by Name**: `SELECT * FROM dropzones WHERE CONTAINS(name, 'Perris')`
3. **Find Nearby Dropzones**: `SELECT * FROM dropzones WHERE ST_DISTANCE(location, {...}) < 50000`
4. **Admin Pending Notes**: `SELECT * FROM notes WHERE status = 'pending'`

### Performance Targets

- **Single-Partition Query**: < 10ms
- **Cross-Partition Query**: < 100ms
- **Geospatial Query**: < 50ms
- **Write Operation**: < 20ms

## Scaling Strategy

### Vertical Scaling (RU/s)
- Serverless mode auto-scales from 0 to 5,000 RU/s
- If exceeds 5,000 RU/s, upgrade to provisioned throughput

### Horizontal Scaling (Partitions)
- Cosmos DB auto-partitions as data grows
- No manual intervention required

### Global Scaling (Multi-Region)
- Add read replicas in key regions (Europe, Asia)
- Write region: US East (primary)
- Read regions: Europe, Asia (low latency reads)

## Backup & Recovery

- **Continuous Backup**: 30-day retention (built-in)
- **Point-in-Time Restore**: Restore to any moment in last 30 days
- **Export Strategy**: Periodic exports to Blob Storage for long-term archival
- **Disaster Recovery**: Automatic failover in multi-region setup (post-MVP)

## Monitoring

- **Request Units (RU)**: Monitor RU consumption per query
- **Latency**: Track P50, P95, P99 query latency
- **Throttling**: Alert on 429 (rate limit) responses
- **Storage**: Monitor data volume growth
- **Partition Metrics**: Track hot partitions

## Alternatives Revisited

This decision will be revisited if:

1. **Cost exceeds $100/month**: Evaluate reserved capacity or alternative DBs
2. **Complex joins required**: Consider denormalization strategies or add SQL DB for specific queries
3. **Query performance issues**: Optimize partition keys or consider read replicas
4. **Vendor diversification**: If multi-cloud strategy emerges, evaluate portable options

## Migration Path

If Cosmos DB becomes insufficient:

1. **PostgreSQL**: Export JSON to PostgreSQL with PostGIS; refactor queries
2. **DynamoDB**: If migrating to AWS; similar NoSQL model
3. **MongoDB**: Use Cosmos DB MongoDB API compatibility layer for easier transition

## Implementation Checklist

- [ ] Provision Cosmos DB account in Azure Portal
- [ ] Create SkyNavDB database (serverless mode)
- [ ] Create containers with partition keys
- [ ] Set up indexing policies
- [ ] Configure local Cosmos DB emulator
- [ ] Implement repository pattern for data access
- [ ] Write seed data scripts for initial dropzones
- [ ] Set up change feed triggers (if needed)
- [ ] Configure backup and retention policies
- [ ] Instrument telemetry for query performance

## Related Decisions

- [ADR-001: Backend Technology Selection](./001-backend-technology.md) - Azure Functions integrate with Cosmos DB
- [ADR-002: Authentication Strategy](./002-authentication-strategy.md) - User profiles stored in Cosmos DB

## References

- [Azure Cosmos DB Overview](https://learn.microsoft.com/en-us/azure/cosmos-db/)
- [Cosmos DB SQL API](https://learn.microsoft.com/en-us/azure/cosmos-db/sql/)
- [Cosmos DB Serverless](https://learn.microsoft.com/en-us/azure/cosmos-db/serverless)
- [Cosmos DB Geospatial](https://learn.microsoft.com/en-us/azure/cosmos-db/sql/sql-query-geospatial-intro)
- [Partitioning in Cosmos DB](https://learn.microsoft.com/en-us/azure/cosmos-db/partitioning-overview)
- [Cosmos DB Pricing](https://azure.microsoft.com/en-us/pricing/details/cosmos-db/)

---

**Revision History**
- 2026-02-07: Initial decision documented
