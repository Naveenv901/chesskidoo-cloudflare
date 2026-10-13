$content = Get-Content C:\Naveen\chesskidoo_website_cb\lms\scripts.js -Raw
$idx = $content.IndexOf('.join("")')
if ($idx -ge 0) {
    $ctx = $content.Substring($idx - 500, 500)
    Write-Host $ctx
}