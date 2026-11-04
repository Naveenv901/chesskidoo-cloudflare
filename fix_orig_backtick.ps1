$content = [System.IO.File]::ReadAllText("C:\Naveen\chesskidoo_website_cb\lms\scripts.js")
$idx = $content.IndexOf("Click the backdrop")
if ($idx -ge 0) {
    $searchIdx = $content.LastIndexOf("`;", $idx)
    if ($searchIdx -ge 0) {
        $content = $content.Remove($searchIdx, 2).Insert($searchIdx, "};")
        [System.IO.File]::WriteAllText("C:\Naveen\chesskidoo_website_cb\lms\scripts.js", $content)
        Write-Host "Fixed at $searchIdx"
    } else {
        Write-Host "Not found"
    }
}