$content = Get-Content C:\Naveen\chesskidoo_website_cb\lms\scripts.js -Raw
$content = $content -replace "`;\r\n    // Click the backdrop", "};\r\n    // Click the backdrop"
Set-Content C:\Naveen\chesskidoo_website_cb\lms\scripts.js -Value $content
Write-Host "Fixed"