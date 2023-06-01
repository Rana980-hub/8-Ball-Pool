# backdate_commits.ps1
# Usage: .\backdate_commits.ps1 "2023-06-15 10:00:00" "Commit message"

param (
    [string]$date,
    [string]$message
)

if (-not $date -or -not $message) {
    Write-Host "Usage: .\backdate_commits.ps1 `"YYYY-MM-DD HH:MM:SS`" `"Message`"" -ForegroundColor Red
    exit
}

$env:GIT_AUTHOR_DATE = $date
$env:GIT_COMMITTER_DATE = $date

git add .
git commit --date="$date" -m "$message"

# Clear env vars
Remove-Item Env:GIT_AUTHOR_DATE
Remove-Item Env:GIT_COMMITTER_DATE

Write-Host "Committed: $message on $date" -ForegroundColor Green
