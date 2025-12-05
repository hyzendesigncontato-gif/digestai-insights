export interface User {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
  birthDate?: string;
  gender?: 'male' | 'female' | 'other';
  weight?: number;
  height?: number;
  createdAt?: string;
  created_at?: string;
}

export interface Symptom {
  id: string;
  userId?: string;
  user_id?: string;
  types: SymptomType[];
  intensity: number;
  datetime: string;
  duration?: string;
  painLocation?: string;
  pain_location?: string;
  notes?: string;
  foodsConsumed?: FoodLog[];
  foods_consumed?: any;
  createdAt?: string;
  created_at?: string;
  updatedAt?: string;
  updated_at?: string;
}

export type SymptomType = 
  | 'abdominal_pain'
  | 'bloating'
  | 'gas'
  | 'diarrhea'
  | 'constipation'
  | 'nausea'
  | 'heartburn'
  | 'vomiting'
  | 'cramps'
  | 'other';

export interface FoodLog {
  id: string;
  userId?: string;
  user_id?: string;
  symptomId?: string;
  symptom_id?: string;
  foodName?: string;
  food_name?: string;
  foodId?: string;
  food_id?: string;
  mealType?: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  meal_type?: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  datetime: string;
  createdAt?: string;
  created_at?: string;
}

export interface Food {
  id: string;
  name: string;
  category: string;
  commonAllergens?: string[];
  imageUrl?: string;
}

export interface UserFoodStatus {
  id: string;
  userId?: string;
  user_id?: string;
  foodId?: string;
  food_id?: string;
  food: Food;
  status: 'safe' | 'moderate' | 'avoid';
  safetyScore?: number;
  safety_score?: number;
  aiNotes?: string;
  ai_notes?: string;
  updatedAt?: string;
  updated_at?: string;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface Conversation {
  id: string;
  userId: string;
  messages: Message[];
  createdAt: string;
  updatedAt: string;
}

export interface Report {
  id: string;
  userId: string;
  periodStart: string;
  periodEnd: string;
  riskScore: number;
  intolerances: IntoleranceAnalysis[];
  summary: string;
  pdfUrl?: string;
  createdAt: string;
}

export interface IntoleranceAnalysis {
  type: string;
  probability: number;
  correlatedSymptoms: string[];
  correlatedFoods: string[];
}

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
