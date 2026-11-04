const BLOG_POSTS = [
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
    title: 'Chess Tournament Preparation: A Parent\'s Guide',
    excerpt: 'Everything you need to know about preparing your child for their first chess tournament.',
    date: 'October 12, 2025',
    author: 'Admin',
    image: '/assets/img/blog/tournament-guide.jpg'
  }
];

function renderBlogPosts(posts) {
  const grid = document.querySelector('.blog-grid');
  if (!grid) return;

  grid.innerHTML = posts.map(post => `
    <div class="blog-card" style="animation: var(--aos-duration, 0.8s) ease-out both;">
      <img class="blog-image" src="${post.image}" alt="${post.title}" loading="lazy">
      <div class="blog-content">
        <div class="blog-meta">
          <span>${post.date}</span>
          <span class="blog-author">${post.author}</span>
        </div>
        <h3 class="blog-title">${post.title}</h3>
        <p class="blog-excerpt">${post.excerpt}</p>
        <a href="#blog-post-${post.id}" class="blog-read-more">Read more →</a>
      </div>
    </div>
  `).join('');
}

document.addEventListener('DOMContentLoaded', () => {
  renderBlogPosts(BLOG_POSTS);
});