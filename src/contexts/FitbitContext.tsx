import { useFitbitApi } from "@/hooks/useFitbitApi";
import { FitbitFoodUnit, FoodLog, FoodLogEntry } from "@/types";
import { createContext, useContext, useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext"; // Import AuthContext to check for user

type FitbitContextType = {
  units: FitbitFoodUnit[];
  foodLog: FoodLog;
  addFoodLogEntry: (entry: FoodLogEntry) => void;
};

const FitbitContext = createContext<FitbitContextType | undefined>(undefined);

export const FitbitProvider = ({ children }: { children: React.ReactNode }) => {
  const [units, setUnits] = useState<FitbitFoodUnit[]>([]);
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
  const isLoaded = useRef(false); // Track if food units are loaded
  const { user } = useAuth(); // Get user and loading state from AuthContext
  const { getFoodUnits, getFoodLog } = useFitbitApi();

  useEffect(() => {
    // Wait until the AuthContext has finished loading and the user is available
    if (!user || isLoaded.current) {
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

    const foodLogPromise = getFoodLog()
      .then((data) => {
        setFoodLog(data);
      })
      .catch((error) => {
        console.error("Error fetching food log:", error);
      });
      
      Promise.all([unitsPromise, foodLogPromise])
        .then(() => (isLoaded.current = true)); // Mark as loaded to prevent re-fetching
  }, [user]);

  const addFoodLogEntry = (entry: FoodLogEntry) => {
    setFoodLog((log) => ({
      ...log,
      foods: [...log.foods, entry]
    }));
  };

  return (
    <FitbitContext.Provider value={{ units, foodLog, addFoodLogEntry }}>
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
