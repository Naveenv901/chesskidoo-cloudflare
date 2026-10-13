$content = Get-Content C:\Naveen\chesskidoo_website_cb\lms\scripts.js -Raw
$idx = 0
$count = 0
while ($true) {
    $idx = $content.IndexOf('[QuickClassSession]', $idx)
    if ($idx -lt 0) { break }
    $start = [Math]::Max(0, $idx - 30)
    $ctx = $content.Substring($start, 120)
    Write-Host ("At " + $idx + ": " + $ctx)
    $idx += 1
    $count++
    if ($count -ge 40) { break }
}
Write-Host ("Total: " + $count)