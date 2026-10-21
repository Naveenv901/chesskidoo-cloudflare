/**
 * cloudflare-client.js
 * ---------------------------------------------------------------------------
 * A Supabase-compatible client backed entirely by ChessKidoo's own Cloudflare
 * API + D1 + R2. It exists so the ~200 existing `supabaseClient.from(...)`
 * call sites across the LMS and public portal keep working unchanged while
 * all data and files live on Cloudflare instead of Supabase.
 *
 * Supported surface (what the app actually uses):
 *   supabase.from(table).select(cols).eq(...).order(...).limit(...)
 *   supabase.from(table).insert(row) / .update(row) / .upsert(row) / .delete().eq(...)
 *   supabase.from(table).select(...).single() / .maybeSingle()
 *   supabase.storage.from(bucket).upload(path, file) / .getPublicUrl(p) / .remove([p])
 *   supabase.auth.getSession() / .signInWithPassword() / .signOut() / .getUser()
 *   supabase.channel(name).on('postgres_changes'|'broadcast', filter, cb).subscribe()
 *
 * Everything resolves to `{ data, error }` exactly like Supabase's client.
 */
(function () {
  'use strict';

  const API = '/api';

  // ── helpers ───────────────────────────────────────────────────────────────
  function readJSON(key) {
    try {
      return JSON.parse(
        sessionStorage.getItem(key) ||
        localStorage.getItem(key) ||
        '{}'
      ) || {};
    } catch (_) { return {}; }
  }

  function authHeaders(extra) {
    const tok = sessionStorage.getItem('sb-access-token') || localStorage.getItem('sb-access-token');
    const auth = readJSON('chesskidoo_auth') || readJSON('twoknights_auth');
    const h = { 'Content-Type': 'application/json' };
    if (tok && typeof tok === 'string' && tok.trim()) h['Authorization'] = 'Bearer ' + tok.trim();
    if (auth.role) h['x-portal-role'] = auth.role;
    if (auth.studentId) h['x-portal-student-id'] = auth.studentId;
    if (auth.coachId) h['x-portal-coach-id'] = auth.coachId;
    return Object.assign(h, extra || {});
  }

  async function req(path, options) {
    try {
      const res = await fetch(path, Object.assign({ headers: authHeaders() }, options));
      let body = null;
      const text = await res.text().catch(() => '');
      if (text) {
        try { body = JSON.parse(text); } catch (_) { body = text; }
      }
      if (!res.ok) {
        const msg = (body && body.error) || ('Request failed: ' + res.status);
        return { data: null, error: { message: msg, status: res.status } };
      }
      return { data: body, error: null };
    } catch (e) {
      return { data: null, error: { message: e.message || 'Network error' } };
    }
  }

  const FILTER_OPS = { eq: 'eq', neq: 'neq', gt: 'gt', gte: 'gte', lt: 'lt', lte: 'lte', like: 'like', ilike: 'ilike', is: 'is' };

  // ── query builder (thenable so `await` works) ─────────────────────────────
  class QueryBuilder {
    constructor(table, kind) {
      this._table = table;
      this._kind = kind || 'select';      // select | insert | update | upsert | delete
      this._cols = '*';
      this._filters = [];                 // {op, field, value}
      this._order = null;                 // {col, ascending}
      this._limit = null;
      this._single = null;                // null | 'single' | 'maybe'
      this._payload = null;
      this._executed = false;
      this._result = null;
    }

    select(cols) { this._cols = cols || '*'; this._kind = 'select'; return this; }
    insert(row) { this._kind = 'insert'; this._payload = Array.isArray(row) ? row[0] : row; return this; }
    update(row) { this._kind = 'update'; this._payload = row; return this; }
    upsert(row) { this._kind = 'upsert'; this._payload = Array.isArray(row) ? row[0] : row; return this; }
    delete() { this._kind = 'delete'; return this; }

    _addFilter(op, field, value) { this._filters.push({ op, field, value }); return this; }
    eq(f, v) { return this._addFilter('eq', f, v); }
    neq(f, v) { return this._addFilter('neq', f, v); }
    gt(f, v) { return this._addFilter('gt', f, v); }
    gte(f, v) { return this._addFilter('gte', f, v); }
    lt(f, v) { return this._addFilter('lt', f, v); }
    lte(f, v) { return this._addFilter('lte', f, v); }
    like(f, v) { return this._addFilter('like', f, v); }
    ilike(f, v) { return this._addFilter('ilike', f, v); }
    is(f, v) { return this._addFilter('is', f, v); }
    in(f, arr) { return this._addFilter('in', f, Array.isArray(arr) ? arr.join(',') : arr); }

    order(col, opts) {
      this._order = { col, ascending: !opts || opts.ascending !== false };
      return this;
    }
    limit(n) { this._limit = n; return this; }
    range(from, to) { this._limit = (to - from + 1); return this; }
    single() { this._single = 'single'; return this; }
    maybeSingle() { this._single = 'maybe'; return this; }

    // Make the builder awaitable
    then(resolve, reject) {
      if (!this._executed) {
        this._executed = true;
        this._result = this._run();
      }
      return Promise.resolve(this._result).then(resolve, reject);
    }
    catch (fn) { return Promise.resolve(this.then()).catch(fn); }

    async _run() {
      const t = this._table;

      // ── select ──
      if (this._kind === 'select') {
        const params = new URLSearchParams();
        params.set('table', t);
        params.set('op', 'select');
        params.set('cols', this._cols);
        for (const f of this._filters) {
          const op = FILTER_OPS[f.op];
          if (!op) continue;
          params.append('filter_' + op + '_' + f.field, f.value);
        }
        if (this._order) {
          params.set('sort', this._order.col);
          params.set('order', this._order.ascending ? 'asc' : 'desc');
        }
        if (this._limit) params.set('limit', String(this._limit));
        const out = await req(API + '/query?' + params.toString());
        if (out.error) return { data: null, error: out.error };
        let rows = Array.isArray(out.data) ? out.data : (out.data && out.data.data) || [];
        if (this._single === 'single' || this._single === 'maybe') {
          const first = rows.length ? rows[0] : null;
          if (this._single === 'single' && !first) {
            return { data: null, error: { message: 'No rows found' } };
          }
          return { data: first, error: null };
        }
        return { data: rows, error: null };
      }

      // ── mutations ──
      if (['insert', 'update', 'upsert', 'delete'].includes(this._kind)) {
        const payload = this._payload;
        // For update/delete the id usually comes from an .eq('id', ...) filter
        if ((this._kind === 'update' || this._kind === 'delete')) {
          const idFilter = this._filters.find(f => f.field === 'id');
          let row = payload;
          if (idFilter) row = Object.assign({}, payload || {}, { id: idFilter.value });
          if (!row || !row.id) {
            return { data: null, error: { message: 'An id is required for update/delete' } };
          }
          const out = await req(API + '/mutate', {
            method: 'POST',
            body: JSON.stringify({ table: t, op: this._kind, data: row })
          });
          if (out.error) return { data: null, error: out.error };
          return { data: (out.data && out.data.data) || out.data, error: null };
        }

        // insert / upsert
        const rowsArr = Array.isArray(payload) ? payload : [payload];
        const outData = [];
        for (const r of rowsArr) {
          const out = await req(API + '/mutate', {
            method: 'POST',
            body: JSON.stringify({ table: t, op: this._kind, data: r })
          });
          if (out.error) return { data: null, error: out.error };
          outData.push((out.data && out.data.data) || out.data);
        }
        return { data: Array.isArray(payload) ? outData : outData[0], error: null };
      }

      return { data: null, error: { message: 'Unsupported operation: ' + this._kind } };
    }
  }

  // ── storage (R2) ──────────────────────────────────────────────────────────
  class StorageBucket {
    constructor(name) { this.name = name; }

    // Supabase: storage.from(b).upload(path, file, opts) -> {data:{path}, error}
    async upload(path, file, opts) {
      try {
        let blob = file;
        if (!(file instanceof Blob) && file && typeof file === 'object' && 'arrayBuffer' in file) {
          blob = file;
        }
        if (typeof blob === 'string') blob = new Blob([blob]);
        const qs = path ? '?key=' + encodeURIComponent(this.name + '/' + path) : '';
        const res = await fetch(API + '/upload' + qs, {
          method: 'POST',
          headers: (function () {
            const h = {};
            const tok = sessionStorage.getItem('sb-access-token') || localStorage.getItem('sb-access-token');
            if (tok) h['Authorization'] = 'Bearer ' + tok;
            return h;
          })(),
          body: blob
        });
        const txt = await res.text().catch(() => '');
        let body = null;
        try { body = txt ? JSON.parse(txt) : {}; } catch (_) { body = {}; }
        if (!res.ok) return { data: null, error: { message: (body && body.error) || 'Upload failed' } };
        const d = body.data || body;
        return { data: { path: d.path || path, id: d.key || path, fullPath: (d.url || d.publicUrl) }, error: null };
      } catch (e) {
        return { data: null, error: { message: e.message || 'Upload failed' } };
      }
    }

    // Supabase: storage.from(b).getPublicUrl(path) -> {data:{publicUrl}}
    getPublicUrl(path) {
      if (!path) return { data: { publicUrl: '' } };
      if (/^https?:\/\//i.test(path)) return { data: { publicUrl: path } };
      return { data: { publicUrl: API + '/files/' + path } };
    }

    createSignedUrl(path) { return Promise.resolve(this.getPublicUrl(path)); }

    async remove(paths) {
      const list = Array.isArray(paths) ? paths : [paths];
      const out = [];
      for (const p of list) {
        const r = await req(API + '/upload?key=' + encodeURIComponent(this.name + '/' + p), { method: 'DELETE' });
        out.push(r);
      }
      return { data: out, error: null };
    }

    list() { return Promise.resolve({ data: [], error: null }); }
    download(path) {
      const url = this.getPublicUrl(path).data.publicUrl;
      return fetch(url).then(r => r.blob());
    }
  }

  class StorageClient {
    from(bucket) { return new StorageBucket(bucket); }
  }

  // ── auth (delegates to the existing Cloudflare auth API) ──────────────────
  const authClient = {
    async getSession() {
      const raw = sessionStorage.getItem('chesskidoo_auth') ||
                  sessionStorage.getItem('twoknights_auth') ||
                  localStorage.getItem('chesskidoo_auth') ||
                  localStorage.getItem('twoknights_auth');
      if (!raw) return { data: { session: null }, error: null };
      try {
        const a = JSON.parse(raw);
        const user = a ? { id: a.userId || a.coachId || a.studentId, email: a.user, role: a.role } : null;
        return { data: { session: a ? { user, access_token: a.token } : null }, error: null };
      } catch (_) {
        return { data: { session: null }, error: null };
      }
    },
    async getUser() {
      const s = await authClient.getSession();
      return { data: { user: s.data.session ? s.data.session.user : null }, error: null };
    },
    async signInWithPassword({ email, password }) {
      const out = await req(API + '/auth/signin', {
        method: 'POST',
        body: JSON.stringify({ username: email, password })
      });
      if (out.error || !out.data || out.data.success !== true) {
        return { data: { user: null, session: null }, error: out.error || { message: 'Invalid credentials' } };
      }
      const d = out.data;
      const authObj = {
        role: d.role, actualRole: d.role, user: d.user,
        studentId: d.userid, coachId: d.userid, userId: d.userid, token: d.token
      };
      const str = JSON.stringify(authObj);
      sessionStorage.setItem('chesskidoo_auth', str);
      localStorage.setItem('chesskidoo_auth', str);
      if (d.token) {
        sessionStorage.setItem('sb-access-token', d.token);
        localStorage.setItem('sb-access-token', d.token);
      }
      return { data: { user: { id: d.userid, email: d.user, role: d.role }, session: { access_token: d.token } }, error: null };
    },
    async signOut() {
      await req(API + '/auth/signout', { method: 'POST', body: JSON.stringify({}) });
      ['chesskidoo_auth', 'twoknights_auth', 'sb-access-token'].forEach(k => {
        sessionStorage.removeItem(k); localStorage.removeItem(k);
      });
      return { error: null };
    }
  };

  // ── realtime shim: polling (D1 has no push) ───────────────────────────────
  const _channels = new Map();
  const POLL_MS = 3000;

  class Channel {
    constructor(name) { this.name = name; this._subs = []; this._timer = null; this._snap = null; }

    on(type, filter, cb) {
      this._subs.push({ type, filter, cb });
      return this;
    }

    subscribe(cb) {
      if (this._timer) return this;
      const self = this;
      // Seed a snapshot so the first poll doesn't fire for pre-existing rows
      this._snapshot().then(() => {
        self._timer = setInterval(() => self._poll(), POLL_MS);
      });
      if (typeof cb === 'function') cb('SUBSCRIBED');
      return this;
    }

    async _snapshot() {
      const pgSubs = this._subs.filter(s => String(s.type).includes('postgres'));
      const tables = pgSubs.map(s => (s.filter && s.filter.table) || null).filter(Boolean);
      if (!tables.length) return;
      const parts = [];
      for (const t of tables) parts.push(t + ':' + (await _count(t)));
      this._snap = parts.join('|');
    }

    async _poll() {
      try {
        const now = await this._snapshot();
        const changed = now !== this._snap;
        this._snap = now;
        if (!changed) return;
        for (const s of this._subs) {
          const table = (s.filter && s.filter.table) || null;
          if (String(s.type).includes('postgres') && table) {
            try {
              const rows = await _select(table);
              s.cb({ eventType: 'CHANGE', table, new: { rows }, schema: 'public' });
            } catch (_) {}
          } else if (typeof s.cb === 'function') {
            s.cb({ eventType: 'CHANGE' });
          }
        }
      } catch (_) {}
    }

    unsubscribe() { this._stop(); return Promise.resolve('ok'); }
    _stop() { if (this._timer) { clearInterval(this._timer); this._timer = null; } }
  }

  async function _count(table) {
    const r = await req(API + '/query?table=' + encodeURIComponent(table) + '&op=select&cols=id&limit=1000');
    if (r.error) return '0';
    const rows = Array.isArray(r.data) ? r.data : (r.data && r.data.data) || [];
    return String(rows.length);
  }
  async function _select(table) {
    const r = await req(API + '/query?table=' + encodeURIComponent(table) + '&op=select&limit=200');
    if (r.error) return [];
    return Array.isArray(r.data) ? r.data : (r.data && r.data.data) || [];
  }

  function channel(name) {
    let ch = _channels.get(name);
    if (!ch) { ch = new Channel(name); _channels.set(name, ch); }
    return ch;
  }
  function removeChannel(name) {
    const ch = _channels.get(name);
    if (ch) ch._stop();
    _channels.delete(name);
  }
  function removeAllChannels() {
    _channels.forEach(ch => ch._stop());
    _channels.clear();
  }

  // ── the client ────────────────────────────────────────────────────────────
  const client = {
    from(table) { return new QueryBuilder(table, 'select'); },
    storage: new StorageClient(),
    auth: authClient,
    channel,
    removeChannel,
    removeAllChannels,
    rpc() { return Promise.resolve({ data: null, error: { message: 'rpc not supported on Cloudflare' } }); },
    __isCloudflareClient: true
  };

  // Supabase-style builder helpers attached as statics (used by some call sites)
  client.QueryBuilder = QueryBuilder;

  window.supabaseClient = client;
  window.cloudflareClient = client;
  window.__USING_CLOUDFLARE_CLIENT = true;

  // Stop every poller when the page goes away
  if (typeof window !== 'undefined') {
    window.addEventListener('beforeunload', removeAllChannels);
  }
})();
