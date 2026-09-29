import re

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

new_coaches_html = """          <div class="ck-card reveal" style="padding:0; overflow:hidden; border:1px solid #e0e0e0; border-radius:5px; background:#fff; text-align:center; position:relative;">
            <span style="position:absolute; top:10px; right:10px; background:#000; color:#fff; font-size:0.7rem; padding:4px 8px; border-radius:15px; font-weight:600;">Beginner, Intermediate</span>
            <img src="https://hcjuyqicftkgpiyrkscr.supabase.co/storage/v1/object/public/Images/saran.jpg" alt="Saran" style="width:100%; height:250px; object-fit:cover; display:block;">
            <div style="padding:20px 10px;">
              <h5 style="color:#000; font-size:1.1rem; margin:0 0 10px 0;">Saran</h5>
              <p style="color:#666; font-size:0.85rem; margin:0;">Beginner coach of child specialist.</p>
            </div>
          </div>

          <div class="ck-card reveal" style="padding:0; overflow:hidden; border:1px solid #e0e0e0; border-radius:5px; background:#fff; text-align:center; position:relative;">
            <span style="position:absolute; top:10px; right:10px; background:#000; color:#fff; font-size:0.7rem; padding:4px 8px; border-radius:15px; font-weight:600;">Intermediate</span>
            <img src="https://hcjuyqicftkgpiyrkscr.supabase.co/storage/v1/object/public/Images/yogesh.jpg" alt="Yogesh" style="width:100%; height:250px; object-fit:cover; display:block;">
            <div style="padding:20px 10px;">
              <h5 style="color:#000; font-size:1.1rem; margin:0 0 10px 0;">Yogesh</h5>
              <p style="color:#666; font-size:0.85rem; margin:0;">Anna University Player Team of South , Sri Eshwar College of Engineering</p>
            </div>
          </div>

          <div class="ck-card reveal" style="padding:0; overflow:hidden; border:1px solid #e0e0e0; border-radius:5px; background:#fff; text-align:center; position:relative;">
            <span style="position:absolute; top:10px; right:10px; background:#000; color:#fff; font-size:0.7rem; padding:4px 8px; border-radius:15px; font-weight:600;">Beginner</span>
            <img src="https://hcjuyqicftkgpiyrkscr.supabase.co/storage/v1/object/public/Images/haris.jpg" alt="Haris" style="width:100%; height:250px; object-fit:cover; display:block;">
            <div style="padding:20px 10px;">
              <h5 style="color:#000; font-size:1.1rem; margin:0 0 10px 0;">Haris</h5>
              <p style="color:#666; font-size:0.85rem; margin:0;">Psychology of Chess, Student Chess Council</p>
            </div>
          </div>

        </div>
      </section>"""

html = html.replace('        </div>\n      </section>\n\n      <!-- Certified Excellence Section -->', new_coaches_html + '\n\n      <!-- Certified Excellence Section -->')

# Update grid layout to wrap correctly
html = html.replace('grid-template-columns:repeat(4, 1fr)', 'grid-template-columns:repeat(auto-fit, minmax(220px, 1fr))')

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)
