$content = Get-Content C:\Naveen\chesskidoo_website_cb\lms\scripts.js -Raw
$old = "`n ow` is local"
$new = "`n `now` is local"
$content = $content.Replace($old, $new)
Set-Content C:\Naveen\chesskidoo_website_cb\lms\scripts.js -Value $content
Write-Host "Fixed"