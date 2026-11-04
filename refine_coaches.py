import re

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Replace the entire coach grid with a perfectly tuned version
old_grid_pattern = r'<div class="coach-grid" style="display:grid;[\s\S]*?</div>\n      </section>'

new_grid = """<div class="coach-grid" style="display:grid; grid-template-columns:repeat(auto-fit, minmax(240px, 1fr)); gap:20px; padding: 20px 0;">
          
          <!-- Ranjith -->
          <div class="reveal" style="background:#fff; border:1px solid #e2e8f0; border-radius:12px; overflow:hidden; position:relative; transition:transform 0.3s ease; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
            <div style="position:absolute; top:12px; right:12px; background:#000; color:#fff; font-size:0.7rem; padding:4px 10px; border-radius:20px; font-weight:700; z-index:10; letter-spacing:0.5px;">Advanced</div>
            <div style="height:320px; overflow:hidden; background:#f8fafc;">
              <img src="assets/img/ranjith.jpeg" alt="Ranjith" style="width:100%; height:100%; object-fit:cover; object-position:center 10%; display:block;">
            </div>
            <div style="padding:24px 16px; text-align:center;">
              <h5 style="color:#0f172a; font-family:var(--font-display); font-weight:800; font-size:1.25rem; margin:0 0 8px 0; letter-spacing:-0.02em;">Ranjith</h5>
              <p style="color:#64748b; font-size:0.9rem; margin:0; line-height:1.6; font-weight:500;">FIDE-certified coach with 2 years of experience in training young talents.</p>
            </div>
          </div>

          <!-- Vishnu -->
          <div class="reveal" style="background:#fff; border:1px solid #e2e8f0; border-radius:12px; overflow:hidden; position:relative; transition:transform 0.3s ease; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); transition-delay:0.1s;">
            <div style="position:absolute; top:12px; right:12px; background:#000; color:#fff; font-size:0.7rem; padding:4px 10px; border-radius:20px; font-weight:700; z-index:10; letter-spacing:0.5px;">Intermediate</div>
            <div style="height:320px; overflow:hidden; background:#f8fafc;">
              <img src="assets/img/vishnu.jpeg" alt="Vishnu" style="width:100%; height:100%; object-fit:cover; object-position:center 10%; display:block;">
            </div>
            <div style="padding:24px 16px; text-align:center;">
              <h5 style="color:#0f172a; font-family:var(--font-display); font-weight:800; font-size:1.25rem; margin:0 0 8px 0; letter-spacing:-0.02em;">Vishnu</h5>
              <p style="color:#64748b; font-size:0.9rem; margin:0; line-height:1.6; font-weight:500;">2 years of experience in Hindustan Incubation Chess Club.</p>
            </div>
          </div>

          <!-- Rohith -->
          <div class="reveal" style="background:#fff; border:1px solid #e2e8f0; border-radius:12px; overflow:hidden; position:relative; transition:transform 0.3s ease; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); transition-delay:0.2s;">
            <div style="position:absolute; top:12px; right:12px; background:#000; color:#fff; font-size:0.7rem; padding:4px 10px; border-radius:20px; font-weight:700; z-index:10; letter-spacing:0.5px;">Intermediate</div>
            <div style="height:320px; overflow:hidden; background:#f8fafc;">
              <img src="assets/img/rohith.jpeg" alt="Rohith Selvaraj" style="width:100%; height:100%; object-fit:cover; object-position:center 10%; display:block;">
            </div>
            <div style="padding:24px 16px; text-align:center;">
              <h5 style="color:#0f172a; font-family:var(--font-display); font-weight:800; font-size:1.25rem; margin:0 0 8px 0; letter-spacing:-0.02em;">Rohith Selvaraj</h5>
              <p style="color:#64748b; font-size:0.9rem; margin:0; line-height:1.6; font-weight:500;">FIDE-certified coach with 2 years of experience.</p>
            </div>
          </div>

          <!-- Gyansurya -->
          <div class="reveal" style="background:#fff; border:1px solid #e2e8f0; border-radius:12px; overflow:hidden; position:relative; transition:transform 0.3s ease; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); transition-delay:0.3s;">
            <div style="position:absolute; top:12px; right:12px; background:#000; color:#fff; font-size:0.7rem; padding:4px 10px; border-radius:20px; font-weight:700; z-index:10; letter-spacing:0.5px;">Beginner, Intermediate</div>
            <div style="height:320px; overflow:hidden; background:#f8fafc;">
              <img src="assets/img/gyansurya.jpeg" alt="Gyansurya" style="width:100%; height:100%; object-fit:cover; object-position:center 10%; display:block;">
            </div>
            <div style="padding:24px 16px; text-align:center;">
              <h5 style="color:#0f172a; font-family:var(--font-display); font-weight:800; font-size:1.25rem; margin:0 0 8px 0; letter-spacing:-0.02em;">Gyansurya</h5>
              <p style="color:#64748b; font-size:0.9rem; margin:0; line-height:1.6; font-weight:500;">Beginner coach of child specialist. AFM title player</p>
            </div>
          </div>

          <!-- Saran -->
          <div class="reveal" style="background:#fff; border:1px solid #e2e8f0; border-radius:12px; overflow:hidden; position:relative; transition:transform 0.3s ease; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); transition-delay:0.4s;">
            <div style="position:absolute; top:12px; right:12px; background:#000; color:#fff; font-size:0.7rem; padding:4px 10px; border-radius:20px; font-weight:700; z-index:10; letter-spacing:0.5px;">Beginner, Intermediate</div>
            <div style="height:320px; overflow:hidden; background:#f8fafc;">
              <img src="assets/img/saran.jpeg" alt="Saran" style="width:100%; height:100%; object-fit:cover; object-position:center 10%; display:block;">
            </div>
            <div style="padding:24px 16px; text-align:center;">
              <h5 style="color:#0f172a; font-family:var(--font-display); font-weight:800; font-size:1.25rem; margin:0 0 8px 0; letter-spacing:-0.02em;">Saran</h5>
              <p style="color:#64748b; font-size:0.9rem; margin:0; line-height:1.6; font-weight:500;">Beginner coach of child specialist.</p>
            </div>
          </div>

          <!-- Yogesh -->
          <div class="reveal" style="background:#fff; border:1px solid #e2e8f0; border-radius:12px; overflow:hidden; position:relative; transition:transform 0.3s ease; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); transition-delay:0.5s;">
            <div style="position:absolute; top:12px; right:12px; background:#000; color:#fff; font-size:0.7rem; padding:4px 10px; border-radius:20px; font-weight:700; z-index:10; letter-spacing:0.5px;">Intermediate</div>
            <div style="height:320px; overflow:hidden; background:#f8fafc;">
              <img src="assets/img/yogesh.png" alt="Yogesh" style="width:100%; height:100%; object-fit:cover; object-position:center 10%; display:block;">
            </div>
            <div style="padding:24px 16px; text-align:center;">
              <h5 style="color:#0f172a; font-family:var(--font-display); font-weight:800; font-size:1.25rem; margin:0 0 8px 0; letter-spacing:-0.02em;">Yogesh</h5>
              <p style="color:#64748b; font-size:0.9rem; margin:0; line-height:1.6; font-weight:500;">Anna University Player Team of South, Sri Eshwar College of Engineering</p>
            </div>
          </div>

          <!-- Haris -->
          <div class="reveal" style="background:#fff; border:1px solid #e2e8f0; border-radius:12px; overflow:hidden; position:relative; transition:transform 0.3s ease; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); transition-delay:0.6s;">
            <div style="position:absolute; top:12px; right:12px; background:#000; color:#fff; font-size:0.7rem; padding:4px 10px; border-radius:20px; font-weight:700; z-index:10; letter-spacing:0.5px;">Beginner</div>
            <div style="height:320px; overflow:hidden; background:#f8fafc;">
              <img src="assets/img/haris.png" alt="Haris" style="width:100%; height:100%; object-fit:cover; object-position:center 10%; display:block;">
            </div>
            <div style="padding:24px 16px; text-align:center;">
              <h5 style="color:#0f172a; font-family:var(--font-display); font-weight:800; font-size:1.25rem; margin:0 0 8px 0; letter-spacing:-0.02em;">Haris</h5>
              <p style="color:#64748b; font-size:0.9rem; margin:0; line-height:1.6; font-weight:500;">Psychology of Chess, Student Chess Council</p>
            </div>
          </div>

        </div>
      </section>"""

html = re.sub(old_grid_pattern, new_grid, html)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)
