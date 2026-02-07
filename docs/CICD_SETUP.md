# CI/CD Setup Guide

Complete guide to setting up automated deployments for SkyNav.

## Prerequisites

Before you begin, ensure you have:

- ✅ Azure subscription with resources deployed (see [Infrastructure Setup](../infra/README.md))
- ✅ GitHub repository with push access
- ✅ Azure CLI installed and logged in
- ✅ Access to Azure Portal

## Quick Setup (5 Steps)

### Step 1: Deploy Azure Resources

If you haven't already deployed the Azure infrastructure:

```powershell
cd infra/scripts
.\deploy.ps1 -Environment prod -Location eastus
```

This creates:
- Azure Functions App
- Azure Static Web Apps
- Azure Cosmos DB
- Application Insights

Note the resource names from the output.

### Step 2: Get Azure Credentials

#### Function App Publish Profile

```bash
# Get the Function App name
az functionapp list --resource-group rg-skynav-prod --query "[].name" -o tsv

# Get publish profile (XML content)
az functionapp deployment list-publishing-profiles \
  --name func-skynav-prod \
  --resource-group rg-skynav-prod \
  --xml
```

**OR** download from Azure Portal:
1. Go to Function App → Deployment Center
2. Click "Manage publish profile"
3. Download publish profile
4. Copy the entire XML content

#### Static Web Apps Token

```bash
# Get the Static Web App name
az staticwebapp list --resource-group rg-skynav-prod --query "[].name" -o tsv

# Get deployment token
az staticwebapp secrets list \
  --name stapp-skynav-prod \
  --resource-group rg-skynav-prod \
  --query properties.apiKey -o tsv
```

**OR** from Azure Portal:
1. Go to Static Web App → Overview
2. Click "Manage deployment token"
3. Copy the token

### Step 3: Configure GitHub Secrets

Go to your GitHub repository → **Settings** → **Secrets and variables** → **Actions**

Add the following secrets:

#### API Deployment Secrets

| Secret Name | Value | Source |
|------------|-------|--------|
| `AZURE_FUNCTIONAPP_NAME` | `func-skynav-prod` | From Step 1 or Azure Portal |
| `AZURE_FUNCTIONAPP_PUBLISH_PROFILE` | XML content | From Step 2 |

#### Web Deployment Secrets

| Secret Name | Value | Source |
|------------|-------|--------|
| `AZURE_STATIC_WEB_APPS_API_TOKEN` | Long token string | From Step 2 |
| `NEXT_PUBLIC_B2C_TENANT_NAME` | `yourapp.onmicrosoft.com` | Azure AD B2C tenant |
| `NEXT_PUBLIC_B2C_CLIENT_ID` | GUID | Azure AD B2C app registration |
| `NEXT_PUBLIC_B2C_POLICY_NAME` | `B2C_1_signupsignin` | Azure AD B2C user flow |
| `NEXT_PUBLIC_API_URL` | `https://func-skynav-prod.azurewebsites.net/api` | From Azure Functions URL |
| `NEXT_PUBLIC_AZURE_MAPS_KEY` | Maps key | Azure Maps account |

**Detailed help**: See [.github/SECRETS.md](../.github/SECRETS.md)

### Step 4: Test the Workflows

#### Option A: Manual Test

1. Go to **Actions** tab in GitHub
2. Select "Deploy API to Azure Functions"
3. Click "Run workflow" → "Run workflow"
4. Watch the deployment progress
5. Repeat for "Deploy Web to Azure Static Web Apps"

#### Option B: Automatic Test

1. Make a small change in `src/api/` or `src/web/`
2. Create a branch and push:
   ```bash
   git checkout -b test/deployment
   echo "# Test" >> src/api/README.md
   git add .
   git commit -m "Test deployment"
   git push origin test/deployment
   ```
3. Create a Pull Request
4. Watch workflows run automatically

### Step 5: Verify Deployment

#### Check API

```bash
# Health check
curl https://func-skynav-prod.azurewebsites.net/api/health

# Test endpoint
curl https://func-skynav-prod.azurewebsites.net/api/dropzones
```

#### Check Web

1. Open: `https://stapp-skynav-prod.azurestaticapps.net`
2. Verify homepage loads
3. Test navigation
4. Try authentication

## Environment-Specific Setup (Optional)

For multiple environments (dev, staging, prod):

### Create GitHub Environments

1. **Settings** → **Environments** → **New environment**
2. Create: `dev`, `staging`, `prod`
3. For production, enable:
   - **Required reviewers**: Add team members who must approve
   - **Wait timer**: Optional delay before deployment
   - **Deployment branches**: Limit to `main` branch

### Add Environment-Specific Secrets

For each environment, add secrets with environment-specific values:

**Dev Environment**:
- `AZURE_FUNCTIONAPP_NAME`: `func-skynav-dev`
- `NEXT_PUBLIC_API_URL`: `https://func-skynav-dev.azurewebsites.net/api`
- etc.

**Prod Environment**:
- `AZURE_FUNCTIONAPP_NAME`: `func-skynav-prod`
- `NEXT_PUBLIC_API_URL`: `https://func-skynav-prod.azurewebsites.net/api`
- etc.

### Update Workflow Files

Modify workflows to use environments:

```yaml
# .github/workflows/deploy-api.yml
jobs:
  build-and-deploy:
    environment: production  # Uses production environment secrets
    # ... rest of workflow
```

## Workflow Configuration

### API Workflow (`deploy-api.yml`)

**Automatic Triggers**:
- Push to `main` with changes in `src/api/**`

**Manual Trigger**:
- Actions → Deploy API → Run workflow

**What it does**:
1. Checks out code
2. Sets up Node.js 18
3. Installs dependencies
4. Builds TypeScript
5. Runs tests (optional)
6. Deploys to Azure Functions

**Customization**:
- Change Node version: Update `node-version` in workflow
- Add linting: Add step before build
- Required tests: Remove `continue-on-error: true`

### Web Workflow (`deploy-web.yml`)

**Automatic Triggers**:
- Push to `main` with changes in `src/web/**`
- Pull requests (creates preview)

**Manual Trigger**:
- Actions → Deploy Web → Run workflow

**What it does**:
1. Checks out code
2. Sets up Node.js 18
3. Installs dependencies (with `--legacy-peer-deps`)
4. Builds Next.js app
5. Deploys to Azure Static Web Apps

**Preview Deployments**:
- Every PR gets a preview URL
- Automatic cleanup when PR closes
- Preview URLs commented on PR

## Advanced Configuration

### Adding Pre-Deployment Tests

Edit `.github/workflows/deploy-api.yml`:

```yaml
- name: Run Linting
  working-directory: src/api
  run: npm run lint

- name: Run Tests
  working-directory: src/api
  run: npm test
  # Remove continue-on-error to make tests required
```

### Adding Deployment Notifications

Add a notification step to workflows:

```yaml
- name: Notify Slack
  if: always()
  uses: 8398a7/action-slack@v3
  with:
    status: ${{ job.status }}
    webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

### Custom Build Steps

For the API, add custom steps before deployment:

```yaml
- name: Generate OpenAPI Spec
  working-directory: src/api
  run: npm run generate-api-docs

- name: Run Database Migrations
  run: npm run migrate
  env:
    COSMOS_DB_CONNECTION_STRING: ${{ secrets.COSMOS_DB_CONNECTION_STRING }}
```

### Deployment Approvals

For production deployments requiring approval:

1. Create `production` environment
2. Enable "Required reviewers"
3. Add team members as reviewers
4. Update workflow:
   ```yaml
   jobs:
     build-and-deploy:
       environment: production  # Requires approval
   ```

## Monitoring Deployments

### GitHub Actions Dashboard

- **Actions** tab shows all workflow runs
- Click any run to see detailed logs
- Failed runs show error details
- Re-run failed workflows with one click

### Azure Monitoring

**Application Insights**:
```bash
# View recent logs
az monitor app-insights metrics show \
  --app appi-skynav-prod \
  --resource-group rg-skynav-prod \
  --metric requests/count
```

**Function App Logs**:
```bash
# Stream logs
az functionapp log tail \
  --name func-skynav-prod \
  --resource-group rg-skynav-prod
```

### Status Badges

Add to README.md:

```markdown
![Deploy API](https://github.com/ShaydeNofziger/SkyNav/actions/workflows/deploy-api.yml/badge.svg)
![Deploy Web](https://github.com/ShaydeNofziger/SkyNav/actions/workflows/deploy-web.yml/badge.svg)
```

## Troubleshooting

### Workflow Won't Trigger

**Issue**: Workflow doesn't run on push

**Solutions**:
1. Check file path filters in workflow
2. Ensure branch name matches trigger
3. Verify workflows are enabled (Actions → Enable workflows)

### Authentication Errors

**Issue**: Azure authentication fails

**Solutions**:
1. Regenerate publish profile/token
2. Update secret in GitHub
3. Check for expired credentials
4. Verify resource names match

### Build Fails

**Issue**: Build step fails in workflow

**Solutions**:
1. Test build locally first
2. Check Node.js version matches
3. Verify all dependencies in package.json
4. Review build logs for specific errors

### Deployment Succeeds But App Not Updated

**Issue**: Deployment completes but changes not visible

**Solutions**:
1. Check deployment took effect in Azure Portal
2. Clear browser cache
3. Verify correct function app/static web app
4. Check for deployment slot issues
5. Review Azure deployment logs

### Secrets Not Available

**Issue**: Build fails due to undefined environment variables

**Solutions**:
1. Verify all required secrets are added
2. Check secret names (case-sensitive)
3. If using environments, ensure workflow specifies environment
4. Re-enter secret values (no extra spaces)

## Security Best Practices

### Protect Main Branch

1. **Settings** → **Branches** → **Add rule**
2. Branch name pattern: `main`
3. Enable:
   - ✅ Require pull request reviews
   - ✅ Require status checks to pass
   - ✅ Require branches to be up to date

### Rotate Credentials Regularly

- Rotate publish profiles every 90 days
- Update GitHub secrets with new values
- Use Azure Key Vault for sensitive data

### Limit Workflow Permissions

Edit workflows to use minimal permissions:

```yaml
permissions:
  contents: read
  deployments: write
```

### Review Deployment Logs

- Regularly check for failed deployments
- Monitor for suspicious activity
- Set up alerts for repeated failures

## Cost Optimization

### GitHub Actions

- Public repos: Unlimited minutes (free)
- Private repos: 2,000 minutes/month free
- Optimize by:
  - Using caching (already enabled)
  - Running only on changed files (already configured)
  - Combining jobs where possible

### Azure Resources

- Monitor usage in Azure Portal
- Set up cost alerts
- Use consumption plans (already configured)
- Review Application Insights data retention

## Next Steps

After CI/CD is working:

1. **Add More Tests**
   - Unit tests for API
   - Integration tests
   - E2E tests for web

2. **Implement Staging**
   - Create staging environment
   - Deploy staging before production
   - Run smoke tests on staging

3. **Automated Rollbacks**
   - Health check after deployment
   - Automatic rollback on failure
   - Alerts on deployment issues

4. **Infrastructure as Code**
   - Automate Azure resource creation
   - Version infrastructure changes
   - Consistent environments

5. **Performance Monitoring**
   - Track deployment frequency
   - Monitor build times
   - Measure deployment success rate

## Resources

- 📖 [Deployment Guide](../docs/DEPLOYMENT.md) - Complete deployment documentation
- ⚡ [Release Process](../docs/RELEASE_PROCESS.md) - Quick reference
- 🔐 [Secrets Template](../.github/SECRETS.md) - Required secrets list
- 🏗️ [Infrastructure Setup](../infra/README.md) - Azure resources
- 🤖 [GitHub Actions Docs](https://docs.github.com/en/actions)
- ☁️ [Azure Functions CI/CD](https://docs.microsoft.com/en-us/azure/azure-functions/functions-how-to-github-actions)

---

**Questions?** Open an issue or refer to the documentation above.

**Last Updated**: February 7, 2026
