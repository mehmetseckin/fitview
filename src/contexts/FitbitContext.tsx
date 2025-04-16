import { useFitbitApi } from "@/hooks/useFitbitApi";
import { FitbitFoodUnit, FitbitNutritionSummary, FoodLog, FoodLogEntry, FrequentFood } from "@/types";
import { createContext, useContext, useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext"; // Import AuthContext to check for user

type FitbitContextType = {
  units: FitbitFoodUnit[];
  foodLog: FoodLog;
  frequentFoods: FrequentFood[];
  date: Date,
  setDate: (date: Date) => void;
  addFoodLogEntry: (entry: FoodLogEntry, summary: FitbitNutritionSummary) => void;
  deleteFoodLogEntry: (logId: string) => void;
};

const FitbitContext = createContext<FitbitContextType | undefined>(undefined);

export const FitbitProvider = ({ children }: { children: React.ReactNode }) => {
  const [units, setUnits] = useState<FitbitFoodUnit[]>([]);
  const [date, setDate] = useState<Date>(new Date());
  const [foodLog, setFoodLog] = useState<FoodLog>({
    foods: [],
    summary: {
      calories: 0,
      carbs: 0,
      protein: 0,
      fat: 0,
      fiber: 0,
      sodium: 0,
      water: 0
    },
    goals: {
      calories: 0,
      macros: {
        carbs: 0,
        fat: 0,
        protein: 0
      }
    }
  });
  const [frequentFoods, setFrequentFoods] = useState<FrequentFood[]>([]); // State to store frequent food
  const { user } = useAuth(); // Get user and loading state from AuthContext
  const { getFoodUnits, getFoodLog, getFrequentFoods } = useFitbitApi();

  useEffect(() => {
    // Wait until the AuthContext has finished loading and the user is available
    if (!user) {
      return;
    }

    // Fetch food units once when the user is available
    const unitsPromise = getFoodUnits()
      .then((data) => {
        setUnits(data);
      })
      .catch((error) => {
        console.error("Error fetching food units:", error);
      });

      const foodLogPromise = getFoodLog(date)
      .then((data) => {
        setFoodLog(data);
      })
      .catch((error) => {
        console.error("Error fetching food log:", error);
      });
      
      const frequentFoodsPromise = getFrequentFoods()
      .then((data) => {
        setFrequentFoods(data);
      })
      .catch((error) => {
        console.error("Error fetching food log:", error);
      });
      
      Promise.all([unitsPromise, foodLogPromise, frequentFoodsPromise]);
  }, [user?.id, date]);

  const addFoodLogEntry = useCallback((entry: FoodLogEntry, summary: FitbitNutritionSummary) => {
    setFoodLog((log) => ({
      ...log,
      foods: [...log.foods.filter(f => f.logId !== entry.logId), entry],
      summary: summary || log.summary
    }));
  }, []);

  const deleteFoodLogEntry = useCallback((logId: string) => {
    setFoodLog((log) => ({
      ...log,
      foods: [...log.foods.filter(f => f.logId !== logId)],
    }));
  }, []);

  const value = useMemo(() => ({ 
    units,
    date,
    foodLog, 
    frequentFoods, 
    addFoodLogEntry,
    deleteFoodLogEntry,
    setDate
  }), [units, date, foodLog, frequentFoods, addFoodLogEntry, deleteFoodLogEntry, setDate]);

  return (
    <FitbitContext.Provider value={value}>
      {children}
    </FitbitContext.Provider>
  );
};

export const useFitbit = () => {
  const context = useContext(FitbitContext);
  if (context === undefined) {
    throw new Error("useFitbit must be used within a FitbitProvider");
  }
  return context;
};
