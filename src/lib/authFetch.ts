/**
 * Authenticated fetch wrapper.
 * Reads the JWT token from localStorage (set by TokenHandler from CRM shell)
 * and attaches it as Authorization: Bearer header on every request.
 */
export function authFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
    const token = localStorage.getItem('token');
    const headers = new Headers(init?.headers || {});

    if (token) {
        headers.set('Authorization', `Bearer ${token}`);
    }

    return fetch(input, {
        ...init,
        headers,
    });
}
