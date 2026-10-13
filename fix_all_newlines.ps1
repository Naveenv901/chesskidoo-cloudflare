$content = [System.IO.File]::ReadAllText("C:\Naveen\chesskidoo_website_cb\lms\scripts.js")
$content = $content.Replace("\\n", "`n")
[System.IO.File]::WriteAllText("C:\Naveen\chesskidoo_website_cb\lms\scripts.js", $content)