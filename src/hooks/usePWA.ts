import { useEffect, useState } from 'react';

export const usePWA = () => {
  const [offlineReady, setOfflineReady] = useState(false);
  const [needRefresh, setNeedRefresh] = useState(false);

  useEffect(() => {
    // Registrar service worker manualmente
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').then(
        (registration) => {
          console.log('Service Worker registrado:', registration);
          setOfflineReady(true);

          // Verificar atualizações
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  setNeedRefresh(true);
                }
              });
            }
          });
        },
        (error) => {
          console.error('Erro ao registrar Service Worker:', error);
        }
      );
    }
  }, []);

  const updateApp = () => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistration().then((registration) => {
        registration?.waiting?.postMessage({ type: 'SKIP_WAITING' });
        window.location.reload();
      });
    }
    setNeedRefresh(false);
  };

  const closePrompt = () => {
    setOfflineReady(false);
    setNeedRefresh(false);
  };

  return {
    offlineReady,
    needRefresh,
    updateApp,
    closePrompt,
  };
};
