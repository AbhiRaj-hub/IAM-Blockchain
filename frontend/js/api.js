/**
 * api.js - Centralized HTTP client for backend REST API calls
 */

const API_BASE_URL = window.location.origin.includes('localhost') || window.location.origin.includes('127.0.0.1')
  ? (window.location.port === '5000' ? '' : 'http://localhost:5000')
  : '';

/**
 * Universal Fetch wrapper with automatic JWT authorization header injection
 */
async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem('sih_token');
  const headers = {
    ...options.headers,
  };

  // Add token if user is authenticated
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Set default JSON Content-Type unless payload is FormData (for file uploads)
  if (!(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const config = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data = await response.json().catch(() => ({}));

    if (response.status === 401 && !endpoint.includes('/api/auth/login')) {
      console.warn('[API] Token expired or unauthorized. Redirecting to login.');
      localStorage.removeItem('sih_token');
      localStorage.removeItem('sih_user');
      if (!window.location.pathname.endsWith('login.html') && !window.location.pathname.endsWith('index.html')) {
        window.location.href = 'login.html';
      }
    }

    return {
      status: response.status,
      ok: response.ok,
      data,
    };
  } catch (error) {
    console.error(`[API Error on ${endpoint}]:`, error);
    return {
      status: 0,
      ok: false,
      data: { success: false, message: 'Network error or backend service unreachable.' },
    };
  }
}
