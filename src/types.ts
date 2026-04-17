export type Role = 'user' | 'coach' | 'owner';

export type Language = 
  | 'English' | 'Assamese' | 'Bengali' | 'Bodo' | 'Dogri' | 'Gujarati' 
  | 'Hindi' | 'Kannada' | 'Kashmiri' | 'Konkani' | 'Maithili' | 'Malayalam' 
  | 'Manipuri' | 'Marathi' | 'Nepali' | 'Odia' | 'Punjabi' | 'Sanskrit' 
  | 'Santali' | 'Sindhi' | 'Tamil' | 'Telugu' | 'Urdu';

export interface UserStats {
  calories: { current: number; target: number };
  protein: { current: number; target: number };
  carbs: { current: number; target: number };
  fats: { current: number; target: number };
  fiber: { current: number; target: number };
  hydration: { current: number; target: number };
  exercise: {
    caloriesBurnt: number;
    logs: {
      id: string;
      name: string;
      duration: number; // in minutes
      caloriesBurnt: number;
      time: string;
    }[];
  };
  meals: {
    id: string;
    name: string;
    kcal: number;
    protein: number;
    carbs: number;
    fats: number;
    fiber: number;
    time: string;
  }[];
  checkIns: {
    id: string;
    label: string;
    checked: boolean;
  }[];
  supplements: {
    id: string;
    name: string;
    time: string;
    checked: boolean;
  }[];
  energyLevel?: number; // 1-10
  targetEnergyLevel?: number; // 1-10
  weight?: number; // Recorded weight for this day
}

export interface WeightLog {
  id: string;
  weight: number;
  date: string; // ISO string
}

export interface UserProfile {
  id: string;
  name: string;
  waterGoal: number; // in liters
  role: Role;
  pin: string;
  height?: number; // in cm
  weight?: number; // in kg
  weightHistory?: WeightLog[];
  healthGoals?: string[];
  coachName?: string;
  coachId?: string;
  email?: string;
  avatar?: string;
}

export interface MealItem {
  id: string;
  name: string;
  amount: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  fiber: number;
}

export interface FoodCombo {
  id: string;
  name: string;
  items: string[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFats: number;
  totalFiber: number;
}

export interface AssignedUser {
  id: string;
  name: string;
  avatar: string;
  lastLog: string;
  meals?: {
    id: string;
    name: string;
    kcal: number;
    protein: number;
    carbs: number;
    fats: number;
    fiber: number;
    time: string;
  }[];
  status: 'optimal' | 'low-fiber' | 'incomplete';
  stats: UserStats;
  weight?: number;
  targetWeight?: number;
  coachId?: string;
  feedback?: string;
}
