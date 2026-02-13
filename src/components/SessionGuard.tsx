import { useState, useEffect } from 'react';

const REFRESH_INTERVAL_MS = 45 * 60 * 1000; // 45 min — Supabase tokens expire at 60 min

/**
 * SessionGuard — handles two responsibilities:
 * 1. Auto-refreshes the JWT token from the CRM parent via postMessage every 45 min
 * 2. Shows a beautiful modal if a 401 is detected (session-expired event)
 */
export function SessionGuard() {
    const [expired, setExpired] = useState(false);

    useEffect(() => {
        // ── 1. Listen for session-expired events (fired by API interceptors on 401) ──
        const onExpired = () => setExpired(true);
        window.addEventListener('session-expired', onExpired);

        // ── 2. Auto-refresh: request fresh token from CRM parent periodically ──
        const interval = setInterval(() => {
            if (window.parent !== window) {
                window.parent.postMessage({ type: 'TOKEN_REFRESH_REQUEST' }, '*');
            }
        }, REFRESH_INTERVAL_MS);

        // ── 3. Listen for token refresh responses from CRM parent ──
        const onMessage = (e: MessageEvent) => {
            if (e.data?.type === 'TOKEN_REFRESH' && e.data.token) {
                console.log('[SessionGuard] Token auto-refreshed from CRM');
                localStorage.setItem('token', e.data.token);
            }
        };
        window.addEventListener('message', onMessage);

        return () => {
            window.removeEventListener('session-expired', onExpired);
            clearInterval(interval);
            window.removeEventListener('message', onMessage);
        };
    }, []);

    if (!expired) return null;

    return (
        <>
            <style>{`
                @keyframes sg-backdrop { from { opacity: 0; } to { opacity: 1; } }
                @keyframes sg-modal { from { opacity: 0; transform: scale(0.9) translateY(10px); } to { opacity: 1; transform: scale(1) translateY(0); } }
                @keyframes sg-pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.08); } }
            `}</style>
            <div
                className="fixed inset-0 z-[99999] flex items-center justify-center"
                style={{ animation: 'sg-backdrop 0.3s ease-out' }}
            >
                {/* Backdrop */}
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

                {/* Modal Card */}
                <div
                    className="relative bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full mx-4 text-center"
                    style={{ animation: 'sg-modal 0.4s ease-out' }}
                >
                    {/* Shield Icon */}
                    <div
                        className="mx-auto w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mb-5 border-4 border-amber-100"
                        style={{ animation: 'sg-pulse 2s ease-in-out infinite' }}
                    >
                        <svg className="w-10 h-10 text-amber-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                            <path d="M12 8v4" />
                            <circle cx="12" cy="16" r="0.5" fill="currentColor" />
                        </svg>
                    </div>

                    {/* Text */}
                    <h2 className="text-xl font-bold text-gray-900 mb-2">
                        Sesión expirada
                    </h2>
                    <p className="text-gray-500 text-sm mb-6 leading-relaxed">
                        Tu sesión de seguridad ha expirado.<br />
                        Recarga para continuar trabajando.
                    </p>

                    {/* Action Button */}
                    <button
                        onClick={() => window.location.reload()}
                        className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg shadow-blue-600/25 hover:shadow-blue-600/40"
                    >
                        🔄 Recargar página
                    </button>

                    <p className="text-xs text-gray-400 mt-4">
                        Esto no afecta tu trabajo guardado
                    </p>
                </div>
            </div>
        </>
    );
}
