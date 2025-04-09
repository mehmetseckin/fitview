import { FitbitFood, FoodSearchResult, FoodLogEntry } from "@/types";
import { supabase } from "@/integrations/supabase/client";

export class FitbitApiService {
  private user: { id: string };

  constructor(user: { id: string }) {
    this.user = user;
  }

  private async fitbitApiRequest(endpoint: string, method: string = "GET", body?: any) {
    const { data, error } = await supabase.functions.invoke("fitbit-proxy", {
      body: {
        userId: this.user.id,
        endpoint: `/1${endpoint}`,
        method,
        body,
      },
    });

    if (error) {
      throw new Error(`Fitbit API error: ${error.message}`);
    }

    return data;
  }

  public async searchFoods(query: string): Promise<FoodSearchResult> {
    const data = await this.fitbitApiRequest(`/foods/search.json?query=${encodeURIComponent(query)}`);
    return {
      foods: data.foods.map((food: any) => ({
        foodId: food.foodId,
        name: food.name,
        brand: food.brand,
        calories: food.calories,
        units: food.units,
        servingSize: food.defaultServingSize,
        servingSizeUnit: food.defaultUnit,
        nutritionalValues: food.nutritionalValues,
      })),
      pagination: {
        next: data.pagination.next,
        previous: data.pagination.previous,
        offset: data.pagination.offset,
        limit: data.pagination.limit,
        total: data.pagination.total,
      },
    };
  }

  public async getFoodDetails(foodId: string): Promise<FitbitFood | null> {
    const data = await this.fitbitApiRequest(`/foods/${foodId}.json`);
    return {
      foodId: data.foodId,
      name: data.name,
      brand: data.brand,
      calories: data.calories,
      units: data.units,
      servingSize: data.defaultServingSize,
      servingSizeUnit: data.defaultUnit,
      nutritionalValues: data.nutritionalValues,
    };
  }

  public async logFood(foodEntry: Omit<FoodLogEntry, "id" | "loggedAt">): Promise<FoodLogEntry> {
    const data = await this.fitbitApiRequest(`/user/-/foods/log.json`, "POST", {
      foodId: foodEntry.foodId,
      mealTypeId: foodEntry.mealTypeId,
      amount: foodEntry.amount,
      unitId: foodEntry.unit,
    });

    return {
      id: data.logId,
      foodId: data.foodId,
      name: data.foodName,
      brand: data.brand,
      mealTypeId: data.mealTypeId,
      amount: data.amount,
      unit: data.unit,
      calories: data.calories,
      nutritionalValues: data.nutritionalValues,
      loggedAt: new Date(data.logDate),
    };
  }

  public async getFoodLog(date?: Date): Promise<FoodLogEntry[]> {
    const dateString = (date ? date : new Date()).toISOString().split("T")[0];
    const data = await this.fitbitApiRequest(`/user/-/foods/log/date/${dateString}.json`);

    return data.foods.map((entry: any) => ({
      id: entry.logId,
      foodId: entry.foodId,
      name: entry.foodName,
      brand: entry.brand,
      mealTypeId: entry.mealTypeId,
      amount: entry.amount,
      unit: entry.unit,
      calories: entry.calories,
      nutritionalValues: entry.nutritionalValues,
      loggedAt: new Date(entry.logDate),
    }));
  }

  public async getNutritionSummary(date?: Date): Promise<{
    totalCalories: number;
    totalCarbs: number;
    totalFat: number;
    totalProtein: number;
  }> {
    const log = await this.getFoodLog(date);

    return log.reduce(
      (acc, entry) => {
        return {
          totalCalories: acc.totalCalories + entry.nutritionalValues.calories,
          totalCarbs: acc.totalCarbs + entry.nutritionalValues.carbs,
          totalFat: acc.totalFat + entry.nutritionalValues.fat,
          totalProtein: acc.totalProtein + entry.nutritionalValues.protein,
        };
      },
      {
        totalCalories: 0,
        totalCarbs: 0,
        totalFat: 0,
        totalProtein: 0,
      }
    );
  }
}
