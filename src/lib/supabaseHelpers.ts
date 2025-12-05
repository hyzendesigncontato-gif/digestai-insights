// ============================================
// DigestAI - Supabase Helpers
// Funções para normalizar dados do Supabase
// ============================================

import { Symptom, UserFoodStatus } from '@/types';

/**
 * Normaliza sintoma do Supabase para o formato do app
 */
export function normalizeSymptom(data: any): Symptom {
  return {
    id: data.id,
    userId: data.user_id || data.userId,
    user_id: data.user_id,
    types: data.types,
    intensity: data.intensity,
    datetime: data.datetime,
    duration: data.duration,
    painLocation: data.pain_location || data.painLocation,
    pain_location: data.pain_location,
    notes: data.notes,
    createdAt: data.created_at || data.createdAt,
    created_at: data.created_at,
    updatedAt: data.updated_at || data.updatedAt,
    updated_at: data.updated_at,
  };
}

/**
 * Normaliza status de alimento do Supabase
 */
export function normalizeUserFoodStatus(data: any): UserFoodStatus {
  return {
    id: data.id,
    userId: data.user_id || data.userId,
    user_id: data.user_id,
    foodId: data.food_id || data.foodId,
    food_id: data.food_id,
    food: data.food,
    status: data.status,
    safetyScore: data.safety_score || data.safetyScore,
    safety_score: data.safety_score,
    aiNotes: data.ai_notes || data.aiNotes,
    ai_notes: data.ai_notes,
    updatedAt: data.updated_at || data.updatedAt,
    updated_at: data.updated_at,
  };
}

/**
 * Normaliza array de sintomas
 */
export function normalizeSymptoms(data: any[]): Symptom[] {
  if (!data) return [];
  return data.map(normalizeSymptom);
}

/**
 * Normaliza array de status de alimentos
 */
export function normalizeUserFoodStatuses(data: any[]): UserFoodStatus[] {
  if (!data) return [];
  return data.map(normalizeUserFoodStatus);
}
