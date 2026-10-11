with open(r'C:\Naveen\chesskidoo_website_cb\index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix team showcase cards - remove inline hardcoded colors
replacements = [
    # Card 1
    ('style="background: #ffffff; border: 1px solid rgba(15, 23, 42, 0.12); border-radius: 20px; overflow: hidden; box-shadow: 0 12px 32px rgba(15, 23, 42, 0.08); display: flex; flex-direction: column;"',
     'class="team-action-card"'),
    ('style="position: relative; width: 100%; height: 290px; overflow: hidden; background: #0f172a; flex: 0 0 auto;"',
     'class="team-action-img-wrap"'),
    ('style="font-family: var(--font-display, \'Poppins\', sans-serif); font-size: 1.35rem; font-weight: 800; color: #0f172a !important; margin: 0 0 8px 0; line-height: 1.3;"',
     'class="team-action-title"'),
    ('style="font-size: 0.95rem; line-height: 1.6; color: #334155 !important; margin: 0; font-weight: 500;"',
     'class="team-action-desc"'),
    ('style="padding: 24px 22px; background: #ffffff; flex: 1; display: flex; flex-direction: column; justify-content: center;"',
     'class="team-action-body"'),
    
    # Card 2
    ('style="background: #ffffff; border: 1px solid rgba(15, 23, 42, 0.12); border-radius: 20px; overflow: hidden; box-shadow: 0 12px 32px rgba(15, 23, 42, 0.08); display: flex; flex-direction: column;"',
     'class="team-action-card"'),
    ('style="padding: 24px 22px; background: #ffffff; flex: 1; display: flex; flex-direction: column; justify-content: center;"',
     'class="team-action-body"'),
    
    # Card 3
    ('style="background: #ffffff; border: 1px solid rgba(15, 23, 42, 0.12); border-radius: 20px; overflow: hidden; box-shadow: 0 12px 32px rgba(15, 23, 42, 0.08); display: flex; flex-direction: column;"',
     'class="team-action-card"'),
    ('style="padding: 24px 22px; background: #ffffff; flex: 1; display: flex; flex-direction: column; justify-content: center;"',
     'class="team-action-body"'),
    
    # Card 4
    ('style="background: #ffffff; border: 1px solid rgba(15, 23, 42, 0.12); border-radius: 20px; overflow: hidden; box-shadow: 0 12px 32px rgba(15, 23, 42, 0.08); display: flex; flex-direction: column;"',
     'class="team-action-card"'),
    ('style="padding: 24px 22px; background: #ffffff; flex: 1; display: flex; flex-direction: column; justify-content: center;"',
     'class="team-action-body"'),
    
    # Card 5
    ('style="background: #ffffff; border: 1px solid rgba(15, 23, 42, 0.12); border-radius: 20px; overflow: hidden; box-shadow: 0 12px 32px rgba(15, 23, 42, 0.08); display: flex; flex-direction: column;"',
     'class="team-action-card"'),
    ('style="padding: 24px 22px; background: #ffffff; flex: 1; display: flex; flex-direction: column; justify-content: center;"',
     'class="team-action-body"'),
    
    # Card 6
    ('style="background: #ffffff; border: 1px solid rgba(15, 23, 42, 0.12); border-radius: 20px; overflow: hidden; box-shadow: 0 12px 32px rgba(15, 23, 42, 0.08); display: flex; flex-direction: column;"',
     'class="team-action-card"'),
    ('style="padding: 24px 22px; background: #ffffff; flex: 1; display: flex; flex-direction: column; justify-content: center;"',
     'class="team-action-body"'),
]

for old, new in replacements:
    content = content.replace(old, new)

# Fix team action tags - they have hardcoded colors that should use CSS classes
tag_replacements = [
    ('style="position: absolute; top: 14px; left: 14px; background: rgba(15, 23, 42, 0.88); color: #fbbf24; border: 1px solid rgba(251, 191, 36, 0.4); font-size: 0.78rem; font-weight: 700; padding: 6px 14px; border-radius: 20px; backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);"',
     'class="team-action-tag"'),
    ('style="position: absolute; top: 14px; left: 14px; background: rgba(15, 23, 42, 0.88); color: #f59e0b; border: 1px solid rgba(245, 158, 11, 0.5); font-size: 0.78rem; font-weight: 700; padding: 6px 14px; border-radius: 20px; backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);"',
     'class="team-action-tag trophy-tag"'),
    ('style="position: absolute; top: 14px; left: 14px; background: rgba(15, 23, 42, 0.88); color: #38bdf8; border: 1px solid rgba(56, 189, 248, 0.5); font-size: 0.78rem; font-weight: 700; padding: 6px 14px; border-radius: 20px; backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);"',
     'class="team-action-tag"'),
    ('style="position: absolute; top: 14px; left: 14px; background: rgba(15, 23, 42, 0.88); color: #fbbf24; border: 1px solid rgba(251, 191, 36, 0.5); font-size: 0.78rem; font-weight: 700; padding: 6px 14px; border-radius: 20px; backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);"',
     'class="team-action-tag"'),
]

for old, new in tag_replacements:
    content = content.replace(old, new)

# Fix team showcase heading eyebrow
content = content.replace(
    'style="background: rgba(232, 160, 32, 0.12); color: #d97706; border: 1px solid rgba(232, 160, 32, 0.3); padding: 6px 18px; border-radius: 20px; font-weight: 800; font-size: 0.82rem; letter-spacing: 1px; display: inline-block; margin-bottom: 12px;"',
    'class="eyebrow"'
)

# Fix showcase gallery title
content = content.replace(
    'style="text-align: center; font-family: var(--font-display); font-size: 2rem; font-weight: 800; color: #212121; margin-bottom: 40px; letter-spacing: -0.02em;"',
    'class="showcase-gallery-title"'
)

# Fix tournament section eyebrow
content = content.replace(
    'style="max-width: 680px; margin: 0 auto;"',
    'style="max-width: 680px; margin: 0 auto; color: var(--text-secondary);"'
)

# Fix complaint-feedback section
content = content.replace(
    'style="background:var(--cream);"',
    'style="background: var(--cream);"'
)
content = content.replace(
    'style="background:var(--cream-dark); border:1px solid var(--border); border-radius:20px; padding:48px 40px; text-align:center; box-shadow:var(--shadow-lg);"',
    'class="complaint-card"'
)
content = content.replace(
    'style="background:var(--cream-dark); border:1px solid var(--border); border-radius:20px; padding:40px 32px; text-align:center; box-shadow:var(--shadow-lg);"',
    'class="register-card"'
)

# Fix why-choose section
content = content.replace(
    'style="background:var(--cream-dark);"',
    'style="background: var(--cream-dark);"'
)

# Fix register-student section
content = content.replace(
    'style="background:var(--cream);"',
    'style="background: var(--cream);"'
)

# Fix complaint-feedback label
content = content.replace(
    'style="background:var(--cream-dark);"',
    'style="background: var(--cream-dark);"'
)

with open(r'C:\Naveen\chesskidoo_website_cb\index.html', 'w', encoding='utf-8') as f:
    f.write(content)

print('Done')