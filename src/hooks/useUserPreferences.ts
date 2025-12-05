// ============================================
// DigestAI - useUserPreferences Hook
// Hook para gerenciar preferências do usuário
// ============================================

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

export interface UserPreferences {
  dietaryRestrictions: string[];
  allergies: string[];
  notificationSettings: {
    symptomReminder: boolean;
    newInsights: boolean;
    reportsReady: boolean;
    dailyTips: boolean;
  };
  alertIntensity: 'high' | 'medium' | 'low';
  theme: 'light' | 'dark' | 'auto';
}

export function useUserPreferences() {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<UserPreferences>({
    dietaryRestrictions: [],
    allergies: [],
    notificationSettings: {
      symptomReminder: true,
      newInsights: true,
      reportsReady: true,
      dailyTips: false,
    },
    alertIntensity: 'medium',
    theme: 'light',
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchPreferences();
    }
  }, [user]);

  const fetchPreferences = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        // PGRST116 = not found, é ok
        throw error;
      }

      if (data) {
        setPreferences({
          dietaryRestrictions: data.dietary_restrictions || [],
          allergies: data.allergies || [],
          notificationSettings: data.notification_settings || preferences.notificationSettings,
          alertIntensity: data.alert_intensity || 'medium',
          theme: data.theme || 'light',
        });
      }
    } catch (error) {
      console.error('Error fetching preferences:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updatePreferences = async (newPreferences: Partial<UserPreferences>) => {
    try {
      const updatedPreferences = { ...preferences, ...newPreferences };
      
      const { error } = await supabase
        .from('user_preferences')
        .upsert(
          {
            user_id: user?.id,
            dietary_restrictions: updatedPreferences.dietaryRestrictions,
            allergies: updatedPreferences.allergies,
            notification_settings: updatedPreferences.notificationSettings,
            alert_intensity: updatedPreferences.alertIntensity,
            theme: updatedPreferences.theme,
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: 'user_id',
            ignoreDuplicates: false
          }
        );

      if (error) throw error;

      setPreferences(updatedPreferences);
      return { success: true };
    } catch (error) {
      console.error('Error updating preferences:', error);
      return { success: false, error };
    }
  };

  return {
    preferences,
    isLoading,
    updatePreferences,
    refetch: fetchPreferences,
  };
}
