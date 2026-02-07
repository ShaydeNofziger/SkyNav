/**
 * Authentication middleware for Azure Functions
 * Validates JWT tokens from Azure AD B2C
 */

import { HttpRequest, InvocationContext } from '@azure/functions';
import jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';

/**
 * Decoded JWT token payload
 */
export interface JwtPayload {
  sub: string; // User ID (matches B2C subject)
  email?: string;
  name?: string;
  roles?: string[];
  iat: number;
  exp: number;
  iss: string;
  aud: string;
}

/**
 * Authenticated user context
 */
export interface AuthenticatedUser {
  userId: string;
  email?: string;
  name?: string;
  roles: string[];
}

/**
 * JWKS client for Azure AD B2C
 */
const getJwksClient = () => {
  const tenantName = process.env.AZURE_AD_B2C_TENANT_NAME;
  const policyName = process.env.AZURE_AD_B2C_POLICY_NAME;
  
  if (!tenantName || !policyName) {
    throw new Error('Azure AD B2C configuration missing: AZURE_AD_B2C_TENANT_NAME and AZURE_AD_B2C_POLICY_NAME required');
  }

  const jwksUri = `https://${tenantName}.b2clogin.com/${tenantName}.onmicrosoft.com/${policyName}/discovery/v2.0/keys`;
  
  return jwksClient({
    jwksUri,
    cache: true,
    cacheMaxAge: 86400000, // 24 hours
    rateLimit: true,
    jwksRequestsPerMinute: 10
  });
};

/**
 * Get signing key from JWKS
 */
const getSigningKey = async (kid: string): Promise<string> => {
  const client = getJwksClient();
  const key = await client.getSigningKey(kid);
  return key.getPublicKey();
};

/**
 * Extract JWT token from Authorization header
 */
const extractToken = (request: HttpRequest): string | null => {
  const authHeader = request.headers.get('authorization');
  
  if (!authHeader) {
    return null;
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0].toLowerCase() !== 'bearer') {
    return null;
  }

  return parts[1];
};

/**
 * Validate JWT token from Azure AD B2C
 * 
 * @param request - HTTP request with Authorization header
 * @param context - Azure Functions invocation context
 * @returns Authenticated user information
 * @throws Error if token is invalid or missing
 */
export const validateToken = async (
  request: HttpRequest,
  context: InvocationContext
): Promise<AuthenticatedUser> => {
  // Extract token from Authorization header
  const token = extractToken(request);
  
  if (!token) {
    throw new Error('Authorization header is missing or has invalid format. Expected: "Bearer <token>"');
  }

  try {
    // Decode token header to get kid (key ID)
    const decoded = jwt.decode(token, { complete: true });
    
    if (!decoded || typeof decoded === 'string' || !decoded.header.kid) {
      throw new Error('Token format is invalid. Please sign in again.');
    }

    // Get signing key from JWKS
    const signingKey = await getSigningKey(decoded.header.kid);

    // Verify token signature and claims
    const clientId = process.env.AZURE_AD_B2C_CLIENT_ID;
    const tenantName = process.env.AZURE_AD_B2C_TENANT_NAME;
    const policyName = process.env.AZURE_AD_B2C_POLICY_NAME;

    if (!clientId || !tenantName || !policyName) {
      throw new Error('Authentication service configuration is missing. Please contact support.');
    }

    const issuer = `https://${tenantName}.b2clogin.com/${process.env.AZURE_AD_B2C_TENANT_ID}/v2.0/`;

    const payload = jwt.verify(token, signingKey, {
      algorithms: ['RS256'],
      audience: clientId,
      issuer: issuer
    }) as JwtPayload;

    // Return authenticated user context
    return {
      userId: payload.sub,
      email: payload.email,
      name: payload.name,
      roles: payload.roles || ['user']
    };
  } catch (error) {
    context.error('JWT validation failed', error);
    
    // Provide more specific error messages
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Your session has expired. Please sign in again.');
    }
    
    if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('Authentication token is invalid. Please sign in again.');
    }
    
    throw new Error(`Token validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Check if user has required role
 * 
 * @param user - Authenticated user
 * @param requiredRole - Role to check for
 * @returns true if user has the required role
 */
export const hasRole = (user: AuthenticatedUser, requiredRole: string): boolean => {
  return user.roles.includes(requiredRole);
};

/**
 * Require admin role
 * 
 * @param user - Authenticated user
 * @throws Error if user is not an admin
 */
export const requireAdmin = (user: AuthenticatedUser): void => {
  if (!hasRole(user, 'admin')) {
    throw new Error('Admin role required');
  }
};
