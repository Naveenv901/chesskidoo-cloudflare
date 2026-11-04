$content = Get-Content C:\Naveen\chesskidoo_website_cb\lms\scripts.js -Raw
$idx = $content.IndexOf("primaryActions = `", 421800)
if ($idx -ge 0) {
    $ctx = $content.Substring($idx, 1500)
    Write-Host $ctx
}