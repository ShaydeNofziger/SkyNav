<#
.SYNOPSIS
  Guide for configuring Azure AD B2C for SkyNav authentication.

.DESCRIPTION
  This script provides step-by-step instructions for setting up Azure AD B2C.
  Note: Azure AD B2C setup is currently manual via Azure Portal due to complexity.
  This script serves as a reference guide.

.EXAMPLE
  .\configure-ad-b2c.ps1
#>

[CmdletBinding()]
param()

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Azure AD B2C Configuration Guide" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Azure AD B2C is the authentication provider for SkyNav." -ForegroundColor White
Write-Host "Setup requires manual configuration via Azure Portal." -ForegroundColor White
Write-Host ""

Write-Host "Prerequisites:" -ForegroundColor Yellow
Write-Host "  • Azure subscription" -ForegroundColor Gray
Write-Host "  • Global Administrator rights" -ForegroundColor Gray
Write-Host ""

Write-Host "Step 1: Create Azure AD B2C Tenant" -ForegroundColor Cyan
Write-Host "  1. Navigate to Azure Portal (portal.azure.com)" -ForegroundColor White
Write-Host "  2. Click 'Create a resource'" -ForegroundColor White
Write-Host "  3. Search for 'Azure Active Directory B2C'" -ForegroundColor White
Write-Host "  4. Click 'Create'" -ForegroundColor White
Write-Host "  5. Select 'Create a new Azure AD B2C Tenant'" -ForegroundColor White
Write-Host "  6. Fill in details:" -ForegroundColor White
Write-Host "     - Organization name: SkyNav" -ForegroundColor Gray
Write-Host "     - Initial domain name: skynav (or your preferred name)" -ForegroundColor Gray
Write-Host "     - Country/Region: United States" -ForegroundColor Gray
Write-Host "  7. Click 'Review + create' then 'Create'" -ForegroundColor White
Write-Host ""

Write-Host "Step 2: Link B2C Tenant to Subscription" -ForegroundColor Cyan
Write-Host "  1. In Azure Portal, switch to your B2C directory" -ForegroundColor White
Write-Host "  2. Go to 'Azure AD B2C' service" -ForegroundColor White
Write-Host "  3. Click 'Settings' > 'Properties'" -ForegroundColor White
Write-Host "  4. Click 'Link a subscription'" -ForegroundColor White
Write-Host "  5. Select your Azure subscription and resource group" -ForegroundColor White
Write-Host ""

Write-Host "Step 3: Register Application" -ForegroundColor Cyan
Write-Host "  1. In Azure AD B2C, go to 'App registrations'" -ForegroundColor White
Write-Host "  2. Click 'New registration'" -ForegroundColor White
Write-Host "  3. Fill in details:" -ForegroundColor White
Write-Host "     - Name: SkyNav Web App" -ForegroundColor Gray
Write-Host "     - Supported account types: Accounts in any identity provider or organizational directory" -ForegroundColor Gray
Write-Host "     - Redirect URI: https://localhost:3000/api/auth/callback/azure-ad-b2c (for local dev)" -ForegroundColor Gray
Write-Host "  4. Click 'Register'" -ForegroundColor White
Write-Host "  5. Note the 'Application (client) ID' - you'll need this" -ForegroundColor White
Write-Host ""

Write-Host "Step 4: Create User Flows" -ForegroundColor Cyan
Write-Host "  1. In Azure AD B2C, go to 'User flows'" -ForegroundColor White
Write-Host "  2. Click 'New user flow'" -ForegroundColor White
Write-Host "  3. Select 'Sign up and sign in' then 'Recommended'" -ForegroundColor White
Write-Host "  4. Name it 'B2C_1_signupsignin'" -ForegroundColor White
Write-Host "  5. Under 'Identity providers', select 'Email signup'" -ForegroundColor White
Write-Host "  6. Under 'User attributes and token claims', select:" -ForegroundColor White
Write-Host "     - Display Name (collect and return)" -ForegroundColor Gray
Write-Host "     - Email Address (collect and return)" -ForegroundColor Gray
Write-Host "     - Given Name (collect and return)" -ForegroundColor Gray
Write-Host "     - Surname (collect and return)" -ForegroundColor Gray
Write-Host "  7. Click 'Create'" -ForegroundColor White
Write-Host ""
Write-Host "  Repeat for 'Password reset' flow:" -ForegroundColor White
Write-Host "  - Name it 'B2C_1_passwordreset'" -ForegroundColor White
Write-Host ""

Write-Host "Step 5: Configure API Permissions" -ForegroundColor Cyan
Write-Host "  1. Go to your app registration" -ForegroundColor White
Write-Host "  2. Click 'API permissions'" -ForegroundColor White
Write-Host "  3. Click 'Add a permission'" -ForegroundColor White
Write-Host "  4. Select 'Microsoft Graph'" -ForegroundColor White
Write-Host "  5. Select 'Delegated permissions'" -ForegroundColor White
Write-Host "  6. Add: 'User.Read', 'openid', 'profile', 'email'" -ForegroundColor White
Write-Host "  7. Click 'Grant admin consent'" -ForegroundColor White
Write-Host ""

Write-Host "Step 6: Create Client Secret" -ForegroundColor Cyan
Write-Host "  1. In app registration, go to 'Certificates & secrets'" -ForegroundColor White
Write-Host "  2. Click 'New client secret'" -ForegroundColor White
Write-Host "  3. Description: 'SkyNav API'" -ForegroundColor White
Write-Host "  4. Expiry: 24 months (or as per your policy)" -ForegroundColor White
Write-Host "  5. Click 'Add'" -ForegroundColor White
Write-Host "  6. **IMPORTANT**: Copy the secret value immediately (it won't be shown again)" -ForegroundColor Yellow
Write-Host ""

Write-Host "Step 7: Configure Application Settings" -ForegroundColor Cyan
Write-Host "  Add these environment variables to your application:" -ForegroundColor White
Write-Host ""
Write-Host "  For Function App:" -ForegroundColor Yellow
Write-Host "    AZURE_AD_B2C_TENANT_NAME=skynav (your tenant name)" -ForegroundColor Gray
Write-Host "    AZURE_AD_B2C_TENANT_ID=<your-tenant-id>" -ForegroundColor Gray
Write-Host "    AZURE_AD_B2C_CLIENT_ID=<your-client-id>" -ForegroundColor Gray
Write-Host "    AZURE_AD_B2C_CLIENT_SECRET=<your-client-secret>" -ForegroundColor Gray
Write-Host "    AZURE_AD_B2C_POLICY_NAME=B2C_1_signupsignin" -ForegroundColor Gray
Write-Host ""
Write-Host "  For Next.js Frontend (.env.local):" -ForegroundColor Yellow
Write-Host "    NEXT_PUBLIC_B2C_TENANT_NAME=skynav" -ForegroundColor Gray
Write-Host "    NEXT_PUBLIC_B2C_CLIENT_ID=<your-client-id>" -ForegroundColor Gray
Write-Host "    NEXT_PUBLIC_B2C_POLICY_NAME=B2C_1_signupsignin" -ForegroundColor Gray
Write-Host "    NEXT_PUBLIC_B2C_PASSWORD_RESET_POLICY=B2C_1_passwordreset" -ForegroundColor Gray
Write-Host "    NEXT_PUBLIC_B2C_REDIRECT_URI=https://localhost:3000/api/auth/callback/azure-ad-b2c" -ForegroundColor Gray
Write-Host ""

Write-Host "Step 8: Test Authentication" -ForegroundColor Cyan
Write-Host "  1. Run your Next.js app locally" -ForegroundColor White
Write-Host "  2. Navigate to sign-in page" -ForegroundColor White
Write-Host "  3. Click 'Sign Up' and create a test user" -ForegroundColor White
Write-Host "  4. Verify JWT token is received" -ForegroundColor White
Write-Host "  5. Test password reset flow" -ForegroundColor White
Write-Host ""

Write-Host "Optional: Add Social Identity Providers" -ForegroundColor Cyan
Write-Host "  To enable login with Google, Microsoft, Facebook, etc.:" -ForegroundColor White
Write-Host "  1. In Azure AD B2C, go to 'Identity providers'" -ForegroundColor White
Write-Host "  2. Click 'New OpenID Connect provider' or select a built-in provider" -ForegroundColor White
Write-Host "  3. Configure with credentials from the provider (e.g., Google Client ID)" -ForegroundColor White
Write-Host "  4. Update your user flows to include the new provider" -ForegroundColor White
Write-Host ""

Write-Host "Cost Information:" -ForegroundColor Yellow
Write-Host "  • First 50,000 monthly active users: FREE" -ForegroundColor Green
Write-Host "  • 50,001+ users: `$0.00325 per MAU" -ForegroundColor Gray
Write-Host "  • No upfront costs or minimum fees" -ForegroundColor Gray
Write-Host ""

Write-Host "References:" -ForegroundColor Cyan
Write-Host "  • Azure AD B2C Documentation:" -ForegroundColor White
Write-Host "    https://learn.microsoft.com/en-us/azure/active-directory-b2c/" -ForegroundColor Gray
Write-Host "  • User flows tutorial:" -ForegroundColor White
Write-Host "    https://learn.microsoft.com/en-us/azure/active-directory-b2c/tutorial-create-user-flows" -ForegroundColor Gray
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Configuration guide complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
