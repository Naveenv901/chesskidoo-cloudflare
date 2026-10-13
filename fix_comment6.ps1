$content = Get-Content C:\Naveen\chesskidoo_website_cb\lms\scripts.js -Raw
$idx = $content.IndexOf("targetMonthEnd is built")
if ($idx -ge 0) {
    $content = $content.Remove($idx + 39, 5).Insert($idx + 39, "`now`")
    Set-Content C:\Naveen\chesskidoo_website_cb\lms\scripts.js -Value $content
    Write-Host "Fixed at $idx"
}