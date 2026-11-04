$content = Get-Content C:\Naveen\chesskidoo_website_cb\lms\scripts.js -Raw
$idx = $content.IndexOf("try {")
while ($idx -ge 0) {
    $ctx = $content.Substring($idx, 100)
    if ($ctx.Contains("getStudentPaymentStatus")) {
        Write-Host "Found at $idx"
        Write-Host $ctx
        break
    }
    $idx = $content.IndexOf("try {", $idx + 1)
}