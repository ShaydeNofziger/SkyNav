# Release Process Quick Reference

## One-Click Deploy to Production

### Prerequisites ✅
- Azure resources deployed (see [Infrastructure Guide](../infra/README.md))
- GitHub secrets configured (see [Deployment Guide](./DEPLOYMENT.md))

### Standard Release Process

1. **Create Feature Branch**
   ```bash
   git checkout -b feature/my-feature
   ```

2. **Make Changes & Commit**
   ```bash
   git add .
   git commit -m "Description of changes"
   git push origin feature/my-feature
   ```

3. **Create Pull Request**
   - Go to GitHub → Pull Requests → New
   - Review code changes
   - Preview deployment created automatically (for web changes)

4. **Merge to Main**
   - Once approved, merge PR
   - **Deployment starts automatically!** 🚀

5. **Monitor Deployment**
   - Go to Actions tab
   - Watch workflow progress
   - Verify deployment success

## Manual Deployment

### Deploy API
1. Go to **Actions** tab
2. Select **"Deploy API to Azure Functions"**
3. Click **"Run workflow"**
4. Select environment (dev/staging/prod)
5. Click **"Run workflow"** button

### Deploy Web
1. Go to **Actions** tab
2. Select **"Deploy Web to Azure Static Web Apps"**
3. Click **"Run workflow"**
4. Click **"Run workflow"** button

## Quick Validation

### API
```bash
# Check health
curl https://func-skynav-prod.azurewebsites.net/api/health

# Test endpoint
curl https://func-skynav-prod.azurewebsites.net/api/dropzones
```

### Web
1. Open production URL in browser
2. Verify homepage loads
3. Test login/authentication

## Rollback

### Quick Rollback
1. Go to **Actions** tab
2. Find last successful deployment
3. Click workflow
4. Click **"Re-run all jobs"**

### Alternative: Revert Commit
```bash
git revert <commit-sha>
git push origin main
# Deployment triggers automatically
```

## Emergency Hotfix

```bash
# Create hotfix branch from main
git checkout -b hotfix/critical-fix main

# Make fix
git add .
git commit -m "Fix critical issue"

# Push and deploy
git push origin hotfix/critical-fix
# Create PR and merge OR manually trigger deployment
```

## Monitoring

### Check Status
- **Actions Tab**: Real-time deployment status
- **Azure Portal**: Application Insights for errors
- **Status Badges**: Add to README for visibility

### Status Badges
```markdown
![Deploy API](https://github.com/ShaydeNofziger/SkyNav/actions/workflows/deploy-api.yml/badge.svg)
![Deploy Web](https://github.com/ShaydeNofziger/SkyNav/actions/workflows/deploy-web.yml/badge.svg)
```

## What Gets Deployed When?

| Change Location | Triggers | Deployment |
|----------------|----------|------------|
| `src/api/**` | API workflow | Azure Functions |
| `src/web/**` | Web workflow | Static Web Apps |
| Both | Both workflows | Full deploy |
| Other files | No deployment | N/A |

## Common Issues

| Issue | Solution |
|-------|----------|
| Build fails | Check build logs in Actions tab |
| Secrets missing | Add/verify in Settings → Secrets |
| Tests fail | Run locally first, check test logs |
| Deploy timeout | Re-run workflow, check Azure status |

## Full Documentation

For detailed information, see:
- 📖 [Complete Deployment Guide](./DEPLOYMENT.md)
- 🏗️ [Infrastructure Setup](../infra/README.md)
- ⚡ [Quick Start](../infra/QUICKSTART.md)

---

**Tip**: Deployments are automatic on merge to `main`. Just merge your PR! 🎉
