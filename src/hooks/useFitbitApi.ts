import { useMemo } from "react";
import { FitbitApiService } from "@/services/fitbitApi";
import { useAuth } from "@/contexts/AuthContext";
import { FoodLogEntry } from "@/types";

export const useFitbitApi = () => {
  const { user } = useAuth();

  const fitbitApi = useMemo(() => new FitbitApiService(user), [user?.id]);

  const getFoodLog = async (date?: Date) => {
    return await fitbitApi.getFoodLog(date);
  };

  const getNutritionSummary = async (date?: Date) => {
    return await fitbitApi.getNutritionSummary(date);
  };

  const searchFoods = async (query: string) => {   
    return await fitbitApi.searchFoods(query);
  };

  const getFoodDetails = async (foodId: string) => {
    return await fitbitApi.getFoodDetails(foodId);
  };

  const getFrequentFoods = async () => {
    return await fitbitApi.getFrequentFoods();
  };

  const logFood = async (foodEntry: Omit<FoodLogEntry, "logDate">) => {
    return await fitbitApi.logFood(foodEntry);
  };
  
  const getFoodUnits = async () => {
    return await fitbitApi.getFoodUnits();
  };

  return { getFoodLog, getFrequentFoods, getNutritionSummary, searchFoods, getFoodDetails, logFood, getFoodUnits };
};
