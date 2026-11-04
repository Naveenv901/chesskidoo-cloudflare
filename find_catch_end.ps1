$content = Get-Content C:\Naveen\chesskidoo_website_cb\lms\scripts.js -Raw
$idx = 0
while ($true) {
    $idx = $content.IndexOf("</tr>`;", $idx)
    if ($idx -lt 0) { break }
    $ctx = $content.Substring($idx, 200)
    if ($ctx.Contains("catch (rowErr)")) {
        Write-Host "Found at $idx"
        Write-Host $ctx
        break
    }
    $idx++
}