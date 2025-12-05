// ============================================
// DigestAI - AI Service
// Serviço para integração com o agente IA
// ============================================

import { 
  chatWithAI, 
  analyzeSymptoms, 
  getFoodRecommendations, 
  generateAIReport,
  AIResponse 
} from '@/config/ai';
import { Symptom, UserFoodStatus, Report } from '@/types';

// ============================================
// Serviço de Chat
// ============================================
export class AIService {
  /**
   * Envia mensagem para o chat
   */
  static async sendMessage(
    userId: string,
    message: string,
    conversationId?: string
  ): Promise<AIResponse> {
    return chatWithAI(userId, message, conversationId);
  }

  /**
   * Analisa sintomas e retorna insights
   */
  static async analyzeUserSymptoms(
    userId: string,
    symptoms: Symptom[]
  ): Promise<AIResponse> {
    return analyzeSymptoms(userId, symptoms);
  }

  /**
   * Obtém recomendações de alimentos
   */
  static async getRecommendations(
    userId: string,
    mealType?: 'breakfast' | 'lunch' | 'dinner' | 'snack'
  ): Promise<AIResponse> {
    return getFoodRecommendations(userId, mealType);
  }

  /**
   * Gera relatório completo com análise da IA
   */
  static async generateReport(
    userId: string,
    symptoms: Symptom[],
    foods: UserFoodStatus[]
  ): Promise<AIResponse> {
    return generateAIReport(userId, symptoms, foods);
  }

  /**
   * Processa resposta da IA e extrai informações estruturadas
   */
  static parseAIResponse(response: AIResponse): {
    message: string;
    hasSuggestions: boolean;
    hasInsights: boolean;
    actionable: boolean;
  } {
    return {
      message: response.message,
      hasSuggestions: (response.suggestions?.length ?? 0) > 0,
      hasInsights: (response.insights?.length ?? 0) > 0,
      actionable: !!(response.suggestions || response.insights),
    };
  }

  /**
   * Formata contexto do usuário para enviar à IA
   */
  static formatUserContext(data: {
    symptoms?: Symptom[];
    foods?: UserFoodStatus[];
    reports?: Report[];
  }) {
    return {
      symptoms: data.symptoms?.map(s => ({
        types: s.types,
        intensity: s.intensity,
        datetime: s.datetime,
        notes: s.notes,
      })),
      foods: data.foods?.map(f => ({
        name: f.food.name,
        status: f.status,
        safetyScore: f.safetyScore,
      })),
      reports: data.reports?.map(r => ({
        riskScore: r.riskScore,
        summary: r.summary,
        periodStart: r.periodStart,
        periodEnd: r.periodEnd,
      })),
    };
  }
}

// ============================================
// Hook personalizado para usar o AI Service
// ============================================
export function useAIService() {
  const sendMessage = async (
    userId: string,
    message: string,
    conversationId?: string
  ) => {
    try {
      const response = await AIService.sendMessage(userId, message, conversationId);
      return { data: response, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  };

  const analyzeSymptoms = async (userId: string, symptoms: Symptom[]) => {
    try {
      const response = await AIService.analyzeUserSymptoms(userId, symptoms);
      return { data: response, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  };

  const getRecommendations = async (
    userId: string,
    mealType?: 'breakfast' | 'lunch' | 'dinner' | 'snack'
  ) => {
    try {
      const response = await AIService.getRecommendations(userId, mealType);
      return { data: response, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  };

  const generateReport = async (
    userId: string,
    symptoms: Symptom[],
    foods: UserFoodStatus[]
  ) => {
    try {
      const response = await AIService.generateReport(userId, symptoms, foods);
      return { data: response, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  };

  return {
    sendMessage,
    analyzeSymptoms,
    getRecommendations,
    generateReport,
  };
}
