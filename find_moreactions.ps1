$content = Get-Content C:\Naveen\chesskidoo_website_cb\lms\scripts.js -Raw
$idx = $content.IndexOf("moreActions = `")
if ($idx -ge 0) {
    Write-Host "Found at $idx"
    $ctx = $content.Substring($idx, 200)
    Write-Host $ctx
} else {
    Write-Host "NOT FOUND"
}