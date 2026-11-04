$content = Get-Content C:\Naveen\chesskidoo_website_cb\lms\scripts.js -Raw
$idx = $content.IndexOf("is local")
if ($idx -ge 0) {
    $start = $idx - 5  # "ow` i" = 5 chars
    $content = $content.Remove($start, 5).Insert($start, "`now` ")
    Set-Content C:\Naveen\chesskidoo_website_cb\lms\scripts.js -Value $content
    Write-Host "Fixed at index $start"
} else {
    Write-Host "NOT FOUND"
}