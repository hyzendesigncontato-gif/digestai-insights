export interface User {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
  birthDate?: string;
  gender?: 'male' | 'female' | 'other';
  weight?: number;
  height?: number;
  createdAt: string;
}

export interface Symptom {
  id: string;
  userId: string;
  types: SymptomType[];
  intensity: number;
  datetime: string;
  duration?: string;
  painLocation?: string;
  notes?: string;
  foodsConsumed?: FoodLog[];
  createdAt: string;
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
  userId: string;
  symptomId?: string;
  foodName: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  datetime: string;
  createdAt: string;
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
  userId: string;
  foodId: string;
  food: Food;
  status: 'safe' | 'moderate' | 'avoid';
  safetyScore: number;
  aiNotes?: string;
  updatedAt: string;
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
