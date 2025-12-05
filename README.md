# 🩺 DigestAI - Sistema Intestinal Blindado

Sistema inteligente de monitoramento de saúde digestiva com IA.

## 🚀 Tecnologias

- **Frontend:** React + TypeScript + Vite
- **UI:** TailwindCSS + Shadcn/ui
- **Backend:** Supabase (PostgreSQL + Auth + Storage)
- **IA:** N8N (Webhook + Automações)
- **Email:** Resend
- **Upload:** ImgBB
- **PWA:** Vite PWA Plugin + Workbox

## 📋 Funcionalidades

- ✅ Autenticação completa (Login/Logout)
- ✅ Dashboard com métricas em tempo real
- ✅ Chat com IA para análise de sintomas
- ✅ Registro de sintomas e alimentos
- ✅ Diário alimentar
- ✅ Análise automática de intolerâncias
- ✅ Geração de relatórios personalizados
- ✅ Sistema de notificações
- ✅ Upload de foto de perfil
- ✅ Configurações de preferências
- ✅ **PWA - Instalável em qualquer dispositivo**
- ✅ **Funciona offline**
- ✅ **Atualizações automáticas**

## 📱 PWA - Progressive Web App

O DigestAI é um PWA completo que pode ser instalado em qualquer dispositivo!

### Como Instalar

**No Celular (Android/iOS):**
- Android: Menu → "Instalar app"
- iOS: Compartilhar → "Adicionar à Tela de Início"

**No Computador:**
- Chrome/Edge: Ícone de instalação na barra de endereço

### Recursos PWA
- 📲 Instalável como app nativo
- 🔄 Atualizações automáticas
- 📡 Funciona offline
- ⚡ Cache inteligente
- 🎨 Ícone personalizado

📖 [Guia completo do PWA](docs/PWA_GUIDE.md)

## 🔧 Variáveis de Ambiente

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-anon-key
VITE_AI_WEBHOOK_URL=https://n8n.produtohub.store/webhook/agenteia-intestinal
```

## 📦 Deploy na Vercel

### Opção 1: Deploy via Dashboard (Recomendado)

1. Acesse [vercel.com](https://vercel.com)
2. Clique em **"Add New Project"**
3. Importe seu repositório do GitHub
4. A Vercel detecta automaticamente que é um projeto Vite
5. Configure as **Environment Variables**:
   ```
   VITE_SUPABASE_URL=https://tsttphdoxjtdgqlrzlto.supabase.co
   VITE_SUPABASE_ANON_KEY=sua-key-aqui
   VITE_AI_WEBHOOK_URL=https://n8n.produtohub.store/webhook/agenteia-intestinal
   ```
6. Clique em **"Deploy"**
7. Pronto! Seu app estará no ar em ~2 minutos 🚀

### Opção 2: Deploy via CLI

```bash
# Instalar Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Deploy em produção
vercel --prod
```

## 🛠️ Desenvolvimento Local

```bash
# Instalar dependências
npm install

# Rodar em desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview do build
npm run preview
```

## 📄 Licença

© 2025 DigestAI. Todos os direitos reservados.
