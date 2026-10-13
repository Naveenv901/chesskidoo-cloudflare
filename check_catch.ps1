$content = Get-Content C:\Naveen\chesskidoo_website_cb\lms\scripts.js -Raw
$idx = $content.IndexOf("function renderStudents")
$sub = $content.Substring($idx, 33117)
$catchIdx = $sub.IndexOf("catch")
if ($catchIdx -ge 0) {
    $ctx = $sub.Substring($catchIdx, 200)
    Write-Host $ctx
}