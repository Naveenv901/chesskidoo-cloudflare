import re
with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

pricing_styles = """
<style>
  #pricing {
    background: #f8fafc;
    padding: 100px 0;
  }
  .pricing-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
    gap: 32px;
    max-width: 1200px;
    margin: 60px auto 0;
    padding: 0 20px;
  }
  .price-card {
    background: #fff;
    border-radius: 24px;
    padding: 48px 32px;
    border: 1px solid #e2e8f0;
    display: flex;
    flex-direction: column;
    position: relative;
    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    box-shadow: 0 10px 25px -5px rgba(0,0,0,0.05);
    text-align: left;
  }
  .price-card:hover {
    transform: translateY(-12px);
    box-shadow: 0 25px 50px -12px rgba(0,0,0,0.15);
  }
  .dark-card {
    background: #0f172a;
    color: #fff;
    border: none;
  }
  .gold-card {
    background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
    border: 2px solid #fbbf24;
    color: #fff;
    transform: scale(1.05);
    z-index: 10;
  }
  .price-rank {
    font-size: 0.75rem;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 1.5px;
    color: #fbbf24;
    margin-bottom: 16px;
  }
  .price-title {
    font-size: 2.2rem;
    font-weight: 800;
    margin-bottom: 12px;
    font-family: 'Playfair Display', serif;
  }
  .price-desc {
    font-size: 1rem;
    color: #94a3b8;
    margin-bottom: 32px;
    line-height: 1.6;
    min-height: 3em;
  }
  .price-amount {
    font-size: 3.5rem;
    font-weight: 800;
    margin-bottom: 32px;
    display: flex;
    align-items: baseline;
    gap: 4px;
    color: #fff;
  }
  .price-card:not(.dark-card):not(.gold-card) .price-amount {
    color: #0f172a;
  }
  .price-amount span {
    font-size: 1.25rem;
    font-weight: 500;
    opacity: 0.6;
  }
  .price-features {
    list-style: none;
    padding: 0;
    margin: 0 0 40px 0;
    flex-grow: 1;
  }
  .price-features li {
    margin-bottom: 18px;
    display: flex;
    align-items: flex-start;
    gap: 12px;
    font-size: 1rem;
    color: #94a3b8;
    line-height: 1.4;
  }
  .dark-card .price-features li, .gold-card .price-features li {
    color: #cbd5e1;
  }
  .price-features .check {
    color: #fbbf24;
    font-weight: bold;
    font-size: 1.2rem;
    line-height: 1;
  }
  .price-btn {
    width: 100%;
    padding: 18px;
    border-radius: 12px;
    font-weight: 800;
    font-size: 1rem;
    cursor: pointer;
    transition: 0.3s;
    border: none;
    text-transform: uppercase;
    letter-spacing: 1px;
    background: #0f172a;
    color: #fff;
  }
  .dark-card .price-btn {
    background: #fff;
    color: #0f172a;
  }
  .gold-card .price-btn {
    background: #fbbf24;
    color: #0f172a;
  }
  .price-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 20px -5px rgba(0,0,0,0.2);
  }
  .price-note {
    margin-top: 20px;
    font-size: 0.85rem;
    text-align: center;
    opacity: 0.6;
    color: #94a3b8;
  }
</style>
"""

if '<style>' not in html:
    # If no style tag in head, insert before pricing
    html = html.replace('<section id="pricing"', pricing_styles + '<section id="pricing"')
else:
    # Append to existing style tag
    html = html.replace('</style>', pricing_styles + '\n</style>')

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)
