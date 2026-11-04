$content = Get-Content C:\Naveen\chesskidoo_website_cb\lms\scripts.js -Raw
$old = @"
toast(
o payment history record found for ${targetKey}`, "warning");
"@
$new = @"
toast(
        `No payment history record found for ${targetKey}`, "warning");
"@
$content = $content.Replace($old, $new)
Set-Content C:\Naveen\chesskidoo_website_cb\lms\scripts.js -Value $content
Write-Host "Fixed"