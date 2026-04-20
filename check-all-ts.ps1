$apps = @(
    "c:\dev\alliedimpact\apps\myprojects",
    "c:\dev\alliedimpact\web\portal",
    "c:\dev\alliedimpact\apps\controlhub",
    "c:\dev\alliedimpact\apps\coinbox",
    "c:\dev\alliedimpact\apps\careerbox",
    "c:\dev\alliedimpact\apps\drivemaster",
    "c:\dev\alliedimpact\apps\edutech",
    "c:\dev\alliedimpact\apps\sportshup"
)

$results = @()

foreach ($app in $apps) {
    $appName = Split-Path $app -Leaf
    Write-Host "Checking $appName..." -ForegroundColor Cyan
    
    if (-not (Test-Path $app)) {
        $results += "$appName | SKIP (not found)"
        continue
    }
    
    Push-Location $app
    
    # Run tsc with timeout
    $job = Start-Job -ScriptBlock { pnpm tsc --noEmit 2>&1 } -WorkingDirectory $app
    $done = $job | Wait-Job -Timeout 30
    
    if ($null -eq $done) {
        # Timeout occurred
        $results += "$appName | TIMEOUT (>30s)"
        Stop-Job $job -Force
        Remove-Job $job
    } else {
        # Check exit code
        $output = Receive-Job $job
        $exitCode = $job.State
        Remove-Job $job
        
        # Parse output for errors
        $errorLines = $output | Where-Object { $_ -match "error TS\d+" }
        
        if ($errorLines.Count -eq 0 -and $output -match "^$|No errors") {
            $results += "$appName | PASS"
        } else {
            # Count error types
            $errorTypes = @{}
            foreach ($line in $errorLines) {
                if ($line -match "error (TS\d+)") {
                    $errorCode = $matches[1]
                    if ($errorTypes.ContainsKey($errorCode)) {
                        $errorTypes[$errorCode] += 1
                    } else {
                        $errorTypes[$errorCode] = 1
                    }
                }
            }
            
            $errorCount = $errorLines.Count
            $summary = ($errorTypes.GetEnumerator() | ForEach-Object { "$($errorCount)x $($_.Key)" }) -join ", "
            $results += "$appName | FAIL ($errorCount errors) - $summary"
        }
    }
    
    Pop-Location
}

Write-Host ""
Write-Host "=== TypeScript Check Results ===" -ForegroundColor Yellow
$results | ForEach-Object { Write-Host $_ }
