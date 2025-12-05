// ============================================
// DigestAI - useFoodLogs Hook
// Hook para gerenciar registros de alimentos
// ============================================

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

export interface FoodLog {
  id: string;
  userId: string;
  foodName: string;
  foodId?: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  datetime: string;
  portionSize?: string;
  notes?: string;
  createdAt: string;
}

export function useFoodLogs() {
  const { user } = useAuth();
  const [foodLogs, setFoodLogs] = useState<FoodLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchFoodLogs();
    }
  }, [user]);

  const fetchFoodLogs = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('food_logs')
        .select('*')
        .order('datetime', { ascending: false })
        .limit(50);

      if (error) throw error;

      const normalizedData = (data || []).map((item: any) => ({
        id: item.id,
        userId: item.user_id,
        foodName: item.food_name,
        foodId: item.food_id,
        mealType: item.meal_type,
        datetime: item.datetime,
        portionSize: item.portion_size,
        notes: item.notes,
        createdAt: item.created_at,
      }));

      setFoodLogs(normalizedData);
    } catch (error) {
      console.error('Error fetching food logs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addFoodLog = async (foodLog: {
    foodName: string;
    mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
    datetime: string;
    portionSize?: string;
    notes?: string;
  }) => {
    try {
      const { data, error } = await supabase
        .from('food_logs')
        .insert({
          user_id: user?.id,
          food_name: foodLog.foodName,
          meal_type: foodLog.mealType,
          datetime: foodLog.datetime,
          portion_size: foodLog.portionSize,
          notes: foodLog.notes,
        })
        .select()
        .single();

      if (error) throw error;

      await fetchFoodLogs();
      return { data, error: null };
    } catch (error) {
      console.error('Error adding food log:', error);
      return { data: null, error: error as Error };
    }
  };

  const deleteFoodLog = async (id: string) => {
    try {
      const { error } = await supabase
        .from('food_logs')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await fetchFoodLogs();
      return { error: null };
    } catch (error) {
      console.error('Error deleting food log:', error);
      return { error: error as Error };
    }
  };

  return {
    foodLogs,
    isLoading,
    addFoodLog,
    deleteFoodLog,
    refetch: fetchFoodLogs,
  };
}
