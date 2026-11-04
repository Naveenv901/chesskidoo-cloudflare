$content = Get-Content 'C:\Naveen\chesskidoo_website_cb\lms\scripts.js' -Raw
$idx = $content.IndexOf('is local')
if ($idx -ge 0) {
    $content = $content.Remove($idx - 5, 5).Insert($idx - 5, '`now`')
    Set-Content 'C:\Naveen\chesskidoo_website_cb\lms\scripts.js' -Value $content
    Write-Host 'Fixed'
}