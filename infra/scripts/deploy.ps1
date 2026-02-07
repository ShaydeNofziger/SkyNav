<#
.SYNOPSIS
  Main deployment script for SkyNav Azure infrastructure.

.DESCRIPTION
  This script orchestrates the deployment of all SkyNav Azure resources including:
  - Resource Group
  - Azure Cosmos DB (serverless, SQL API)
  - Azure Static Web App (Next.js frontend)
  - Azure Functions (Node.js/TypeScript API)
  - Application Insights (monitoring)

.PARAMETER Environment
  The deployment environment (dev, staging, prod). Default is 'dev'.

.PARAMETER Location
  Azure region for resource deployment. Default is 'eastus'.

.PARAMETER ResourceGroupName
  Override the default resource group name.

.PARAMETER SkipConfirmation
  Skip confirmation prompts (useful for CI/CD).

.PARAMETER WhatIf
  Show what would be deployed without actually deploying.

.EXAMPLE
  .\deploy.ps1 -Environment dev -Location eastus
  Deploy development environment to East US.

.EXAMPLE
  .\deploy.ps1 -Environment prod -SkipConfirmation
  Deploy production environment without confirmation prompts.

.EXAMPLE
  .\deploy.ps1 -WhatIf
  Show what would be deployed without deploying.
#>

[CmdletBinding()]
param(
  [Parameter(Mandatory = $false)]
  [ValidateSet('dev', 'staging', 'prod')]
  [string]$Environment = 'dev',

  [Parameter(Mandatory = $false)]
  [string]$Location = 'eastus',

  [Parameter(Mandatory = $false)]
  [string]$ResourceGroupName,

  [Parameter(Mandatory = $false)]
  [switch]$SkipConfirmation,

  [Parameter(Mandatory = $false)]
  [switch]$WhatIf
)

$ErrorActionPreference = 'Stop'

# Script directory
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

# Configuration
$ProjectName = 'skynav'
$DefaultResourceGroupName = "rg-$ProjectName-$Environment"
$ResourceGroup = if ($ResourceGroupName) { $ResourceGroupName } else { $DefaultResourceGroupName }

# Resource naming conventions
$CosmosDbName = "cosmos-$ProjectName-$Environment"
$StaticWebAppName = "stapp-$ProjectName-$Environment"
$FunctionAppName = "func-$ProjectName-$Environment"
$StorageAccountName = "st$ProjectName$Environment" -replace '-', ''
$AppInsightsName = "appi-$ProjectName-$Environment"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "SkyNav Azure Infrastructure Deployment" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Environment:          $Environment" -ForegroundColor Yellow
Write-Host "Location:             $Location" -ForegroundColor Yellow
Write-Host "Resource Group:       $ResourceGroup" -ForegroundColor Yellow
Write-Host "Cosmos DB:            $CosmosDbName" -ForegroundColor Yellow
Write-Host "Static Web App:       $StaticWebAppName" -ForegroundColor Yellow
Write-Host "Function App:         $FunctionAppName" -ForegroundColor Yellow
Write-Host "Storage Account:      $StorageAccountName" -ForegroundColor Yellow
Write-Host "Application Insights: $AppInsightsName" -ForegroundColor Yellow
Write-Host ""

if ($WhatIf) {
  Write-Host "==> WhatIf mode enabled. No resources will be created." -ForegroundColor Magenta
  Write-Host ""
}

# Confirmation
if (-not $SkipConfirmation -and -not $WhatIf) {
  $confirmation = Read-Host "Do you want to proceed with deployment? (yes/no)"
  if ($confirmation -ne 'yes') {
    Write-Host "Deployment cancelled." -ForegroundColor Yellow
    exit 0
  }
}

# Check Azure CLI
Write-Host "==> Checking Azure CLI..." -ForegroundColor Green
try {
  $azVersion = az version --output json | ConvertFrom-Json
  Write-Host "    Azure CLI version: $($azVersion.'azure-cli')" -ForegroundColor Gray
} catch {
  Write-Error "Azure CLI not found. Please install from: https://aka.ms/installazurecli"
  exit 1
}

# Check login status
Write-Host "==> Checking Azure login status..." -ForegroundColor Green
try {
  $account = az account show --output json | ConvertFrom-Json
  Write-Host "    Logged in as: $($account.user.name)" -ForegroundColor Gray
  Write-Host "    Subscription: $($account.name) ($($account.id))" -ForegroundColor Gray
} catch {
  Write-Error "Not logged in to Azure. Please run: az login"
  exit 1
}

# Create Resource Group
Write-Host ""
Write-Host "==> Creating Resource Group..." -ForegroundColor Green
if ($WhatIf) {
  Write-Host "    [WhatIf] Would create resource group: $ResourceGroup in $Location" -ForegroundColor Magenta
} else {
  & "$ScriptDir\create-resource-group.ps1" -ResourceGroupName $ResourceGroup -Location $Location
  if ($LASTEXITCODE -ne 0) {
    Write-Error "Failed to create resource group."
    exit 1
  }
  Write-Host "    ✓ Resource Group created successfully" -ForegroundColor Gray
}

# Deploy Cosmos DB
Write-Host ""
Write-Host "==> Deploying Cosmos DB..." -ForegroundColor Green
if ($WhatIf) {
  Write-Host "    [WhatIf] Would deploy Cosmos DB: $CosmosDbName" -ForegroundColor Magenta
} else {
  & "$ScriptDir\deploy-cosmos-db.ps1" `
    -ResourceGroupName $ResourceGroup `
    -CosmosDbName $CosmosDbName `
    -Location $Location
  if ($LASTEXITCODE -ne 0) {
    Write-Error "Failed to deploy Cosmos DB."
    exit 1
  }
  Write-Host "    ✓ Cosmos DB deployed successfully" -ForegroundColor Gray
}

# Deploy Application Insights
Write-Host ""
Write-Host "==> Deploying Application Insights..." -ForegroundColor Green
if ($WhatIf) {
  Write-Host "    [WhatIf] Would deploy Application Insights: $AppInsightsName" -ForegroundColor Magenta
} else {
  & "$ScriptDir\deploy-monitoring.ps1" `
    -ResourceGroupName $ResourceGroup `
    -AppInsightsName $AppInsightsName `
    -Location $Location
  if ($LASTEXITCODE -ne 0) {
    Write-Error "Failed to deploy Application Insights."
    exit 1
  }
  Write-Host "    ✓ Application Insights deployed successfully" -ForegroundColor Gray
}

# Deploy Function App
Write-Host ""
Write-Host "==> Deploying Function App..." -ForegroundColor Green
if ($WhatIf) {
  Write-Host "    [WhatIf] Would deploy Function App: $FunctionAppName" -ForegroundColor Magenta
} else {
  & "$ScriptDir\deploy-function-app.ps1" `
    -ResourceGroupName $ResourceGroup `
    -FunctionAppName $FunctionAppName `
    -StorageAccountName $StorageAccountName `
    -AppInsightsName $AppInsightsName `
    -Location $Location
  if ($LASTEXITCODE -ne 0) {
    Write-Error "Failed to deploy Function App."
    exit 1
  }
  Write-Host "    ✓ Function App deployed successfully" -ForegroundColor Gray
}

# Deploy Static Web App
Write-Host ""
Write-Host "==> Deploying Static Web App..." -ForegroundColor Green
if ($WhatIf) {
  Write-Host "    [WhatIf] Would deploy Static Web App: $StaticWebAppName" -ForegroundColor Magenta
} else {
  & "$ScriptDir\deploy-static-web-app.ps1" `
    -ResourceGroupName $ResourceGroup `
    -StaticWebAppName $StaticWebAppName `
    -Location $Location
  if ($LASTEXITCODE -ne 0) {
    Write-Warning "Static Web App deployment requires manual configuration or GitHub token."
    Write-Host "    Please deploy manually via Azure Portal or provide GitHub token." -ForegroundColor Yellow
  } else {
    Write-Host "    ✓ Static Web App deployed successfully" -ForegroundColor Gray
  }
}

# Deployment summary
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Deployment Summary" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

if ($WhatIf) {
  Write-Host ""
  Write-Host "This was a WhatIf run. No resources were created." -ForegroundColor Magenta
  Write-Host "Remove the -WhatIf flag to actually deploy resources." -ForegroundColor Magenta
} else {
  Write-Host ""
  Write-Host "✓ Resource Group:       $ResourceGroup" -ForegroundColor Green
  Write-Host "✓ Cosmos DB:            $CosmosDbName" -ForegroundColor Green
  Write-Host "✓ Application Insights: $AppInsightsName" -ForegroundColor Green
  Write-Host "✓ Function App:         $FunctionAppName" -ForegroundColor Green
  Write-Host "⚠ Static Web App:       $StaticWebAppName (may require manual setup)" -ForegroundColor Yellow
  Write-Host ""
  Write-Host "Next Steps:" -ForegroundColor Cyan
  Write-Host "1. Configure Azure AD B2C (see configure-ad-b2c.ps1)" -ForegroundColor White
  Write-Host "2. Update application configuration with connection strings" -ForegroundColor White
  Write-Host "3. Deploy application code to Function App and Static Web App" -ForegroundColor White
  Write-Host "4. Configure custom domains (optional)" -ForegroundColor White
  Write-Host ""
  Write-Host "To view resources:" -ForegroundColor Cyan
  Write-Host "  az resource list --resource-group $ResourceGroup --output table" -ForegroundColor Gray
  Write-Host ""
  Write-Host "To delete all resources:" -ForegroundColor Cyan
  Write-Host "  az group delete --name $ResourceGroup --yes --no-wait" -ForegroundColor Gray
}

Write-Host ""
Write-Host "Deployment complete!" -ForegroundColor Green
