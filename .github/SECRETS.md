# GitHub Secrets Template

This file lists all GitHub Secrets required for CI/CD workflows.

**IMPORTANT**: This is a template. Never commit actual secret values to the repository!

## How to Configure Secrets

1. Go to your GitHub repository
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add each secret from the lists below

## Required Secrets for API Deployment

Add these secrets for the `deploy-api.yml` workflow:

### AZURE_FUNCTIONAPP_NAME
- **Description**: Name of your Azure Functions app
- **Example**: `func-skynav-prod`
- **How to get**: From Azure Portal or deployment output
- **Required for**: API deployment

### AZURE_FUNCTIONAPP_PUBLISH_PROFILE
- **Description**: XML content of the Functions app publish profile
- **How to get**: 
  ```bash
  # Option 1: Azure CLI
  az functionapp deployment list-publishing-profiles \
    --name <your-function-app-name> \
    --resource-group <your-resource-group> \
    --xml
  
  # Option 2: Azure Portal
  # Go to Function App → Deployment Center → Manage publish profile → Download
  ```
- **Format**: Complete XML content (starts with `<publishData>`)
- **Required for**: API deployment

## Required Secrets for Web Deployment

Add these secrets for the `deploy-web.yml` workflow:

### AZURE_STATIC_WEB_APPS_API_TOKEN
- **Description**: Deployment token for Azure Static Web Apps
- **How to get**:
  ```bash
  # Option 1: Azure CLI
  az staticwebapp secrets list \
    --name <your-static-web-app-name> \
    --resource-group <your-resource-group> \
    --query properties.apiKey -o tsv
  
  # Option 2: Azure Portal
  # Go to Static Web App → Overview → Manage deployment token
  ```
- **Format**: Long alphanumeric string
- **Required for**: Web deployment

### NEXT_PUBLIC_B2C_TENANT_NAME
- **Description**: Azure AD B2C tenant name
- **Example**: `yourapp.onmicrosoft.com` or `yourapp.b2clogin.com`
- **How to get**: From your Azure AD B2C tenant overview
- **Required for**: Authentication

### NEXT_PUBLIC_B2C_CLIENT_ID
- **Description**: Azure AD B2C application (client) ID
- **Example**: `12345678-1234-1234-1234-123456789abc`
- **How to get**: 
  - Azure Portal → Azure AD B2C → App registrations → Your app
  - Copy the "Application (client) ID"
- **Required for**: Authentication

### NEXT_PUBLIC_B2C_POLICY_NAME
- **Description**: User flow policy name
- **Example**: `B2C_1_signupsignin`
- **How to get**: 
  - Azure Portal → Azure AD B2C → User flows
  - Copy the name of your sign-up/sign-in user flow
- **Default**: Usually `B2C_1_signupsignin`
- **Required for**: Authentication

### NEXT_PUBLIC_API_URL
- **Description**: Full URL to your Azure Functions API
- **Example**: `https://func-skynav-prod.azurewebsites.net/api`
- **Format**: `https://<function-app-name>.azurewebsites.net/api`
- **How to get**: From Azure Portal or after API deployment
- **Note**: Include `/api` at the end
- **Required for**: API communication

### NEXT_PUBLIC_AZURE_MAPS_KEY
- **Description**: Azure Maps subscription key
- **How to get**:
  ```bash
  # Azure CLI
  az maps account keys list \
    --name <your-maps-account-name> \
    --resource-group <your-resource-group> \
    --query primaryKey -o tsv
  
  # Or from Azure Portal:
  # Azure Maps Account → Authentication → Primary Key
  ```
- **Format**: Long alphanumeric string
- **Required for**: Map functionality

## Optional: Environment-Specific Secrets

For multiple environments (dev, staging, prod), use GitHub Environments:

1. Go to **Settings** → **Environments**
2. Create environments: `dev`, `staging`, `prod`
3. Add environment-specific secrets to each
4. Secrets in environments override repository secrets

### Example Environment Structure

**dev environment**:
- `AZURE_FUNCTIONAPP_NAME`: `func-skynav-dev`
- `NEXT_PUBLIC_API_URL`: `https://func-skynav-dev.azurewebsites.net/api`
- Other secrets with dev values...

**prod environment**:
- `AZURE_FUNCTIONAPP_NAME`: `func-skynav-prod`
- `NEXT_PUBLIC_API_URL`: `https://func-skynav-prod.azurewebsites.net/api`
- Other secrets with prod values...

## Verification Checklist

Before running workflows, verify:

- [ ] All required secrets are added
- [ ] Secret names match exactly (case-sensitive)
- [ ] No extra spaces in secret values
- [ ] Publish profile is complete XML
- [ ] API URL includes `/api` at the end
- [ ] B2C tenant name is correct format
- [ ] All secrets are in correct environment (if using environments)

## Testing Secrets

After adding secrets, test the workflow:

1. Go to **Actions** tab
2. Select a workflow
3. Click **Run workflow**
4. Monitor for errors related to missing or invalid secrets

## Security Best Practices

✅ **DO**:
- Rotate secrets regularly (every 90 days recommended)
- Use different secrets for dev/staging/prod
- Limit who can access secrets (use environments with protection)
- Monitor secret usage in workflow logs
- Use least-privilege credentials

❌ **DON'T**:
- Commit secrets to repository
- Share secrets via email or chat
- Use production secrets in development
- Leave secrets in workflow logs (they're automatically masked)
- Reuse secrets across multiple applications

## Troubleshooting

### Secret Not Working

1. **Verify secret exists**:
   - Settings → Secrets → Check name matches exactly

2. **Check for typos**:
   - Secret names are case-sensitive
   - No extra spaces before/after value

3. **Regenerate credential**:
   - Some credentials expire
   - Generate new one in Azure Portal
   - Update secret value in GitHub

4. **Check environment**:
   - If using environments, secret must be in correct environment
   - Environment secrets override repository secrets

### Still Having Issues?

- Review workflow logs for specific error messages
- Check [Deployment Guide](../docs/DEPLOYMENT.md) for detailed help
- Verify Azure resources are properly configured
- Ensure your Azure credentials have necessary permissions

## Getting Credentials

Need help getting Azure credentials? See:
- [Deployment Guide](../docs/DEPLOYMENT.md#secrets-configuration)
- [Infrastructure Setup](../infra/README.md)
- [Azure CLI Reference](https://docs.microsoft.com/en-us/cli/azure/)

---

**Last Updated**: February 7, 2026
