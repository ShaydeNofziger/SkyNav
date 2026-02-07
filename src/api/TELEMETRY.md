# Application Insights and Telemetry

This document explains how to set up and use Application Insights for logging and telemetry in the SkyNav API.

## Overview

The SkyNav API uses Azure Application Insights to:
- Track API errors and exceptions
- Monitor API performance and response times
- Track user authentication events
- Measure usage metrics (trips created, dropzone views, etc.)
- Provide detailed logging for debugging

## Setup

### 1. Create an Application Insights Resource

If you haven't already created an Application Insights resource in Azure:

```bash
# Using Azure CLI
az monitor app-insights component create \
  --app skynav-api \
  --location <region> \
  --resource-group <resource-group-name>
```

### 2. Get the Connection String

Get your Application Insights connection string from the Azure Portal or CLI:

```bash
# Using Azure CLI
az monitor app-insights component show \
  --app skynav-api \
  --resource-group <resource-group-name> \
  --query connectionString -o tsv
```

### 3. Configure Environment Variables

Add the Application Insights connection string to your environment variables:

**For local development** (`local.settings.json`):
```json
{
  "Values": {
    "APPLICATIONINSIGHTS_CONNECTION_STRING": "InstrumentationKey=xxx;IngestionEndpoint=https://...;LiveEndpoint=https://...",
    ...
  }
}
```

**For Azure Functions deployment**:
```bash
az functionapp config appsettings set \
  --name <function-app-name> \
  --resource-group <resource-group-name> \
  --settings "APPLICATIONINSIGHTS_CONNECTION_STRING=<your-connection-string>"
```

## Features

### Automatic Telemetry Collection

The API automatically collects:
- **Request telemetry**: All HTTP requests with response times, status codes, and success/failure
- **Exception telemetry**: All unhandled exceptions with stack traces
- **Dependency telemetry**: Database calls to Cosmos DB
- **Console logs**: All console.log, console.warn, and console.error messages

### Custom Events

The API tracks custom events for business logic:

| Event | Description |
|-------|-------------|
| `User.Login` | User successfully authenticated |
| `User.Provisioned` | New user account created |
| `Auth.Failed` | Authentication failed |
| `Profile.Viewed` | User profile accessed |
| `Profile.Updated` | User profile updated |
| `Trip.Created` | New trip created |
| `Trip.Viewed` | Trip details viewed |
| `Trip.Updated` | Trip updated |
| `Trip.Deleted` | Trip deleted |
| `Trip.ListViewed` | Trip list viewed |
| `Segment.Created` | Travel segment created |
| `Segment.Viewed` | Travel segment viewed |
| `Segment.Updated` | Travel segment updated |
| `Segment.Deleted` | Travel segment deleted |
| `Dropzone.ListViewed` | Dropzone directory viewed |
| `Dropzone.Viewed` | Dropzone details viewed |
| `Dropzone.Search` | Dropzone search performed |
| `API.Error` | API error occurred |
| `Validation.Error` | Request validation failed |
| `Database.Error` | Database operation failed |

### Custom Metrics

The API tracks custom metrics:

| Metric | Description |
|--------|-------------|
| `ResponseTime` | API response time in milliseconds |
| `ItemCount` | Number of items returned in list operations |
| `ErrorCount` | Number of errors in a time period |
| `RequestSize` | Size of request payload |
| `ResponseSize` | Size of response payload |

## Usage in Code

### Creating a Logger

```typescript
import { createLogger, TelemetryEvents } from '../utils/telemetry';

export async function myFunction(request: HttpRequest, context: InvocationContext) {
  const logger = createLogger(context, 'myFunction');
  
  // Your function code...
}
```

### Logging Messages

```typescript
// Info message
logger.info('User authenticated', { userId: user.userId });

// Warning message
logger.warn('Invalid input detected', { field: 'email' });

// Error message with exception
logger.error('Database query failed', error, { query: 'SELECT...' });
```

### Tracking Events

```typescript
// Track a custom event
logger.trackEvent(TelemetryEvents.TRIP_CREATED, {
  userId: user.userId,
  tripId: trip.id,
  tripName: trip.name
});

// Track an event with metrics
logger.trackEvent('ItemsProcessed', 
  { batchId: 'abc123' },
  { itemCount: 42, duration: 1500 }
);
```

### Tracking Metrics

```typescript
// Track a single metric
logger.trackMetric('ItemCount', result.items.length, {
  endpoint: 'listTrips'
});
```

### Tracking Requests

```typescript
const startTime = Date.now();
// ... process request ...
const duration = Date.now() - startTime;

logger.trackRequest(
  'GET /api/trips',
  request.url,
  duration,
  200,
  true,
  { userId: user.userId }
);
```

## Querying Telemetry Data

### Azure Portal

View telemetry in the Azure Portal:
1. Navigate to your Application Insights resource
2. Use the "Logs" section to run KQL queries
3. Use the "Metrics" section to view aggregated metrics

### Example KQL Queries

**View all API errors in the last hour:**
```kql
traces
| where timestamp > ago(1h)
| where severityLevel >= 3
| project timestamp, message, severityLevel, customDimensions
| order by timestamp desc
```

**Count events by type:**
```kql
customEvents
| where timestamp > ago(24h)
| summarize count() by name
| order by count_ desc
```

**View authentication failures:**
```kql
customEvents
| where name == "Auth.Failed"
| where timestamp > ago(24h)
| project timestamp, customDimensions
| order by timestamp desc
```

**Track API performance:**
```kql
requests
| where timestamp > ago(24h)
| summarize avg(duration), count() by name
| order by avg_duration desc
```

## Best Practices

1. **Include context**: Always include relevant properties (userId, tripId, etc.) when logging
2. **Use appropriate log levels**: info for normal operations, warn for recoverable issues, error for failures
3. **Track business events**: Use custom events to understand user behavior and feature usage
4. **Monitor regularly**: Set up alerts for error rates and response time thresholds
5. **Protect sensitive data**: Never log passwords, tokens, or personally identifiable information

## Configuration

The Application Insights configuration is managed in `host.json`:

```json
{
  "logging": {
    "applicationInsights": {
      "samplingSettings": {
        "isEnabled": true,
        "maxTelemetryItemsPerSecond": 20
      }
    }
  }
}
```

### Sampling

Sampling is enabled to reduce telemetry volume and costs:
- Default: 20 telemetry items per second
- Requests are excluded from sampling to ensure all API calls are tracked
- Adjust `maxTelemetryItemsPerSecond` based on your application's scale

## Troubleshooting

### Telemetry Not Appearing

1. **Check connection string**: Ensure `APPLICATIONINSIGHTS_CONNECTION_STRING` is set correctly
2. **Wait a few minutes**: Telemetry can take 2-5 minutes to appear in the portal
3. **Check console logs**: Look for "Application Insights telemetry initialized" message
4. **Verify network**: Ensure the Functions app can reach Azure endpoints

### Missing Custom Events

1. **Check event names**: Ensure you're using the correct event name from `TelemetryEvents`
2. **Verify logger creation**: Make sure you're calling `createLogger()` in each function
3. **Check sampling**: High-volume events may be sampled; adjust sampling settings if needed

## Cost Optimization

Application Insights pricing is based on data ingestion volume:

1. **Use sampling**: Keep sampling enabled for high-volume applications
2. **Filter logs**: Only log what's necessary; avoid verbose logging in production
3. **Set retention**: Configure appropriate data retention policies (default: 90 days)
4. **Use daily cap**: Set a daily data cap to prevent unexpected costs

## Additional Resources

- [Application Insights Documentation](https://learn.microsoft.com/en-us/azure/azure-monitor/app/app-insights-overview)
- [Azure Functions Monitoring](https://learn.microsoft.com/en-us/azure/azure-functions/functions-monitoring)
- [KQL Query Language](https://learn.microsoft.com/en-us/azure/data-explorer/kusto/query/)
