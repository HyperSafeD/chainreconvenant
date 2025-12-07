# Auto-push script for GitHub - Runs every 2 minutes
# ChainReCovenant - Automated Git Push Script

$repoPath = "."
$commitMessage = "Auto-update: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"

Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "ChainReCovenant Auto-Push Script" -ForegroundColor Cyan
Write-Host "Pushing to GitHub every 2 minutes" -ForegroundColor Cyan
Write-Host "Press Ctrl+C to stop" -ForegroundColor Yellow
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Function to perform git operations
function Push-ToGitHub {
    param (
        [string]$message
    )
    
    try {
        # Change to repository directory
        Set-Location $repoPath
        
        # Check if there are any changes
        $status = git status --porcelain
        
        if ($status) {
            Write-Host "[$(Get-Date -Format 'HH:mm:ss')] Changes detected. Pushing to GitHub..." -ForegroundColor Green
            
            # Add all changes
            git add .
            Write-Host "  ✓ Files staged" -ForegroundColor Gray
            
            # Commit changes
            git commit -m $message
            Write-Host "  ✓ Changes committed: $message" -ForegroundColor Gray
            
            # Push to remote
            git push origin main
            Write-Host "  ✓ Successfully pushed to GitHub!" -ForegroundColor Green
            Write-Host ""
        }
        else {
            Write-Host "[$(Get-Date -Format 'HH:mm:ss')] No changes to push." -ForegroundColor Yellow
        }
    }
    catch {
        Write-Host "[$(Get-Date -Format 'HH:mm:ss')] Error: $_" -ForegroundColor Red
    }
}

# Initial push
Write-Host "Performing initial push..." -ForegroundColor Cyan
Push-ToGitHub -message "Initial commit: ChainReCovenant smart contract with automated enforcement"

# Infinite loop - push every 2 minutes (120 seconds)
$counter = 1
while ($true) {
    # Wait for 2 minutes
    Write-Host "Waiting 2 minutes until next push... (Iteration: $counter)" -ForegroundColor Cyan
    Start-Sleep -Seconds 120
    
    # Perform push
    $commitMsg = "Auto-update #$counter : $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
    Push-ToGitHub -message $commitMsg
    
    $counter++
}

