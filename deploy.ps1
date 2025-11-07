# Deploy Backend (Cloud Run)
cd server
gcloud builds submit . --tag gcr.io/sensus-app-8db18/sensus-api:latest --project sensus-app-8db18
gcloud run deploy sensus-api `
  --image gcr.io/sensus-app-8db18/sensus-api:latest `
  --region us-central1 `
  --project sensus-app-8db18 `
  --allow-unauthenticated `
  --set-secrets="MONGODB_URI=MONGODB_URI:latest,GEMINI_API_KEY=GEMINI_API_KEY:latest" `
  --memory 512Mi `
  --cpu 1

Write-Host "Backend deployed! Testing the /api/status endpoint..."
$serviceUrl = (gcloud run services describe sensus-api --region us-central1 --project sensus-app-8db18 --format 'value(status.url)')
Invoke-RestMethod "$serviceUrl/api/status" | ConvertTo-Json

# Deploy Frontend (Firebase)
cd ../client
$env:REACT_APP_API_URL="https://sensus-api-602409653611.us-central1.run.app"
npm run build
firebase deploy --only hosting --project sensus-app-8db18

Write-Host "`n✅ Deployment complete!"
Write-Host "🌐 Frontend: https://sensus.yargnad.com"
Write-Host "🔧 Backend: $serviceUrl"
