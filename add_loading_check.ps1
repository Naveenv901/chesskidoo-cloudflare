$content = Get-Content C:\Naveen\chesskidoo_website_cb\lms\scripts.js -Raw
$idx = $content.IndexOf("window.openQuickClassSessionModal = function () {")
if ($idx -ge 0) {
    $insertPos = $idx + 40
    $insertText = "`n    // Ensure batch data is loaded for coach batch filtering`n    if ((!window.allBatches || window.allBatches.length === 0) && typeof loadAllData === 'function') {`n      await loadAllData(false);`n    }"
    $content = $content.Substring(0, $insertPos) + $insertText + $content.Substring($insertPos)
    Set-Content C:\Naveen\chesskidoo_website_cb\lms\scripts.js -Value $content
    Write-Host "Added"
} else {
    Write-Host "NOT FOUND"
}