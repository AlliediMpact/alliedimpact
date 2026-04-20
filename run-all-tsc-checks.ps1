param(
    [int]$TimeoutSeconds = 30
)

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

Write-Host "=== TypeScript Check Results (30s timeout per app) ===" -ForegroundColor Yellow
Write-Host ""

foreach ($app in $apps) {
    $appPath = $app.path
    $appName = $app.name
    
    if (-not (Test-Path $appPath)) {
        Write-Host "$appName | SKIP (path not found)"
        continue
    }
    
    $outputFile = Join-Path $PSScriptRoot "$($appName)-tsc-output.log"
    
    # Run pnpm tsc with timeout using a background job
    $job = Start-Job -ScriptBlock {
        param($path)
        Set-Location $path
        & pnpm tsc --noEmit 2>&1
        exit $LASTEXITCODE
    } -ArgumentList $appPath
    
    # Wait for job with timeout
    $completed = $job | Wait-Job -Timeout $TimeoutSeconds
    
    if ($null -eq $completed) {
        Write-Host "$appName | TIMEOUT (>$TimeoutSeconds`s)"
        Stop-Job $job -Force
        Remove-Job $job -Force
    }
    else {
        $output = Receive-Job $job
        $exitCode = $job.ExitCode
        Remove-Job $job -Force
        
        # Save output for analysis
        $output | Out-File -FilePath $outputFile -Encoding UTF8
        
        if ($exitCode -eq 0) {
            Write-Host "$appName | PASS"
        }
        else {
            # Parse error output
            $errorLines = @()
            $errorCounts = @{}
            
            foreach ($line in $output) {
                # Match lines like: "src/file.ts(10,5): error TS2339: Property 'foo' does not exist"
                if ($line -match "\serror\s(TS\d+):\s") {
                    $errorCode = $matches[1]
                    $errorLines += $line
                    $errorCounts[$errorCode]++
                }
            }
            
            if ($errorLines.Count -gt 0) {
                $summary = ($errorCounts.GetEnumerator() | Sort-Object -Property Key | ForEach-Object { "$($_.Value)x $($_.Key)" }) -join ", "
                Write-Host "$appName | FAIL ($($errorLines.Count) errors) - $summary"
            }
            else {
                # No errors found but exit code != 0, might be a different issue
                Write-Host "$appName | FAIL (exit code: $exitCode, see log)"
            }
        }
    }
}

Write-Host ""
Write-Host "Logs saved to: $PSScriptRoot\*-tsc-output.log"
