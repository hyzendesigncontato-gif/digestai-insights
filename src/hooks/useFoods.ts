// ============================================
// DigestAI - useFoods Hook
// Hook para gerenciar alimentos e status
// ============================================

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Food, UserFoodStatus } from '@/types';
import { useAuth } from '@/contexts/AuthContext';

export function useFoods() {
  const { user } = useAuth();
  const [foods, setFoods] = useState<Food[]>([]);
  const [userFoodStatus, setUserFoodStatus] = useState<UserFoodStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    fetchFoods();
    if (user) {
      fetchUserFoodStatus();
    }
  }, [user]);

  const fetchFoods = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('foods')
        .select('*')
        .order('name');

      if (error) throw error;

      setFoods(data || []);
    } catch (err) {
      setError(err as Error);
      console.error('Error fetching foods:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserFoodStatus = async () => {
    try {
      const { data, error } = await supabase
        .from('user_food_status')
        .select(`
          *,
          food:foods(*)
        `)
        .order('safety_score', { ascending: false });

      if (error) throw error;

      // Normaliza os dados
      const normalizedData = (data || []).map((item: any) => ({
        ...item,
        userId: item.user_id,
        foodId: item.food_id,
        safetyScore: item.safety_score,
        aiNotes: item.ai_notes,
        updatedAt: item.updated_at,
      }));

      setUserFoodStatus(normalizedData);
    } catch (err) {
      console.error('Error fetching user food status:', err);
    }
  };

  const searchFoods = async (searchTerm: string, category?: string) => {
    try {
      const { data, error } = await supabase.rpc('search_foods', {
        p_search_term: searchTerm,
        p_category: category,
        p_limit: 20,
      });

      if (error) throw error;
      return { data, error: null };
    } catch (err) {
      console.error('Error searching foods:', err);
      return { data: null, error: err as Error };
    }
  };

  const updateFoodScores = async () => {
    try {
      const { data, error } = await supabase.rpc('update_user_food_status_scores');

      if (error) throw error;

      await fetchUserFoodStatus();
      return { data, error: null };
    } catch (err) {
      console.error('Error updating food scores:', err);
      return { data: null, error: err as Error };
    }
  };

  return {
    foods,
    userFoodStatus,
    isLoading,
    error,
    searchFoods,
    updateFoodScores,
    refetch: fetchFoods,
  };
}
