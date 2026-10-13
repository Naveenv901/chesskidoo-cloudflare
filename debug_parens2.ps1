$content = Get-Content C:\Naveen\chesskidoo_website_cb\lms\scripts.js -Raw
$lines = $content -split "`n"
$line = $lines[5771]
$opens = 0
$closes = 0
for ($i = 0; $i -lt $line.Length; $i++) {
    $c = $line[$i]
    if ($c -eq '(') { $opens++ }
    elseif ($c -eq ')') { $closes++ }
}
Write-Host "Opens: $opens, Closes: $closes"
# Show last 30 chars
Write-Host "End: " + $line.Substring($line.Length - 30)