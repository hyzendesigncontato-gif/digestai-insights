// ============================================
// DigestAI - useReports Hook
// Hook para gerenciar relatórios
// ============================================

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Report } from '@/types';
import { useAuth } from '@/contexts/AuthContext';

export function useReports() {
  const { user } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (user) {
      fetchReports();
    } else {
      setReports([]);
      setIsLoading(false);
    }
  }, [user]);

  const fetchReports = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Normaliza os dados
      const normalizedData = (data || []).map((item: any) => ({
        ...item,
        userId: item.user_id,
        periodStart: item.period_start,
        periodEnd: item.period_end,
        riskScore: item.risk_score,
        pdfUrl: item.pdf_url,
        createdAt: item.created_at,
      }));

      setReports(normalizedData);
    } catch (err) {
      setError(err as Error);
      console.error('Error fetching reports:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const generateReport = async (periodDays: number = 30) => {
    try {
      const { data, error } = await supabase.rpc('generate_user_report', {
        p_period_days: periodDays,
      });

      if (error) throw error;

      await fetchReports();
      return { data, error: null };
    } catch (err) {
      console.error('Error generating report:', err);
      return { data: null, error: err as Error };
    }
  };

  return {
    reports,
    isLoading,
    error,
    generateReport,
    refetch: fetchReports,
  };
}
