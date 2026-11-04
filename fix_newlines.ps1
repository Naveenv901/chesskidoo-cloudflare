$content = Get-Content C:\Naveen\chesskidoo_website_cb\lms\scripts.js -Raw
$bad = "// Ensure batch data is loaded for coach batch filtering\n    if ((!window.allBatches || window.allBatches.length === 0) && typeof loadAllData === \"function\") {\n      await loadAllData(false);\n    }"
$good = "// Ensure batch data is loaded for coach batch filtering`n    if ((!window.allBatches || window.allBatches.length === 0) && typeof loadAllData === \"function\") {`n      await loadAllData(false);`n    }"
$content = $content -replace [regex]::Escape($bad), $good
Set-Content C:\Naveen\chesskidoo_website_cb\lms\scripts.js -Value $content