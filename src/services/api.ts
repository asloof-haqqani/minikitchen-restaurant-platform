const apiBaseUrl = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');

export function apiUrl(path: string): string {
  return `${apiBaseUrl}${path.startsWith('/') ? path : `/${path}`}`;
}

export function adminFetch(input: string, init: RequestInit = {}): Promise<Response> {
  const headers = new Headers(init.headers);
  const token = localStorage.getItem('mk_admin_token');
  if (token) headers.set('Authorization', `Bearer ${token}`);
  return fetch(apiUrl(input), { ...init, headers }).then((response) => {
    if (response.status === 401 && token) {
      localStorage.removeItem('mk_admin_token');
      localStorage.removeItem('mk_admin_user');
      window.dispatchEvent(new Event('mk-admin-session-expired'));
    }
    return response;
  });
}
