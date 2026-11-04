import re

with open(r'C:\Naveen\chesskidoo_website_cb\lms\scripts.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace }; with `; when it's closing a template literal before moreActions = `
# Pattern: }; followed by optional whitespace/newline and then "moreActions = `"
pattern = r'\};(\s*\n\s*moreActions = \`)'
replacement = r'\`;\1'

new_content = re.sub(pattern, replacement, content)

if new_content != content:
    with open(r'C:\Naveen\chesskidoo_website_cb\lms\scripts.js', 'w', encoding='utf-8') as f:
        f.write(new_content)
    print('Fixed!')
else:
    print('No changes needed')

# Also check for any }; that should be `; before other template literal assignments
# Pattern: }; followed by newline, spaces, variable = `
pattern2 = r'\};(\s*\n\s*\w+\s*=\s*\`)'
replacement2 = r'\`;\1'

new_content2 = re.sub(pattern2, replacement2, new_content)

if new_content2 != new_content:
    with open(r'C:\Naveen\chesskidoo_website_cb\lms\scripts.js', 'w', encoding='utf-8') as f:
        f.write(new_content2)
    print('Fixed additional!')
else:
    print('No additional changes')