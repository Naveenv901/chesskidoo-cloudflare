import re
with open('assets/js/auth.js', 'r', encoding='utf-8') as f:
    js = f.read()

# Update the bypass check to accept 'admin123' too
js = js.replace("password === 'admin'", "(password === 'admin' || password === 'admin123')")

with open('assets/js/auth.js', 'w', encoding='utf-8') as f:
    f.write(js)
