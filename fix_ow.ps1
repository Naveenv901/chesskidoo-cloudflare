$content = Get-Content C:\Naveen\chesskidoo_website_cb\lms\scripts.js -Raw
$content = $content -replace "ow` is local", "`now` is local"
Set-Content C:\Naveen\chesskidoo_website_cb\lms\scripts.js -Value $content
Write-Host "Fixed"