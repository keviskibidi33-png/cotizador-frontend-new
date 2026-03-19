const TOKEN_STORAGE_KEY = 'token';
const TOKEN_REFRESH_TIMEOUT_MS = 5000;

let tokenRefreshRequestCounter = 0;

export function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null;
  const token = localStorage.getItem(TOKEN_STORAGE_KEY);
  return typeof token === 'string' && token.trim() ? token : null;
}

export function storeToken(token: string | null): void {
  if (typeof window === 'undefined') return;
  if (typeof token === 'string' && token.trim()) {
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
    return;
  }
  localStorage.removeItem(TOKEN_STORAGE_KEY);
}

export async function requestTokenRefreshFromParent(reason = 'generic'): Promise<string | null> {
  if (typeof window === 'undefined' || window.parent === window) return null;

  const requestId = `cotizador_${Date.now()}_${tokenRefreshRequestCounter++}`;

  return new Promise((resolve) => {
    let settled = false;

    const cleanup = (timeoutId: number, handler: (event: MessageEvent) => void) => {
      window.clearTimeout(timeoutId);
      window.removeEventListener('message', handler);
    };

    const timeoutId = window.setTimeout(() => {
      if (settled) return;
      settled = true;
      cleanup(timeoutId, onMessage);
      resolve(null);
    }, TOKEN_REFRESH_TIMEOUT_MS);

    const onMessage = (event: MessageEvent) => {
      if (event.data?.type !== 'TOKEN_REFRESH' || !event.data?.token) return;
      if (event.data?.requestId && event.data.requestId !== requestId) return;

      settled = true;
      cleanup(timeoutId, onMessage);
      storeToken(event.data.token);
      resolve(event.data.token);
    };

    window.addEventListener('message', onMessage);
    window.parent.postMessage(
      {
        type: 'TOKEN_REFRESH_REQUEST',
        requestId,
        reason,
        source: 'cotizador_web',
      },
      '*',
    );
  });
}
