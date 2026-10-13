$content = Get-Content C:\Naveen\chesskidoo_website_cb\lms\scripts.js -Raw
$old = "ow` is local"
$new = "`now` is local"
$content = $content.Replace($old, $new)
Set-Content C:\Naveen\chesskidoo_website_cb\lms\scripts.js -Value $content
Write-Host "Fixed"