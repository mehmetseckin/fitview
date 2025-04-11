
// Fitbit API Types
export interface FitbitFood {
  accessLevel?: "PUBLIC" | "PRIVATE";
  foodId: string;
  name: string;
  brand: string;
  calories: number;
  units: string[];
  defaultServingSize: number;
  defaultUnit: FitbitFoodUnit;
  isGeneric?: boolean;
  locale?: string;
  servings?: [{
    multiplier: number,
    servingSize: number,
    unit: FitbitFoodUnit,
    unitId: number,
  }],
  nutritionalValues?: {
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

export interface FoodLog {
  foods: FoodLogEntry[];
  summary: FitbitNutritionSummary;
  goals: FitbitNutritionGoals;
}

export interface FoodLogEntry {
  isFavorite?: boolean;
  logId: string;
  logDate: Date;
  loggedFood: LoggedFood;
  nutritionalValues?: {
    calories: number;
    carbs: number;
    fat: number;
    protein: number;
    fiber?: number;
    sodium?: number;
    sugar?: number;
  };
}

export interface LoggedFood {
  foodId: string;
  name: string;
  brand: string;
  mealTypeId: MealType;
  amount: number;
  unit: FitbitFoodUnit;
  calories: number;
  accesLevel?: "PUBLIC" | "PRIVATE";
  locale?: string;
}

export interface FrequentFood extends LoggedFood {
  dateLastEaten: Date;
}

export interface FitbitNutritionSummary {
  calories: number;
  carbs: number;
  fat: number;
  protein: number;
  fiber?: number;
  sodium?: number;
  sugar?: number;
  water: number;
}

export interface FitbitNutritionGoals {
  calories: number;
  macros?: {
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
  anytime = 7
}