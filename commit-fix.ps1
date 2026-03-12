# Remove any git lock files
Remove-Item -Path ".git\index.lock" -Force -ErrorAction SilentlyContinue

# Stage the file
git add apps/myprojects/app/page.tsx

# Commit with message
git commit -m "Fix: Return undefined in catch block to satisfy TypeScript"

# Push to remote
git push origin main

Write-Host "Commit and push completed!"
