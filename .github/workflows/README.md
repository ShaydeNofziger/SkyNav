# GitHub Actions Workflows

This directory contains automated CI/CD workflows for SkyNav deployments.

## Workflows

### 1. Deploy API (`deploy-api.yml`)

Deploys the Azure Functions API backend to Azure.

**Triggers**:
- Push to `main` with changes in `src/api/`
- Manual workflow dispatch

**Requirements**:
- `AZURE_FUNCTIONAPP_NAME` - Function app name
- `AZURE_FUNCTIONAPP_PUBLISH_PROFILE` - Publish profile from Azure

**Environment**: Supports `dev`, `staging`, `prod` environments

### 2. Deploy Web (`deploy-web.yml`)

Deploys the Next.js frontend to Azure Static Web Apps.

**Triggers**:
- Push to `main` with changes in `src/web/`
- Pull requests (creates preview deployments)
- Manual workflow dispatch

**Requirements**:
- `AZURE_STATIC_WEB_APPS_API_TOKEN` - Deployment token
- `NEXT_PUBLIC_B2C_TENANT_NAME` - Azure AD B2C tenant
- `NEXT_PUBLIC_B2C_CLIENT_ID` - B2C client ID
- `NEXT_PUBLIC_B2C_POLICY_NAME` - B2C policy name
- `NEXT_PUBLIC_API_URL` - API endpoint URL
- `NEXT_PUBLIC_AZURE_MAPS_KEY` - Azure Maps key

## Setup Instructions

### 1. Configure GitHub Secrets

Go to **Settings** → **Secrets and variables** → **Actions**

Add the required secrets for each workflow (see above).

### 2. Get Azure Credentials

**Function App Publish Profile**:
```bash
# Via Azure CLI
az functionapp deployment list-publishing-profiles --name <app-name> --resource-group <rg-name> --xml

# Or download from Azure Portal:
# Function App → Deployment Center → Manage publish profile → Download
```

**Static Web Apps Token**:
```bash
# Via Azure CLI
az staticwebapp secrets list --name <app-name> --resource-group <rg-name> --query properties.apiKey -o tsv

# Or from Azure Portal:
# Static Web App → Manage deployment token
```

### 3. Test Workflow

**Manual Test**:
1. Go to **Actions** tab
2. Select workflow
3. Click "Run workflow"
4. Monitor execution

**Automatic Test**:
1. Make a change in `src/api/` or `src/web/`
2. Commit and push to a branch
3. Create pull request
4. Workflow runs automatically

## Workflow Features

### Build Caching
- Node.js dependencies are cached
- Speeds up subsequent builds
- Automatic cache invalidation on `package-lock.json` changes

### Conditional Execution
- Workflows only run when relevant files change
- API workflow: `src/api/**`
- Web workflow: `src/web/**`

### Preview Deployments
- Pull requests trigger preview deployments (web only)
- Preview URL provided in PR comments
- Automatic cleanup when PR is closed

### Deployment Summary
- Success/failure status in GitHub Actions UI
- Deployment details in job summary
- Timestamp and commit information

## Monitoring

### View Deployment Status

**GitHub Actions Tab**:
- Real-time workflow execution
- Build logs and errors
- Deployment history

**Status Badges**:
Add to README:
```markdown
![Deploy API](https://github.com/ShaydeNofziger/SkyNav/actions/workflows/deploy-api.yml/badge.svg)
![Deploy Web](https://github.com/ShaydeNofziger/SkyNav/actions/workflows/deploy-web.yml/badge.svg)
```

### Azure Monitoring

**Application Insights**:
- Request/response logs
- Performance metrics
- Error tracking

**Azure Portal**:
- Function App logs
- Static Web App metrics
- Deployment history

## Troubleshooting

### Workflow Fails

1. **Check Logs**
   - Actions tab → Failed workflow → View logs
   
2. **Common Issues**:
   - Missing secrets → Verify in Settings
   - Build errors → Test locally first
   - Azure credentials expired → Regenerate and update secrets
   - Network timeouts → Re-run workflow

### Deployment Issues

1. **API Not Updating**
   - Verify function app name in secrets
   - Check publish profile is valid
   - Review Azure Function App logs

2. **Web Not Updating**
   - Verify Static Web Apps token
   - Check if build completed successfully
   - Review build output in logs

### Getting Help

- 📖 [Deployment Guide](../../docs/DEPLOYMENT.md)
- 🐛 [GitHub Actions Docs](https://docs.github.com/en/actions)
- ☁️ [Azure Functions Deployment](https://docs.microsoft.com/en-us/azure/azure-functions/functions-how-to-github-actions)
- 🌐 [Static Web Apps Deployment](https://docs.microsoft.com/en-us/azure/static-web-apps/github-actions-workflow)

## Security Notes

- Never commit secrets to repository
- Use GitHub Secrets for sensitive data
- Rotate credentials regularly
- Use environment protection rules for production
- Limit workflow permissions

## Future Enhancements

Potential improvements:

- [ ] Add automated testing step
- [ ] Implement staging environment
- [ ] Add deployment approvals
- [ ] Automated rollback on health check failure
- [ ] Performance testing
- [ ] Infrastructure provisioning workflow
- [ ] Slack/Teams notifications
- [ ] Release tagging automation

---

**Last Updated**: February 7, 2026
