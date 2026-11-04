with open(r'C:\Naveen\chesskidoo_website_cb\lms\scripts.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix the toggleTheme function (the one at line ~557686)
old = '''    const newTheme = document.body.dataset.theme === "dark" ? "light" : "dark";




    document.body.dataset.theme = newTheme;




    localStorage.setItem("chesskidoo_theme", newTheme);




    // Re-render dashboard if visible to update chart colors




    if ($("page-dash").classList.contains("active")) renderDash();





  }'''

new = '''const newTheme = document.documentElement.getAttribute("data-theme") === "light" ? "dark" : "light";
  if (newTheme === "light") {
    document.documentElement.setAttribute("data-theme", "light");
  } else {
    document.documentElement.removeAttribute("data-theme");
  }
  localStorage.setItem("ck_portal_theme", newTheme);
  if ($("page-dash") && $("page-dash").classList.contains("active")) renderDash();
}'''

if old in content:
    content = content.replace(old, new)
    print('Replaced toggleTheme')
else:
    print('Old toggleTheme not found, trying alternative...')
    # Try with different whitespace
    import re
    content = re.sub(
        r'const newTheme = document\.body\.dataset\.theme === "dark" \? "light" : "dark";[\s\S]*?document\.body\.dataset\.theme = newTheme;[\s\S]*?localStorage\.setItem\("chesskidoo_theme", newTheme\);[\s\S]*?if \(\$\(\"page-dash"\)\)\.classList\.contains\("active"\)\) renderDash\(\);[\s\S]*?\}',
        new,
        content,
        flags=re.DOTALL
    )
    print('Replaced via regex')

# Fix the theme initialization (line ~557974)
old_init = '''  const savedTheme = localStorage.getItem("ck_portal_theme");

  if (savedTheme) document.body.dataset.theme = savedTheme;'''

new_init = '''  const savedTheme = localStorage.getItem("ck_portal_theme");
  if (savedTheme === "light") document.documentElement.setAttribute("data-theme", "light");'''

if old_init in content:
    content = content.replace(old_init, new_init)
    print('Replaced init')
else:
    print('Old init not found, trying alternative...')
    import re
    content = re.sub(
        r'const savedTheme = localStorage\.getItem\("ck_portal_theme"\);\s*if \(savedTheme\) document\.body\.dataset\.theme = savedTheme;',
        new_init,
        content
    )
    print('Replaced init via regex')

with open(r'C:\Naveen\chesskidoo_website_cb\lms\scripts.js', 'w', encoding='utf-8') as f:
    f.write(content)

print('Done')