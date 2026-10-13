$content = Get-Content C:\Naveen\chesskidoo_website_cb\lms\scripts.js -Raw
$old = "window.openQuickClassSessionModal = function () {





























    const coachSel = `$(""qcs-coach"");"
$new = "window.openQuickClassSessionModal = function () {





























    // Ensure batch data is loaded for coach batch filtering
    if ((!window.allBatches || window.allBatches.length === 0) && typeof loadAllData === ""function"") {
      await loadAllData(false);
    }
    const coachSel = `$(""qcs-coach"");"
$content = $content -replace [regex]::Escape($old), $new
Set-Content C:\Naveen\chesskidoo_website_cb\lms\scripts.js -Value $content