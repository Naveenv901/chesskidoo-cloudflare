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

// NOTE: The Supabase-compatible client is provided by lms/js/cloudflare-client.js
// (loaded before this file) and is backed by Cloudflare D1 + R2. Do not
// re-declare window.supabaseClient here or it will clobber the full client.
if (window.supabaseClient) {
  // Adopt the Cloudflare client installed by cloudflare-client.js.
}

// Initialize with stored token
const stored = localStorage.getItem('ck_token');
if (stored) setAuthToken(stored);
