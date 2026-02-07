<#
.SYNOPSIS
  Deploys Azure Cosmos DB for SkyNav.

.DESCRIPTION
  Creates an Azure Cosmos DB account with SQL API in serverless mode.
  Also creates the database and required containers with appropriate partition keys.

.PARAMETER ResourceGroupName
  Name of the resource group.

.PARAMETER CosmosDbName
  Name of the Cosmos DB account.

.PARAMETER Location
  Azure region for Cosmos DB.

.PARAMETER DatabaseName
  Name of the database. Default is 'SkyNavDB'.

.EXAMPLE
  .\deploy-cosmos-db.ps1 -ResourceGroupName "rg-skynav-dev" -CosmosDbName "cosmos-skynav-dev" -Location "eastus"
#>

[CmdletBinding()]
param(
  [Parameter(Mandatory = $true)]
  [string]$ResourceGroupName,

  [Parameter(Mandatory = $true)]
  [string]$CosmosDbName,

  [Parameter(Mandatory = $true)]
  [string]$Location,

  [Parameter(Mandatory = $false)]
  [string]$DatabaseName = 'SkyNavDB'
)

$ErrorActionPreference = 'Stop'

Write-Host "Deploying Cosmos DB: $CosmosDbName" -ForegroundColor Cyan

# Check if Cosmos DB account exists
Write-Host "Checking if Cosmos DB account exists..." -ForegroundColor Yellow
$accountExists = az cosmosdb check-name-exists --name $CosmosDbName

if ($accountExists -eq 'true') {
  Write-Host "Cosmos DB account already exists. Skipping creation." -ForegroundColor Yellow
} else {
  Write-Host "Creating Cosmos DB account (this may take several minutes)..." -ForegroundColor Yellow
  
  az cosmosdb create `
    --name $CosmosDbName `
    --resource-group $ResourceGroupName `
    --locations regionName=$Location `
    --kind GlobalDocumentDB `
    --default-consistency-level Session `
    --enable-automatic-failover false `
    --capabilities EnableServerless `
    --backup-policy-type Continuous `
    --tags project=SkyNav component=database `
    --output none

  if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Cosmos DB account created successfully" -ForegroundColor Green
  } else {
    Write-Error "Failed to create Cosmos DB account"
    exit 1
  }
}

# Create database
Write-Host "Creating database: $DatabaseName" -ForegroundColor Yellow
az cosmosdb sql database create `
  --account-name $CosmosDbName `
  --resource-group $ResourceGroupName `
  --name $DatabaseName `
  --output none 2>$null

if ($LASTEXITCODE -eq 0) {
  Write-Host "✓ Database created successfully" -ForegroundColor Green
} else {
  Write-Host "Database may already exist, continuing..." -ForegroundColor Yellow
}

# Create containers with partition keys
$containers = @(
  @{ Name = 'dropzones'; PartitionKey = '/id' },
  @{ Name = 'annotations'; PartitionKey = '/dropzoneId' },
  @{ Name = 'communityNotes'; PartitionKey = '/dropzoneId' },
  @{ Name = 'users'; PartitionKey = '/id' },
  @{ Name = 'auditLog'; PartitionKey = '/entityType' }
)

foreach ($container in $containers) {
  Write-Host "Creating container: $($container.Name) with partition key $($container.PartitionKey)" -ForegroundColor Yellow
  
  az cosmosdb sql container create `
    --account-name $CosmosDbName `
    --resource-group $ResourceGroupName `
    --database-name $DatabaseName `
    --name $container.Name `
    --partition-key-path $container.PartitionKey `
    --output none 2>$null

  if ($LASTEXITCODE -eq 0) {
    Write-Host "  ✓ Container $($container.Name) created" -ForegroundColor Green
  } else {
    Write-Host "  Container $($container.Name) may already exist" -ForegroundColor Yellow
  }
}

Write-Host ""
Write-Host "✓ Cosmos DB deployment complete" -ForegroundColor Green
Write-Host ""
Write-Host "Connection information:" -ForegroundColor Cyan
Write-Host "  Account name: $CosmosDbName" -ForegroundColor Gray
Write-Host "  Database: $DatabaseName" -ForegroundColor Gray
Write-Host ""
Write-Host "To get the connection string:" -ForegroundColor Cyan
Write-Host "  az cosmosdb keys list --name $CosmosDbName --resource-group $ResourceGroupName --type connection-strings --query 'connectionStrings[0].connectionString' -o tsv" -ForegroundColor Gray

exit 0
