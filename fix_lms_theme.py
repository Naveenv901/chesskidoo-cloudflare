import re

with open(r'C:\Naveen\chesskidoo_website_cb\lms\scripts.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace the toggleTheme function - use regex with DOTALL flag
old_func_pattern = r'function toggleTheme\(\) \{[\s\S]*?const newTheme = document\.body\.dataset\.theme === "dark" \? "light" : "dark";[\s\S]*?document\.body\.dataset\.theme = newTheme;[\s\S]*?localStorage\.setItem\("chesskidoo_theme", newTheme\);[\s\S]*?if \(\$\(\"page-dash"\)\)\.classList\.contains\("active"\)\) renderDash\(\);[\s\S]*?\}'

new_func = '''function toggleTheme() {
  const newTheme = document.documentElement.getAttribute("data-theme") === "light" ? "dark" : "light";
  if (newTheme === "light") {
    document.documentElement.setAttribute("data-theme", "light");
  } else {
    document.documentElement.removeAttribute("data-theme");
  }
  localStorage.setItem("ck_portal_theme", newTheme);
  if ($("page-dash") && $("page-dash").classList.contains("active")) renderDash();
}'''

content = re.sub(old_func_pattern, new_func, content, flags=re.DOTALL)

# Also replace the theme initialization
old_init = 'const savedTheme = localStorage.getItem("chesskidoo_theme");\n  if (savedTheme) document.body.dataset.theme = savedTheme;'
new_init = 'const savedTheme = localStorage.getItem("ck_portal_theme");\n  if (savedTheme === "light") document.documentElement.setAttribute("data-theme", "light");'

content = content.replace(old_init, new_init)

with open(r'C:\Naveen\chesskidoo_website_cb\lms\scripts.js', 'w', encoding='utf-8') as f:
    f.write(content)

print('Done')