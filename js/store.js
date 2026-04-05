// UNLIT — Storage / API Abstraction Layer
// store.js — swap localStorage ↔ real API by changing one file

const Store = (() => {

  // ─── CONFIG ──────────────────────────────────────────────
  // Set USE_API = true and fill API_BASE when backend is ready
  const USE_API = false;
  const API_BASE = '/api'; // e.g. 'https://api.unlit.xyz'

  // ─── MOCK USERS (replace with real auth) ─────────────────
  const MOCK_USERS = [
    { id: 'head-01',  name: '편집장',      role: 'head',   category: null,              password: 'head0000' },
    { id: 'film-01',  name: 'Film Editor', role: 'editor', category: 'film',            password: 'film0000' },
    { id: 'art-01',   name: 'Art Editor',  role: 'editor', category: 'contemporary-art',password: 'art00000' },
    { id: 'arch-01',  name: 'Arch Editor', role: 'editor', category: 'architecture',    password: 'arch0000' },
    { id: 'obj-01',   name: 'Obj Editor',  role: 'editor', category: 'object',          password: 'obj00000' },
    { id: 'nat-01',   name: 'Nature Ed.',  role: 'editor', category: 'nature',          password: 'nat00000' },
    { id: 'snd-01',   name: 'Sound Ed.',   role: 'editor', category: 'sound',           password: 'snd00000' },
  ];

  // ─── LOCAL STORAGE HELPERS ───────────────────────────────
  const ls = {
    get: (key, fallback = null) => {
      try { return JSON.parse(localStorage.getItem(key)) ?? fallback; }
      catch { return fallback; }
    },
    set: (key, val) => localStorage.setItem(key, JSON.stringify(val)),
  };

  const getPosts = () => ls.get('unlit_posts', []);
  const setPosts = (posts) => ls.set('unlit_posts', posts);

  // ─── AUTH ─────────────────────────────────────────────────
  const Auth = {
    async login(id, password) {
      if (USE_API) {
        const res = await fetch(`${API_BASE}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id, password }),
        });
        if (!res.ok) throw new Error('Login failed');
        const user = await res.json();
        ls.set('unlit_session', user);
        return user;
      }
      // Local mock
      const user = MOCK_USERS.find(u => u.id === id && u.password === password);
      if (!user) throw new Error('Invalid credentials');
      const session = { ...user };
      delete session.password;
      ls.set('unlit_session', session);
      return session;
    },

    logout() {
      localStorage.removeItem('unlit_session');
    },

    getSession() {
      return ls.get('unlit_session');
    },

    requireSession(redirectTo = 'login.html') {
      const s = this.getSession();
      if (!s) { window.location.href = redirectTo; return null; }
      return s;
    },
  };

  // ─── POSTS ────────────────────────────────────────────────
  const Posts = {
    async getAll(filters = {}) {
      if (USE_API) {
        const q = new URLSearchParams(filters).toString();
        const res = await fetch(`${API_BASE}/posts?${q}`, { headers: _authHeader() });
        return res.json();
      }
      let posts = getPosts();
      if (filters.status) posts = posts.filter(p => p.status === filters.status);
      if (filters.editorId) posts = posts.filter(p => p.editorId === filters.editorId);
      if (filters.category) posts = posts.filter(p => p.category === filters.category);
      return posts;
    },

    async getById(id) {
      if (USE_API) {
        const res = await fetch(`${API_BASE}/posts/${id}`, { headers: _authHeader() });
        return res.json();
      }
      return getPosts().find(p => p.id === id) ?? null;
    },

    async create(data) {
      if (USE_API) {
        const res = await fetch(`${API_BASE}/posts`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ..._authHeader() },
          body: JSON.stringify(data),
        });
        return res.json();
      }
      const posts = getPosts();
      const post = {
        id: `p-${Date.now()}`,
        status: 'draft',
        featured: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...data,
      };
      posts.push(post);
      setPosts(posts);
      return post;
    },

    async update(id, data) {
      if (USE_API) {
        const res = await fetch(`${API_BASE}/posts/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', ..._authHeader() },
          body: JSON.stringify(data),
        });
        return res.json();
      }
      const posts = getPosts();
      const idx = posts.findIndex(p => p.id === id);
      if (idx === -1) throw new Error('Post not found');
      posts[idx] = { ...posts[idx], ...data, updatedAt: new Date().toISOString() };
      setPosts(posts);
      return posts[idx];
    },

    async delete(id) {
      if (USE_API) {
        await fetch(`${API_BASE}/posts/${id}`, {
          method: 'DELETE', headers: _authHeader(),
        });
        return;
      }
      setPosts(getPosts().filter(p => p.id !== id));
    },

    // Editor pitches post to head editor
    async pitch(id) {
      return Posts.update(id, { status: 'pitched' });
    },

    // Head editor approves
    async approve(id, note = '') {
      return Posts.update(id, { status: 'published', headNote: note, publishedAt: new Date().toISOString() });
    },

    // Head editor rejects with note
    async reject(id, note = '') {
      return Posts.update(id, { status: 'rejected', headNote: note });
    },

    // Head editor sends back for revision
    async revise(id, note = '') {
      return Posts.update(id, { status: 'revision', headNote: note });
    },
  };

  // ─── TEAM ─────────────────────────────────────────────────
  const Team = {
    async get() {
      if (USE_API) {
        const res = await fetch(`${API_BASE}/team`, { headers: _authHeader() });
        return res.json();
      }
      try {
        const res = await fetch('../data/team.json');
        return res.json();
      } catch {
        return null;
      }
    },
    getMockUsers: () => MOCK_USERS.map(u => { const c = {...u}; delete c.password; return c; }),
  };

  // ─── PRIVATE ──────────────────────────────────────────────
  function _authHeader() {
    const s = ls.get('unlit_session');
    return s ? { 'X-User-Id': s.id } : {};
  }

  return { Auth, Posts, Team };
})();
