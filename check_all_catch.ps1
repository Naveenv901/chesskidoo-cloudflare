$content = Get-Content C:\Naveen\chesskidoo_website_cb\lms\scripts.js -Raw
$idx = $content.IndexOf("function renderStudents")
$sub = $content.Substring($idx, 33117)
# Find all catch occurrences
$matches = [regex]::Matches($sub, 'catch\s*\(')
foreach ($m in $matches) {
    $ctx = $sub.Substring($m.Index, 100)
    Write-Host "At $($m.Index): $ctx"
    Write-Host "---"
}