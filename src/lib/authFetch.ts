/**
 * Authenticated fetch wrapper.
 * Reads the JWT token from localStorage (set by TokenHandler from CRM shell)
 * and attaches it as Authorization: Bearer header on every request.
 */
export async function authFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
    const token = localStorage.getItem('token');
    const headers = new Headers(init?.headers || {});

    if (token) {
        headers.set('Authorization', `Bearer ${token}`);
    }

    const response = await fetch(input, {
        ...init,
        headers,
    });

    // If backend returns 401, trigger the session-expired modal
    if (response.status === 401) {
        console.error('[Auth] Session expired — showing modal');
        window.dispatchEvent(new CustomEvent('session-expired'));
    }

    return response;
}
