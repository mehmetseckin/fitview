
// Fitbit API Types
export interface FitbitFood {
  foodId: string;
  name: string;
  brand: string;
  calories: number;
  units: string[];
  defaultServingSize: number;
  defaultUnit: FitbitFoodUnit;
  nutritionalValues: {
    calories: number;
    carbs: number;
    fat: number;
    protein: number;
    fiber?: number;
    sodium?: number;
    sugar?: number;
  };
}

export interface FitbitFoodUnit {
  id: string;
  name: string;
  plural: string;
}

export interface FoodSearchResult {
  foods: FitbitFood[];
}

export interface FoodLogEntry {
  id: string;
  foodId: string;
  name: string;
  brand: string;
  mealTypeId: MealType;
  amount: number;
  unit: FitbitFoodUnit;
  calories: number;
  nutritionalValues: {
    calories: number;
    carbs: number;
    fat: number;
    protein: number;
    fiber?: number;
    sodium?: number;
    sugar?: number;
  };
  loggedAt: Date;
}

export interface NutritionSummary {
  calories: {
    consumed: number;
    goal: number;
  };
  macros: {
    carbs: { consumed: number; goal: number };
    fat: { consumed: number; goal: number };
    protein: { consumed: number; goal: number };
  };
}

export interface NutritionGoals {
  calories: number;
  macros: {
    carbs: number;
    fat: number;
    protein: number;
  };
}

export enum MealType {
  breakfast = 1,
  morningSnack = 2,
  lunch = 3,
  afternoonSnack = 4,
  dinner = 5,
  eveningSnack = 6,
  unknown = 7
}