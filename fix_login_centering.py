import re
with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Make the login logo more prominent and centered
old_logo = """            <div class="login-logo">
              <div class="logo-icon" style="width:48px; height:48px; font-size:22px; margin:0 auto 12px;">♛</div>
              <span style="font-size:1.3rem; font-weight:800; color:var(--ink);">Chess<span style="color:var(--amber);">Kidoo</span></span>
            </div>"""

new_logo = """            <div class="login-logo" style="margin-bottom:32px;">
              <div style="width:64px; height:64px; background:var(--ink); color:white; border-radius:16px; display:flex; align-items:center; justify-content:center; font-size:32px; margin:0 auto 16px; box-shadow:0 10px 20px rgba(15,23,42,0.2);">♛</div>
              <div style="font-size:1.5rem; font-weight:900; color:var(--ink); letter-spacing:-0.5px;">Chess<span style="color:var(--amber);">Kidoo</span></div>
            </div>"""

html = html.replace(old_logo, new_logo)

# Ensure the card itself has no weird margins and is centered
html = html.replace('class="login-card reveal"', 'class="login-card reveal" style="margin: 0 auto;"')

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)
