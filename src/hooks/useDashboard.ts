// ============================================
// DigestAI - useDashboard Hook
// Hook para dados do dashboard
// ============================================

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

interface DashboardStats {
  totalSymptoms: number;
  avgIntensity: number;
  safeFoods: number;
  avoidFoods: number;
  moderateFoods: number;
  latestReport: any;
  unreadInsights: number;
  unreadNotifications: number;
}

export function useDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (user) {
      fetchDashboardStats();
    } else {
      setStats(null);
      setIsLoading(false);
    }
  }, [user]);

  const fetchDashboardStats = async () => {
    try {
      setIsLoading(true);
      
      // Tenta usar a função RPC
      const { data, error } = await supabase.rpc('get_user_dashboard_stats');

      if (error) {
        console.warn('RPC function not available, using fallback:', error);
        // Fallback: buscar dados manualmente
        await fetchStatsManually();
        return;
      }

      setStats(data);
    } catch (err) {
      setError(err as Error);
      console.error('Error fetching dashboard stats:', err);
      // Em caso de erro, tenta buscar manualmente
      await fetchStatsManually();
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStatsManually = async () => {
    try {
      // Buscar dados manualmente se a função RPC não existir
      const [symptomsRes, foodStatusRes] = await Promise.all([
        supabase
          .from('symptoms')
          .select('*')
          .gte('datetime', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
        supabase
          .from('user_food_status')
          .select('status')
      ]);

      const symptoms = symptomsRes.data || [];
      const foodStatus = foodStatusRes.data || [];

      const avgIntensity = symptoms.length > 0
        ? symptoms.reduce((sum, s) => sum + s.intensity, 0) / symptoms.length
        : 0;

      setStats({
        totalSymptoms: symptoms.length,
        avgIntensity: Math.round(avgIntensity * 10) / 10,
        safeFoods: foodStatus.filter(f => f.status === 'safe').length,
        avoidFoods: foodStatus.filter(f => f.status === 'avoid').length,
        moderateFoods: foodStatus.filter(f => f.status === 'moderate').length,
        latestReport: null,
        unreadInsights: 0,
        unreadNotifications: 0,
      });
    } catch (err) {
      console.error('Error fetching stats manually:', err);
    }
  };

  return {
    stats,
    isLoading,
    error,
    refetch: fetchDashboardStats,
  };
}
