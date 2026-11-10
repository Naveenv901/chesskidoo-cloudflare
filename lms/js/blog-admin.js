/**
 * Blog Management Module for ChessKidoo Admin Portal
 * Handles CRUD operations, local storage fallback, and synchronization with /api/blogs
 * Updated to persist image URLs and refresh landing page after CRUD
 */

(function () {
  'use strict';

  const STATIC_BLOG_POSTS = [
    {
      id: 'post-1',
      title: '5 Benefits of Chess for Children',
      excerpt: 'Discover how chess improves cognitive skills, concentration, and academic performance in young learners.',
      content: 'Chess helps children develop critical thinking, pattern recognition, patience, and spatial reasoning. Studies show chess players excel in problem solving and math.',
      author: 'Ranjith Kumar',
      date: '2026-03-15',
      image: '/assets/img/blog/chess-benefits.jpg'
    },
    {
      id: 'post-2',
      title: 'How to Introduce Chess to Your Kids',
      excerpt: 'A step-by-step guide for parents to introduce the game of chess to children of any age.',
      content: 'Start with piece movements one by one, use mini-games (pawns only, knight tour), keep sessions short and fun, and celebrate curiosity over winning.',
      author: 'Arivuselvam',
      date: '2026-02-28',
      image: '/assets/img/blog/intro-to-chess.jpg'
    },
    {
      id: 'post-3',
      title: 'Understanding Chess Openings for Beginners',
      excerpt: 'Learn the most common opening principles and why they matter for new players.',
      content: 'Control the center, develop minor pieces (knights before bishops), castle early for king safety, and avoid moving the same piece twice in the opening.',
      author: 'Vishnu',
      date: '2026-01-20',
      image: '/assets/img/blog/openings.jpg'
    },
    {
      id: 'post-4',
      title: 'Top 10 Chess Tactics Every Student Should Know',
      excerpt: 'Essential tactical patterns that will help your child win more games and improve faster.',
      content: 'Forks, pins, skewers, discovered attacks, and double checks are the building blocks of tactics that turn equal games into quick victories.',
      author: 'Rohith Selvaraj',
      date: '2025-12-10',
      image: '/assets/img/blog/tactics.jpg'
    },
    {
      id: 'post-5',
      title: 'The Role of FIDE Coaches in Student Development',
      excerpt: 'How our FIDE-certified coaches accelerate learning and help students reach their full potential.',
      content: 'Personalized guidance from FIDE-rated trainers ensures correct habits, psychological resilience under pressure, and systematic preparation for tournaments.',
      author: 'Admin',
      date: '2025-11-05',
      image: '/assets/img/blog/fide-coaches.jpg'
    },
    {
      id: 'post-6',
      title: "Chess Tournament Preparation: A Parent's Guide",
      excerpt: 'Everything you need to know about preparing your child for their first chess tournament.',
      content: 'Pack healthy snacks, maintain regular sleep schedules, arrive 30 minutes before round 1, and emphasize learning and sportsmanship over result.',
      author: 'Admin',
      date: '2025-10-12',
      image: '/assets/img/blog/tournament-guide.jpg'
    }
  ];

  let adminBlogPosts = [];

  // Seed or load blogs
  async function loadBlogPosts() {
    const loadingEl = document.getElementById('blog-admin-loading');
    if (loadingEl) loadingEl.style.display = 'block';

    try {
      if (typeof window.apiCall === 'function') {
        const response = await window.apiCall('/api/blogs');
        // apiCall() resolves with a Response, so parse it before reading data.
        const res = response && typeof response.json === 'function' ? await response.json() : response;
        if (res && res.data && Array.isArray(res.data) && res.data.length > 0) {
          adminBlogPosts = res.data.map(item => ({
            id: item.id,
            title: item.title,
            excerpt: item.excerpt || (item.content ? item.content.slice(0, 120) + '...' : ''),
            content: item.content || '',
            author: item.author || 'Admin',
            date: item.created_at ? item.created_at.split('T')[0] : (item.date || '2026-03-15'),
            image: item.image || item.img_url || '/assets/img/blog/chess-benefits.jpg'
          }));
        } else {
          // If remote DB is empty, seed with STATIC_BLOG_POSTS
          await seedStaticPosts();
        }
      } else {
        fallbackToLocalStorage();
      }
    } catch (err) {
      console.warn('[Blog] Remote load failed, falling back to local data:', err);
      fallbackToLocalStorage();
    } finally {
      if (loadingEl) loadingEl.style.display = 'none';
      renderAdminBlog();
    }
  }

  function fallbackToLocalStorage() {
    const cached = localStorage.getItem('ck_blog_posts');
    if (cached) {
      try {
        adminBlogPosts = JSON.parse(cached);
      } catch (e) {
        adminBlogPosts = [...STATIC_BLOG_POSTS];
      }
    } else {
      adminBlogPosts = [...STATIC_BLOG_POSTS];
      localStorage.setItem('ck_blog_posts', JSON.stringify(adminBlogPosts));
    }
  }

  async function seedStaticPosts() {
    adminBlogPosts = [...STATIC_BLOG_POSTS];
    localStorage.setItem('ck_blog_posts', JSON.stringify(adminBlogPosts));

    // Try background insertion into DB
    for (const p of STATIC_BLOG_POSTS) {
      try {
        await window.apiCall('/api/blogs', {
          method: 'POST',
          body: JSON.stringify({
            id: p.id,
            title: p.title,
            excerpt: p.excerpt,
            content: p.content,
            author: p.author,
            image: p.image,
            created_at: p.date ? new Date(p.date).toISOString() : new Date().toISOString()
          })
        });
      } catch (e) {
        // Continue silently if offline
      }
    }
  }

  function renderAdminBlog() {
    const grid = document.getElementById('blog-admin-grid');
    if (!grid) return;

    if (!adminBlogPosts || adminBlogPosts.length === 0) {
      grid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align:center; padding: 48px 20px; background:var(--surface, #1e293b); border-radius:12px; border:1px dashed var(--border, rgba(255,255,255,0.1));">
          <div style="font-size:3rem; margin-bottom:12px;">📰</div>
          <h3 style="color:var(--gold, #d4af37); margin:0 0 8px 0;">No Blog Posts Found</h3>
          <p style="color:var(--ivory-dim, #94a3b8); margin-bottom:16px;">Get started by creating your first chess article or guide.</p>
          <button class="btn btn-gold" onclick="openBlogModal()">Create Post</button>
        </div>
      `;
      return;
    }

    grid.innerHTML = adminBlogPosts.map(post => `
      <div class="card" style="padding:0; overflow:hidden; display:flex; flex-direction:column; background:var(--surface, #1e293b); border:1px solid var(--border, rgba(255,255,255,0.1)); border-radius:12px; transition:transform 0.2s ease, box-shadow 0.2s ease;">
        <div style="height:160px; overflow:hidden; background:rgba(0,0,0,0.2); position:relative;">
          <img src="${post.image}" alt="${escapeHtml(post.title)}" style="width:100%; height:100%; object-fit:cover;" onerror="this.onerror=null; this.src='/assets/img/cert-logo.png';">
          <span style="position:absolute; top:12px; right:12px; background:rgba(0,0,0,0.7); backdrop-filter:blur(4px); color:var(--gold, #d4af37); font-size:11px; font-weight:700; padding:4px 10px; border-radius:99px; border:1px solid rgba(218,163,62,0.3);">
            ${post.date}
          </span>
        </div>
        <div style="padding:20px; flex:1; display:flex; flex-direction:column;">
          <div style="font-size:12px; color:var(--gold, #d4af37); font-weight:600; text-transform:uppercase; letter-spacing:0.05em; margin-bottom:6px;">
            ✍️ ${escapeHtml(post.author || 'Admin')}
          </div>
          <h3 style="font-size:1.15rem; font-weight:700; color:var(--ivory, #fff); margin:0 0 10px 0; line-height:1.4;">
            ${escapeHtml(post.title)}
          </h3>
          <p style="font-size:0.875rem; color:var(--ivory-dim, #94a3b8); line-height:1.6; margin:0 0 20px 0; flex:1;">
            ${escapeHtml(post.excerpt || post.content || '')}
          </p>
          <div style="display:flex; gap:10px; border-top:1px solid var(--border, rgba(255,255,255,0.08)); padding-top:14px; margin-top:auto;">
            <button class="btn btn-outline" style="flex:1; padding:7px 12px; font-size:13px; display:inline-flex; align-items:center; justify-content:center; gap:6px;" onclick="editBlogPost('${post.id}')">
              <span>✏️</span> Edit
            </button>
            <button class="btn btn-outline" style="color:var(--danger, #ef4444); border-color:rgba(239,68,68,0.3); padding:7px 14px; font-size:13px; display:inline-flex; align-items:center; justify-content:center; gap:6px;" onclick="deleteBlogPost('${post.id}')" title="Delete Article">
              <span>🗑️</span>
            </button>
          </div>
        </div>
      </div>
    `).join('');
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  window.openBlogModal = function (id) {
    const idInput = document.getElementById('blog-id');
    const titleInput = document.getElementById('blog-title');
    const authorInput = document.getElementById('blog-author');
    const dateInput = document.getElementById('blog-date');
    const excerptInput = document.getElementById('blog-excerpt');
    const contentInput = document.getElementById('blog-content');
    const urlInput = document.getElementById('blog-img-url');
    const previewImg = document.getElementById('blog-img-preview');
    const fileInput = document.getElementById('blog-img-file');
    const modalTitle = document.getElementById('blog-modal-title');

    if (fileInput) fileInput.value = '';
    if (previewImg) { previewImg.src = ''; previewImg.style.display = 'none'; }

    if (id) {
      const p = adminBlogPosts.find(x => String(x.id) === String(id));
      if (p) {
        if (modalTitle) modalTitle.textContent = 'Edit Blog Post';
        if (idInput) idInput.value = p.id;
        if (titleInput) titleInput.value = p.title || '';
        if (authorInput) authorInput.value = p.author || '';
        if (dateInput) dateInput.value = p.date || '';
        if (excerptInput) excerptInput.value = p.excerpt || '';
        if (contentInput) contentInput.value = p.content || '';
        if (urlInput) urlInput.value = p.image || '';
        if (previewImg && p.image) {
          previewImg.src = p.image;
          previewImg.style.display = 'block';
        }
      }
    } else {
      if (modalTitle) modalTitle.textContent = 'New Blog Post';
      if (idInput) idInput.value = '';
      if (titleInput) titleInput.value = '';
      if (authorInput) authorInput.value = 'Ranjith Kumar';
      if (dateInput) dateInput.value = new Date().toISOString().split('T')[0];
      if (excerptInput) excerptInput.value = '';
      if (contentInput) contentInput.value = '';
      if (urlInput) urlInput.value = '/assets/img/blog/chess-benefits.jpg';
    }

    if (typeof window.openModal === 'function') {
      window.openModal('blog-modal');
    } else {
      const m = document.getElementById('blog-modal');
      if (m) m.classList.add('active');
    }
  };

  window.editBlogPost = function (id) {
    window.openBlogModal(id);
  };

  window.saveBlogPost = async function () {
    const id = document.getElementById('blog-id')?.value;
    const title = document.getElementById('blog-title')?.value.trim();
    const author = document.getElementById('blog-author')?.value.trim() || 'Admin';
    const date = document.getElementById('blog-date')?.value || new Date().toISOString().split('T')[0];
    const excerpt = document.getElementById('blog-excerpt')?.value.trim() || '';
    const content = document.getElementById('blog-content')?.value.trim() || '';
    const urlInput = document.getElementById('blog-img-url')?.value.trim();
    const fileInput = document.getElementById('blog-img-file');

    if (!title) {
      if (typeof window.toast === 'function') window.toast('Please enter a title', 'error');
      else alert('Please enter a title');
      return;
    }

    let imgUrl = urlInput || '/assets/img/blog/chess-benefits.jpg';
    if (fileInput && fileInput.files && fileInput.files[0]) {
      if (typeof window.uploadToImgbb === 'function') {
        if (typeof window.toast === 'function') window.toast('Uploading image...', 'info');
        try {
          const uploaded = await window.uploadToImgbb(fileInput.files[0]);
          if (uploaded) imgUrl = uploaded;
        } catch (e) {
          console.warn('[Blog] Image upload failed:', e);
          if (typeof window.toast === 'function') window.toast('Image upload failed: ' + (e?.message || 'unknown error'), 'error');
        }
      } else {
        console.warn('[Blog] window.uploadToImgbb is not defined; image will not be uploaded');
        if (typeof window.toast === 'function') window.toast('Image upload function not available', 'error');
      }
    }

    const postData = {
      id: id || `blog-${Date.now()}`,
      title,
      author,
      date,
      excerpt,
      content,
      image: imgUrl,
      img_url: imgUrl
    };

    // Save locally
    if (id) {
      const idx = adminBlogPosts.findIndex(x => String(x.id) === String(id));
      if (idx !== -1) adminBlogPosts[idx] = postData;
      else adminBlogPosts.unshift(postData);
    } else {
      adminBlogPosts.unshift(postData);
    }
    localStorage.setItem('ck_blog_posts', JSON.stringify(adminBlogPosts));

    // Save to remote API
    try {
      if (typeof window.apiCall === 'function') {
        let res;
        if (id) {
          res = await window.apiCall(`/api/blogs?id=${encodeURIComponent(id)}`, {
            method: 'PUT',
            body: JSON.stringify({
              title,
              excerpt,
              content: content || excerpt,
              author,
              image: imgUrl,
              img_url: imgUrl,
              created_at: date ? new Date(date).toISOString() : null
            })
          });
        } else {
          res = await window.apiCall('/api/blogs', {
            method: 'POST',
            body: JSON.stringify({
              id: postData.id,
              title,
              excerpt,
              content: content || excerpt,
              author,
              image: imgUrl,
              img_url: imgUrl,
              created_at: date ? new Date(date).toISOString() : new Date().toISOString()
            })
          });
        }
        if (!res.ok) {
          let errMsg = `Blog save failed (${res.status})`;
          try {
            const errBody = await res.json();
            if (errBody.error) errMsg = errBody.error;
          } catch (_) {}
          throw new Error(errMsg);
        }
      }
    } catch (e) {
      console.warn('[Blog] API call error:', e);
      if (typeof window.toast === 'function') window.toast(e.message || 'Failed to save blog post', 'error');
      return;
    }

    if (typeof window.closeModals === 'function') window.closeModals();
    else {
      const m = document.getElementById('blog-modal');
      if (m) m.classList.remove('active');
    }

    if (typeof window.toast === 'function') window.toast('Blog post published!', 'success');

    // Refresh both the public landing page grid and the admin grid without a reload.
    if (typeof window.refreshAllBlogs === 'function') {
      await window.refreshAllBlogs();
    } else {
      await loadBlogPosts();
      renderAdminBlog();
    }
  };

  window.deleteBlogPost = async function (id) {
    if (!confirm('Are you sure you want to delete this blog post?')) return;

    adminBlogPosts = adminBlogPosts.filter(x => String(x.id) !== String(id));
    localStorage.setItem('ck_blog_posts', JSON.stringify(adminBlogPosts));

    try {
      if (typeof window.apiCall === 'function') {
        await window.apiCall(`/api/blogs?id=${encodeURIComponent(id)}`, {
          method: 'DELETE'
        });
      }
    } catch (e) {
      console.warn('[Blog] Delete API failed:', e);
    }

    if (typeof window.toast === 'function') window.toast('Post deleted', 'info');
    if (typeof window.refreshAllBlogs === 'function') {
      await window.refreshAllBlogs();
    } else {
      await loadBlogPosts();
      renderAdminBlog();
    }
  };

  // Export renderAdminBlog globally
  window.renderAdminBlog = renderAdminBlog;
  if (typeof window.loadBlogPosts !== 'function') window.loadBlogPosts = loadBlogPosts;

  // Called by window.refreshAllBlogs() so the admin grid picks up saved changes too.
  window.adminReload = async function () {
    await loadBlogPosts();
    renderAdminBlog();
  };

  // Auto initialize when DOM is ready
  document.addEventListener('DOMContentLoaded', () => {
    loadBlogPosts();
  });
})();
