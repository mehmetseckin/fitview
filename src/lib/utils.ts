import { FitbitFood, LoggedFood, MealType } from "@/types"
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getFitbitMealName(mealTypeId: MealType) {
  switch (mealTypeId) {
    case MealType.breakfast:
      return "Breakfast";
    case MealType.lunch:
      return "Lunch";
    case MealType.dinner:
      return "Dinner";
    case MealType.morningSnack:
      return "Morning Snack";
    case MealType.afternoonSnack:
      return "Afternoon Snack";
    case MealType.eveningSnack:
      return "Evening Snack";
    default:
      return "Anytime";
  }
}

export function getFitbitMealType(mealName: string) {
  switch (mealName.toLowerCase()) {
    case "breakfast":
      return MealType.breakfast;
    case "lunch":
      return MealType.lunch;
    case "dinner":
      return MealType.dinner;
    case "morning snack":
      return MealType.morningSnack;
    case "afternoon snack":
      return MealType.afternoonSnack;
    case "evening snack":
      return MealType.eveningSnack;
    default:
      return MealType.anytime;
  }
}