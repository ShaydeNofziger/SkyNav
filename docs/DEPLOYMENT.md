# Deployment Guide

This document describes the deployment process for SkyNav using GitHub Actions for automated CI/CD.

## Overview

SkyNav uses GitHub Actions workflows to automate deployments to Azure:

- **API Deployment**: Deploys Azure Functions backend to Azure Functions
- **Web Deployment**: Deploys Next.js frontend to Azure Static Web Apps

Both deployments support:
- ✅ Automatic deployment on push to `main`
- ✅ Manual deployment via workflow dispatch
- ✅ Environment-specific configurations
- ✅ Build validation and testing

## Prerequisites

Before setting up deployments, ensure you have:

1. **Azure Resources Deployed**
   - Azure Functions App for API
   - Azure Static Web Apps for frontend
   - Azure Cosmos DB
   - Azure Application Insights
   - See [Infrastructure README](../infra/README.md) for setup instructions

2. **GitHub Repository Secrets Configured**
   - See [Secrets Configuration](#secrets-configuration) below

3. **Azure Permissions**
   - Ability to download publish profiles from Azure Portal
   - Access to Azure Static Web Apps deployment tokens

## Secrets Configuration

### Required Secrets

Configure the following secrets in your GitHub repository (Settings → Secrets and variables → Actions):

#### For API Deployment (`deploy-api.yml`)

| Secret Name | Description | How to Obtain |
|------------|-------------|---------------|
| `AZURE_FUNCTIONAPP_NAME` | Name of your Azure Functions app | From Azure Portal or deployment output |
| `AZURE_FUNCTIONAPP_PUBLISH_PROFILE` | Publish profile for Azure Functions | Download from Azure Portal: Function App → Get publish profile |

#### For Web Deployment (`deploy-web.yml`)

| Secret Name | Description | How to Obtain |
|------------|-------------|---------------|
| `AZURE_STATIC_WEB_APPS_API_TOKEN` | Deployment token for Static Web Apps | Azure Portal: Static Web App → Manage deployment token |
| `NEXT_PUBLIC_B2C_TENANT_NAME` | Azure AD B2C tenant name | Your B2C tenant (e.g., `yourapp.onmicrosoft.com`) |
| `NEXT_PUBLIC_B2C_CLIENT_ID` | Azure AD B2C client ID | From B2C app registration |
| `NEXT_PUBLIC_B2C_POLICY_NAME` | User flow policy name | Usually `B2C_1_signupsignin` |
| `NEXT_PUBLIC_API_URL` | API endpoint URL | Your Functions app URL (e.g., `https://func-skynav-prod.azurewebsites.net/api`) |
| `NEXT_PUBLIC_AZURE_MAPS_KEY` | Azure Maps subscription key | From Azure Maps account |

### How to Add Secrets

1. Navigate to your GitHub repository
2. Go to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Enter the secret name and value
5. Click **Add secret**

### Environment-Specific Secrets

For multiple environments (dev, staging, prod), you can use GitHub Environments:

1. Go to **Settings** → **Environments**
2. Create environments: `dev`, `staging`, `prod`
3. Add environment-specific secrets to each environment
4. Workflows will automatically use environment-specific secrets

## Workflows

### API Deployment Workflow

**File**: `.github/workflows/deploy-api.yml`

**Triggers**:
- Push to `main` branch (with changes in `src/api/`)
- Manual workflow dispatch

**Steps**:
1. Checkout code
2. Setup Node.js 18
3. Install dependencies (`npm ci`)
4. Build TypeScript (`npm run build`)
5. Run tests (`npm test`)
6. Deploy to Azure Functions

**Manual Deployment**:
```bash
# Via GitHub UI:
# 1. Go to Actions tab
# 2. Select "Deploy API to Azure Functions"
# 3. Click "Run workflow"
# 4. Select environment (dev/staging/prod)
# 5. Click "Run workflow"
```

### Web Deployment Workflow

**File**: `.github/workflows/deploy-web.yml`

**Triggers**:
- Push to `main` branch (with changes in `src/web/`)
- Pull request to `main` (creates preview deployment)
- Manual workflow dispatch

**Steps**:
1. Checkout code
2. Setup Node.js 18
3. Install dependencies (`npm ci --legacy-peer-deps`)
4. Build Next.js app (`npm run build`)
5. Deploy to Azure Static Web Apps

**Features**:
- **Preview Deployments**: Automatic preview for pull requests
- **Automatic Cleanup**: Preview environments deleted when PR is closed
- **Build Caching**: Uses npm cache for faster builds

**Manual Deployment**:
```bash
# Via GitHub UI:
# 1. Go to Actions tab
# 2. Select "Deploy Web to Azure Static Web Apps"
# 3. Click "Run workflow"
# 4. Click "Run workflow"
```

## Release Process

### Standard Release (Automated)

For regular deployments to production:

1. **Merge to Main**
   ```bash
   # Create feature branch
   git checkout -b feature/my-feature
   
   # Make changes and commit
   git add .
   git commit -m "Add new feature"
   
   # Push and create PR
   git push origin feature/my-feature
   ```

2. **Review Pull Request**
   - Code review by team members
   - Automated preview deployment for web changes
   - Tests run automatically

3. **Merge PR**
   - Once approved, merge to `main`
   - Deployment automatically triggers based on changed files
   - API changes trigger API deployment
   - Web changes trigger web deployment

4. **Monitor Deployment**
   - Go to **Actions** tab to monitor progress
   - View deployment logs
   - Check deployment summary

### Manual Release

For specific deployments or rollbacks:

1. **Navigate to Actions Tab**
   - Go to repository → Actions

2. **Select Workflow**
   - Choose "Deploy API" or "Deploy Web"

3. **Run Workflow**
   - Click "Run workflow"
   - Select environment (if applicable)
   - Click "Run workflow" button

4. **Monitor Progress**
   - Watch workflow execution
   - Review logs for any issues

### Hotfix Release

For urgent production fixes:

1. **Create Hotfix Branch**
   ```bash
   git checkout -b hotfix/critical-fix main
   ```

2. **Make Fix and Test**
   ```bash
   # Make changes
   git add .
   git commit -m "Fix critical issue"
   ```

3. **Deploy**
   ```bash
   # Push to main
   git push origin hotfix/critical-fix
   
   # Create and merge PR
   # Or manually trigger deployment via Actions tab
   ```

## Deployment Validation

After deployment, validate the changes:

### API Validation

1. **Check Function Health**
   ```bash
   curl https://func-skynav-prod.azurewebsites.net/api/health
   ```

2. **Monitor Application Insights**
   - Go to Azure Portal → Application Insights
   - Check for errors or exceptions
   - Review performance metrics

3. **Test API Endpoints**
   ```bash
   # Test a simple endpoint
   curl https://func-skynav-prod.azurewebsites.net/api/dropzones
   ```

### Web Validation

1. **Access the Site**
   - Open production URL in browser
   - Verify homepage loads correctly

2. **Test Key Features**
   - Authentication flow
   - Navigation
   - Core functionality

3. **Check Static Web Apps Metrics**
   - Azure Portal → Static Web App → Metrics
   - Review request counts and response times

## Rollback Procedure

If a deployment introduces issues:

### Option 1: Redeploy Previous Version

1. **Find Previous Successful Deployment**
   - Go to Actions tab
   - Find last successful workflow run

2. **Re-run Workflow**
   - Click on successful workflow
   - Click "Re-run all jobs"

### Option 2: Redeploy from Previous Commit

1. **Identify Last Good Commit**
   ```bash
   git log --oneline
   ```

2. **Manual Deployment**
   - Go to Actions tab
   - Run workflow
   - Workflow will deploy current state

3. **Or Revert Commit**
   ```bash
   git revert <bad-commit-sha>
   git push origin main
   ```

### Option 3: Azure Portal Rollback

For Azure Functions:
1. Azure Portal → Function App
2. Deployment Center → Deployment History
3. Select previous deployment
4. Click "Redeploy"

For Static Web Apps:
1. Azure Portal → Static Web App
2. Environments → Production
3. View deployment history
4. Rollback to previous version

## Monitoring & Alerts

### Application Insights

Monitor application health:

1. **Azure Portal → Application Insights**
2. View metrics:
   - Request rates
   - Response times
   - Failure rates
   - Dependencies

3. **Set up alerts** for:
   - High error rates
   - Slow response times
   - Failed deployments

### GitHub Actions Status

Monitor deployment status:

1. **Status Checks**
   - View workflow status in commits
   - Check Actions tab for history

2. **Notifications**
   - Configure email notifications for failed workflows
   - Settings → Notifications

3. **Status Badges**
   - Add workflow status badges to README
   ```markdown
   ![Deploy API](https://github.com/ShaydeNofziger/SkyNav/actions/workflows/deploy-api.yml/badge.svg)
   ![Deploy Web](https://github.com/ShaydeNofziger/SkyNav/actions/workflows/deploy-web.yml/badge.svg)
   ```

## Troubleshooting

### Common Issues

#### API Deployment Fails

**Issue**: Build or deployment fails

**Solutions**:
1. Check build logs in Actions tab
2. Verify all dependencies are in `package.json`
3. Ensure TypeScript compiles locally: `npm run build`
4. Check Azure Functions publish profile is valid
5. Verify function app settings in Azure Portal

#### Web Deployment Fails

**Issue**: Build or deployment fails

**Solutions**:
1. Check if all environment variables are set
2. Test build locally: `npm run build`
3. Verify Static Web Apps token is valid
4. Check for dependency conflicts (use `--legacy-peer-deps`)
5. Review build logs for specific errors

#### Tests Fail

**Issue**: Tests fail during deployment

**Solutions**:
1. Run tests locally first: `npm test`
2. Check if test environment variables are needed
3. Review test logs in Actions tab
4. Note: Tests are set to `continue-on-error: true` for now

#### Secrets Not Working

**Issue**: Environment variables not available

**Solutions**:
1. Verify secrets are added to correct environment
2. Check secret names match exactly (case-sensitive)
3. Ensure secrets are not masked in logs
4. Try re-entering the secret value

### Getting Help

1. **Check Logs**
   - Actions tab → Select failed workflow → View logs

2. **Review Documentation**
   - [GitHub Actions docs](https://docs.github.com/en/actions)
   - [Azure Functions deployment](https://docs.microsoft.com/en-us/azure/azure-functions/functions-how-to-github-actions)
   - [Azure Static Web Apps deployment](https://docs.microsoft.com/en-us/azure/static-web-apps/github-actions-workflow)

3. **Azure Support**
   - Azure Portal → Support
   - Check service health status

## Security Best Practices

1. **Secrets Management**
   - Never commit secrets to repository
   - Rotate secrets regularly
   - Use environment-specific secrets

2. **Access Control**
   - Limit who can trigger manual deployments
   - Use protected branches for `main`
   - Require PR reviews

3. **Monitoring**
   - Enable Application Insights
   - Set up alerts for suspicious activity
   - Review deployment logs regularly

4. **Dependency Security**
   - Keep dependencies updated
   - Use `npm audit` to check for vulnerabilities
   - Review Dependabot alerts

## Performance Optimization

1. **Build Caching**
   - npm cache enabled for faster builds
   - Dependencies cached between runs

2. **Parallel Deployments**
   - API and Web can deploy simultaneously
   - Independent workflows for independence

3. **Selective Deployment**
   - Workflows only trigger on relevant file changes
   - API deploys only when `src/api/` changes
   - Web deploys only when `src/web/` changes

## Cost Optimization

1. **Workflow Minutes**
   - Optimize build steps
   - Use caching to reduce build time
   - Public repos get unlimited minutes

2. **Azure Resources**
   - Functions on Consumption plan (pay per use)
   - Static Web Apps Free tier for MVP
   - Monitor usage in Azure Portal

## Future Enhancements

Potential improvements to consider:

1. **Automated Testing**
   - Add comprehensive test suites
   - Integration tests
   - E2E tests

2. **Staging Environment**
   - Add staging deployment workflow
   - Promote from staging to production

3. **Deployment Approvals**
   - Require manual approval for production
   - Use GitHub Environments with protection rules

4. **Automated Rollback**
   - Monitor health checks post-deployment
   - Automatic rollback on failure

5. **Performance Testing**
   - Load testing before production
   - Performance benchmarks

6. **Infrastructure as Code**
   - Automate Azure resource provisioning
   - Bicep or Terraform workflows

## Related Documentation

- [Infrastructure Setup](../infra/README.md)
- [Quick Start Guide](../infra/QUICKSTART.md)
- [API Documentation](../docs/api/)
- [Architecture Overview](../docs/architecture.md)

---

**Last Updated**: February 7, 2026  
**Status**: ✅ Ready for production use
