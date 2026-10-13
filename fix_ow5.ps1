$content = Get-Content C:\Naveen\chesskidoo_website_cb\lms\scripts.js -Raw
$idx = $content.IndexOf("is local")
if ($idx -ge 0) {
    $start = $idx - 5
    $content = $content.Remove($start, 3).Insert($start, "`now")
    Set-Content C:\Naveen\chesskidoo_website_cb\lms\scripts.js -Value $content
    Write-Host "Fixed at index $start"
} else {
    Write-Host "NOT FOUND"
}