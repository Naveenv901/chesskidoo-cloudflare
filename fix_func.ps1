$content = Get-Content C:\Naveen\chesskidoo_website_cb\lms\scripts.js -Raw
$bad = @"
openQuickClassSessionModal = func
    // Ensure batch data is loaded for coach batch filtering
    if ((!window.allBatches || window.allBatches.length === 0) && typeof loadAllData === 'function') {
      await loadAllData(false);
    }
tion () {

    const coachSel = $("qcs-coach");
"@
$good = @"
window.openQuickClassSessionModal = function () {

    // Ensure batch data is loaded for coach batch filtering
    if ((!window.allBatches || window.allBatches.length === 0) && typeof loadAllData === "function") {
      await loadAllData(false);
    }

    const coachSel = $("qcs-coach");
"@
$content = $content.Replace($bad, $good)
Set-Content C:\Naveen\chesskidoo_website_cb\lms\scripts.js -Value $content
Write-Host "Fixed"