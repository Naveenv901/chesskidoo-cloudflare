$content = Get-Content C:\Naveen\chesskidoo_website_cb\lms\scripts.js -Raw
$lines = $content -split "`n"
$line = $lines[5771]
$chars = $line.ToCharArray()
for ($i = 0; $i -lt $chars.Count; $i++) {
    $c = $chars[$i]
    if ($c -eq '(' -or $c -eq ')') {
        Write-Host "$i: '$c'"
    }
}