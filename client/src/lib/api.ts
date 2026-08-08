// ============================================
// BrandForge AI — API Client
// ============================================

export const getAuthToken = () => localStorage.getItem('brandforge_token');

export const setAuthToken = (token: string) => localStorage.setItem('brandforge_token', token);

export const removeAuthToken = () => localStorage.removeItem('brandforge_token');

export const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  const token = getAuthToken();
  const headers = new Headers(options.headers || {});
  
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  // Only set Content-Type if it's not FormData
  if (!(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(url, {
    ...options,
    headers
  });

  if (response.status === 401) {
    removeAuthToken();
    window.location.href = '/login';
  }

  return response;
};
