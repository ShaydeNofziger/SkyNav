# Deployment Pipeline Documentation Index

Complete index of all deployment and CI/CD documentation for SkyNav.

## 🚀 Quick Start

**New to deployment?** Start here:
1. [CI/CD Setup Guide](CICD_SETUP.md) - Complete setup in 5 steps
2. [Release Process](RELEASE_PROCESS.md) - Quick reference for deployments
3. [Secrets Configuration](../.github/SECRETS.md) - Required GitHub secrets

## 📚 Documentation Structure

### Core Deployment Guides

| Document | Purpose | Audience |
|----------|---------|----------|
| [CICD_SETUP.md](CICD_SETUP.md) | **START HERE** - Complete CI/CD setup guide | DevOps, First-time setup |
| [DEPLOYMENT.md](DEPLOYMENT.md) | Comprehensive deployment documentation | All developers |
| [RELEASE_PROCESS.md](RELEASE_PROCESS.md) | Quick reference for releases | Daily development |

### GitHub Actions

| Document | Purpose | Audience |
|----------|---------|----------|
| [.github/workflows/README.md](../.github/workflows/README.md) | Workflow configuration guide | DevOps |
| [.github/SECRETS.md](../.github/SECRETS.md) | GitHub secrets template | Setup, Maintenance |
| [.github/workflows/deploy-api.yml](../.github/workflows/deploy-api.yml) | API deployment workflow | Reference |
| [.github/workflows/deploy-web.yml](../.github/workflows/deploy-web.yml) | Web deployment workflow | Reference |

### Infrastructure

| Document | Purpose | Audience |
|----------|---------|----------|
| [infra/README.md](../infra/README.md) | Azure infrastructure guide | Infrastructure team |
| [infra/QUICKSTART.md](../infra/QUICKSTART.md) | Quick infrastructure deployment | First-time setup |

### Application Configuration

| Document | Purpose | Audience |
|----------|---------|----------|
| [src/api/local.settings.example.json](../src/api/local.settings.example.json) | API environment variables | Developers |
| [src/web/.env.example](../src/web/.env.example) | Web environment variables | Developers |

## 🎯 Common Tasks

### I want to...

#### Deploy the application
→ [Release Process](RELEASE_PROCESS.md) - Quick deployment steps

#### Set up CI/CD for the first time
→ [CI/CD Setup Guide](CICD_SETUP.md) - Complete setup walkthrough

#### Configure GitHub secrets
→ [Secrets Template](../.github/SECRETS.md) - Required secrets and how to get them

#### Understand the workflows
→ [Workflows README](../.github/workflows/README.md) - Workflow documentation

#### Deploy Azure infrastructure
→ [Infrastructure Guide](../infra/README.md) - Azure resource deployment

#### Troubleshoot a deployment
→ [Deployment Guide - Troubleshooting](DEPLOYMENT.md#troubleshooting)

#### Set up local development
→ [API Settings](../src/api/local.settings.example.json) & [Web Settings](../src/web/.env.example)

#### Roll back a deployment
→ [Release Process - Rollback](RELEASE_PROCESS.md#rollback)

#### Set up multiple environments
→ [CI/CD Setup - Environments](CICD_SETUP.md#environment-specific-setup-optional)

## 📋 Deployment Workflow

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Developer creates feature branch                         │
│    git checkout -b feature/my-feature                       │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. Developer makes changes and pushes                       │
│    git push origin feature/my-feature                       │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. Create Pull Request on GitHub                            │
│    - Code review                                            │
│    - Automated checks                                       │
│    - Preview deployment (for web changes)                  │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. Merge PR to main branch                                  │
│    Triggers automatic deployment                            │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 5. GitHub Actions runs workflows                            │
│    ├── Deploy API (if src/api/** changed)                  │
│    │   ├── Build TypeScript                                │
│    │   ├── Run tests                                       │
│    │   └── Deploy to Azure Functions                       │
│    └── Deploy Web (if src/web/** changed)                  │
│        ├── Build Next.js                                   │
│        └── Deploy to Static Web Apps                       │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 6. Verify deployment                                        │
│    ├── Check Actions tab for status                        │
│    ├── Test API endpoints                                  │
│    └── Test web application                                │
└─────────────────────────────────────────────────────────────┘
```

## 🔧 Setup Checklist

Use this checklist when setting up CI/CD:

### Prerequisites
- [ ] Azure subscription active
- [ ] Azure resources deployed (Functions, Static Web Apps, Cosmos DB)
- [ ] GitHub repository access
- [ ] Azure CLI installed

### Azure Setup
- [ ] Function App deployed and named
- [ ] Static Web App deployed and named
- [ ] Azure AD B2C configured
- [ ] Azure Maps account created
- [ ] Application Insights configured

### GitHub Configuration
- [ ] Repository cloned locally
- [ ] GitHub Actions workflows committed
- [ ] GitHub secrets added (API deployment)
- [ ] GitHub secrets added (Web deployment)
- [ ] Workflows tested manually

### Validation
- [ ] API deploys successfully
- [ ] Web deploys successfully
- [ ] API responds to requests
- [ ] Web application loads
- [ ] Authentication works
- [ ] Status badges added to README

## 🔐 Required Secrets Summary

Quick reference for GitHub secrets:

### API Deployment
- `AZURE_FUNCTIONAPP_NAME`
- `AZURE_FUNCTIONAPP_PUBLISH_PROFILE`

### Web Deployment
- `AZURE_STATIC_WEB_APPS_API_TOKEN`
- `NEXT_PUBLIC_B2C_TENANT_NAME`
- `NEXT_PUBLIC_B2C_CLIENT_ID`
- `NEXT_PUBLIC_B2C_POLICY_NAME`
- `NEXT_PUBLIC_API_URL`
- `NEXT_PUBLIC_AZURE_MAPS_KEY`

**Details**: [Secrets Template](../.github/SECRETS.md)

## 🎓 Learning Path

**For new team members:**

1. **Understand the Architecture**
   - Read [README.md](../README.md)
   - Review [Infrastructure Guide](../infra/README.md)

2. **Set Up Local Development**
   - Configure [API settings](../src/api/local.settings.example.json)
   - Configure [Web settings](../src/web/.env.example)

3. **Learn the Deployment Process**
   - Read [Release Process](RELEASE_PROCESS.md)
   - Review [Deployment Guide](DEPLOYMENT.md)

4. **Practice Deploying**
   - Make a small change
   - Create a PR
   - Watch the deployment

5. **Deep Dive**
   - Study [CI/CD Setup](CICD_SETUP.md)
   - Understand [Workflows](../.github/workflows/README.md)

## 🆘 Getting Help

### Documentation Issues
If you find errors or gaps in documentation:
1. Open an issue on GitHub
2. Tag it with `documentation`
3. Suggest improvements

### Deployment Issues
1. Check [Deployment Guide - Troubleshooting](DEPLOYMENT.md#troubleshooting)
2. Review GitHub Actions logs
3. Check Azure Portal for errors
4. Open an issue with details

### Questions
- Review FAQ sections in each guide
- Check workflow logs for errors
- Consult Azure documentation
- Ask team members

## 📊 Monitoring & Metrics

### GitHub Actions
- View workflow history in Actions tab
- Monitor success/failure rates
- Track deployment frequency

### Azure
- Application Insights for telemetry
- Function App metrics
- Static Web Apps analytics
- Cosmos DB monitoring

### Status Badges
![Deploy API](https://github.com/ShaydeNofziger/SkyNav/actions/workflows/deploy-api.yml/badge.svg)
![Deploy Web](https://github.com/ShaydeNofziger/SkyNav/actions/workflows/deploy-web.yml/badge.svg)

## 🔄 Maintenance

### Regular Tasks

**Weekly**:
- Review deployment logs
- Check for failed workflows
- Monitor Azure costs

**Monthly**:
- Review and update dependencies
- Check for security updates
- Audit GitHub secrets access

**Quarterly**:
- Rotate Azure credentials
- Update publish profiles
- Review and optimize workflows

## 🚦 Status

| Component | Status | Last Updated |
|-----------|--------|--------------|
| API Workflow | ✅ Ready | 2026-02-07 |
| Web Workflow | ✅ Ready | 2026-02-07 |
| Documentation | ✅ Complete | 2026-02-07 |
| Secrets Template | ✅ Complete | 2026-02-07 |
| CI/CD Guide | ✅ Complete | 2026-02-07 |

## 📝 Version History

- **2026-02-07**: Initial deployment pipeline implementation
  - Created GitHub Actions workflows
  - Added comprehensive documentation
  - Configured automatic deployments
  - Added status badges

---

**Last Updated**: February 7, 2026  
**Maintained by**: DevOps Team
