import { FitbitFood, FoodSearchResult, FoodLogEntry, FitbitFoodUnit, FoodLog, FitbitNutritionSummary } from "@/types";
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
    return await this.fitbitApiRequest(`/foods/search.json?query=${encodeURIComponent(query)}`);
  }

  public async getFoodDetails(foodId: string): Promise<FitbitFood | null> {
    return await this.fitbitApiRequest(`/foods/${foodId}.json`);
  }

  public async logFood(foodEntry: Omit<FoodLogEntry, "logId" | "logDate">): Promise<FoodLogEntry> {
    const data = await this.fitbitApiRequest(`/user/-/foods/log.json`, "POST", {
      foodId: foodEntry.loggedFood.foodId,
      mealTypeId: foodEntry.loggedFood.mealTypeId,
      amount: foodEntry.loggedFood.amount,
      unitId: foodEntry.loggedFood.unit.id,
    });

    return data;
  }

  public async getFoodLog(date?: Date): Promise<FoodLog> {
    const dateString = (date ? date : new Date()).toISOString().split("T")[0];
    const data = await this.fitbitApiRequest(`/user/-/foods/log/date/${dateString}.json`);
    return data;
  }

  public async getNutritionSummary(date?: Date): Promise<FitbitNutritionSummary> {
    const log = await this.getFoodLog(date);
    return log.summary;
  }

  public async getFoodUnits(): Promise<FitbitFoodUnit[]> {
    return await this.fitbitApiRequest(`/foods/units.json`);
  }
}
