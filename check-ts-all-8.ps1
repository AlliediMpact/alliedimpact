param([int]$TimeoutSeconds = 30)

$appsConfig = @(
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

foreach ($appConfig in $appsConfig) {
    $appPath = $appConfig.path
    $appName = $appConfig.name
    $logFile = Join-Path $appPath "ts-check-output.txt"
    
    if (-not (Test-Path "$appPath\package.json")) {
        Write-Host "$appName | SKIP (no package.json)"
        continue
    }
    
    Push-Location $appPath
    
    # Run type-check and save output
    $sw = [System.Diagnostics.Stopwatch]::StartNew()
    
    # Run pnpm run type-check and capture output
    & pnpm run type-check 2>&1 | Out-File -FilePath $logFile -Encoding Unicode
    $exitCode = $LASTEXITCODE
    
    $sw.Stop()
    $elapsed = $sw.ElapsedMilliseconds / 1000
    
    # Check if timed out (though this will still complete, but we can track)
    if ($elapsed -gt $TimeoutSeconds) {
        Write-Host "$appName | TIMEOUT (>${TimeoutSeconds}s)"
    }
    elseif ($exitCode -eq 0) {
        Write-Host "$appName | PASS"
    }
    else {
        # Parse errors from log file
        $content = Get-Content $logFile -Encoding Unicode
        $errorLines = @()
        $errorCounts = @{}
        
        foreach ($line in $content) {
            if ($line -match "error\s(TS\d+):\s") {
                $errorCode = $matches[1]
                $errorLines += $line
                if ($errorCounts.ContainsKey($errorCode)) {
                    $errorCounts[$errorCode]++
                }
                else {
                    $errorCounts[$errorCode] = 1
                }
            }
        }
        
        if ($errorLines.Count -gt 0) {
            $summary = ($errorCounts.GetEnumerator() | Sort-Object -Property Key | ForEach-Object { "$($_.Value)x $($_.Key)" }) -join ", "
            Write-Host "$appName | FAIL ($($errorLines.Count) errors) - $summary"
        }
        else {
            Write-Host "$appName | FAIL (exit code: $exitCode)"
        }
    }
    
    Pop-Location
}

Write-Host ""
