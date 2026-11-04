import re
with open('assets/js/admin.js', 'r', encoding='utf-8') as f:
    js = f.read()

old_fetch = "const { data } = await SB().from('meetings').select('*').order('meeting_time', { ascending: true }).limit(10);"
new_fetch = """const { data, error } = await SB().from('meetings').select('*').order('meeting_time', { ascending: true }).limit(10);
      if (error && error.code === '42P01') {
        box.innerHTML = '<p style="text-align:center;color:red;opacity:0.8;">Meetings table missing. Please run setup_meetings.sql in Supabase.</p>';
        return;
      }"""

js = js.replace(old_fetch, new_fetch)
with open('assets/js/admin.js', 'w', encoding='utf-8') as f:
    f.write(js)
