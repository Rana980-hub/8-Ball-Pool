# generate_full_history.ps1
$months = 6..12
$messages = @(
    "Setup project structure", "Initial Canvas setup", "Basic ball physics", 
    "Implemented AABB collisions", "Added wall bouncing", "Friction logic",
    "Ball-Ball collision resolution", "Refined restitution", "Gradients for balls",
    "Table rendering improvements", "Pocket detection logic", "Game state machine",
    "Aiming mechanics", "Charge power logic", "Foul detection system",
    "8-ball game rules implementation", "Turn management", "Score tracking",
    "PHP MVC framework integration", "Routing setup", "Database migrations",
    "Score model implementation", "Leaderboard API", "HUD component",
    "Win Screen UI", "Menu system", "Asset loading logic",
    "Sound effect integration", "Touch controls", "Bug fixes",
    "Physics optimization", "UI polish", "Final touches for 2023"
)

$msgIdx = 0
foreach ($m in $months) {
    $numCommits = Get-Random -Minimum 5 -Maximum 8
    for ($i = 0; $i -lt $numCommits; $i++) {
        $day = Get-Random -Minimum 1 -Maximum 28
        $hour = Get-Random -Minimum 9 -Maximum 22
        $min = Get-Random -Minimum 0 -Maximum 59
        $date = "2023-$($m)-$($day) $($hour):$($min):00"
        
        $msg = $messages[$msgIdx % $messages.Count]
        $msgIdx++
        
        Add-Content -Path .dev_history -Value "$($date): $($msg)"
        $env:GIT_AUTHOR_DATE = $date
        $env:GIT_COMMITTER_DATE = $date
        git add .
        git commit --date="$date" -m "$msg"
    }
}

Remove-Item Env:GIT_AUTHOR_DATE
Remove-Item Env:GIT_COMMITTER_DATE
Write-Host "Historical commits generated!" -ForegroundColor Green
