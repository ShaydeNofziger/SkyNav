<#
.SYNOPSIS
  Deploys Application Insights for SkyNav monitoring.

.DESCRIPTION
  Creates an Azure Application Insights instance for monitoring the application.

.PARAMETER ResourceGroupName
  Name of the resource group.

.PARAMETER AppInsightsName
  Name of the Application Insights instance.

.PARAMETER Location
  Azure region for Application Insights.

.EXAMPLE
  .\deploy-monitoring.ps1 -ResourceGroupName "rg-skynav-dev" -AppInsightsName "appi-skynav-dev" -Location "eastus"
#>

[CmdletBinding()]
param(
  [Parameter(Mandatory = $true)]
  [string]$ResourceGroupName,

  [Parameter(Mandatory = $true)]
  [string]$AppInsightsName,

  [Parameter(Mandatory = $true)]
  [string]$Location
)

$ErrorActionPreference = 'Stop'

Write-Host "Deploying Application Insights: $AppInsightsName" -ForegroundColor Cyan

# Check if Application Insights exists
$appInsightsExists = az monitor app-insights component show `
  --app $AppInsightsName `
  --resource-group $ResourceGroupName `
  --output none 2>$null

if ($LASTEXITCODE -eq 0) {
  Write-Host "Application Insights already exists" -ForegroundColor Yellow
} else {
  Write-Host "Creating Application Insights..." -ForegroundColor Yellow
  
  az monitor app-insights component create `
    --app $AppInsightsName `
    --resource-group $ResourceGroupName `
    --location $Location `
    --kind web `
    --application-type web `
    --retention-time 90 `
    --tags project=SkyNav component=monitoring `
    --output none

  if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Application Insights created successfully" -ForegroundColor Green
  } else {
    Write-Error "Failed to create Application Insights"
    exit 1
  }
}

# Get instrumentation key and connection string
$instrumentationKey = az monitor app-insights component show `
  --app $AppInsightsName `
  --resource-group $ResourceGroupName `
  --query 'instrumentationKey' `
  --output tsv

$connectionString = az monitor app-insights component show `
  --app $AppInsightsName `
  --resource-group $ResourceGroupName `
  --query 'connectionString' `
  --output tsv

Write-Host ""
Write-Host "✓ Application Insights deployment complete" -ForegroundColor Green
Write-Host ""
Write-Host "Application Insights details:" -ForegroundColor Cyan
Write-Host "  Name: $AppInsightsName" -ForegroundColor Gray
Write-Host "  Instrumentation Key: $instrumentationKey" -ForegroundColor Gray
Write-Host ""
Write-Host "To configure your application:" -ForegroundColor Cyan
Write-Host "  Set environment variable:" -ForegroundColor White
Write-Host "    APPLICATIONINSIGHTS_CONNECTION_STRING=$connectionString" -ForegroundColor Gray
Write-Host ""
Write-Host "  Or use instrumentation key:" -ForegroundColor White
Write-Host "    APPINSIGHTS_INSTRUMENTATIONKEY=$instrumentationKey" -ForegroundColor Gray

exit 0
