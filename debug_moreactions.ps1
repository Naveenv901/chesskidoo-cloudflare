$content = [System.IO.File]::ReadAllText("C:\Naveen\chesskidoo_website_cb\lms\scripts.js")
$idx = $content.IndexOf("moreActions = `")
if ($idx -ge 0) {
    for ($i = 0; $i -lt 50; $i++) {
        $c = $content[$idx + $i]
        $code = [int]$c
        Write-Host ($idx + $i + ": '" + $c + "' (" + $code + ")")
    }
}