$content = Get-Content C:\Naveen\chesskidoo_website_cb\lms\scripts.js -Raw
$idx = $content.IndexOf("is local")
if ($idx -ge 0) {
    # Go back to find "ow"
    $start = $idx - 5
    $content = $content.Remove($start, 2).Insert($start, "`now")
    Set-Content C:\Naveen\chesskidoo_website_cb\lms\scripts.js -Value $content
    Write-Host "Fixed at index $start"
} else {
    Write-Host "NOT FOUND"
}