# Infrastructure

This directory contains Infrastructure as Code (IaC) configuration for deploying SkyNav to Azure.

## Overview

SkyNav uses a serverless architecture on Azure with the following components:

- **Azure Static Web Apps**: Hosts the Next.js frontend
- **Azure Functions**: Serverless API backend
- **Azure Cosmos DB**: NoSQL database (SQL API)
- **Azure Blob Storage**: File storage for images and assets
- **Azure Maps**: Mapping services
- **Azure AD B2C**: Authentication and user management
- **Azure Application Insights**: Monitoring and analytics

## Structure

```
infra/
├── bicep/              # Azure Bicep templates
│   ├── main.bicep             # Main infrastructure template
│   ├── cosmos-db.bicep        # Cosmos DB configuration
│   ├── storage.bicep          # Blob Storage configuration
│   ├── static-web-app.bicep   # Static Web Apps + Functions
│   └── monitoring.bicep       # Application Insights
├── terraform/          # Terraform configuration (alternative to Bicep)
│   ├── main.tf
│   ├── variables.tf
│   └── outputs.tf
└── scripts/            # Deployment and utility scripts
    ├── deploy.sh              # Deployment script
    └── seed-data.sh           # Database seed script
```

## Deployment Options

### Option 1: Azure Bicep (Recommended)

```bash
# Login to Azure
az login

# Create resource group
az group create --name rg-skynav-prod --location eastus

# Deploy infrastructure
az deployment group create \
  --resource-group rg-skynav-prod \
  --template-file bicep/main.bicep \
  --parameters environment=prod
```

### Option 2: Terraform

```bash
# Initialize Terraform
cd terraform
terraform init

# Plan deployment
terraform plan -out=tfplan

# Apply deployment
terraform apply tfplan
```

### Option 3: Azure Portal

For initial development, resources can be manually created via Azure Portal. Production deployments should use IaC.

## Environments

- **Development**: Local development with Azurite emulator
- **Staging**: Azure environment for testing (optional)
- **Production**: Production Azure environment

## Resource Naming Convention

Following Azure naming best practices:

- **Resource Group**: `rg-skynav-{env}`
- **Static Web App**: `stapp-skynav-{env}`
- **Function App**: `func-skynav-{env}`
- **Cosmos DB**: `cosmos-skynav-{env}`
- **Storage Account**: `stskynav{env}`
- **Application Insights**: `appi-skynav-{env}`

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

Deployment is automated via GitHub Actions:
- Push to `main` → Deploy to production
- Pull requests → Deploy to preview environment

---

**Status**: 🚧 Coming in Milestone 1 (Weeks 1-2)
