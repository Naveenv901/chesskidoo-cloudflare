$content = Get-Content C:\Naveen\chesskidoo_website_cb\lms\scripts.js -Raw
$old = "window.allBatches || window.allBatches.length === 0) && typeof loadAllData === \"function\") {`n      await loadAllData(false);`n    }`n`n    const coachSel = `$(""qcs-coach"");"
$new = "window.allBatches || window.allBatches.length === 0) && typeof loadAllData === \"function\") {`n      console.log(\"[QuickClassSession] Loading all data, batches:\", window.allBatches?.length);`n      await loadAllData(false);`n      console.log(\"[QuickClassSession] After load, batches:\", window.allBatches?.length);`n    }`n`n    const coachSel = `$(""qcs-coach"");"
$content = $content.Replace($old, $new)
Set-Content C:\Naveen\chesskidoo_website_cb\lms\scripts.js -Value $content
Write-Host "Added debug"