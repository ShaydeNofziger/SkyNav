<#
.SYNOPSIS
  Deploys Azure Function App for SkyNav API.

.DESCRIPTION
  Creates an Azure Function App with Node.js runtime for the serverless API backend.
  Also creates required storage account for Function App internals.

.PARAMETER ResourceGroupName
  Name of the resource group.

.PARAMETER FunctionAppName
  Name of the Function App.

.PARAMETER StorageAccountName
  Name of the storage account (will be created if doesn't exist).

.PARAMETER AppInsightsName
  Name of the Application Insights instance.

.PARAMETER Location
  Azure region for Function App.

.EXAMPLE
  .\deploy-function-app.ps1 -ResourceGroupName "rg-skynav-dev" -FunctionAppName "func-skynav-dev" -StorageAccountName "stskynavdev" -AppInsightsName "appi-skynav-dev" -Location "eastus"
#>

[CmdletBinding()]
param(
  [Parameter(Mandatory = $true)]
  [string]$ResourceGroupName,

  [Parameter(Mandatory = $true)]
  [string]$FunctionAppName,

  [Parameter(Mandatory = $true)]
  [string]$StorageAccountName,

  [Parameter(Mandatory = $true)]
  [string]$AppInsightsName,

  [Parameter(Mandatory = $true)]
  [string]$Location
)

$ErrorActionPreference = 'Stop'

Write-Host "Deploying Function App: $FunctionAppName" -ForegroundColor Cyan

# Create storage account for Function App
Write-Host "Creating storage account: $StorageAccountName" -ForegroundColor Yellow

$storageExists = az storage account check-name --name $StorageAccountName --query 'nameAvailable' --output tsv

if ($storageExists -eq 'false') {
  Write-Host "Storage account already exists" -ForegroundColor Yellow
} else {
  az storage account create `
    --name $StorageAccountName `
    --resource-group $ResourceGroupName `
    --location $Location `
    --sku Standard_LRS `
    --kind StorageV2 `
    --https-only true `
    --min-tls-version TLS1_2 `
    --tags project=SkyNav component=function-storage `
    --output none

  if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Storage account created" -ForegroundColor Green
  } else {
    Write-Error "Failed to create storage account"
    exit 1
  }
}

# Get Application Insights instrumentation key
Write-Host "Getting Application Insights instrumentation key..." -ForegroundColor Yellow
$appInsightsKey = az monitor app-insights component show `
  --app $AppInsightsName `
  --resource-group $ResourceGroupName `
  --query 'instrumentationKey' `
  --output tsv

if (-not $appInsightsKey) {
  Write-Warning "Could not retrieve Application Insights key. App may not have monitoring enabled."
}

# Create Function App
Write-Host "Creating Function App..." -ForegroundColor Yellow

az functionapp create `
  --name $FunctionAppName `
  --resource-group $ResourceGroupName `
  --storage-account $StorageAccountName `
  --consumption-plan-location $Location `
  --runtime node `
  --runtime-version 18 `
  --functions-version 4 `
  --os-type Linux `
  --tags project=SkyNav component=api `
  --output none

if ($LASTEXITCODE -eq 0) {
  Write-Host "✓ Function App created successfully" -ForegroundColor Green
} else {
  Write-Error "Failed to create Function App"
  exit 1
}

# Configure Application Insights
if ($appInsightsKey) {
  Write-Host "Configuring Application Insights..." -ForegroundColor Yellow
  
  az functionapp config appsettings set `
    --name $FunctionAppName `
    --resource-group $ResourceGroupName `
    --settings "APPINSIGHTS_INSTRUMENTATIONKEY=$appInsightsKey" `
    --output none
  
  Write-Host "✓ Application Insights configured" -ForegroundColor Green
}

# Configure additional settings
Write-Host "Configuring Function App settings..." -ForegroundColor Yellow

az functionapp config appsettings set `
  --name $FunctionAppName `
  --resource-group $ResourceGroupName `
  --settings `
    "FUNCTIONS_WORKER_RUNTIME=node" `
    "WEBSITE_NODE_DEFAULT_VERSION=~18" `
    "WEBSITE_RUN_FROM_PACKAGE=1" `
  --output none

Write-Host "✓ Function App settings configured" -ForegroundColor Green

# Get Function App URL
$functionUrl = az functionapp show `
  --name $FunctionAppName `
  --resource-group $ResourceGroupName `
  --query 'defaultHostName' `
  --output tsv

Write-Host ""
Write-Host "✓ Function App deployment complete" -ForegroundColor Green
Write-Host ""
Write-Host "Function App details:" -ForegroundColor Cyan
Write-Host "  Name: $FunctionAppName" -ForegroundColor Gray
Write-Host "  URL: https://$functionUrl" -ForegroundColor Gray
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Deploy function code from /src/api" -ForegroundColor White
Write-Host "2. Configure environment variables (Cosmos DB connection string, etc.)" -ForegroundColor White
Write-Host "3. Enable CORS for frontend domain" -ForegroundColor White
Write-Host ""
Write-Host "To deploy functions:" -ForegroundColor Cyan
Write-Host "  cd src/api" -ForegroundColor Gray
Write-Host "  npm install" -ForegroundColor Gray
Write-Host "  npm run build" -ForegroundColor Gray
Write-Host "  func azure functionapp publish $FunctionAppName" -ForegroundColor Gray

exit 0
