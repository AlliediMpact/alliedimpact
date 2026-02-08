# Test Coverage Survey Script
Write-Host "=== TEST COVERAGE SURVEY - ALL 8 APPS ===" -ForegroundColor Cyan
Write-Host ""

$apps = [ordered]@{
    'Portal' = 'web\portal'
    'CoinBox' = 'apps\coinbox'
    'MyProjects' = 'apps\myprojects'
    'ControlHub' = 'apps\controlhub'
    'DriveMaster' = 'apps\drivemaster'
    'EduTech' = 'apps\edutech'
    'SportsHub' = 'apps\sports-hub'
    'CareerBox' = 'apps\careerbox'
}

foreach ($app in $apps.GetEnumerator()) {
    $testFiles = (Get-ChildItem $app.Value -Recurse -Include "*.test.ts","*.test.tsx","*.test.js","*.test.jsx","*.spec.ts","*.spec.tsx" -ErrorAction SilentlyContinue).Count
    $hasJestConfig = Test-Path "$($app.Value)\jest.config.js" -or (Test-Path "$($app.Value)\jest.config.ts")
    $hasPackageTest = Test-Path "$($app.Value)\package.json"
    
    $status = if ($testFiles -gt 0) { "✅" } else { "❌" }
    $color = if ($testFiles -gt 0) { "Green" } else { "Yellow" }
    
    Write-Host "$status $($app.Key):" -ForegroundColor $color -NoNewline
    Write-Host " $testFiles test files, Jest config: $hasJestConfig"
}

Write-Host ""
Write-Host "Run 'pnpm test' in app directories to check coverage" -ForegroundColor Gray
