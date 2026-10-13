$content = Get-Content C:\Naveen\chesskidoo_website_cb\lms\scripts.js -Raw
$old = "window.openQuickClassSessionModal = function () {`n`n    const coachSel = `$(""qcs-coach"");"
$new = "window.openQuickClassSessionModal = function () {`n`n    // Ensure batch data is loaded for coach batch filtering`n    if ((!window.allBatches || window.allBatches.length === 0) && typeof loadAllData === ""function"") {`n      await loadAllData(false);`n    }`n`n    const coachSel = `$(""qcs-coach"");"
$content = $content.Replace($old, $new)
Set-Content C:\Naveen\chesskidoo_website_cb\lms\scripts.js -Value $content
Write-Host "Added"