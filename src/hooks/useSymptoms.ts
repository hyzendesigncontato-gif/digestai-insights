// ============================================
// DigestAI - useSymptoms Hook
// Hook para gerenciar sintomas do Supabase
// ============================================

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Symptom } from '@/types';
import { useAuth } from '@/contexts/AuthContext';

export function useSymptoms() {
  const { user } = useAuth();
  const [symptoms, setSymptoms] = useState<Symptom[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (user) {
      fetchSymptoms();
    } else {
      setSymptoms([]);
      setIsLoading(false);
    }
  }, [user]);

  const fetchSymptoms = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('symptoms')
        .select('*')
        .order('datetime', { ascending: false });

      if (error) throw error;

      // Normaliza os dados para o formato esperado
      const normalizedData = (data || []).map((item: any) => ({
        ...item,
        userId: item.user_id,
        painLocation: item.pain_location,
        createdAt: item.created_at,
        updatedAt: item.updated_at,
      }));

      setSymptoms(normalizedData);
    } catch (err) {
      setError(err as Error);
      console.error('Error fetching symptoms:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const addSymptom = async (symptom: Omit<Symptom, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    try {
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      // Prepara os dados com user_id
      const symptomData = {
        user_id: user.id, // Campo do Supabase
        types: symptom.types,
        intensity: symptom.intensity,
        datetime: symptom.datetime,
        duration: symptom.duration || null,
        pain_location: symptom.painLocation || null,
        notes: symptom.notes || null,
      };

      console.log('Tentando salvar sintoma:', symptomData);
      
      const { data, error } = await supabase
        .from('symptoms')
        .insert([symptomData])
        .select()
        .single();

      if (error) {
        console.error('Erro do Supabase:', error);
        throw error;
      }

      console.log('Sintoma salvo com sucesso:', data);
      
      // Normaliza os dados de volta
      const normalizedData = {
        ...data,
        userId: data.user_id,
        painLocation: data.pain_location,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };
      
      setSymptoms(prev => [normalizedData, ...prev]);
      return { data: normalizedData, error: null };
    } catch (err) {
      console.error('Error adding symptom:', err);
      return { data: null, error: err as Error };
    }
  };

  const updateSymptom = async (id: string, updates: Partial<Symptom>) => {
    try {
      const { data, error } = await supabase
        .from('symptoms')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setSymptoms(prev => prev.map(s => s.id === id ? data : s));
      return { data, error: null };
    } catch (err) {
      console.error('Error updating symptom:', err);
      return { data: null, error: err as Error };
    }
  };

  const deleteSymptom = async (id: string) => {
    try {
      const { error } = await supabase
        .from('symptoms')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setSymptoms(prev => prev.filter(s => s.id !== id));
      return { error: null };
    } catch (err) {
      console.error('Error deleting symptom:', err);
      return { error: err as Error };
    }
  };

  return {
    symptoms,
    isLoading,
    error,
    addSymptom,
    updateSymptom,
    deleteSymptom,
    refetch: fetchSymptoms,
  };
}
