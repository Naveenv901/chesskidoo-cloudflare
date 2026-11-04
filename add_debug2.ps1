$content = Get-Content C:\Naveen\chesskidoo_website_cb\lms\scripts.js -Raw
$idx = $content.IndexOf("await loadAllData(false);")
if ($idx -ge 0) {
    $insertPos = $idx + "await loadAllData(false);".Length
    $insertText = "`n      console.log(\"[QuickClassSession] After load, batches:\", window.allBatches?.length);"
    $content = $content.Substring(0, $insertPos) + $insertText + $content.Substring($insertPos)
    
    # Add before await
    $idx2 = $content.IndexOf("await loadAllData(false);")
    $insertText2 = "      console.log(\"[QuickClassSession] Loading all data, batches:\", window.allBatches?.length);`n"
    $content = $content.Substring(0, $idx2) + $insertText2 + $content.Substring($idx2)
    
    Set-Content C:\Naveen\chesskidoo_website_cb\lms\scripts.js -Value $content
    Write-Host "Added debug"
} else {
    Write-Host "NOT FOUND"
}