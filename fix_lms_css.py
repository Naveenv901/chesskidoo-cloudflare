with open(r'C:\Naveen\chesskidoo_website_cb\lms\styles.css', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('body[data-theme="light"]', '[data-theme="light"]')

with open(r'C:\Naveen\chesskidoo_website_cb\lms\styles.css', 'w', encoding='utf-8') as f:
    f.write(content)

print('Done')