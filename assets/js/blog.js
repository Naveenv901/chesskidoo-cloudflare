// Fallback content shown if the API is unavailable or has no posts yet.
const DEFAULT_BLOG_POSTS = [
  {
    id: 'post-1',
    title: '5 Benefits of Chess for Children',
    excerpt: 'Discover how chess improves cognitive skills, concentration, and academic performance in young learners.',
    date: 'March 15, 2026',
    author: 'Ranjith Kumar',
    image: '/assets/img/blog/chess-benefits.jpg'
  },
  {
    id: 'post-2',
    title: 'How to Introduce Chess to Your Kids',
    excerpt: 'A step-by-step guide for parents to introduce the game of chess to children of any age.',
    date: 'February 28, 2026',
    author: 'Arivuselvam',
    image: '/assets/img/blog/intro-to-chess.jpg'
  },
  {
    id: 'post-3',
    title: 'Understanding Chess Openings for Beginners',
    excerpt: 'Learn the most common opening principles and why they matter for new players.',
    date: 'January 20, 2026',
    author: 'Vishnu',
    image: '/assets/img/blog/openings.jpg'
  },
  {
    id: 'post-4',
    title: 'Top 10 Chess Tactics Every Student Should Know',
    excerpt: 'Essential tactical patterns that will help your child win more games and improve faster.',
    date: 'December 10, 2025',
    author: 'Rohith Selvaraj',
    image: '/assets/img/blog/tactics.jpg'
  },
  {
    id: 'post-5',
    title: 'The Role of FIDE Coaches in Student Development',
    excerpt: 'How our FIDE-certified coaches accelerate learning and help students reach their full potential.',
    date: 'November 5, 2025',
    author: 'Admin',
    image: '/assets/img/blog/fide-coaches.jpg'
  },
  {
    id: 'post-6',
    title: "Chess Tournament Preparation: A Parent's Guide",
    excerpt: 'Everything you need to know about preparing your child for their first chess tournament.',
    date: 'October 12, 2025',
    author: 'Admin',
    image: '/assets/img/blog/tournament-guide.jpg'
  }
];

let BLOG_POSTS = DEFAULT_BLOG_POSTS.slice();

async function loadBlogPosts() {
  try {
    // The admin portal exposes window.apiCall, but the public landing page does
    // not load that helper, so fall back to a plain fetch there.
    const request = typeof window.apiCall === 'function'
      ? window.apiCall
      : async (url) => {
          const response = await fetch(url, { headers: { Accept: 'application/json' } });
          if (!response.ok) throw new Error(`Failed to load blogs (${response.status})`);
          return response.json();
        };

    const res = await request('/api/blogs');
    // apiCall() returns a Response while the plain fetch fallback returns parsed JSON.
    const payload = res && typeof res.json === 'function' ? await res.json() : res;
    if (payload && Array.isArray(payload.data)) {
      BLOG_POSTS = payload.data.length
        ? payload.data.map(item => ({
            id: item.id,
            title: item.title,
            excerpt: item.excerpt || (item.content ? item.content.slice(0, 120) + '...' : ''),
            date: item.created_at ? item.created_at.split('T')[0] : (item.date || ''),
            author: item.author || 'Admin',
            image: item.image || item.img_url || '/assets/img/blog/chess-benefits.jpg',
            content: item.content || ''
          }))
        : DEFAULT_BLOG_POSTS.slice();
      window.BLOG_POSTS = BLOG_POSTS;
    }
  } catch (e) {
    console.warn('Failed to load blogs from API', e);
  }
}

// expose for other scripts
window.loadBlogPosts = loadBlogPosts;

// Reload blog data everywhere it is displayed (public grid + admin grid).
window.refreshAllBlogs = async function () {
  await loadBlogPosts();
  renderBlogPosts(BLOG_POSTS);
  if (typeof window.adminReload === 'function') {
    await window.adminReload();
  }
};


function escapeBlogHtml(value) {
  if (value === null || value === undefined) return '';
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function renderBlogPosts(posts) {
  const blogGrid = document.querySelector('.blog-grid');
  if (!blogGrid) return;
  // Render each post with read‑more/less toggle
  blogGrid.innerHTML = posts.map(post => `
    <div class="blog-card" style="animation: var(--aos-duration, 0.8s) ease-out both;">
      <img class="blog-image" src="${escapeBlogHtml(post.image)}" alt="${escapeBlogHtml(post.title)}" loading="lazy">
      <div class="blog-content">
        <div class="blog-meta">
          <span>${escapeBlogHtml(post.date)}</span>
          <span class="blog-author">${escapeBlogHtml(post.author)}</span>
        </div>
        <h3 class="blog-title">${escapeBlogHtml(post.title)}</h3>
        <p class="blog-excerpt">${escapeBlogHtml(post.excerpt)}</p>
        ${post.content ? '<p class="blog-full" style="display:none;">' + escapeBlogHtml(post.content) + '</p>' : ''}
        <a href="#" class="blog-read-more" data-id="${escapeBlogHtml(post.id)}">Read more →</a>
      </div>
    </div>`).join('');

  // Attach toggle handler
  blogGrid.querySelectorAll('.blog-read-more').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      const card = e.target.closest('.blog-card');
      const excerpt = card.querySelector('.blog-excerpt');
      const full = card.querySelector('.blog-full');
      if (!full) return;
      const showingFull = full.style.display !== 'none';
      excerpt.style.display = showingFull ? '' : 'none';
      full.style.display = showingFull ? 'none' : '';
      e.target.textContent = showingFull ? 'Read more →' : 'Read less ←';
    });
  });
}

window.renderBlogPosts = renderBlogPosts;
window.BLOG_POSTS = BLOG_POSTS;

document.addEventListener('DOMContentLoaded', async () => {
  await loadBlogPosts();
  renderBlogPosts(BLOG_POSTS);
});
