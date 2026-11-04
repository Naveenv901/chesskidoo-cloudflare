import { apiGet, apiPost, apiPut, apiPatch, apiDel } from '@lib/api.js';

const API = {
  async from(table) {
    return {
      select: (cols = '*') => API._query(table, 'select', cols),
      insert: (data) => API._mutate(table, 'insert', data),
      update: (data) => API._mutate(table, 'update', data),
      delete: () => API._mutate(table, 'delete'),
      upsert: (data) => API._mutate(table, 'upsert', data),
      eq: (field, value) => API._filter({ field, value, op: 'eq' }),
      neq: (field, value) => API._filter({ field, value, op: 'neq' }),
      ilike: (field, value) => API._filter({ field, value, op: 'ilike' }),
      in: (field, values) => API._filter({ field, value: values, op: 'in' }),
      order: (field, opts = {}) => API._sort(field, opts),
      limit: (n) => API._limit(n),
      single: async () => {
        const result = await API._exec();
        if (result.error) throw new Error(result.error);
        return result.data ? { data: result.data } : { data: null, error: { message: 'No rows found' } };
      }
    };
  },

  auth: {
    async getUser() {
      return apiGet('/auth/me');
    },
    async signInWithPassword({ email, password }) {
      const data = await apiPost('/auth/login', { email, password });
      return { data, error: data.success ? null : { message: data.error } };
    },
    async signOut() {
      await apiPost('/auth/logout');
      return { error: null };
    }
  },

  storage: {
    async from(bucket) {
      return {
        upload: async (path, file) => {
          const formData = new FormData();
          formData.append('file', file);
          formData.append('path', path);
          const res = await fetch(`/api/storage/upload?bucket=${bucket}`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${localStorage.getItem('ck_token') || ''}` },
            body: formData
          });
          return res.json();
        },
        getPublicUrl: (path) => ({ data: { publicUrl: `/api/storage/${bucket}/${path}` } })
      };
    }
  },

  _filters: [],
  _sortField: null,
  _sortAsc: true,
  _limitVal: null,

  _filter(f) {
    const clone = Object.create(API);
    clone._filters = [...API._filters, f];
    return clone;
  },

  _sort(field, opts) {
    const clone = Object.create(API);
    clone._filters = API._filters;
    clone._sortField = field;
    clone._sortAsc = opts.ascending !== false;
    return clone;
  },

  _limit(n) {
    const clone = Object.create(API);
    clone._filters = API._filters;
    clone._limitVal = n;
    return clone;
  },

  async _exec() {
    return { data: [], error: null };
  },

  async _query(table, op, cols) {
    const params = new URLSearchParams();
    params.set('table', table);
    params.set('op', op);
    params.set('cols', cols);

    for (const f of API._filters) {
      params.set(`filter_${f.op}_${f.field}`, f.value);
    }
    if (API._sortField) {
      params.set('sort', API._sortField);
      params.set('order', API._sortAsc ? 'asc' : 'desc');
    }
    if (API._limitVal) params.set('limit', API._limitVal);

    const res = await apiGet(`/query?${params.toString()}`);
    return {
      then: (resolve) => resolve({ data: res.data || [], error: res.error || null }),
      catch: () => ({ data: [], error: null })
    };
  },

  async _mutate(table, op, data) {
    const res = await apiPost('/mutate', { table, op, data });
    return { data: res.data, error: res.error || null };
  }
};

export function createClient(url, key) {
  console.log('[Compat] Cloudflare-native client initialized');
  return API;
}

export default { createClient };
