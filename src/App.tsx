import { useEffect } from 'react';
import { QuoteBuilderPage } from './pages/QuoteBuilderPage';
import { QuotesListPage } from './pages/QuotesListPage';

// Capture auth token from URL (passed by CRM shell) and persist it
function useTokenHandler() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    if (token) {
      console.log('[TokenHandler] Token received from CRM, saving to localStorage');
      localStorage.setItem('token', token);
    }
  }, []);
}

export default function App() {
  useTokenHandler();

  const path = window.location.pathname;
  
  if (path === '/quotes' || path === '/list') {
    return <QuotesListPage />;
  }
  
  return <QuoteBuilderPage />;
}
