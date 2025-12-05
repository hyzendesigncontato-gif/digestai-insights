// ============================================
// DigestAI - AI Agent Configuration
// Configuração do agente IA via N8N
// ============================================

export const AI_CONFIG = {
  // URL do webhook do agente IA no N8N (PRODUÇÃO)
  webhookUrl: import.meta.env.VITE_AI_WEBHOOK_URL || 'https://n8n.produtohub.store/webhook/agenteia-intestinal',
  
  // Timeout para requisições (30 segundos)
  timeout: Number(import.meta.env.VITE_AI_TIMEOUT) || 30000,
  
  // Retry configuration
  maxRetries: Number(import.meta.env.VITE_AI_MAX_RETRIES) || 3,
  retryDelay: 1000,
} as const;

// ============================================
// Tipos de mensagens suportadas
// ============================================
export interface AIMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
}

export interface AIRequest {
  message: string;
  userId: string;
  conversationId?: string;
  context?: {
    symptoms?: any[];
    foods?: any[];
    reports?: any[];
  };
}

export interface AIResponse {
  output?: string; // Resposta do N8N vem em "output"
  message?: string; // Fallback para compatibilidade
  suggestions?: string[];
  insights?: {
    type: string;
    title: string;
    content: string;
    priority: 'high' | 'medium' | 'low';
  }[];
  metadata?: {
    model?: string;
    tokens?: number;
    processingTime?: number;
  };
}

// ============================================
// Função para limpar markdown da resposta
// ============================================
function cleanMarkdown(text: string): string {
  if (!text) return text;
  
  return text
    // Remove headers (##, ###, etc)
    .replace(/^#{1,6}\s+/gm, '')
    // Remove bold (**texto** ou __texto__)
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/__(.+?)__/g, '$1')
    // Remove italic (*texto* ou _texto_)
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/_(.+?)_/g, '$1')
    // Remove code blocks (```código```)
    .replace(/```[\s\S]*?```/g, '')
    // Remove inline code (`código`)
    .replace(/`(.+?)`/g, '$1')
    // Remove links [texto](url)
    .replace(/\[(.+?)\]\(.+?\)/g, '$1')
    // Remove imagens ![alt](url)
    .replace(/!\[.*?\]\(.+?\)/g, '')
    // Remove listas (* item ou - item)
    .replace(/^[\*\-]\s+/gm, '')
    // Remove blockquotes (> texto)
    .replace(/^>\s+/gm, '')
    // Remove linhas horizontais (---, ***, ___)
    .replace(/^[\-\*_]{3,}$/gm, '')
    // Remove múltiplas quebras de linha
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

// ============================================
// Função para enviar mensagem ao agente IA
// ============================================
export async function sendMessageToAI(
  request: AIRequest
): Promise<AIResponse> {
  try {
    const response = await fetch(AI_CONFIG.webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
      signal: AbortSignal.timeout(AI_CONFIG.timeout),
    });

    if (!response.ok) {
      throw new Error(`AI Agent error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    // Normaliza a resposta do N8N
    // Se vier "output", usa ele como message e limpa markdown
    if (data.output) {
      return {
        ...data,
        message: cleanMarkdown(data.output),
      } as AIResponse;
    }
    
    // Se já vier "message", limpa markdown também
    if (data.message) {
      return {
        ...data,
        message: cleanMarkdown(data.message),
      } as AIResponse;
    }
    
    return data as AIResponse;
  } catch (error) {
    console.error('Error communicating with AI agent:', error);
    throw error;
  }
}

// ============================================
// Função com retry automático
// ============================================
export async function sendMessageToAIWithRetry(
  request: AIRequest,
  retries = AI_CONFIG.maxRetries
): Promise<AIResponse> {
  try {
    return await sendMessageToAI(request);
  } catch (error) {
    if (retries > 0) {
      console.log(`Retrying... (${AI_CONFIG.maxRetries - retries + 1}/${AI_CONFIG.maxRetries})`);
      await new Promise(resolve => setTimeout(resolve, AI_CONFIG.retryDelay));
      return sendMessageToAIWithRetry(request, retries - 1);
    }
    throw error;
  }
}

// ============================================
// Função para análise de sintomas
// ============================================
export async function analyzeSymptoms(
  userId: string,
  symptoms: any[]
): Promise<AIResponse> {
  return sendMessageToAIWithRetry({
    message: 'Analise meus sintomas recentes e forneça insights',
    userId,
    context: { symptoms },
  });
}

// ============================================
// Função para recomendações de alimentos
// ============================================
export async function getFoodRecommendations(
  userId: string,
  mealType?: string
): Promise<AIResponse> {
  const message = mealType 
    ? `Sugira alimentos seguros para ${mealType}`
    : 'Quais alimentos posso comer hoje?';
    
  return sendMessageToAIWithRetry({
    message,
    userId,
  });
}

// ============================================
// Função para gerar relatório com IA
// ============================================
export async function generateAIReport(
  userId: string,
  symptoms: any[],
  foods: any[]
): Promise<AIResponse> {
  return sendMessageToAIWithRetry({
    message: 'Gere um relatório completo da minha saúde digestiva',
    userId,
    context: { symptoms, foods },
  });
}

// ============================================
// Função para chat conversacional
// ============================================
export async function chatWithAI(
  userId: string,
  message: string,
  conversationId?: string,
  context?: AIRequest['context']
): Promise<AIResponse> {
  return sendMessageToAIWithRetry({
    message,
    userId,
    conversationId,
    context,
  });
}
