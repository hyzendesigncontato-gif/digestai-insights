# 🤖 Integração com Agente IA (N8N)

## 📋 Visão Geral

O DigestAI está integrado com um agente de IA via webhook N8N para fornecer análises inteligentes, recomendações personalizadas e chat conversacional.

## 🔗 Configuração

### URL do Webhook (PRODUÇÃO)
```
https://n8n.produtohub.store/webhook/agenteia-intestinal
```

### Variáveis de Ambiente

Arquivo `.env`:
```bash
VITE_AI_WEBHOOK_URL=https://n8n.produtohub.store/webhook/agenteia-intestinal
VITE_AI_TIMEOUT=30000
VITE_AI_MAX_RETRIES=3
```

## 📡 Formato das Requisições

### Request Body

```typescript
{
  "message": "Analise meus sintomas recentes",
  "userId": "uuid-do-usuario",
  "conversationId": "uuid-da-conversa", // opcional
  "context": {
    "symptoms": [
      {
        "types": ["bloating", "gas"],
        "intensity": 6,
        "datetime": "2024-12-04T14:30:00Z",
        "notes": "Após almoço"
      }
    ],
    "foods": [
      {
        "name": "Leite",
        "status": "avoid",
        "safetyScore": 15
      }
    ],
    "reports": [
      {
        "riskScore": 65,
        "summary": "Alta probabilidade de intolerância à lactose"
      }
    ]
  }
}
```

### Response Body

O N8N retorna a resposta no campo `output`. O sistema automaticamente:
- Extrai o conteúdo de `output`
- Remove toda formatação markdown (##, **, *, etc)
- Retorna texto limpo

```typescript
// Resposta do N8N
{
  "output": "Baseado nos seus sintomas, recomendo evitar laticínios..."
}

// Após processamento interno
{
  "message": "Baseado nos seus sintomas, recomendo evitar laticínios...", // Limpo, sem markdown
  "output": "Baseado nos seus sintomas, recomendo evitar laticínios...",
  "suggestions": [...], // Opcional
  "insights": [...] // Opcional
}
```

## 💻 Uso no Código

### 1. Chat Conversacional

```typescript
import { chatWithAI } from '@/config/ai';

const response = await chatWithAI(
  userId,
  'O que posso comer hoje?',
  conversationId
);

console.log(response.message);
```

### 2. Análise de Sintomas

```typescript
import { analyzeSymptoms } from '@/config/ai';

const response = await analyzeSymptoms(userId, symptoms);

console.log(response.insights);
```

### 3. Recomendações de Alimentos

```typescript
import { getFoodRecommendations } from '@/config/ai';

const response = await getFoodRecommendations(userId, 'lunch');

console.log(response.suggestions);
```

### 4. Gerar Relatório

```typescript
import { generateAIReport } from '@/config/ai';

const response = await generateAIReport(userId, symptoms, foods);

console.log(response.message);
```

### 5. Usando o Hook

```typescript
import { useAIService } from '@/services/aiService';

function MyComponent() {
  const { sendMessage, analyzeSymptoms } = useAIService();
  
  const handleAnalyze = async () => {
    const { data, error } = await analyzeSymptoms(userId, symptoms);
    
    if (error) {
      console.error('Erro:', error);
      return;
    }
    
    console.log('Análise:', data);
  };
}
```

## 🔄 Retry Automático

O sistema implementa retry automático em caso de falha:

```typescript
// Configuração padrão
maxRetries: 3
retryDelay: 1000ms

// Uso
const response = await sendMessageToAIWithRetry(request);
```

## ⚡ Timeout

Requisições têm timeout de 30 segundos por padrão:

```typescript
timeout: 30000 // 30 segundos
```

## 🛡️ Tratamento de Erros

### Erro de Conexão

```typescript
try {
  const response = await chatWithAI(userId, message);
} catch (error) {
  if (error.name === 'AbortError') {
    console.error('Timeout: Requisição demorou muito');
  } else {
    console.error('Erro de conexão:', error);
  }
  
  // Fallback para resposta local
  const fallbackResponse = generateLocalResponse(message);
}
```

### Erro HTTP

```typescript
// Status 4xx ou 5xx
if (!response.ok) {
  throw new Error(`AI Agent error: ${response.status}`);
}
```

## 📊 Exemplos de Uso

### Exemplo 1: Chat Simples

```typescript
// src/pages/Chat.tsx
const handleSend = async () => {
  const userMessage = {
    role: 'user',
    content: input,
    timestamp: new Date().toISOString(),
  };
  
  setMessages(prev => [...prev, userMessage]);
  setIsLoading(true);
  
  try {
    const response = await chatWithAI(user.id, input);
    
    const aiMessage = {
      role: 'assistant',
      content: response.message,
      timestamp: new Date().toISOString(),
    };
    
    setMessages(prev => [...prev, aiMessage]);
  } catch (error) {
    console.error('Erro:', error);
  } finally {
    setIsLoading(false);
  }
};
```

### Exemplo 2: Análise com Contexto

```typescript
// Incluir contexto completo do usuário
const response = await chatWithAI(
  userId,
  'Analise minha situação',
  conversationId,
  {
    symptoms: recentSymptoms,
    foods: userFoodStatus,
    reports: latestReports,
  }
);
```

### Exemplo 3: Dashboard com IA

```typescript
// src/pages/Dashboard.tsx
const getAIInsights = async () => {
  const response = await analyzeSymptoms(user.id, mockSymptoms);
  
  if (response.insights) {
    response.insights.forEach(insight => {
      // Criar notificação
      createNotification({
        type: insight.type,
        title: insight.title,
        message: insight.content,
        priority: insight.priority,
      });
    });
  }
};
```

## 🧪 Testando a Integração

### Teste Manual

```bash
# Via curl
curl -X POST https://n8n.produtohub.store/webhook/agenteia-intestinal \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Olá, teste",
    "userId": "test-user-123"
  }'
```

### Teste no Frontend

```typescript
// Console do navegador
import { chatWithAI } from './src/config/ai';

const response = await chatWithAI(
  'test-user-123',
  'Teste de conexão'
);

console.log(response);
```

## 📝 Logs e Debug

### Habilitar Debug

```bash
# .env
VITE_DEBUG_MODE=true
```

### Ver Logs

```typescript
// src/config/ai.ts
console.log('Sending to AI:', request);
console.log('AI Response:', response);
```

## 🔐 Segurança

### Headers Recomendados

```typescript
headers: {
  'Content-Type': 'application/json',
  'X-User-ID': userId, // Opcional
  'X-Request-ID': requestId, // Para rastreamento
}
```

### Validação de Resposta

```typescript
// Validar estrutura da resposta
if (!response.message) {
  throw new Error('Invalid AI response format');
}
```

## 🚀 Performance

### Otimizações

1. **Cache de Respostas**
```typescript
const cache = new Map<string, AIResponse>();

async function getCachedResponse(key: string) {
  if (cache.has(key)) {
    return cache.get(key);
  }
  
  const response = await chatWithAI(...);
  cache.set(key, response);
  return response;
}
```

2. **Debounce de Mensagens**
```typescript
import { debounce } from 'lodash';

const debouncedSend = debounce(sendMessage, 500);
```

3. **Loading States**
```typescript
const [isLoading, setIsLoading] = useState(false);

// Mostrar skeleton enquanto carrega
{isLoading && <LoadingSkeleton />}
```

## 📈 Monitoramento

### Métricas Importantes

- Taxa de sucesso das requisições
- Tempo médio de resposta
- Taxa de retry
- Erros por tipo

### Implementação

```typescript
const metrics = {
  totalRequests: 0,
  successfulRequests: 0,
  failedRequests: 0,
  totalResponseTime: 0,
};

async function sendWithMetrics(request: AIRequest) {
  metrics.totalRequests++;
  const startTime = Date.now();
  
  try {
    const response = await sendMessageToAI(request);
    metrics.successfulRequests++;
    return response;
  } catch (error) {
    metrics.failedRequests++;
    throw error;
  } finally {
    metrics.totalResponseTime += Date.now() - startTime;
  }
}
```

## 🔄 Atualizações Futuras

### Planejado

- [ ] Streaming de respostas (SSE)
- [ ] Suporte a anexos (imagens)
- [ ] Histórico de conversas
- [ ] Feedback de qualidade
- [ ] Análise de sentimento
- [ ] Sugestões proativas

## 📞 Suporte

Para problemas com a integração:

1. Verificar logs do N8N
2. Testar webhook manualmente
3. Verificar variáveis de ambiente
4. Consultar documentação do N8N

## 🎯 Checklist de Integração

- [x] URL do webhook configurada
- [x] Variáveis de ambiente criadas
- [x] Funções de integração implementadas
- [x] Tratamento de erros
- [x] Retry automático
- [x] Timeout configurado
- [x] Integração no Chat
- [x] Serviço de IA criado
- [x] Documentação completa
- [ ] Testes automatizados
- [ ] Monitoramento implementado

## 🎉 Pronto!

A integração com o agente IA está completa e pronta para uso!
