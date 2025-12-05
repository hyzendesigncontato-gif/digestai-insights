# 📱 Guia PWA - DigestAI

## O que é PWA?

Progressive Web App (PWA) é uma tecnologia que permite que aplicações web funcionem como aplicativos nativos, podendo ser instalados em dispositivos móveis e desktops.

## ✨ Recursos do PWA DigestAI

- 📲 **Instalável**: Pode ser instalado em qualquer dispositivo
- 🔄 **Atualizações automáticas**: Sempre na versão mais recente
- 📡 **Funciona offline**: Acesso mesmo sem internet
- ⚡ **Rápido**: Cache inteligente para melhor performance
- 🔔 **Notificações**: (futuro) Alertas sobre sintomas e relatórios

## 📥 Como Instalar

### No Celular (Android/iOS)

#### Android (Chrome/Edge)
1. Acesse https://digestai.produtohub.store
2. Toque no menu (⋮) no canto superior direito
3. Selecione "Instalar app" ou "Adicionar à tela inicial"
4. Confirme a instalação

#### iOS (Safari)
1. Acesse https://digestai.produtohub.store
2. Toque no botão de compartilhar (□↑)
3. Role para baixo e toque em "Adicionar à Tela de Início"
4. Toque em "Adicionar"

### No Computador

#### Windows/Mac/Linux (Chrome/Edge)
1. Acesse https://digestai.produtohub.store
2. Clique no ícone de instalação (⊕) na barra de endereço
3. Ou clique no menu (⋮) → "Instalar DigestAI"
4. Confirme a instalação

## 🚀 Recursos Offline

O DigestAI funciona offline com as seguintes funcionalidades:

- ✅ Visualizar dados já carregados
- ✅ Navegar entre páginas
- ✅ Acessar configurações
- ⚠️ Sincronização automática quando voltar online

## 🔄 Atualizações

O app verifica automaticamente por atualizações. Quando uma nova versão estiver disponível:

1. Uma notificação aparecerá no topo da tela
2. Clique em "Atualizar Agora"
3. O app será recarregado com a nova versão

## 🛠️ Desenvolvimento

### Build para Produção

```bash
npm run build
```

O build irá gerar:
- Service Worker otimizado
- Manifest.json configurado
- Assets com cache estratégico

### Testar PWA Localmente

```bash
npm run build
npm run preview
```

Acesse via HTTPS (necessário para PWA funcionar).

## 📊 Cache Strategy

- **NetworkFirst**: APIs do Supabase e n8n (prioriza rede, fallback para cache)
- **CacheFirst**: Assets estáticos (imagens, CSS, JS)
- **Expiração**: 24h para dados do Supabase, 1h para APIs

## 🔧 Configuração

Todas as configurações do PWA estão em:
- `vite.config.ts` - Plugin e workbox
- `public/manifest.json` - Metadados do app
- `index.html` - Meta tags PWA

## 📝 Checklist de Deploy

- [ ] Certificado SSL/HTTPS configurado
- [ ] Service Worker registrado
- [ ] Manifest.json acessível
- [ ] Ícones em múltiplos tamanhos
- [ ] Meta tags PWA no HTML
- [ ] Cache strategy configurada

## 🐛 Troubleshooting

### App não aparece para instalação
- Verifique se está usando HTTPS
- Limpe o cache do navegador
- Verifique se o manifest.json está acessível

### Service Worker não registra
- Abra DevTools → Application → Service Workers
- Verifique erros no console
- Force atualização (Ctrl+Shift+R)

### Cache não funciona
- Verifique a estratégia de cache no vite.config.ts
- Limpe o cache: DevTools → Application → Clear Storage

## 📚 Recursos Adicionais

- [PWA Builder](https://www.pwabuilder.com/)
- [Workbox Docs](https://developers.google.com/web/tools/workbox)
- [Vite PWA Plugin](https://vite-pwa-org.netlify.app/)
