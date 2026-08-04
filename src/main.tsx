import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { ErrorBoundary } from './components/common/ErrorBoundary.tsx';
import './index.css';

// Ensure any service workers are completely unregistered and caches cleared safely
if (typeof window !== 'undefined') {
  try {
    if ('serviceWorker' in navigator && navigator.serviceWorker) {
      navigator.serviceWorker
        .getRegistrations()
        .then((registrations) => {
          for (const registration of registrations) {
            registration.unregister().catch(() => {});
          }
        })
        .catch(() => {});
    }
  } catch (e) {
    console.warn('Service worker cleanup skipped:', e);
  }

  try {
    if ('caches' in window && window.caches) {
      caches.keys()
        .then((names) => {
          for (const name of names) {
            caches.delete(name).catch(() => {});
          }
        })
        .catch(() => {});
    }
  } catch (e) {
    console.warn('Cache cleanup skipped:', e);
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);


