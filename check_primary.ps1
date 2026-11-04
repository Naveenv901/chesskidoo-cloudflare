$content = Get-Content C:\Naveen\chesskidoo_website_cb\lms\scripts.js -Raw
$idx = $content.IndexOf("primaryActions = ")
if ($idx -ge 0) {
    Write-Host "Found at $idx"
    $ctx = $content.Substring($idx, 1000)
    Write-Host $ctx
}