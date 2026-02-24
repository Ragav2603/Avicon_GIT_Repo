# Azure App Service Deployment Script for Python FastApi Backend
# Ensure you are logged into Azure CLI before running (`az login`)

$appName = "avicon-ai-backend" # Replace with a uniquely generated name if this fails
$resourceGroup = "avicon-rg"
$location = "eastus"

Write-Host "Deploying AI Backend to Azure App Service: $appName"

# Step 1: Push code to Azure App Service
az webapp up --name $appName --resource-group $resourceGroup --location $location --sku B1 --os-type Linux --runtime "PYTHON:3.12"

# Step 2: Set startup command (Wait a few seconds for the app to initialize)
Start-Sleep -Seconds 10
Write-Host "Setting Startup command..."
az webapp config set --resource-group $resourceGroup --name $appName --startup-file "startup.sh"

Write-Host "Deployment initialization sent successfully. Check the Portal for logs."
Write-Host "Remember to set your environment variables (PINECONE_API_KEY, OPENAI_API_KEY, LLAMA_CLOUD_API_KEY) in the Azure Portal Configuration."
