$content = Get-Content C:\Naveen\chesskidoo_website_cb\lms\scripts.js -Raw
$bad = @"
// Ensure batch data is loaded for coach batch filtering
    if ((!window.allBatches || window.allBatches.length === 0) && typeof loadAllData === "function") {
      await loadAllData(false);
    }
"@
$good = @"
// Ensure batch data is loaded for coach batch filtering
    if ((!window.allBatches || window.allBatches.length === 0) && typeof loadAllData === "function") {
      await loadAllData(false);
    }
"@
$content = $content.Replace($bad, $good)
Set-Content C:\Naveen\chesskidoo_website_cb\lms\scripts.js -Value $content