import re
with open('assets/js/main.js', 'r', encoding='utf-8') as f:
    js = f.read()

old_submit = r"const \{ error \} = await window\.supabaseClient\.from\('leads'\)\.insert\(\{[\s\S]*?\}\);"
new_submit = """const { error } = await window.supabaseClient.from('leads').insert({
        name: form.fullName.value,
        phone: form.phone.value,
        parent_name: form.fullName.value,
        child_age: form.age.value,
        city: form.city.value,
        status: 'new',
        created_at: new Date().toISOString()
      });"""

js = re.sub(old_submit, new_submit, js)
with open('assets/js/main.js', 'w', encoding='utf-8') as f:
    f.write(js)
