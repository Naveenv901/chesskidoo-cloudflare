$content = Get-Content C:\Naveen\chesskidoo_website_cb\lms\scripts.js -Raw
$idx = $content.IndexOf("function renderStudents")
$sub = $content.Substring($idx, 33117)
$finallyIdx = $sub.IndexOf("finally")
if ($finallyIdx -ge 0) {
    $ctx = $sub.Substring($finallyIdx, 200)
    Write-Host "Finally found"
    Write-Host $ctx
}