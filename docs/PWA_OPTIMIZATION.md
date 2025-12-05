# 🚀 Otimização PWA - DigestAI

## Checklist de Performance

### ✅ Implementado

- [x] Service Worker com Workbox
- [x] Manifest.json configurado
- [x] Ícones em múltiplos tamanhos
- [x] Meta tags PWA
- [x] Cache strategy (NetworkFirst + CacheFirst)
- [x] Offline fallback
- [x] Auto-update prompt
- [x] Install prompt customizado

### 🔄 Próximas Melhorias

- [ ] Code splitting para reduzir bundle inicial
- [ ] Lazy loading de rotas
- [ ] Otimização de imagens (WebP)
- [ ] Preload de recursos críticos
- [ ] Push notifications
- [ ] Background sync
- [ ] Share API

## 📊 Métricas Atuais

```
Bundle Size: ~708 KB (205 KB gzipped)
Precache: 16 arquivos (~1.9 MB)
```

## 🎯 Otimizações Recomendadas

### 1. Code Splitting

Adicionar no `vite.config.ts`:

```typescript
build: {
  rollupOptions: {
    output: {
      manualChunks: {
        'react-vendor': ['react', 'react-dom', 'react-router-dom'],
        'ui-vendor': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
        'supabase': ['@supabase/supabase-js'],
        'charts': ['recharts'],
      }
    }
  }
}
```

### 2. Lazy Loading de Rotas

```typescript
// Ao invés de:
import Dashboard from './pages/Dashboard';

// Use:
const Dashboard = lazy(() => import('./pages/Dashboard'));
```

### 3. Otimização de Imagens

Converter imagens para WebP:

```bash
# Instalar sharp
npm install -D sharp

# Converter imagens
npx sharp -i public/icon-site2.png -o public/icon-site2.webp
```

### 4. Preload de Recursos Críticos

Adicionar no `index.html`:

```html
<link rel="preload" href="/icon-site2.png" as="image">
<link rel="preconnect" href="https://tsttphdoxjtdgqlrzlto.supabase.co">
```

### 5. Push Notifications

```typescript
// Solicitar permissão
const permission = await Notification.requestPermission();

if (permission === 'granted') {
  // Registrar push subscription
  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: 'sua-vapid-key'
  });
}
```

### 6. Background Sync

Adicionar no `vite.config.ts`:

```typescript
workbox: {
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/.*\.supabase\.co\/.*\/symptoms$/,
      handler: 'NetworkOnly',
      options: {
        backgroundSync: {
          name: 'symptoms-queue',
          options: {
            maxRetentionTime: 24 * 60 // 24 horas
          }
        }
      }
    }
  ]
}
```

## 📱 Testes

### Lighthouse Audit

```bash
# Instalar Lighthouse
npm install -g lighthouse

# Rodar audit
lighthouse https://digestai.produtohub.store --view
```

### PWA Checklist

Verificar em: https://www.pwabuilder.com/

### Teste Offline

1. Abrir DevTools
2. Application → Service Workers
3. Marcar "Offline"
4. Recarregar página

## 🔍 Monitoramento

### Service Worker Status

```javascript
// Verificar status do SW
navigator.serviceWorker.getRegistration().then(reg => {
  console.log('SW Status:', reg?.active?.state);
});
```

### Cache Size

```javascript
// Verificar tamanho do cache
caches.keys().then(keys => {
  keys.forEach(async key => {
    const cache = await caches.open(key);
    const requests = await cache.keys();
    console.log(`Cache ${key}: ${requests.length} items`);
  });
});
```

## 🎨 Customização

### Splash Screen (iOS)

Adicionar no `index.html`:

```html
<link rel="apple-touch-startup-image" href="/splash-640x1136.png" media="(device-width: 320px) and (device-height: 568px)">
<link rel="apple-touch-startup-image" href="/splash-750x1334.png" media="(device-width: 375px) and (device-height: 667px)">
```

### Theme Color Dinâmico

```typescript
// Mudar cor do tema dinamicamente
const metaThemeColor = document.querySelector('meta[name="theme-color"]');
metaThemeColor?.setAttribute('content', '#09C400');
```

## 📈 Métricas de Sucesso

- **Install Rate**: % de usuários que instalam o PWA
- **Retention**: % de usuários que voltam após instalar
- **Offline Usage**: % de sessões offline
- **Update Rate**: % de usuários que atualizam

## 🔗 Recursos

- [PWA Checklist](https://web.dev/pwa-checklist/)
- [Workbox Docs](https://developers.google.com/web/tools/workbox)
- [Web.dev PWA](https://web.dev/progressive-web-apps/)
- [MDN PWA Guide](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)
