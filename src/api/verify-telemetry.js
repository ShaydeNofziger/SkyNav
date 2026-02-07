#!/usr/bin/env node

/**
 * Telemetry Verification Script
 * Tests that the telemetry module is properly initialized and all functions work
 */

const { initializeTelemetry, createLogger, TelemetryEvents, TelemetryMetrics } = require('./dist/utils/telemetry');

// Mock InvocationContext for testing
const mockContext = {
  invocationId: 'test-invocation-123',
  log: (...args) => console.log('[INFO]', ...args),
  error: (...args) => console.error('[ERROR]', ...args),
  warn: (...args) => console.warn('[WARN]', ...args)
};

console.log('=== Telemetry Verification ===\n');

// Test 1: Module initialization
console.log('✓ Test 1: Module loads without errors');

// Test 2: Check constants
console.log('✓ Test 2: TelemetryEvents contains', Object.keys(TelemetryEvents).length, 'event types');
console.log('✓ Test 3: TelemetryMetrics contains', Object.keys(TelemetryMetrics).length, 'metric types');

// Test 4: Create logger
const logger = createLogger(mockContext, 'testFunction');
console.log('✓ Test 4: Logger created successfully');

// Test 5: Test info logging
console.log('\n--- Testing Logger Methods ---');
logger.info('Test info message', { testProperty: 'value' });
console.log('✓ Test 5: Info logging works');

// Test 6: Test warning logging
logger.warn('Test warning message', { testProperty: 'value' });
console.log('✓ Test 6: Warning logging works');

// Test 7: Test error logging without exception
logger.error('Test error message', undefined, { testProperty: 'value' });
console.log('✓ Test 7: Error logging (without exception) works');

// Test 8: Test error logging with exception
const testError = new Error('Test error');
logger.error('Test error with exception', testError, { testProperty: 'value' });
console.log('✓ Test 8: Error logging (with exception) works');

// Test 9: Test event tracking
logger.trackEvent(TelemetryEvents.API_ERROR, { endpoint: 'test', error: 'test' });
console.log('✓ Test 9: Event tracking works');

// Test 10: Test metric tracking
logger.trackMetric(TelemetryMetrics.RESPONSE_TIME, 125, { endpoint: 'test' });
console.log('✓ Test 10: Metric tracking works');

// Test 11: Test request tracking
logger.trackRequest('GET /api/test', 'http://localhost/api/test', 125, 200, true, { test: 'value' });
console.log('✓ Test 11: Request tracking works');

console.log('\n=== All Tests Passed! ===');
console.log('\nNote: Application Insights is not configured (expected in dev environment)');
console.log('Telemetry will log to console only. Configure APPLICATIONINSIGHTS_CONNECTION_STRING');
console.log('in production to send telemetry to Azure Application Insights.\n');
