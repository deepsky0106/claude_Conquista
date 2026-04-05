// DOGWALKPOOPOO — Beauty Curation Platform
// app.js — Core application logic

const App = {
  data: {
    team: null,
    posts: null,
  },

  async init() {
    await this.loadData();
    this.initNav();
    this.render();
  },

  async loadData() {
    try {
      const [teamRes, postsRes] = await Promise.all([
        fetch('./data/team.json'),
        fetch('./data/posts.json'),
      ]);
      this.data.team = await teamRes.json();
      this.data.posts = await postsRes.json();
    } catch (e) {
      console.warn('Data load failed, using inline data.');
    }
  },

  initNav() {
    const nav = document.querySelector('nav');
    if (!nav) return;

    window.addEventListener('scroll', () => {
      if (window.scrollY > 40) {
        nav.classList.add('scrolled');
      } else {
        nav.classList.remove('scrolled');
      }
    });

    // Mark active nav link
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-links a').forEach(link => {
      const href = link.getAttribute('href');
      if (href === currentPage || (currentPage === '' && href === 'index.html')) {
        link.classList.add('active');
      }
    });
  },

  render() {
    const page = document.body.dataset.page;
    if (page === 'home') this.renderHome();
    if (page === 'team') this.renderTeam();
    if (page === 'post') this.renderPost();
  },

  // ─── HOME ──────────────────────────────────────────────

  renderHome() {
    if (!this.data.posts) return;

    const posts = this.data.posts.posts;
    const published = posts.filter(p => p.status === 'published');
    const featured = published.find(p => p.featured);
    const rest = published.filter(p => !p.featured);

    const grid = document.getElementById('posts-grid');
    if (!grid) return;

    if (featured) {
      grid.insertAdjacentHTML('afterbegin', this.buildPostCard(featured, true));
    }
    rest.forEach(p => {
      grid.insertAdjacentHTML('beforeend', this.buildPostCard(p, false));
    });

    // Category filter
    this.initCategoryFilter(published);

    // Stats
    const team = this.data.team;
    if (team) {
      const editorCount = team.categories.reduce((n, c) => n + c.editors.length, 0);
      const statsEl = document.getElementById('hero-stats');
      if (statsEl) {
        statsEl.innerHTML = `
          <div class="hero-stat">
            <span class="hero-stat-number">${team.categories.length}</span>
            <span class="hero-stat-label">Categories</span>
          </div>
          <div class="hero-stat">
            <span class="hero-stat-number">${editorCount}</span>
            <span class="hero-stat-label">Editors</span>
          </div>
          <div class="hero-stat">
            <span class="hero-stat-number">${published.length}</span>
            <span class="hero-stat-label">Published</span>
          </div>
        `;
      }
    }
  },

  buildPostCard(post, featured = false) {
    const categoryName = this.getCategoryName(post.category);
    return `
      <article class="post-card${featured ? ' featured' : ''}" onclick="App.openPost('${post.id}')">
        <div class="post-card-image">
          <div class="post-card-image-placeholder">Image — ${categoryName}</div>
        </div>
        <div class="post-card-body">
          <span class="post-card-category">${categoryName}</span>
          <h2 class="post-card-title serif">${post.title}</h2>
          <p class="post-card-desc">${post.description}</p>
          <div class="post-card-footer">
            <span class="post-card-source">${post.source}</span>
            <span class="post-card-date">${this.formatDate(post.date)}</span>
          </div>
        </div>
      </article>
    `;
  },

  initCategoryFilter(posts) {
    const bar = document.getElementById('categories-bar');
    if (!bar || !this.data.team) return;

    const categories = ['all', ...this.data.team.categories.map(c => c.id)];
    const labels = { all: 'All' };
    this.data.team.categories.forEach(c => {
      labels[c.id] = c.nameEn;
    });

    bar.innerHTML = categories.map(id => `
      <button class="category-tab${id === 'all' ? ' active' : ''}"
              data-category="${id}">
        ${labels[id]}
      </button>
    `).join('');

    bar.querySelectorAll('.category-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        bar.querySelectorAll('.category-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        this.filterPosts(tab.dataset.category, posts);
      });
    });
  },

  filterPosts(category, posts) {
    const grid = document.getElementById('posts-grid');
    if (!grid) return;
    grid.innerHTML = '';

    const filtered = category === 'all'
      ? posts
      : posts.filter(p => p.category === category);

    const featured = filtered.find(p => p.featured);
    const rest = filtered.filter(p => !p.featured);

    if (featured) grid.insertAdjacentHTML('afterbegin', this.buildPostCard(featured, true));
    rest.forEach(p => grid.insertAdjacentHTML('beforeend', this.buildPostCard(p, false)));

    if (filtered.length === 0) {
      grid.innerHTML = `<p style="color:var(--text-muted);font-size:0.85rem;padding:3rem 0;">No posts in this category yet.</p>`;
    }
  },

  openPost(id) {
    window.location.href = `post.html?id=${id}`;
  },

  // ─── TEAM ──────────────────────────────────────────────

  renderTeam() {
    if (!this.data.team) return;
    const { headEditor, categories } = this.data.team;

    // Head editor
    const headEl = document.getElementById('head-editor');
    if (headEl) {
      headEl.innerHTML = `
        <div class="head-editor-card">
          <div class="head-editor-badge">
            <div class="head-editor-badge-inner">HEAD<br>EDITOR</div>
          </div>
          <div>
            <div class="head-editor-role">${headEditor.roleEn}</div>
            <div class="head-editor-name serif">${headEditor.placeholder ? 'Open Position' : headEditor.name}</div>
            <p class="head-editor-bio">${headEditor.bioEn}</p>
            ${headEditor.placeholder ? '<span class="open-badge">Recruiting</span>' : ''}
          </div>
        </div>
      `;
    }

    // Category editors
    const gridEl = document.getElementById('category-editors-grid');
    if (gridEl) {
      gridEl.innerHTML = categories.map(cat => {
        const editor = cat.editors[0];
        return `
          <div class="category-editor-card">
            <div class="category-dot" style="background:${cat.color}"></div>
            <div class="category-editor-category">${cat.nameEn}</div>
            <div class="category-editor-name serif">${editor.placeholder ? 'Open Position' : editor.name}</div>
            <p class="category-editor-desc">${cat.descriptionEn}</p>
            ${editor.placeholder ? '<span class="open-badge">Recruiting</span>' : ''}
          </div>
        `;
      }).join('');
    }
  },

  // ─── POST DETAIL ───────────────────────────────────────

  renderPost() {
    if (!this.data.posts) return;
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    const post = this.data.posts.posts.find(p => p.id === id);
    if (!post) return;

    document.title = `${post.title} — DOGWALKPOOPOO`;

    const categoryName = this.getCategoryName(post.category);

    const el = document.getElementById('post-content');
    if (!el) return;

    el.innerHTML = `
      <div class="post-detail-hero container">
        <div class="post-detail-category">${categoryName}</div>
        <h1 class="post-detail-title serif">${post.title}</h1>
        <p class="post-detail-source">${post.source}</p>
      </div>
      <div class="post-detail-image container">
        Image placeholder — ${categoryName}
      </div>
      <div class="post-detail-body container">
        <div class="post-detail-text">
          <p>${post.description}</p>
          <p class="text-secondary">${post.descriptionEn}</p>
        </div>
        <aside class="post-detail-sidebar">
          <div class="sidebar-label">Category</div>
          <div class="sidebar-value">${categoryName}</div>
          <div class="sidebar-label">Source</div>
          <div class="sidebar-value">${post.source}</div>
          <div class="sidebar-label">Published</div>
          <div class="sidebar-value">${this.formatDate(post.date)}</div>
          <div class="sidebar-label">Tags</div>
          <div>${post.tags.map(t => `<span class="tag">${t}</span>`).join('')}</div>
        </aside>
      </div>
    `;
  },

  // ─── HELPERS ───────────────────────────────────────────

  getCategoryName(id) {
    if (!this.data.team) return id;
    const cat = this.data.team.categories.find(c => c.id === id);
    return cat ? cat.nameEn : id;
  },

  formatDate(dateStr) {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  },
};

document.addEventListener('DOMContentLoaded', () => App.init());
