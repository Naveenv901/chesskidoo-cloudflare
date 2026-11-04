$content = [System.IO.File]::ReadAllText("C:\Naveen\chesskidoo_website_cb\lms\scripts.js")
$idx = $content.IndexOf("targetMonthEnd is built")
if ($idx -ge 0) {
    # Remove the \r at idx+43 (which is the \r before `now`)
    $content = $content.Remove($idx + 43, 1)
    [System.IO.File]::WriteAllText("C:\Naveen\chesskidoo_website_cb\lms\scripts.js", $content)
    Write-Host "Fixed"
}