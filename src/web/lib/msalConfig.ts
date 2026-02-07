/**
 * MSAL Configuration for Azure AD B2C Authentication
 */

import { Configuration, LogLevel } from '@azure/msal-browser';

/**
 * MSAL configuration object
 * See: https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-browser/docs/configuration.md
 */
export const msalConfig: Configuration = {
  auth: {
    clientId: process.env.NEXT_PUBLIC_B2C_CLIENT_ID || '',
    authority: `https://${process.env.NEXT_PUBLIC_B2C_TENANT_NAME}.b2clogin.com/${process.env.NEXT_PUBLIC_B2C_TENANT_NAME}.onmicrosoft.com/${process.env.NEXT_PUBLIC_B2C_POLICY_NAME}`,
    knownAuthorities: [`${process.env.NEXT_PUBLIC_B2C_TENANT_NAME}.b2clogin.com`],
    redirectUri: process.env.NEXT_PUBLIC_B2C_REDIRECT_URI || 'http://localhost:3000',
    postLogoutRedirectUri: '/',
  },
  cache: {
    cacheLocation: 'localStorage', // Use 'sessionStorage' for more security but loses session on tab close
  },
  system: {
    loggerOptions: {
      loggerCallback: (level, message, containsPii) => {
        if (containsPii) {
          return;
        }
        switch (level) {
          case LogLevel.Error:
            console.error(message);
            return;
          case LogLevel.Info:
            console.info(message);
            return;
          case LogLevel.Verbose:
            console.debug(message);
            return;
          case LogLevel.Warning:
            console.warn(message);
            return;
          default:
            return;
        }
      },
    },
  },
};

/**
 * Scopes for API access
 */
export const loginRequest = {
  scopes: ['openid', 'profile', 'email'],
};

/**
 * Password reset policy authority
 */
export const passwordResetAuthority = `https://${process.env.NEXT_PUBLIC_B2C_TENANT_NAME}.b2clogin.com/${process.env.NEXT_PUBLIC_B2C_TENANT_NAME}.onmicrosoft.com/${process.env.NEXT_PUBLIC_B2C_PASSWORD_RESET_POLICY}`;
