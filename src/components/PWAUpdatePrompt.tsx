import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, X, WifiOff } from 'lucide-react';

export const PWAUpdatePrompt = () => {
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

  if (!offlineReady && !needRefresh) return null;

  return (
    <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-5">
      <div className="bg-card border border-border rounded-lg shadow-lg p-4 max-w-sm relative">
        <button
          onClick={closePrompt}
          className="absolute top-2 right-2 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Fechar"
        >
          <X className="h-4 w-4" />
        </button>

        {offlineReady && !needRefresh && (
          <div className="flex items-start gap-3 pr-6">
            <div className="bg-green-100 dark:bg-green-900/20 p-2 rounded-lg">
              <WifiOff className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h3 className="font-semibold text-sm mb-1">App pronto para uso offline</h3>
              <p className="text-xs text-muted-foreground">
                O DigestAI agora funciona mesmo sem internet!
              </p>
            </div>
          </div>
        )}

        {needRefresh && (
          <div className="flex items-start gap-3 pr-6">
            <div className="bg-blue-100 dark:bg-blue-900/20 p-2 rounded-lg">
              <RefreshCw className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-sm mb-1">Nova versão disponível</h3>
              <p className="text-xs text-muted-foreground mb-3">
                Atualize para ter acesso às últimas melhorias
              </p>
              <Button
                onClick={updateApp}
                size="sm"
                className="w-full"
              >
                Atualizar Agora
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
