$content = Get-Content C:\Naveen\chesskidoo_website_cb\lms\scripts.js -Raw
$idx = $content.IndexOf("targetMonthEnd is built")
if ($idx -ge 0) {
    # Find the \r`now` pattern
    $searchIdx = $content.IndexOf("\r`now`", $idx)
    if ($searchIdx -ge 0) {
        $content = $content.Remove($searchIdx, 5).Insert($searchIdx, "`now`")
        Set-Content C:\Naveen\chesskidoo_website_cb\lms\scripts.js -Value $content
        Write-Host "Fixed at $searchIdx"
    } else {
        Write-Host "Pattern not found"
    }
}