# Environment Variables Guide

This document describes all environment variables used in SkyNav and how to configure them for local development and cloud deployment.

## Overview

SkyNav requires different configurations for:
- **Frontend (Next.js)**: Environment variables prefixed with `NEXT_PUBLIC_` are exposed to the browser
- **Backend (Azure Functions)**: Environment variables for server-side configuration

## Frontend Environment Variables (Next.js)

### Configuration Files

- **Local Development**: `src/web/.env.local` (git-ignored)
- **Example Template**: `src/web/.env.example` (committed to repo)
- **Production**: Configure via Azure Static Web App settings

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API endpoint | `http://localhost:7071/api` (local)<br>`https://func-skynav-prod.azurewebsites.net/api` (prod) |
| `NEXT_PUBLIC_B2C_TENANT_NAME` | Azure AD B2C tenant name | `skynav` |
| `NEXT_PUBLIC_B2C_CLIENT_ID` | Azure AD B2C application client ID | `12345678-1234-1234-1234-123456789012` |
| `NEXT_PUBLIC_B2C_POLICY_NAME` | User flow for sign-up/sign-in | `B2C_1_signupsignin` |
| `NEXT_PUBLIC_B2C_REDIRECT_URI` | OAuth redirect URI | `http://localhost:3000/api/auth/callback` (local) |
| `NEXT_PUBLIC_AZURE_MAPS_SUBSCRIPTION_KEY` | Azure Maps subscription key | `your-azure-maps-key` |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_B2C_PASSWORD_RESET_POLICY` | User flow for password reset | `B2C_1_passwordreset` |
| `NEXT_PUBLIC_APPINSIGHTS_INSTRUMENTATIONKEY` | Application Insights key for client telemetry | (none) |
| `NEXT_PUBLIC_ENVIRONMENT` | Environment name for logging | `development` |

### Local Development Setup

1. Copy the example file:
   ```bash
   cd src/web
   cp .env.example .env.local
   ```

2. Update values in `.env.local`:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:7071/api
   NEXT_PUBLIC_B2C_TENANT_NAME=your-dev-tenant
   NEXT_PUBLIC_B2C_CLIENT_ID=your-client-id
   NEXT_PUBLIC_B2C_POLICY_NAME=B2C_1_signupsignin
   NEXT_PUBLIC_B2C_REDIRECT_URI=http://localhost:3000/api/auth/callback
   NEXT_PUBLIC_AZURE_MAPS_SUBSCRIPTION_KEY=your-maps-key
   ```

3. Restart Next.js dev server to load new variables

### Production Configuration

Set environment variables in Azure Static Web App:

```powershell
# Via Azure CLI
az staticwebapp appsettings set `
  --name stapp-skynav-prod `
  --resource-group rg-skynav-prod `
  --setting-names `
    "NEXT_PUBLIC_API_URL=https://func-skynav-prod.azurewebsites.net/api" `
    "NEXT_PUBLIC_B2C_TENANT_NAME=your-prod-tenant" `
    "NEXT_PUBLIC_B2C_CLIENT_ID=your-prod-client-id"
```

Or via Azure Portal:
1. Go to your Static Web App
2. Click "Configuration"
3. Add application settings

## Backend Environment Variables (Azure Functions)

### Configuration Files

- **Local Development**: `src/api/local.settings.json` (git-ignored)
- **Example Template (with comments)**: `src/api/local.settings.example.json` (for reference)
- **JSON Template (no comments)**: `src/api/local.settings.template.json` (ready to copy)
- **Production**: Configure via Azure Function App settings

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `FUNCTIONS_WORKER_RUNTIME` | Azure Functions runtime | `node` |
| `AzureWebJobsStorage` | Storage connection for Functions internals | `UseDevelopmentStorage=true` (local)<br>`DefaultEndpointsProtocol=https;...` (prod) |
| `COSMOS_DB_ENDPOINT` | Cosmos DB account endpoint | `https://localhost:8081` (local)<br>`https://cosmos-skynav-prod.documents.azure.com:443/` (prod) |
| `COSMOS_DB_KEY` | Cosmos DB access key | `C2y6yDjf5/R+ob0N8A7Cgv...` (local emulator)<br>`your-production-key` (prod) |
| `COSMOS_DB_DATABASE_NAME` | Cosmos DB database name | `SkyNavDB` |
| `AZURE_AD_B2C_TENANT_NAME` | Azure AD B2C tenant name | `skynav` |
| `AZURE_AD_B2C_CLIENT_ID` | Application client ID | `12345678-1234-1234-1234-123456789012` |
| `AZURE_AD_B2C_CLIENT_SECRET` | Application client secret | `your-client-secret` |
| `AZURE_AD_B2C_POLICY_NAME` | User flow name | `B2C_1_signupsignin` |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `AZURE_AD_B2C_TENANT_ID` | Tenant ID (if needed) | (none) |
| `APPINSIGHTS_INSTRUMENTATIONKEY` | Application Insights key | (none) |
| `APPLICATIONINSIGHTS_CONNECTION_STRING` | Application Insights connection string | (none) |
| `CORS_ALLOWED_ORIGINS` | Allowed CORS origins | `*` (local), specific domain (prod) |
| `AZURE_MAPS_SUBSCRIPTION_KEY` | Azure Maps key (if used server-side) | (none) |

### Local Development Setup

1. Copy the template file:
   ```bash
   cd src/api
   cp local.settings.template.json local.settings.json
   ```

2. Update values in `local.settings.json`:
   ```json
   {
     "IsEncrypted": false,
     "Values": {
       "AzureWebJobsStorage": "UseDevelopmentStorage=true",
       "FUNCTIONS_WORKER_RUNTIME": "node",
       "COSMOS_DB_ENDPOINT": "https://localhost:8081",
       "COSMOS_DB_KEY": "C2y6yDjf5/R+ob0N8A7Cgv...",
       "COSMOS_DB_DATABASE_NAME": "SkyNavDB",
       "AZURE_AD_B2C_TENANT_NAME": "your-dev-tenant",
       "AZURE_AD_B2C_CLIENT_ID": "your-client-id",
       "AZURE_AD_B2C_CLIENT_SECRET": "your-client-secret",
       "AZURE_AD_B2C_POLICY_NAME": "B2C_1_signupsignin"
     },
     "Host": {
       "LocalHttpPort": 7071,
       "CORS": "*"
     }
   }
   ```

3. Start Azure Functions Core Tools to load settings

### Production Configuration

Set environment variables in Azure Function App:

```powershell
# Get Cosmos DB connection information
$cosmosEndpoint = az cosmosdb show --name cosmos-skynav-prod --resource-group rg-skynav-prod --query "documentEndpoint" -o tsv
$cosmosKey = az cosmosdb keys list --name cosmos-skynav-prod --resource-group rg-skynav-prod --query "primaryMasterKey" -o tsv

# Get Application Insights key
$appInsightsKey = az monitor app-insights component show --app appi-skynav-prod --resource-group rg-skynav-prod --query "instrumentationKey" -o tsv

# Set Function App settings
az functionapp config appsettings set `
  --name func-skynav-prod `
  --resource-group rg-skynav-prod `
  --settings `
    "COSMOS_DB_ENDPOINT=$cosmosEndpoint" `
    "COSMOS_DB_KEY=$cosmosKey" `
    "COSMOS_DB_DATABASE_NAME=SkyNavDB" `
    "AZURE_AD_B2C_TENANT_NAME=your-prod-tenant" `
    "AZURE_AD_B2C_CLIENT_ID=your-prod-client-id" `
    "AZURE_AD_B2C_CLIENT_SECRET=your-prod-client-secret" `
    "AZURE_AD_B2C_POLICY_NAME=B2C_1_signupsignin" `
    "APPINSIGHTS_INSTRUMENTATIONKEY=$appInsightsKey" `
    "CORS_ALLOWED_ORIGINS=https://stapp-skynav-prod.azurestaticapps.net"
```

Or via Azure Portal:
1. Go to your Function App
2. Click "Configuration" > "Application settings"
3. Add new application settings

## Azure AD B2C Configuration

### Getting B2C Credentials

1. **Tenant Name**: From your B2C tenant domain (e.g., `skynav.b2clogin.com` → tenant name is `skynav`)

2. **Tenant ID**: 
   ```powershell
   az ad tenant show --query "tenantId" -o tsv
   ```

3. **Client ID**: From App Registration in Azure Portal
   - Go to Azure AD B2C → App registrations → Your app
   - Copy "Application (client) ID"

4. **Client Secret**: 
   - Go to App Registration → Certificates & secrets
   - Create new client secret
   - **IMPORTANT**: Copy the value immediately (shown only once)

5. **User Flow Names**: From Azure AD B2C → User flows
   - Default sign-up/sign-in: `B2C_1_signupsignin`
   - Password reset: `B2C_1_passwordreset`

## Azure Cosmos DB Configuration

### Local Development (Emulator)

Default Cosmos DB Emulator credentials:
- **Endpoint**: `https://localhost:8081`
- **Key**: `C2y6yDjf5/R+ob0N8A7Cgv3ZHhYDjUsbi3n8ixjOlH6l/gIx4s0lHJRsYPmZdP8M9xDHN8xXL6KfYd3vX7LJzA==`

### Production (Azure Cosmos DB)

Get connection information:

```powershell
# Endpoint
az cosmosdb show --name cosmos-skynav-prod --resource-group rg-skynav-prod --query "documentEndpoint" -o tsv

# Primary Key
az cosmosdb keys list --name cosmos-skynav-prod --resource-group rg-skynav-prod --query "primaryMasterKey" -o tsv

# Full Connection String (alternative)
az cosmosdb keys list --name cosmos-skynav-prod --resource-group rg-skynav-prod --type connection-strings --query "connectionStrings[0].connectionString" -o tsv
```

## Azure Maps Configuration

Get your Azure Maps subscription key:

```powershell
az maps account keys list --name maps-skynav-prod --resource-group rg-skynav-prod --query "primaryKey" -o tsv
```

Or via Azure Portal:
1. Go to your Azure Maps account
2. Click "Authentication"
3. Copy "Primary Key"

## Application Insights Configuration

Get instrumentation key:

```powershell
# Instrumentation Key
az monitor app-insights component show --app appi-skynav-prod --resource-group rg-skynav-prod --query "instrumentationKey" -o tsv

# Connection String
az monitor app-insights component show --app appi-skynav-prod --resource-group rg-skynav-prod --query "connectionString" -o tsv
```

## Security Best Practices

### ⚠️ Never Commit Secrets

- **DO NOT** commit `local.settings.json`, `.env.local`, or any file containing secrets
- These files are git-ignored by default
- Use example files (`.example`) as templates

### ✅ Use Azure Key Vault (Post-MVP)

For enhanced security, store secrets in Azure Key Vault:

```powershell
# Create Key Vault
az keyvault create --name kv-skynav-prod --resource-group rg-skynav-prod

# Store secrets
az keyvault secret set --vault-name kv-skynav-prod --name "CosmosDbKey" --value "your-key"

# Grant Function App access
az functionapp identity assign --name func-skynav-prod --resource-group rg-skynav-prod
az keyvault set-policy --name kv-skynav-prod --object-id <function-identity> --secret-permissions get

# Reference in Function App
az functionapp config appsettings set --name func-skynav-prod --resource-group rg-skynav-prod --settings "COSMOS_DB_KEY=@Microsoft.KeyVault(SecretUri=https://kv-skynav-prod.vault.azure.net/secrets/CosmosDbKey/)"
```

### Environment-Specific Secrets

- Use different Azure AD B2C tenants for dev/prod
- Use different Cosmos DB accounts for dev/prod
- Never share production secrets with developers
- Rotate secrets regularly (especially client secrets)

## Troubleshooting

### "Environment variable not found"

- Ensure `.env.local` or `local.settings.json` exists
- Restart dev server after creating/modifying env files
- Verify file is in correct directory (`src/web` or `src/api`)

### "CORS error" when calling API

- Check `CORS_ALLOWED_ORIGINS` in Function App settings
- For local dev, ensure CORS is set to `*` in `local.settings.json`
- For production, set to Static Web App URL

### "Authentication failed"

- Verify Azure AD B2C credentials are correct
- Check tenant name matches (without `.b2clogin.com`)
- Ensure user flow names match exactly (including `B2C_1_` prefix)
- Verify redirect URI is registered in B2C app

### "Cannot connect to Cosmos DB"

- For local: Ensure Cosmos DB Emulator is running
- For production: Verify firewall rules allow access
- Check endpoint URL format (includes port for local, no port for production)
- Ensure key is primary or secondary master key (not read-only key)

## References

- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
- [Azure Functions App Settings](https://learn.microsoft.com/en-us/azure/azure-functions/functions-how-to-use-azure-function-app-settings)
- [Azure Key Vault Integration](https://learn.microsoft.com/en-us/azure/app-service/app-service-key-vault-references)

---

**Last Updated**: February 7, 2026
