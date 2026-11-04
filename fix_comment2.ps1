$content = Get-Content C:\Naveen\chesskidoo_website_cb\lms\scripts.js -Raw
$old = "// targetMonthEnd is built with Date.UTC, and `n`n ow` is local \u2014 comparing the"
$new = "// targetMonthEnd is built with Date.UTC, and `now` is local \u2014 comparing the"
$content = $content.Replace($old, $new)
Set-Content C:\Naveen\chesskidoo_website_cb\lms\scripts.js -Value $content
Write-Host "Fixed"