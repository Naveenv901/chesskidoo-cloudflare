$content = Get-Content C:\Naveen\chesskidoo_website_cb\lms\scripts.js -Raw
$openTicks = 0
for ($i = 0; $i -lt $content.Length; $i++) {
    if ($content[$i] -eq '`') {
        $openTicks++
        if ($openTicks -gt 100) {
            $start = [Math]::Max(0, $i - 100)
            $ctx = $content.Substring($start, 200)
            Write-Host ("At " + $i + ": " + $ctx)
            break
        }
    }
}
Write-Host ("Total backticks: " + $openTicks)