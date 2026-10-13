$content = Get-Content C:\Naveen\chesskidoo_website_cb\lms\scripts.js -Raw
$idx = $content.IndexOf("try {")
while ($idx -ge 0) {
    $ctx = $content.Substring($idx, 50)
    Write-Host ("At " + $idx + ": " + $ctx)
    $idx = $content.IndexOf("try {", $idx + 1)
}