import re

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

old_grid_pattern = r'<div class="coach-grid">[\s\S]*?</section>'

new_grid = """<div class="coach-grid" style="display:grid; grid-template-columns:repeat(auto-fit, minmax(220px, 1fr)); gap:20px; padding: 20px 0;">
          
          <div class="ck-card reveal" style="padding:0; overflow:hidden; border:1px solid #e0e0e0; border-radius:8px; background:#fff; text-align:center; position:relative; box-shadow:0 4px 15px rgba(0,0,0,0.05);">
            <span style="position:absolute; top:10px; right:10px; background:#000; color:#fff; font-size:0.75rem; padding:4px 12px; border-radius:15px; font-weight:600; z-index:2;">Advanced</span>
            <img src="assets/img/ranjith.jpeg" alt="Ranjith" style="width:100%; height:260px; object-fit:cover; object-position:center top; display:block; border-bottom:1px solid #eee;">
            <div style="padding:20px 15px;">
              <h5 style="color:#000; font-family:var(--font-display); font-weight:700; font-size:1.2rem; margin:0 0 10px 0;">Ranjith</h5>
              <p style="color:#666; font-size:0.9rem; margin:0; line-height:1.5;">FIDE-certified coach with 2 years of experience in training young talents.</p>
            </div>
          </div>

          <div class="ck-card reveal" style="padding:0; overflow:hidden; border:1px solid #e0e0e0; border-radius:8px; background:#fff; text-align:center; position:relative; box-shadow:0 4px 15px rgba(0,0,0,0.05); transition-delay:0.1s;">
            <span style="position:absolute; top:10px; right:10px; background:#000; color:#fff; font-size:0.75rem; padding:4px 12px; border-radius:15px; font-weight:600; z-index:2;">Intermediate</span>
            <img src="assets/img/vishnu.jpeg" alt="Vishnu" style="width:100%; height:260px; object-fit:cover; object-position:center top; display:block; border-bottom:1px solid #eee;">
            <div style="padding:20px 15px;">
              <h5 style="color:#000; font-family:var(--font-display); font-weight:700; font-size:1.2rem; margin:0 0 10px 0;">Vishnu</h5>
              <p style="color:#666; font-size:0.9rem; margin:0; line-height:1.5;">2 years of experience in Hindustan Incubation Chess Club.</p>
            </div>
          </div>

          <div class="ck-card reveal" style="padding:0; overflow:hidden; border:1px solid #e0e0e0; border-radius:8px; background:#fff; text-align:center; position:relative; box-shadow:0 4px 15px rgba(0,0,0,0.05); transition-delay:0.2s;">
            <span style="position:absolute; top:10px; right:10px; background:#000; color:#fff; font-size:0.75rem; padding:4px 12px; border-radius:15px; font-weight:600; z-index:2;">Intermediate</span>
            <img src="assets/img/rohith.jpeg" alt="Rohith Selvaraj" style="width:100%; height:260px; object-fit:cover; object-position:center top; display:block; border-bottom:1px solid #eee;">
            <div style="padding:20px 15px;">
              <h5 style="color:#000; font-family:var(--font-display); font-weight:700; font-size:1.2rem; margin:0 0 10px 0;">Rohith Selvaraj</h5>
              <p style="color:#666; font-size:0.9rem; margin:0; line-height:1.5;">FIDE-certified coach with 2 years of experience.</p>
            </div>
          </div>

          <div class="ck-card reveal" style="padding:0; overflow:hidden; border:1px solid #e0e0e0; border-radius:8px; background:#fff; text-align:center; position:relative; box-shadow:0 4px 15px rgba(0,0,0,0.05); transition-delay:0.3s;">
            <span style="position:absolute; top:10px; right:10px; background:#000; color:#fff; font-size:0.75rem; padding:4px 12px; border-radius:15px; font-weight:600; z-index:2;">Beginner, Intermediate</span>
            <img src="assets/img/gyansurya.jpeg" alt="Gyansurya" style="width:100%; height:260px; object-fit:cover; object-position:center top; display:block; border-bottom:1px solid #eee;">
            <div style="padding:20px 15px;">
              <h5 style="color:#000; font-family:var(--font-display); font-weight:700; font-size:1.2rem; margin:0 0 10px 0;">Gyansurya</h5>
              <p style="color:#666; font-size:0.9rem; margin:0; line-height:1.5;">Beginner coach of child specialist. AFM title player</p>
            </div>
          </div>

          <div class="ck-card reveal" style="padding:0; overflow:hidden; border:1px solid #e0e0e0; border-radius:8px; background:#fff; text-align:center; position:relative; box-shadow:0 4px 15px rgba(0,0,0,0.05); transition-delay:0.4s;">
            <span style="position:absolute; top:10px; right:10px; background:#000; color:#fff; font-size:0.75rem; padding:4px 12px; border-radius:15px; font-weight:600; z-index:2;">Beginner, Intermediate</span>
            <img src="assets/img/saran.jpeg" alt="Saran" style="width:100%; height:260px; object-fit:cover; object-position:center top; display:block; border-bottom:1px solid #eee;">
            <div style="padding:20px 15px;">
              <h5 style="color:#000; font-family:var(--font-display); font-weight:700; font-size:1.2rem; margin:0 0 10px 0;">Saran</h5>
              <p style="color:#666; font-size:0.9rem; margin:0; line-height:1.5;">Beginner coach of child specialist.</p>
            </div>
          </div>

          <div class="ck-card reveal" style="padding:0; overflow:hidden; border:1px solid #e0e0e0; border-radius:8px; background:#fff; text-align:center; position:relative; box-shadow:0 4px 15px rgba(0,0,0,0.05); transition-delay:0.5s;">
            <span style="position:absolute; top:10px; right:10px; background:#000; color:#fff; font-size:0.75rem; padding:4px 12px; border-radius:15px; font-weight:600; z-index:2;">Intermediate</span>
            <img src="assets/img/yogesh.png" alt="Yogesh" style="width:100%; height:260px; object-fit:cover; object-position:center top; display:block; border-bottom:1px solid #eee;">
            <div style="padding:20px 15px;">
              <h5 style="color:#000; font-family:var(--font-display); font-weight:700; font-size:1.2rem; margin:0 0 10px 0;">Yogesh</h5>
              <p style="color:#666; font-size:0.9rem; margin:0; line-height:1.5;">Anna University Player Team of South, Sri Eshwar College of Engineering</p>
            </div>
          </div>

          <div class="ck-card reveal" style="padding:0; overflow:hidden; border:1px solid #e0e0e0; border-radius:8px; background:#fff; text-align:center; position:relative; box-shadow:0 4px 15px rgba(0,0,0,0.05); transition-delay:0.6s;">
            <span style="position:absolute; top:10px; right:10px; background:#000; color:#fff; font-size:0.75rem; padding:4px 12px; border-radius:15px; font-weight:600; z-index:2;">Beginner</span>
            <img src="assets/img/haris.png" alt="Haris" style="width:100%; height:260px; object-fit:cover; object-position:center top; display:block; border-bottom:1px solid #eee;">
            <div style="padding:20px 15px;">
              <h5 style="color:#000; font-family:var(--font-display); font-weight:700; font-size:1.2rem; margin:0 0 10px 0;">Haris</h5>
              <p style="color:#666; font-size:0.9rem; margin:0; line-height:1.5;">Psychology of Chess, Student Chess Council</p>
            </div>
          </div>

        </div>
      </section>"""

html = re.sub(old_grid_pattern, new_grid, html)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)
