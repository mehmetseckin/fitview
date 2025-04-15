import { FitbitFood, FoodSearchResult, FoodLogEntry, FitbitFoodUnit, FoodLog, FitbitNutritionSummary, FrequentFood, FitbitLogFoodResponse } from "@/types";
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
    return await this.fitbitApiRequest(`/foods/search.json?query=${encodeURIComponent(query?.toLowerCase())}`);
  }

  public async getFoodDetails(foodId: string): Promise<{ food: FitbitFood } | null> {
    return await this.fitbitApiRequest(`/foods/${foodId}.json`);
  }

  public async logFood(foodEntry: Omit<FoodLogEntry, "logDate">): Promise<FitbitLogFoodResponse> {
    
    const { logId, loggedFood } = foodEntry;
    const { foodId, mealTypeId, unit, amount } = loggedFood;
    const endpoint = !!logId ? `/user/-/foods/log/${logId}.json` : `/user/-/foods/log.json`;
    const parameters = new URLSearchParams({
      foodId: foodId.toString(),
      mealTypeId: mealTypeId.toString(),
      unitId: unit.id.toString(),
      amount: amount.toString()
    });

    if(!logId) {
      parameters.append("date", (new Date()).toISOString());
    }

    const data = await this.fitbitApiRequest(`${endpoint}?${parameters}`, "POST");
    return data;
  }

  public async deleteFoodLog(logId: string): Promise<any> {
    const data = await this.fitbitApiRequest(`/user/-/foods/log/${logId}.json`, "DELETE");
    return data;
  }

  public async getFoodLog(date?: Date): Promise<FoodLog> {
    const dateString = (date ? date : new Date()).toISOString().split("T")[0];
    const data = await this.fitbitApiRequest(`/user/-/foods/log/date/${dateString}.json`);
    return data;
  }

  public async getFrequentFoods(): Promise<FrequentFood[]> {
    const data = await this.fitbitApiRequest(`/user/-/foods/log/frequent.json`);
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
