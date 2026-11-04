$content = Get-Content C:\Naveen\chesskidoo_website_cb\lms\scripts.js -Raw
$idx = $content.IndexOf("moreActions = `")
if ($idx -ge 0) {
    $content = $content.Remove($idx + 14, 1)
    Set-Content C:\Naveen\chesskidoo_website_cb\lms\scripts.js -Value $content
    Write-Host "Fixed"
}