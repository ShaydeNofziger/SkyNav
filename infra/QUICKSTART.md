# Quick Start Guide - Azure Infrastructure

This is a quick reference for deploying SkyNav infrastructure to Azure.

## Prerequisites Checklist

- [ ] Azure subscription with sufficient permissions
- [ ] Azure CLI installed (v2.40.0+)
- [ ] PowerShell 7+ installed
- [ ] Logged in to Azure (`az login`)
- [ ] Correct subscription selected

## 5-Minute Deployment

### Step 1: Deploy Infrastructure (5 minutes)

```powershell
# Navigate to scripts directory
cd infra/scripts

# Deploy all resources to development environment
.\deploy.ps1 -Environment dev -Location eastus

# Or deploy to production
.\deploy.ps1 -Environment prod -Location eastus -SkipConfirmation
```

**What gets created:**
- Resource Group
- Cosmos DB (serverless, with 5 containers)
- Azure Functions (Node.js 18)
- Static Web App
- Application Insights
- Storage Account

### Step 2: Configure Azure AD B2C (15-20 minutes)

```powershell
# Display step-by-step setup guide
.\configure-ad-b2c.ps1
```

Follow the instructions to:
1. Create Azure AD B2C tenant
2. Register application
3. Create user flows (sign-up/sign-in, password reset)
4. Get credentials (tenant ID, client ID, client secret)

### Step 3: Get Connection Strings

```powershell
# Cosmos DB
az cosmosdb keys list --name cosmos-skynav-dev --resource-group rg-skynav-dev --type connection-strings --query 'connectionStrings[0].connectionString' -o tsv

# Application Insights
az monitor app-insights component show --app appi-skynav-dev --resource-group rg-skynav-dev --query 'instrumentationKey' -o tsv

# Static Web App deployment token
az staticwebapp secrets list --name stapp-skynav-dev --resource-group rg-skynav-dev --query 'properties.apiKey' -o tsv
```

### Step 4: Configure Local Development

**Frontend:**
```bash
cd src/web
cp .env.example .env.local
# Edit .env.local with your values
```

**Backend:**
```bash
cd src/api
cp local.settings.template.json local.settings.json
# Edit local.settings.json with your values
```

### Step 5: Deploy Application Code

**Functions:**
```bash
cd src/api
npm install
npm run build
func azure functionapp publish func-skynav-dev
```

**Static Web App:**
Set up GitHub Actions or deploy manually via Azure Portal.

## Common Commands

### View Resources
```powershell
az resource list --resource-group rg-skynav-dev --output table
```

### Delete Everything
```powershell
az group delete --name rg-skynav-dev --yes --no-wait
```

### View Function Logs
```powershell
az functionapp log tail --name func-skynav-dev --resource-group rg-skynav-dev
```

## Troubleshooting

**Issue:** "Resource name already exists"  
**Fix:** Resource names must be globally unique. Modify names in parameters.

**Issue:** "Insufficient permissions"  
**Fix:** Ensure you have Contributor role or higher on the subscription.

**Issue:** "Static Web App deployment failed"  
**Fix:** Use Azure Portal for initial setup or provide GitHub token.

## Cost Management

**Monitor costs:**
```powershell
az consumption usage list --start-date 2026-02-01 --end-date 2026-02-28
```

**Expected MVP costs:** $30-75/month with minimal traffic

## Support

- 📖 Full documentation: `/infra/README.md`
- 🔐 Environment variables: `/docs/environment-variables.md`
- 🏗️ Architecture: `/docs/architecture.md`
- 📋 ADRs: `/docs/adr/`

---

**Need help?** Review the full documentation in `/infra/README.md`
