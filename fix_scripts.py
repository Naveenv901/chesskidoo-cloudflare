import re

f = 'C:/Naveen/chesskidoo_website_cb/lms/scripts.js'
s = open(f, encoding='latin-1').read()

# Fix the broken if statements
s = s.replace("if (window.supabaseClient) {\n                      window.supabaseClient.from('students').select('*'),",
              "window.supabaseClient.from('students').select('*'),")
s = s.replace("if (window.supabaseClient) {\n                      window.supabaseClient.from('batches').select('*'),",
              "window.supabaseClient.from('batches').select('*'),")
s = s.replace("if (window.supabaseClient) {\n                      window.supabaseClient.from('attendance').select('*'),",
              "window.supabaseClient.from('attendance').select('*'),")
s = s.replace("if (window.supabaseClient) {\n                      window.supabaseClient.from('homework_assignments').select('*'),",
              "window.supabaseClient.from('homework_assignments').select('*'),")
s = s.replace("if (!window.supabaseClient) {\n                supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);",
              "supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);")
s = s.replace("if (!window.supabaseClient) {\n                window.supabaseClient = supabaseClient;",
              "window.supabaseClient = supabaseClient;")

open(f, 'w', encoding='latin-1').write(s)
print('done')
