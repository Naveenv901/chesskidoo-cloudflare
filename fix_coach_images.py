import re

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Replace supabase URLs with local assets/img paths
replacements = {
    r"url\('https://hcjuyqicftkgpiyrkscr.supabase.co/storage/v1/object/public/Images/ranjith.jpg'\)": "url('assets/img/ranjith.jpeg')",
    r"url\('https://hcjuyqicftkgpiyrkscr.supabase.co/storage/v1/object/public/Images/vishnu.jpg'\)": "url('assets/img/vishnu.jpeg')",
    r"url\('https://hcjuyqicftkgpiyrkscr.supabase.co/storage/v1/object/public/Images/rohith.jpg'\)": "url('assets/img/rohith.jpeg')",
    r"url\('https://hcjuyqicftkgpiyrkscr.supabase.co/storage/v1/object/public/Images/gyansurya.jpg'\)": "url('assets/img/gyansurya.jpeg')",
    r"url\('https://hcjuyqicftkgpiyrkscr.supabase.co/storage/v1/object/public/Images/saran.jpg'\)": "url('assets/img/saran.jpeg')",
    r"url\('https://hcjuyqicftkgpiyrkscr.supabase.co/storage/v1/object/public/Images/yogesh.jpg'\)": "url('assets/img/yogesh.png')",
    r"url\('https://hcjuyqicftkgpiyrkscr.supabase.co/storage/v1/object/public/Images/haris.jpg'\)": "url('assets/img/haris.png')"
}

for old, new in replacements.items():
    html = re.sub(old, new, html)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)
