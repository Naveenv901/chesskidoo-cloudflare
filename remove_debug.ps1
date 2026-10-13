$content = Get-Content C:\Naveen\chesskidoo_website_cb\lms\scripts.js -Raw
# Remove all the extra debug logs except the first one in openQuickClassSessionModal
# Pattern: console.log("[QuickClassSession] ...);
$pattern = 'console\.log\("\[QuickClassSession\] Loading all data, batches:", window\.allBatches\?\.length\);'
$content = $content -replace $pattern, ''
$pattern2 = 'console\.log\("\[QuickClassSession\] After load, batches:", window\.allBatches\?\.length\);'
$content = $content -replace $pattern2, ''
Set-Content C:\Naveen\chesskidoo_website_cb\lms\scripts.js -Value $content
Write-Host "Removed extra debug logs"