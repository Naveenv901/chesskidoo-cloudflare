$content = [System.IO.File]::ReadAllText("C:\Naveen\chesskidoo_website_cb\lms\scripts.js")
$idx = $content.IndexOf("Error rendering student")
if ($idx -ge 0) {
    # Find the start of the catch block
    $catchStart = $content.LastIndexOf("} catch (rowErr) {", $idx)
    if ($catchStart -ge 0) {
        # Find the end of the catch block (the closing brace before })
        $braceCount = 0
        $pos = $catchStart
        while ($pos -lt $content.Length) {
            if ($content[$pos] -eq '{') { $braceCount++ }
            elseif ($content[$pos] -eq '}') { 
                $braceCount--
                if ($braceCount -eq 0) {
                    # Found the end of the catch block
                    $catchEnd = $pos + 1
                    # Also remove the preceding newline and indentation
                    $content = $content.Remove($catchStart, $catchEnd - $catchStart)
                    [System.IO.File]::WriteAllText("C:\Naveen\chesskidoo_website_cb\lms\scripts.js", $content)
                    Write-Host "Removed catch block from $catchStart to $catchEnd"
                    break
                }
            }
            $pos++
        }
    } else {
        Write-Host "Catch start not found"
    }
} else {
    Write-Host "Error rendering student not found"
}