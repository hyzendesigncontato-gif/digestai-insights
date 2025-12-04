import { User, Symptom, Food, UserFoodStatus, Message, Report, UserPreferences } from '@/types';

export const mockUser: User = {
  id: '1',
  email: 'joao@example.com',
  fullName: 'João Silva',
  avatarUrl: '',
  birthDate: '1990-05-15',
  gender: 'male',
  weight: 75,
  height: 175,
  createdAt: '2024-01-15T10:00:00Z',
};

export const mockSymptoms: Symptom[] = [
  {
    id: '1',
    userId: '1',
    types: ['bloating', 'gas'],
    intensity: 6,
    datetime: '2024-12-03T14:30:00Z',
    duration: '2 hours',
    painLocation: 'lower_abdomen',
    notes: 'Começou após o almoço',
    foodsConsumed: [
      { id: '1', userId: '1', foodName: 'Macarrão', mealType: 'lunch', datetime: '2024-12-03T12:00:00Z', createdAt: '2024-12-03T12:00:00Z' },
      { id: '2', userId: '1', foodName: 'Queijo', mealType: 'lunch', datetime: '2024-12-03T12:00:00Z', createdAt: '2024-12-03T12:00:00Z' },
    ],
    createdAt: '2024-12-03T14:30:00Z',
  },
  {
    id: '2',
    userId: '1',
    types: ['abdominal_pain', 'nausea'],
    intensity: 7,
    datetime: '2024-12-02T09:00:00Z',
    duration: '3 hours',
    painLocation: 'upper_abdomen',
    notes: 'Tomei leite no café da manhã',
    createdAt: '2024-12-02T09:00:00Z',
  },
  {
    id: '3',
    userId: '1',
    types: ['diarrhea'],
    intensity: 5,
    datetime: '2024-12-01T16:00:00Z',
    duration: '1 hour',
    createdAt: '2024-12-01T16:00:00Z',
  },
  {
    id: '4',
    userId: '1',
    types: ['bloating'],
    intensity: 4,
    datetime: '2024-11-30T20:00:00Z',
    duration: '1.5 hours',
    createdAt: '2024-11-30T20:00:00Z',
  },
  {
    id: '5',
    userId: '1',
    types: ['heartburn'],
    intensity: 3,
    datetime: '2024-11-29T22:00:00Z',
    duration: '30 minutes',
    createdAt: '2024-11-29T22:00:00Z',
  },
];

export const mockFoods: Food[] = [
  { id: '1', name: 'Leite', category: 'Laticínios', commonAllergens: ['lactose'] },
  { id: '2', name: 'Queijo', category: 'Laticínios', commonAllergens: ['lactose'] },
  { id: '3', name: 'Iogurte', category: 'Laticínios', commonAllergens: ['lactose'] },
  { id: '4', name: 'Pão de Forma', category: 'Grãos', commonAllergens: ['gluten'] },
  { id: '5', name: 'Macarrão', category: 'Grãos', commonAllergens: ['gluten'] },
  { id: '6', name: 'Arroz', category: 'Grãos' },
  { id: '7', name: 'Feijão', category: 'Leguminosas' },
  { id: '8', name: 'Frango', category: 'Proteínas' },
  { id: '9', name: 'Peixe', category: 'Proteínas' },
  { id: '10', name: 'Ovo', category: 'Proteínas' },
  { id: '11', name: 'Banana', category: 'Frutas' },
  { id: '12', name: 'Maçã', category: 'Frutas' },
  { id: '13', name: 'Laranja', category: 'Frutas' },
  { id: '14', name: 'Alface', category: 'Vegetais' },
  { id: '15', name: 'Tomate', category: 'Vegetais' },
  { id: '16', name: 'Cenoura', category: 'Vegetais' },
  { id: '17', name: 'Brócolis', category: 'Vegetais' },
  { id: '18', name: 'Cebola', category: 'Vegetais', commonAllergens: ['fodmap'] },
  { id: '19', name: 'Alho', category: 'Vegetais', commonAllergens: ['fodmap'] },
  { id: '20', name: 'Café', category: 'Bebidas' },
];

export const mockUserFoodStatus: UserFoodStatus[] = [
  { id: '1', userId: '1', foodId: '1', food: mockFoods[0], status: 'avoid', safetyScore: 15, aiNotes: 'Alto risco de intolerância à lactose detectado. Correlação direta com sintomas de dor abdominal e náusea.', updatedAt: '2024-12-01' },
  { id: '2', userId: '1', foodId: '2', food: mockFoods[1], status: 'moderate', safetyScore: 45, aiNotes: 'Consumo moderado pode ser tolerado. Evite grandes quantidades.', updatedAt: '2024-12-01' },
  { id: '3', userId: '1', foodId: '3', food: mockFoods[2], status: 'moderate', safetyScore: 50, aiNotes: 'Iogurtes com probióticos podem ser melhor tolerados.', updatedAt: '2024-12-01' },
  { id: '4', userId: '1', foodId: '4', food: mockFoods[3], status: 'avoid', safetyScore: 20, aiNotes: 'Sensibilidade ao glúten identificada. Correlação com estufamento.', updatedAt: '2024-12-01' },
  { id: '5', userId: '1', foodId: '5', food: mockFoods[4], status: 'avoid', safetyScore: 18, aiNotes: 'Contém glúten. Correlação com sintomas digestivos.', updatedAt: '2024-12-01' },
  { id: '6', userId: '1', foodId: '6', food: mockFoods[5], status: 'safe', safetyScore: 95, aiNotes: 'Excelente tolerância. Alimento base recomendado.', updatedAt: '2024-12-01' },
  { id: '7', userId: '1', foodId: '7', food: mockFoods[6], status: 'safe', safetyScore: 85, aiNotes: 'Boa tolerância. Rico em fibras e proteínas.', updatedAt: '2024-12-01' },
  { id: '8', userId: '1', foodId: '8', food: mockFoods[7], status: 'safe', safetyScore: 98, aiNotes: 'Excelente fonte de proteína. Sem correlação com sintomas.', updatedAt: '2024-12-01' },
  { id: '9', userId: '1', foodId: '9', food: mockFoods[8], status: 'safe', safetyScore: 96, aiNotes: 'Proteína de fácil digestão. Altamente recomendado.', updatedAt: '2024-12-01' },
  { id: '10', userId: '1', foodId: '10', food: mockFoods[9], status: 'safe', safetyScore: 90, aiNotes: 'Bem tolerado. Versátil e nutritivo.', updatedAt: '2024-12-01' },
  { id: '11', userId: '1', foodId: '11', food: mockFoods[10], status: 'safe', safetyScore: 92, aiNotes: 'Fruta de fácil digestão. Rica em potássio.', updatedAt: '2024-12-01' },
  { id: '12', userId: '1', foodId: '12', food: mockFoods[11], status: 'moderate', safetyScore: 60, aiNotes: 'Contém frutose. Consumir com moderação.', updatedAt: '2024-12-01' },
  { id: '13', userId: '1', foodId: '18', food: mockFoods[17], status: 'avoid', safetyScore: 25, aiNotes: 'Alto teor de FODMAPs. Pode causar gases e estufamento.', updatedAt: '2024-12-01' },
  { id: '14', userId: '1', foodId: '19', food: mockFoods[18], status: 'avoid', safetyScore: 22, aiNotes: 'Alto teor de FODMAPs. Evitar em grandes quantidades.', updatedAt: '2024-12-01' },
];

export const mockMessages: Message[] = [
  {
    id: '1',
    role: 'assistant',
    content: 'Olá! Eu sou o DigestAI, seu assistente especializado em saúde digestiva. 👋\n\nEstou aqui para ajudá-lo a entender melhor seu sistema digestivo, identificar possíveis intolerâncias alimentares e criar um plano alimentar personalizado.\n\nComo posso ajudá-lo hoje?',
    timestamp: '2024-12-04T08:00:00Z',
  },
];

export const mockReports: Report[] = [
  {
    id: '1',
    userId: '1',
    periodStart: '2024-11-01',
    periodEnd: '2024-12-01',
    riskScore: 65,
    intolerances: [
      {
        type: 'Lactose',
        probability: 78,
        correlatedSymptoms: ['Dor abdominal', 'Náusea', 'Diarreia'],
        correlatedFoods: ['Leite', 'Queijo', 'Iogurte'],
      },
      {
        type: 'Glúten',
        probability: 62,
        correlatedSymptoms: ['Estufamento', 'Gases', 'Desconforto'],
        correlatedFoods: ['Pão', 'Macarrão', 'Biscoitos'],
      },
      {
        type: 'FODMAPs',
        probability: 45,
        correlatedSymptoms: ['Gases', 'Estufamento'],
        correlatedFoods: ['Cebola', 'Alho', 'Maçã'],
      },
    ],
    summary: 'Análise indica alta probabilidade de intolerância à lactose e sensibilidade ao glúten. Recomenda-se período de eliminação de 2-4 semanas para confirmação.',
    createdAt: '2024-12-01T10:00:00Z',
  },
];

export const mockUserPreferences: UserPreferences = {
  dietaryRestrictions: ['sem_lactose'],
  allergies: [],
  notificationSettings: {
    symptomReminder: true,
    newInsights: true,
    reportsReady: true,
    dailyTips: false,
  },
  alertIntensity: 'medium',
  theme: 'light',
};

export const symptomTypeLabels: Record<string, string> = {
  abdominal_pain: 'Dor Abdominal',
  bloating: 'Estufamento',
  gas: 'Gases',
  diarrhea: 'Diarreia',
  constipation: 'Prisão de Ventre',
  nausea: 'Náusea',
  heartburn: 'Azia/Refluxo',
  vomiting: 'Vômito',
  cramps: 'Cólicas',
  other: 'Outro',
};

export const quickSuggestions = [
  'O que posso comer hoje?',
  'Estou com estufamento, o que significa?',
  'Analise meus sintomas recentes',
  'Gerar relatório completo',
  'Quais alimentos devo evitar?',
  'Criar plano alimentar para hoje',
];
