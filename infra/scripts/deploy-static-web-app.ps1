<#
.SYNOPSIS
  Deploys Azure Static Web App for SkyNav frontend.

.DESCRIPTION
  Creates an Azure Static Web App for hosting the Next.js PWA.
  Note: Full deployment requires GitHub integration which can be set up via Azure Portal.

.PARAMETER ResourceGroupName
  Name of the resource group.

.PARAMETER StaticWebAppName
  Name of the Static Web App.

.PARAMETER Location
  Azure region for Static Web App. Use 'eastus2', 'centralus', 'westus2', or 'westeurope'.

.PARAMETER Sku
  SKU for Static Web App. Default is 'Free'.

.EXAMPLE
  .\deploy-static-web-app.ps1 -ResourceGroupName "rg-skynav-dev" -StaticWebAppName "stapp-skynav-dev" -Location "eastus2"
#>

[CmdletBinding()]
param(
  [Parameter(Mandatory = $true)]
  [string]$ResourceGroupName,

  [Parameter(Mandatory = $true)]
  [string]$StaticWebAppName,

  [Parameter(Mandatory = $true)]
  [string]$Location,

  [Parameter(Mandatory = $false)]
  [ValidateSet('Free', 'Standard')]
  [string]$Sku = 'Free'
)

$ErrorActionPreference = 'Stop'

Write-Host "Deploying Static Web App: $StaticWebAppName" -ForegroundColor Cyan

# Map location to Static Web App supported regions
$swaLocations = @{
  'eastus' = 'eastus2'
  'eastus2' = 'eastus2'
  'westus' = 'westus2'
  'westus2' = 'westus2'
  'centralus' = 'centralus'
  'westeurope' = 'westeurope'
}

$swaLocation = if ($swaLocations.ContainsKey($Location)) {
  $swaLocations[$Location]
} else {
  'eastus2'
}

if ($swaLocation -ne $Location) {
  Write-Host "Note: Static Web Apps not available in $Location, using $swaLocation instead" -ForegroundColor Yellow
}

Write-Host "Creating Static Web App in $swaLocation..." -ForegroundColor Yellow

# Create Static Web App
az staticwebapp create `
  --name $StaticWebAppName `
  --resource-group $ResourceGroupName `
  --location $swaLocation `
  --sku $Sku `
  --tags project=SkyNav component=frontend `
  --output none

if ($LASTEXITCODE -eq 0) {
  Write-Host "✓ Static Web App created successfully" -ForegroundColor Green
  
  # Get deployment token
  $token = az staticwebapp secrets list `
    --name $StaticWebAppName `
    --resource-group $ResourceGroupName `
    --query 'properties.apiKey' `
    --output tsv
  
  # Get default hostname
  $hostname = az staticwebapp show `
    --name $StaticWebAppName `
    --resource-group $ResourceGroupName `
    --query 'defaultHostname' `
    --output tsv
  
  Write-Host ""
  Write-Host "✓ Static Web App deployment complete" -ForegroundColor Green
  Write-Host ""
  Write-Host "Static Web App details:" -ForegroundColor Cyan
  Write-Host "  Name: $StaticWebAppName" -ForegroundColor Gray
  Write-Host "  URL: https://$hostname" -ForegroundColor Gray
  Write-Host ""
  Write-Host "Next steps:" -ForegroundColor Cyan
  Write-Host "1. Set up GitHub Actions workflow for automatic deployment" -ForegroundColor White
  Write-Host "2. Add deployment token to GitHub repository secrets:" -ForegroundColor White
  Write-Host "   Secret name: AZURE_STATIC_WEB_APPS_API_TOKEN" -ForegroundColor Gray
  Write-Host "   Secret value: $token" -ForegroundColor Gray
  Write-Host ""
  Write-Host "Or deploy manually:" -ForegroundColor Cyan
  Write-Host "  cd src/web" -ForegroundColor Gray
  Write-Host "  npm run build" -ForegroundColor Gray
  Write-Host "  swa deploy .next --deployment-token $token" -ForegroundColor Gray
  
  exit 0
} else {
  Write-Error "Failed to create Static Web App"
  Write-Host ""
  Write-Host "Alternative: Create via Azure Portal" -ForegroundColor Yellow
  Write-Host "1. Go to Azure Portal" -ForegroundColor White
  Write-Host "2. Create new Static Web App" -ForegroundColor White
  Write-Host "3. Connect to GitHub repository" -ForegroundColor White
  Write-Host "4. Configure build settings:" -ForegroundColor White
  Write-Host "   - App location: /src/web" -ForegroundColor Gray
  Write-Host "   - Output location: .next" -ForegroundColor Gray
  Write-Host "   - API location: /src/api (optional)" -ForegroundColor Gray
  exit 1
}
