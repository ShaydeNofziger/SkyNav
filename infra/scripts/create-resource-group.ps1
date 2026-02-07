<#
.SYNOPSIS
  Creates an Azure Resource Group for SkyNav.

.DESCRIPTION
  Creates a new Azure Resource Group or updates tags if it already exists.

.PARAMETER ResourceGroupName
  Name of the resource group to create.

.PARAMETER Location
  Azure region for the resource group.

.EXAMPLE
  .\create-resource-group.ps1 -ResourceGroupName "rg-skynav-dev" -Location "eastus"
#>

[CmdletBinding()]
param(
  [Parameter(Mandatory = $true)]
  [string]$ResourceGroupName,

  [Parameter(Mandatory = $true)]
  [string]$Location
)

$ErrorActionPreference = 'Stop'

Write-Host "Creating Resource Group: $ResourceGroupName in $Location" -ForegroundColor Cyan

# Check if resource group exists
$rgExists = az group exists --name $ResourceGroupName
if ($rgExists -eq 'true') {
  Write-Host "Resource group already exists. Updating tags..." -ForegroundColor Yellow
  
  az group update `
    --name $ResourceGroupName `
    --tags project=SkyNav environment=$Environment deployedBy=PowerShell `
    --output none
  
  Write-Host "✓ Resource group updated" -ForegroundColor Green
} else {
  Write-Host "Creating new resource group..." -ForegroundColor Yellow
  
  az group create `
    --name $ResourceGroupName `
    --location $Location `
    --tags project=SkyNav environment=$Environment deployedBy=PowerShell `
    --output none
  
  if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Resource group created successfully" -ForegroundColor Green
  } else {
    Write-Error "Failed to create resource group"
    exit 1
  }
}

exit 0
