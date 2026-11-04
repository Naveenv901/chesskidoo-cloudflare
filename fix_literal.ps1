$content = Get-Content C:\Naveen\chesskidoo_website_cb\lms\scripts.js -Raw
$bad = "// Ensure batch data is loaded for coach batch filtering`n    if ((!window.allBatches || window.allBatches.length === 0) && typeof loadAllData === \"function\") {`n      await loadAllData(false);`n    }"
$good = "// Ensure batch data is loaded for coach batch filtering`n    if ((!window.allBatches || window.allBatches.length === 0) && typeof loadAllData === \"function\") {`n      await loadAllData(false);`n    }"
# The above are the same - need to find what's actually in the file
$idx = $content.IndexOf("Ensure batch data")
if ($idx -ge 0) {
    $snippet = $content.Substring($idx, 200)
    Write-Host "Found at $idx: $snippet"
    # Replace literal \n with actual newlines
    $content = $content -replace 'Ensure batch data is loaded for coach batch filtering\\n', "Ensure batch data is loaded for coach batch filtering`n"
    $content = $content -replace 'if \(\(!window\.allBatches \|\| window\.allBatches\.length === 0\) \&\& typeof loadAllData === "function"\) \\{', "if ((!window.allBatches || window.allBatches.length === 0) && typeof loadAllData === \"function\") {"
    $content = $content -replace 'await loadAllData\(false\);\\n', "await loadAllData(false);`n"
    $content = $content -replace '\\}\\n', "}`n"
    Set-Content C:\Naveen\chesskidoo_website_cb\lms\scripts.js -Value $content
    Write-Host "Fixed"
} else {
    Write-Host "Not found"
}