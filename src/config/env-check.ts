// ============================================
// Environment Variables Check
// ============================================

export function checkEnvironmentVariables() {
  const requiredVars = {
    VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
    VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY,
  };

  console.log('🔍 Environment Variables Check:');
  
  Object.entries(requiredVars).forEach(([key, value]) => {
    if (!value) {
      console.error(`❌ ${key} is missing!`);
    } else {
      // Mostra apenas os primeiros e últimos caracteres para segurança
      const masked = key.includes('KEY') 
        ? `${value.substring(0, 10)}...${value.substring(value.length - 10)}`
        : value;
      console.log(`✅ ${key}:`, masked);
    }
  });

  return requiredVars;
}
