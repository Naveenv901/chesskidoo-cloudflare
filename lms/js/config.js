/**
 * Cloudflare-native configuration with Supabase fallback.
 * The Supabase anon key is public by design and safe in client code.
 */

window.SUPABASE_URL = 'https://vseombfkrvpffnpgbsnk.supabase.co';
window.SUPABASE_ANON_KEY = 'sb_publishable_DADHCm1eB-nASpQfSi5zvA_2rMZxCJT';
window.API_BASE = '/api';

let authToken = null;

function getAuthHeaders() {
  const headers = { 'Content-Type': 'application/json' };
  if (authToken) headers['Authorization'] = `Bearer ${authToken}`;
  return headers;
}

async function apiRequest(path, options = {}) {
  const res = await fetch(`${window.API_BASE}${path}`, {
    ...options,
    headers: { ...getAuthHeaders(), ...options.headers }
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    return { data: null, error: { message: data.error || res.statusText, code: res.status } };
  }
  return { data: data.data || data, error: null };
}

function setAuthToken(token) {
  authToken = token;
}

function getAuthToken() {
  return authToken;
}

// Supabase-compatible client
window.supabaseClient = {
  from(table) {
    let filters = [];
    let sortField = null;
    let sortOrder = 'asc';
    let limitVal = null;
    let cols = '*';

    const buildQuery = () => {
      const params = new URLSearchParams();
      params.set('table', table);
      params.set('op', 'select');
      params.set('cols', cols);
      for (const f of filters) {
        params.set(`filter_${f.op}_${f.field}`, typeof f.value === 'object' ? JSON.stringify(f.value) : f.value);
      }
      if (sortField) {
        params.set('sort', sortField);
        params.set('order', sortOrder);
      }
      if (limitVal) params.set('limit', limitVal);
      return params.toString();
    };

    return {
      select(c) { cols = c; return this; },
      eq(f, v) { filters.push({ op: 'eq', field: f, value: v }); return this; },
      neq(f, v) { filters.push({ op: 'neq', field: f, value: v }); return this; },
      ilike(f, v) { filters.push({ op: 'ilike', field: f, value: v }); return this; },
      in(f, v) { filters.push({ op: 'in', field: f, value: Array.isArray(v) ? v.join(',') : v }); return this; },
      order(f, opts = {}) { sortField = f; sortOrder = opts.ascending === false ? 'desc' : 'asc'; return this; },
      limit(n) { limitVal = n; return this; },
      single() {
        return this.then(result => {
          if (result.error) return result;
          const arr = Array.isArray(result.data) ? result.data : [result.data];
          return { data: arr[0] || null, error: arr[0] ? null : { message: 'No rows found' } };
        });
      },
      async then(resolve) {
        const qs = buildQuery();
        const result = await apiRequest(`/query?${qs}`);
        return resolve(result);
      },
      async insert(data) {
        const result = await apiRequest('/mutate', {
          method: 'POST',
          body: JSON.stringify({ table, op: 'insert', data })
        });
        return result;
      },
      async update(data) {
        const result = await apiRequest('/mutate', {
          method: 'POST',
          body: JSON.stringify({ table, op: 'update', data })
        });
        return result;
      },
      async delete() {
        const id = filters.find(f => f.field === 'id')?.value;
        const result = await apiRequest('/mutate', {
          method: 'POST',
          body: JSON.stringify({ table, op: 'delete', data: { id } })
        });
        return result;
      },
      async upsert(data) {
        const result = await apiRequest('/mutate', {
          method: 'POST',
          body: JSON.stringify({ table, op: 'upsert', data })
        });
        return result;
      }
    };
  },

  auth: {
    async getUser() {
      const result = await apiRequest('/auth/me');
      return { data: { user: result.data?.user || null }, error: result.error };
    },
    async signInWithPassword({ email, password }) {
      const result = await apiRequest('/auth/signin', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });
      if (result.error) return { data: null, error: result.error };
      authToken = result.data?.token;
      return { data: { user: { email: result.data.user, id: result.data.userid }, session: { access_token: result.data.token } }, error: null };
    },
    async signOut() {
      await apiRequest('/auth/logout', { method: 'POST' });
      authToken = null;
      return { error: null };
    }
  },

  storage: {
    from(bucket) {
      return {
        async upload(path, file) {
          const formData = new FormData();
          formData.append('file', file);
          formData.append('path', path);
          const res = await fetch(`/api/storage/upload?bucket=${bucket}`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${authToken || ''}` },
            body: formData
          });
          const data = await res.json();
          return { data: data.data, error: data.error ? { message: data.error } : null };
        },
        getPublicUrl(path) {
          return { data: { publicUrl: `/api/storage/${bucket}/${path}` } };
        }
      };
    }
  }
};

// Initialize with stored token
const stored = localStorage.getItem('ck_token');
if (stored) setAuthToken(stored);
