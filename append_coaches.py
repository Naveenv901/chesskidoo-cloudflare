import re
with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

new_coaches = """          <div class="coach-card reveal" style="transition-delay:0.4s;">
            <div class="coach-img-wrap" style="background-image: url('https://hcjuyqicftkgpiyrkscr.supabase.co/storage/v1/object/public/Images/saran.jpg');">
              <div class="coach-rating-badge">Youth Expert</div>
            </div>
            <div class="coach-info">
              <div class="coach-role">Beginner & Intermediate</div>
              <h5 class="coach-name">♘ Saran</h5>
              <p class="coach-bio">Dedicated beginner specialist with a talent for keeping young students engaged and motivated.</p>
            </div>
          </div>
          <div class="coach-card reveal" style="transition-delay:0.5s;">
            <div class="coach-img-wrap" style="background-image: url('https://hcjuyqicftkgpiyrkscr.supabase.co/storage/v1/object/public/Images/yogesh.jpg');">
              <div class="coach-rating-badge">Head Coach</div>
            </div>
            <div class="coach-info">
              <div class="coach-role">Intermediate</div>
              <h5 class="coach-name">♙ Yogesh</h5>
              <p class="coach-bio">Anna University South Zone representative and Sri Eshwar College of Engineering player.</p>
            </div>
          </div>
          <div class="coach-card reveal" style="transition-delay:0.6s;">
            <div class="coach-img-wrap" style="background-image: url('https://hcjuyqicftkgpiyrkscr.supabase.co/storage/v1/object/public/Images/haris.jpg');">
              <div class="coach-rating-badge">Psychologist</div>
            </div>
            <div class="coach-info">
              <div class="coach-role">Beginner</div>
              <h5 class="coach-name">♚ Haris</h5>
              <p class="coach-bio">Chess psychology specialist - building mental strength and resilience alongside chess skills.</p>
            </div>
          </div>
        </div>"""

html = html.replace('        </div>\n      </section>\n\n      <!-- Reviews -->', new_coaches + '\n      </section>\n\n      <!-- Reviews -->')

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)
