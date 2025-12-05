import { useEffect, useState } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';

export const usePWA = () => {
  const [needRefresh, setNeedRefresh] = useState(false);

  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefreshState, setNeedRefreshState],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      console.log('Service Worker registrado:', r);
    },
    onRegisterError(error) {
      console.error('Erro ao registrar Service Worker:', error);
    },
  });

  useEffect(() => {
    if (needRefreshState) {
      setNeedRefresh(true);
    }
  }, [needRefreshState]);

  const updateApp = () => {
    updateServiceWorker(true);
    setNeedRefresh(false);
  };

  const closePrompt = () => {
    setOfflineReady(false);
    setNeedRefreshState(false);
    setNeedRefresh(false);
  };

  return {
    offlineReady,
    needRefresh,
    updateApp,
    closePrompt,
  };
};
