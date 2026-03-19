/**
 * Authenticated fetch wrapper.
 * Reads the JWT token from localStorage (set by TokenHandler from CRM shell)
 * and attaches it as Authorization: Bearer header on every request.
 */
import { getStoredToken, requestTokenRefreshFromParent } from './tokenBridge';

export async function authFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
    const executeRequest = async (token: string | null) => {
        const headers = new Headers(init?.headers || {});
        if (token) {
            headers.set('Authorization', `Bearer ${token}`);
        } else {
            headers.delete('Authorization');
        }

        return fetch(input, {
            ...init,
            headers,
        });
    };

    const initialToken = getStoredToken();
    let response = await executeRequest(initialToken);

    if (response.status === 401) {
        console.warn('[Auth] Received 401, requesting fresh token from CRM parent');
        const refreshedToken = await requestTokenRefreshFromParent('auth_fetch_401');

        if (refreshedToken) {
            response = await executeRequest(refreshedToken);
        }
    }

    if (response.status === 401) {
        console.error('[Auth] Session expired — showing modal');
        window.dispatchEvent(new CustomEvent('session-expired'));
    }

    return response;
}
