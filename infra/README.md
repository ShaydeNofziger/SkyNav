# Infrastructure

This directory contains Infrastructure as Code (IaC) configuration and deployment scripts for deploying SkyNav to Azure.

## Overview

SkyNav uses a serverless architecture on Azure with the following components:

- **Azure Static Web Apps**: Hosts the Next.js frontend
- **Azure Functions**: Serverless API backend (Node.js 18)
- **Azure Cosmos DB**: NoSQL database (SQL API, serverless mode)
- **Azure Blob Storage**: File storage for images and assets (included with Function App)
- **Azure Maps**: Mapping services (configured separately)
- **Azure AD B2C**: Authentication and user management (requires manual setup)
- **Azure Application Insights**: Monitoring and analytics

## Structure

```
infra/
├── config/                    # Configuration files
│   ├── parameters.json              # Default parameters template
│   ├── local.parameters.example.json # Local config example (with comments)
│   └── local.parameters.template.json # Local config template (copy to local.parameters.json)
└── scripts/                   # PowerShell deployment scripts
    ├── deploy.ps1                   # Main orchestration script
    ├── create-resource-group.ps1    # Create Azure Resource Group
    ├── deploy-cosmos-db.ps1         # Deploy Cosmos DB
    ├── deploy-static-web-app.ps1    # Deploy Static Web App
    ├── deploy-function-app.ps1      # Deploy Function App
    ├── deploy-monitoring.ps1        # Deploy Application Insights
    └── configure-ad-b2c.ps1         # Azure AD B2C setup guide
```

## Prerequisites

Before deploying, ensure you have:

1. **Azure Subscription**: Active Azure subscription with sufficient permissions
2. **Azure CLI**: [Install Azure CLI](https://aka.ms/installazurecli) (version 2.40.0 or later)
3. **PowerShell**: PowerShell 7+ recommended ([Install PowerShell](https://docs.microsoft.com/en-us/powershell/scripting/install/installing-powershell))
4. **Azure Login**: Authenticate with `az login`

To verify your setup:

```powershell
# Check Azure CLI version
az --version

# Check PowerShell version
$PSVersionTable.PSVersion

# Login to Azure
az login

# Set your subscription (if you have multiple)
az account set --subscription "Your Subscription Name"
```

## Deployment Options

### Option 1: PowerShell Scripts (Recommended for MVP)

The PowerShell scripts provide a streamlined deployment experience with automated resource creation.

#### Quick Start

```powershell
# Navigate to scripts directory
cd infra/scripts

# Deploy development environment
.\deploy.ps1 -Environment dev -Location eastus

# Deploy production environment
.\deploy.ps1 -Environment prod -Location eastus -SkipConfirmation

# Preview what would be deployed (dry run)
.\deploy.ps1 -WhatIf
```

#### Script Parameters

- **Environment**: `dev`, `staging`, or `prod` (default: `dev`)
- **Location**: Azure region (default: `eastus`)
- **ResourceGroupName**: Override default resource group name
- **SkipConfirmation**: Skip confirmation prompts (for CI/CD)
- **WhatIf**: Preview deployment without creating resources

#### Individual Component Deployment

You can also deploy components individually:

```powershell
# Create resource group
.\create-resource-group.ps1 -ResourceGroupName "rg-skynav-dev" -Location "eastus"

# Deploy Cosmos DB only
.\deploy-cosmos-db.ps1 -ResourceGroupName "rg-skynav-dev" -CosmosDbName "cosmos-skynav-dev" -Location "eastus"

# Deploy Function App only
.\deploy-function-app.ps1 -ResourceGroupName "rg-skynav-dev" -FunctionAppName "func-skynav-dev" -StorageAccountName "stskynavdev" -AppInsightsName "appi-skynav-dev" -Location "eastus"

# Deploy Static Web App only
.\deploy-static-web-app.ps1 -ResourceGroupName "rg-skynav-dev" -StaticWebAppName "stapp-skynav-dev" -Location "eastus2"

# Deploy Application Insights only
.\deploy-monitoring.ps1 -ResourceGroupName "rg-skynav-dev" -AppInsightsName "appi-skynav-dev" -Location "eastus"
```

### Option 2: Azure Portal (Manual Setup)

For initial development or if you prefer a UI-based approach, resources can be manually created via Azure Portal. Production deployments should use automated scripts for consistency and reproducibility.

## Post-Deployment Configuration

### 1. Configure Azure AD B2C

Azure AD B2C requires manual configuration via the Azure Portal. Run the configuration guide:

```powershell
.\scripts\configure-ad-b2c.ps1
```

This will display step-by-step instructions for:
- Creating an Azure AD B2C tenant
- Registering the SkyNav application
- Setting up user flows
- Configuring social identity providers (optional)

### 2. Retrieve Connection Strings

After deployment, retrieve connection strings for your application:

```powershell
# Get Cosmos DB connection string
az cosmosdb keys list --name cosmos-skynav-dev --resource-group rg-skynav-dev --type connection-strings --query 'connectionStrings[0].connectionString' -o tsv

# Get Application Insights instrumentation key
az monitor app-insights component show --app appi-skynav-dev --resource-group rg-skynav-dev --query 'instrumentationKey' -o tsv

# Get Static Web App deployment token
az staticwebapp secrets list --name stapp-skynav-dev --resource-group rg-skynav-dev --query 'properties.apiKey' -o tsv
```

### 3. Configure Application Settings

#### For Function App

Set environment variables via Azure Portal or CLI:

```powershell
az functionapp config appsettings set --name func-skynav-dev --resource-group rg-skynav-dev --settings `
  "COSMOS_DB_CONNECTION_STRING=<your-connection-string>" `
  "AZURE_AD_B2C_TENANT_NAME=<your-tenant-name>" `
  "AZURE_AD_B2C_CLIENT_ID=<your-client-id>" `
  "AZURE_AD_B2C_CLIENT_SECRET=<your-client-secret>" `
  "AZURE_AD_B2C_POLICY_NAME=B2C_1_signupsignin"
```

#### For Next.js Frontend

Create `.env.local` in `src/web/`:

```env
# Azure Cosmos DB (for local development with emulator)
COSMOS_DB_ENDPOINT=https://localhost:8081
COSMOS_DB_KEY=your-local-emulator-key

# Azure AD B2C
NEXT_PUBLIC_B2C_TENANT_NAME=your-tenant-name
NEXT_PUBLIC_B2C_CLIENT_ID=your-client-id
NEXT_PUBLIC_B2C_POLICY_NAME=B2C_1_signupsignin
NEXT_PUBLIC_B2C_REDIRECT_URI=https://localhost:3000/api/auth/callback

# Application Insights
NEXT_PUBLIC_APPINSIGHTS_INSTRUMENTATIONKEY=your-instrumentation-key

# API Endpoint (local development)
NEXT_PUBLIC_API_URL=http://localhost:7071/api
```

### 4. Deploy Application Code

#### Deploy Functions

```powershell
# Navigate to API directory
cd src/api

# Install dependencies
npm install

# Build TypeScript
npm run build

# Deploy to Azure
func azure functionapp publish func-skynav-dev
```

#### Deploy Static Web App

Option A: Via GitHub Actions (Recommended)

1. Add deployment token to GitHub repository secrets:
   - Secret name: `AZURE_STATIC_WEB_APPS_API_TOKEN`
   - Secret value: (from step 2 above)

2. Push code to trigger GitHub Actions workflow

Option B: Manual deployment with SWA CLI

```powershell
# Navigate to web directory
cd src/web

# Install dependencies
npm install

# Build application
npm run build

# Deploy
npx @azure/static-web-apps-cli deploy .next --deployment-token <your-token>
```

## Local vs Cloud Setup

### Local Development Environment

For local development, use Azure emulators and local services:

#### Prerequisites

1. **Azure Functions Core Tools**: [Install](https://docs.microsoft.com/en-us/azure/azure-functions/functions-run-local)
2. **Azure Cosmos DB Emulator**: [Install](https://docs.microsoft.com/en-us/azure/cosmos-db/local-emulator) (Windows) or use Docker
3. **Node.js 18+**: [Install](https://nodejs.org/)

#### Setup

```powershell
# Start Cosmos DB Emulator (Windows)
# Or via Docker:
docker run -p 8081:8081 -p 10251-10254:10251-10254 mcr.microsoft.com/cosmosdb/linux/azure-cosmos-emulator

# Start Azure Functions locally
cd src/api
npm install
npm start
# Functions available at http://localhost:7071

# Start Next.js frontend locally
cd src/web
npm install
npm run dev
# Frontend available at http://localhost:3000
```

#### Local Configuration

Create `local.settings.json` in `src/api/`:

```json
{
  "IsEncrypted": false,
  "Values": {
    "AzureWebJobsStorage": "UseDevelopmentStorage=true",
    "FUNCTIONS_WORKER_RUNTIME": "node",
    "COSMOS_DB_CONNECTION_STRING": "AccountEndpoint=https://localhost:8081/;AccountKey=C2y6yDjf5/R+ob0N8A7Cgv...",
    "AZURE_AD_B2C_TENANT_NAME": "your-dev-tenant",
    "AZURE_AD_B2C_CLIENT_ID": "your-dev-client-id",
    "AZURE_AD_B2C_POLICY_NAME": "B2C_1_signupsignin"
  },
  "Host": {
    "CORS": "*"
  }
}
```

### Cloud Environment

Cloud deployment uses real Azure services:

- **Cosmos DB**: Production Cosmos DB account (serverless mode)
- **Functions**: Azure Functions in Consumption plan
- **Static Web App**: Azure Static Web Apps with CDN
- **AD B2C**: Production Azure AD B2C tenant
- **Application Insights**: Full monitoring and telemetry

#### Environment Comparison

| Feature | Local Development | Cloud (Dev/Prod) |
|---------|------------------|------------------|
| **Database** | Cosmos DB Emulator | Azure Cosmos DB (serverless) |
| **Functions** | Local Functions runtime | Azure Functions (consumption) |
| **Frontend** | Next.js dev server | Azure Static Web Apps |
| **Authentication** | Azure AD B2C (dev tenant) | Azure AD B2C (prod tenant) |
| **Monitoring** | Console logs | Application Insights |
| **Cost** | Free (local) | $30-75/month (MVP estimate) |
| **Scale** | Single instance | Auto-scaling, globally distributed |

## Resource Naming Convention

Following Azure naming best practices:

- **Resource Group**: `rg-skynav-{env}`
- **Static Web App**: `stapp-skynav-{env}`
- **Function App**: `func-skynav-{env}`
- **Cosmos DB**: `cosmos-skynav-{env}`
- **Storage Account**: `stskynav{env}` (lowercase, no hyphens)
- **Application Insights**: `appi-skynav-{env}`

Where `{env}` is `dev`, `staging`, or `prod`.

## Environments

- **Development (dev)**: Local development with Azure emulators or cloud dev resources
- **Staging (optional)**: Azure environment for pre-production testing
- **Production (prod)**: Production Azure environment

## Configuration

### Cosmos DB

- **API**: SQL API
- **Consistency Level**: Session (default)
- **Throughput**: Serverless (auto-scaling)
- **Containers**:
  - `dropzones` - Partition key: `/id`
  - `annotations` - Partition key: `/dropzoneId`
  - `communityNotes` - Partition key: `/dropzoneId`
  - `users` - Partition key: `/id`
  - `auditLog` - Partition key: `/entityType`

### Azure Functions

- **Runtime**: Node.js 18
- **Plan**: Consumption (serverless)
- **Trigger**: HTTP (REST API)

### Azure Static Web Apps

- **Framework**: Next.js
- **Build Command**: `npm run build`
- **Output Location**: `.next`
- **API Location**: `src/api`

## Cost Estimation (MVP)

Based on serverless pricing with minimal traffic:

- **Static Web Apps**: Free tier (suitable for MVP)
- **Azure Functions**: ~$0-10/month (first 1M executions free)
- **Cosmos DB**: ~$25-50/month (serverless, minimal RU/s)
- **Azure Maps**: ~$0-5/month (S0 tier, limited transactions)
- **Blob Storage**: ~$1-5/month
- **Application Insights**: ~$0-5/month (first 5GB free)

**Estimated Total**: $30-75/month for MVP with low traffic

## Monitoring & Observability

- **Application Insights**: Request/response logging, performance metrics
- **Azure Monitor**: Resource health and alerts
- **Log Analytics**: Query and analyze logs
- **Alerts**: Configured for errors, high latency, and resource limits

## Security

- **Authentication**: Azure AD B2C JWT tokens
- **API Security**: CORS, rate limiting, input validation
- **Database**: Firewall rules, managed identity access
- **Secrets**: Azure Key Vault for sensitive configuration
- **HTTPS**: Enforced for all endpoints

## Scaling Strategy

The serverless architecture auto-scales with demand:

- **Functions**: Scale to zero when idle, scale out automatically
- **Cosmos DB**: Serverless mode scales RU/s automatically
- **Static Web Apps**: CDN-backed, globally distributed

## Backup & Disaster Recovery

- **Cosmos DB**: Continuous backup (30-day retention)
- **Blob Storage**: Geo-redundant storage (GRS)
- **Deployment**: Infrastructure as Code for reproducibility

## CI/CD

Deployment can be automated via GitHub Actions:
- Push to `main` → Deploy to production
- Pull requests → Deploy to preview environment

Example GitHub Actions workflow (create `.github/workflows/azure-deploy.yml`):

```yaml
name: Deploy to Azure

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  deploy-infrastructure:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Azure Login
        uses: azure/login@v1
        with:
          creds: ${{ secrets.AZURE_CREDENTIALS }}
      
      - name: Deploy Infrastructure
        shell: pwsh
        run: |
          cd infra/scripts
          .\deploy.ps1 -Environment prod -SkipConfirmation

  deploy-functions:
    needs: deploy-infrastructure
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Deploy Functions
        run: |
          cd src/api
          npm install
          npm run build
          func azure functionapp publish func-skynav-prod
```

## Troubleshooting

### Common Issues

1. **"Resource name already exists"**
   - Resource names must be globally unique (especially Storage Accounts, Cosmos DB)
   - Modify the resource name in deployment parameters

2. **"Insufficient permissions"**
   - Ensure you have Contributor role or higher on the subscription
   - Some resources (like AD B2C) require Global Administrator

3. **"Static Web App deployment failed"**
   - Static Web Apps require GitHub integration for full functionality
   - Use Azure Portal for initial setup, or provide GitHub token

4. **"Functions cold start is slow"**
   - This is normal for Consumption plan
   - Consider Premium plan if sub-second response is critical
   - Implement keep-alive ping for critical endpoints

5. **"Cosmos DB throttling (429 errors)"**
   - Serverless mode has automatic scaling but may throttle on sudden spikes
   - Monitor RU consumption and optimize queries
   - Consider provisioned throughput for predictable workloads

### Useful Commands

```powershell
# List all resources in resource group
az resource list --resource-group rg-skynav-dev --output table

# Check resource group costs
az consumption usage list --start-date 2026-02-01 --end-date 2026-02-28

# Delete all resources (careful!)
az group delete --name rg-skynav-dev --yes --no-wait

# View Function App logs
az functionapp log tail --name func-skynav-dev --resource-group rg-skynav-dev

# View Cosmos DB metrics
az monitor metrics list --resource /subscriptions/{sub-id}/resourceGroups/rg-skynav-dev/providers/Microsoft.DocumentDB/databaseAccounts/cosmos-skynav-dev --metric TotalRequests
```

## Additional Resources

- [Azure Functions Documentation](https://learn.microsoft.com/en-us/azure/azure-functions/)
- [Azure Cosmos DB Documentation](https://learn.microsoft.com/en-us/azure/cosmos-db/)
- [Azure Static Web Apps Documentation](https://learn.microsoft.com/en-us/azure/static-web-apps/)
- [Azure AD B2C Documentation](https://learn.microsoft.com/en-us/azure/active-directory-b2c/)
- [Azure CLI Reference](https://learn.microsoft.com/en-us/cli/azure/)

## Support

For issues or questions:
1. Review the [Architecture Decision Records](../docs/adr/)
2. Check [SkyNav documentation](../docs/)
3. Review Azure service documentation linked above

---

**Status**: ✅ Ready for MVP deployment (PowerShell scripts)  
**Last Updated**: February 7, 2026
