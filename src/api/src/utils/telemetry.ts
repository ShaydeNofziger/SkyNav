/**
 * Telemetry and Logging Utilities
 * Provides centralized logging and metrics tracking using Application Insights
 */

import { InvocationContext } from '@azure/functions';
import * as appInsights from 'applicationinsights';
import { KnownSeverityLevel } from 'applicationinsights/out/src/declarations/generated';

// Initialize Application Insights if connection string is provided
let appInsightsClient: appInsights.TelemetryClient | null = null;

export function initializeTelemetry(): void {
  const connectionString = process.env.APPLICATIONINSIGHTS_CONNECTION_STRING;
  
  if (connectionString) {
    appInsights
      .setup(connectionString)
      .setAutoDependencyCorrelation(true)
      .setAutoCollectRequests(true)
      .setAutoCollectPerformance(true, true)
      .setAutoCollectExceptions(true)
      .setAutoCollectDependencies(true)
      .setAutoCollectConsole(true, true)
      .setUseDiskRetryCaching(true)
      .setSendLiveMetrics(true)
      .start();
    
    appInsightsClient = appInsights.defaultClient;
    console.log('Application Insights telemetry initialized');
  } else {
    console.warn('Application Insights not configured - telemetry will be limited to console logging');
  }
}

/**
 * Telemetry logger interface
 */
export interface TelemetryLogger {
  info(message: string, properties?: Record<string, string>): void;
  error(message: string, error?: Error, properties?: Record<string, string>): void;
  warn(message: string, properties?: Record<string, string>): void;
  trackEvent(name: string, properties?: Record<string, string>, metrics?: Record<string, number>): void;
  trackMetric(name: string, value: number, properties?: Record<string, string>): void;
  trackRequest(name: string, url: string, duration: number, responseCode: number, success: boolean, properties?: Record<string, string>): void;
}

/**
 * Create a logger instance for a specific context
 */
export function createLogger(context: InvocationContext, functionName: string): TelemetryLogger {
  const baseProperties = {
    functionName,
    invocationId: context.invocationId
  };

  return {
    info(message: string, properties?: Record<string, string>): void {
      const allProps = { ...baseProperties, ...properties };
      context.log(message, allProps);
      
      if (appInsightsClient) {
        appInsightsClient.trackTrace({
          message,
          severity: KnownSeverityLevel.Information,
          properties: allProps
        });
      }
    },

    error(message: string, error?: Error, properties?: Record<string, string>): void {
      const allProps = { ...baseProperties, ...properties };
      
      if (error) {
        context.error(message, error);
        
        if (appInsightsClient) {
          appInsightsClient.trackException({
            exception: error,
            properties: { ...allProps, message }
          });
        }
      } else {
        context.error(message);
        
        if (appInsightsClient) {
          appInsightsClient.trackTrace({
            message,
            severity: KnownSeverityLevel.Error,
            properties: allProps
          });
        }
      }
    },

    warn(message: string, properties?: Record<string, string>): void {
      const allProps = { ...baseProperties, ...properties };
      context.warn(message, allProps);
      
      if (appInsightsClient) {
        appInsightsClient.trackTrace({
          message,
          severity: KnownSeverityLevel.Warning,
          properties: allProps
        });
      }
    },

    trackEvent(name: string, properties?: Record<string, string>, metrics?: Record<string, number>): void {
      const allProps = { ...baseProperties, ...properties };
      
      if (appInsightsClient) {
        appInsightsClient.trackEvent({
          name,
          properties: allProps,
          measurements: metrics
        });
      }
      
      context.log(`Event: ${name}`, { properties: allProps, metrics });
    },

    trackMetric(name: string, value: number, properties?: Record<string, string>): void {
      const allProps = { ...baseProperties, ...properties };
      
      if (appInsightsClient) {
        appInsightsClient.trackMetric({
          name,
          value,
          properties: allProps
        });
      }
      
      context.log(`Metric: ${name} = ${value}`, allProps);
    },

    trackRequest(name: string, url: string, duration: number, responseCode: number, success: boolean, properties?: Record<string, string>): void {
      const allProps = { ...baseProperties, ...properties };
      
      if (appInsightsClient) {
        appInsightsClient.trackRequest({
          name,
          url,
          duration,
          resultCode: responseCode.toString(),
          success,
          properties: allProps
        });
      }
      
      context.log(`Request: ${name} - ${responseCode} (${duration}ms)`, allProps);
    }
  };
}

/**
 * Event names for common operations
 */
export const TelemetryEvents = {
  // Authentication events
  USER_LOGIN: 'User.Login',
  USER_PROVISIONED: 'User.Provisioned',
  AUTH_FAILED: 'Auth.Failed',
  
  // User profile events
  PROFILE_VIEWED: 'Profile.Viewed',
  PROFILE_UPDATED: 'Profile.Updated',
  
  // Trip events
  TRIP_CREATED: 'Trip.Created',
  TRIP_VIEWED: 'Trip.Viewed',
  TRIP_UPDATED: 'Trip.Updated',
  TRIP_DELETED: 'Trip.Deleted',
  TRIP_LIST_VIEWED: 'Trip.ListViewed',
  
  // Travel segment events
  SEGMENT_CREATED: 'Segment.Created',
  SEGMENT_VIEWED: 'Segment.Viewed',
  SEGMENT_UPDATED: 'Segment.Updated',
  SEGMENT_DELETED: 'Segment.Deleted',
  
  // Dropzone events
  DROPZONE_LIST_VIEWED: 'Dropzone.ListViewed',
  DROPZONE_VIEWED: 'Dropzone.Viewed',
  DROPZONE_SEARCH: 'Dropzone.Search',
  
  // Error events
  API_ERROR: 'API.Error',
  VALIDATION_ERROR: 'Validation.Error',
  DATABASE_ERROR: 'Database.Error'
} as const;

/**
 * Metric names for common measurements
 */
export const TelemetryMetrics = {
  RESPONSE_TIME: 'ResponseTime',
  ITEM_COUNT: 'ItemCount',
  ERROR_COUNT: 'ErrorCount',
  REQUEST_SIZE: 'RequestSize',
  RESPONSE_SIZE: 'ResponseSize'
} as const;

// Initialize telemetry on module load
initializeTelemetry();
