
import { FitbitFood, FoodSearchResult, FoodLogEntry } from "@/types";

// This is a mock implementation since we don't have real API credentials yet
// In a real implementation, this would use the Fitbit Web API

// Mock food database
const mockFoodDatabase: FitbitFood[] = [
  {
    foodId: "1",
    name: "Apple",
    brand: "Generic",
    calories: 95,
    units: ["oz", "g", "serving"],
    servingSize: 182,
    servingSizeUnit: "g",
    nutritionalValues: {
      calories: 95,
      carbs: 25,
      fat: 0.3,
      protein: 0.5,
      fiber: 4.4,
      sugar: 19
    }
  },
  {
    foodId: "2",
    name: "Chicken Breast",
    brand: "Generic",
    calories: 165,
    units: ["oz", "g", "serving"],
    servingSize: 100,
    servingSizeUnit: "g",
    nutritionalValues: {
      calories: 165,
      carbs: 0,
      fat: 3.6,
      protein: 31,
      sodium: 74
    }
  },
  {
    foodId: "3",
    name: "Brown Rice",
    brand: "Generic",
    calories: 216,
    units: ["cup", "g", "serving"],
    servingSize: 195,
    servingSizeUnit: "g",
    nutritionalValues: {
      calories: 216,
      carbs: 45,
      fat: 1.8,
      protein: 5,
      fiber: 3.5
    }
  },
  {
    foodId: "4",
    name: "Greek Yogurt",
    brand: "Fage",
    calories: 90,
    units: ["container", "g", "serving"],
    servingSize: 170,
    servingSizeUnit: "g",
    nutritionalValues: {
      calories: 90,
      carbs: 5,
      fat: 0.5,
      protein: 18,
      sodium: 65
    }
  },
  {
    foodId: "5",
    name: "Avocado",
    brand: "Generic",
    calories: 234,
    units: ["fruit", "g", "serving"],
    servingSize: 150,
    servingSizeUnit: "g",
    nutritionalValues: {
      calories: 234,
      carbs: 12,
      fat: 21,
      protein: 2.9,
      fiber: 9.7
    }
  }
];

// Mock food log entries
const mockFoodLog: FoodLogEntry[] = [
  {
    id: "log1",
    foodId: "2",
    name: "Chicken Breast",
    brand: "Generic",
    mealType: "lunch",
    amount: 150,
    unit: "g",
    calories: 247,
    nutritionalValues: {
      calories: 247,
      carbs: 0,
      fat: 5.4,
      protein: 46.5
    },
    loggedAt: new Date(),
  },
  {
    id: "log2",
    foodId: "3",
    name: "Brown Rice",
    brand: "Generic",
    mealType: "lunch",
    amount: 1,
    unit: "cup",
    calories: 216,
    nutritionalValues: {
      calories: 216,
      carbs: 45,
      fat: 1.8,
      protein: 5,
      fiber: 3.5
    },
    loggedAt: new Date(),
  }
];

export const searchFoods = async (query: string): Promise<FoodSearchResult> => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 500));

  // Filter foods that match the query
  const results = mockFoodDatabase.filter(food =>
    food.name.toLowerCase().includes(query.toLowerCase()) ||
    food.brand.toLowerCase().includes(query.toLowerCase())
  );

  return {
    foods: results,
    pagination: {
      next: "",
      previous: "",
      offset: 0,
      limit: 20,
      total: results.length
    }
  };
};

export const getFoodDetails = async (foodId: string): Promise<FitbitFood | null> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  return mockFoodDatabase.find(food => food.foodId === foodId) || null;
};

export const logFood = async (foodEntry: Omit<FoodLogEntry, 'id' | 'loggedAt'>): Promise<FoodLogEntry> => {
  await new Promise(resolve => setTimeout(resolve, 400));
  
  const newEntry: FoodLogEntry = {
    ...foodEntry,
    id: `log${mockFoodLog.length + 1}`,
    loggedAt: new Date()
  };
  
  mockFoodLog.push(newEntry);
  return newEntry;
};

export const getFoodLog = async (date?: Date): Promise<FoodLogEntry[]> => {
  await new Promise(resolve => setTimeout(resolve, 400));
  
  // Filter by date if provided
  if (date) {
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);
    
    const nextDay = new Date(targetDate);
    nextDay.setDate(targetDate.getDate() + 1);
    
    return mockFoodLog.filter(entry => {
      const entryDate = new Date(entry.loggedAt);
      return entryDate >= targetDate && entryDate < nextDay;
    });
  }
  
  return [...mockFoodLog];
};

export const getNutritionSummary = async (date?: Date): Promise<{
  totalCalories: number;
  totalCarbs: number;
  totalFat: number;
  totalProtein: number;
}> => {
  const log = await getFoodLog(date);
  
  return log.reduce((acc, entry) => {
    return {
      totalCalories: acc.totalCalories + entry.nutritionalValues.calories,
      totalCarbs: acc.totalCarbs + entry.nutritionalValues.carbs,
      totalFat: acc.totalFat + entry.nutritionalValues.fat,
      totalProtein: acc.totalProtein + entry.nutritionalValues.protein
    };
  }, {
    totalCalories: 0,
    totalCarbs: 0,
    totalFat: 0,
    totalProtein: 0
  });
};
