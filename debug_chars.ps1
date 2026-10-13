$content = Get-Content C:\Naveen\chesskidoo_website_cb\lms\scripts.js -Raw
$idx = $content.IndexOf("is local")
for ($i = $idx - 10; $i -lt $idx + 10; $i++) {
    $c = $content.Substring($i, 1)
    $code = [int][char]$c
    Write-Host ($i + ": '" + $c + "' (" + $code + ")")
}