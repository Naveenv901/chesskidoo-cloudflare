$content = Get-Content C:\Naveen\chesskidoo_website_cb\lms\scripts.js -Raw
$idx = $content.IndexOf("function renderStudents")
$sub = $content.Substring($idx, 33117)
$matches = [regex]::Matches($sub, 'try\s*\{')
foreach ($m in $matches) {
    $ctx = $sub.Substring($m.Index, 50)
    Write-Host "try at $($m.Index): $ctx"
}