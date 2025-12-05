// ============================================
// DigestAI - Supabase Client
// Cliente configurado para o Supabase
// ============================================

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Debug: Log environment variables (apenas em desenvolvimento)
if (import.meta.env.DEV) {
  console.log('🔍 Supabase URL:', supabaseUrl);
  console.log('🔍 Anon Key exists:', !!supabaseAnonKey);
}

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing environment variables:', {
    hasUrl: !!supabaseUrl,
    hasKey: !!supabaseAnonKey,
    url: supabaseUrl,
  });
  throw new Error('Missing Supabase environment variables. Check your .env file or Vercel environment variables.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

// Helper para verificar se está autenticado
export async function isAuthenticated() {
  const { data: { session } } = await supabase.auth.getSession();
  return !!session;
}

// Helper para obter usuário atual
export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

// Helper para fazer logout
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  return { error };
}
