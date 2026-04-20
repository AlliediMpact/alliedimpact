$apps = @(
    @{ path = "c:\dev\alliedimpact\apps\myprojects"; name = "myprojects" },
    @{ path = "c:\dev\alliedimpact\web\portal"; name = "portal" },
    @{ path = "c:\dev\alliedimpact\apps\controlhub"; name = "controlhub" },
    @{ path = "c:\dev\alliedimpact\apps\coinbox"; name = "coinbox" },
    @{ path = "c:\dev\alliedimpact\apps\careerbox"; name = "careerbox" },
    @{ path = "c:\dev\alliedimpact\apps\drivemaster"; name = "drivemaster" },
    @{ path = "c:\dev\alliedimpact\apps\edutech"; name = "edutech" },
    @{ path = "c:\dev\alliedimpact\apps\sportshup"; name = "sportshup" }
)

Write-Host "=== TypeScript Check Results ===" -ForegroundColor Yellow
Write-Host ""

foreach ($app in $apps) {
    $appPath = $app.path
    $appName = $app.name
    
    if (-not (Test-Path "$appPath\package.json")) {
        Write-Host "$appName | SKIP (no package.json)"
        continue
    }
    
    Push-Location $appPath
    
    # Run type-check with timeout
    $sw = [System.Diagnostics.Stopwatch]::StartNew()
    $output = & { pnpm run type-check 2>&1 } 
    $exitCode = $LASTEXITCODE
    $elapsed = $sw.ElapsedMilliseconds / 1000
    
    if ($elapsed -gt 30) {
        Write-Host "$appName | TIMEOUT (>${30}s)"
    }
    elseif ($exitCode -eq 0) {
        Write-Host "$appName | PASS"
    }
    else {
        # Count error types
        $errorCounts = @{}
        foreach ($line in $output) {
            if ($line -match "\serror\s(TS\d+):\s") {
                $code = $matches[1]
                $errorCounts[$code]++
            }
        }
        
        $totalErrors = ($output | Select-String "error TS" | Measure-Object).Count
        
        if ($totalErrors -gt 0) {
            $summary = ($errorCounts.GetEnumerator() | Sort-Object -Property Key | ForEach-Object { "$($_.Value)x $($_.Key)" }) -join ", "
            Write-Host "$appName | FAIL ($totalErrors errors) - $summary"
        }
        else {
            Write-Host "$appName | FAIL (exit code: $exitCode)"
        }
    }
    
    Pop-Location
}

Write-Host ""
