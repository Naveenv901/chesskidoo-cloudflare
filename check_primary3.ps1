$content = Get-Content C:\Naveen\chesskidoo_website_cb\lms\scripts.js -Raw
$search = "primaryActions = " + [char]96
$idx = $content.IndexOf($search, 421800)
if ($idx -ge 0) {
    Write-Host "Found at $idx"
    $ctx = $content.Substring($idx, 1500)
    Write-Host $ctx
}