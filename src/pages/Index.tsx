import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import FoodLogCard from "@/components/FoodLogCard";
import DailyGoals from "@/components/DailyGoals";
import { FitbitNutritionGoals, FitbitNutritionSummary } from "@/types";
import { useFitbit } from "@/contexts/FitbitContext";
import NutritionSummary from "@/components/NutritionSummary";
import QuickAddCard from "@/components/QuickAddCard";

const Index = () => {
  const { foodLog, frequentFoods } = useFitbit();

  const [nutritionGoals, setNutritionGoals] = useState<FitbitNutritionGoals>({
    calories: 0,
    macros: {
      carbs: 0,
      fat: 0,
      protein: 0
    }
  });

  const [summaryData, setSummaryData] = useState<FitbitNutritionSummary>({
    calories: 0,
    carbs: 0,
    fat: 0,
    protein: 0,
    fiber: 0,
    sodium: 0,
    sugar: 0,
    water: 0
  });

  useEffect(() => {
    setNutritionGoals(foodLog.goals);
    setSummaryData(foodLog.summary);
  }, [foodLog]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container py-6">
        <h1 className="text-3xl font-bold mb-6">FitView Dashboard</h1>
        
        <div className="grid gap-6 md:grid-cols-6">
          {/* Main content area - 4 columns on medium+ screens */}
          <div className="md:col-span-4 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Nutrition Overview</CardTitle>
                <CardDescription>Track your daily nutrition intake</CardDescription>
              </CardHeader>
              <CardContent>
                <NutritionSummary 
                  calories={{
                    consumed: summaryData.calories,
                    goal: nutritionGoals.calories
                  }}
                  macros={{
                    carbs: {
                      consumed: summaryData.carbs,
                      goal: nutritionGoals.macros?.carbs || 0
                    },
                    fat: {
                      consumed: summaryData.fat,
                      goal: nutritionGoals.macros?.fat || 0
                    },
                    protein: {
                      consumed: summaryData.protein,
                      goal: nutritionGoals.macros?.protein || 0
                    }
                  }}
                />
              </CardContent>
            </Card>
            
            <FoodLogCard />
          </div>
          
          {/* Sidebar - 2 columns on medium+ screens */}
          <div className="md:col-span-2 space-y-6">
            <DailyGoals 
              goals={nutritionGoals} 
              onSave={setNutritionGoals} 
            />
            
            <QuickAddCard frequentFoods={frequentFoods} onFoodSelect={(food) => {
              // We need to keep this functionality but delegate it to the FoodLogCard component.
              // For now, the FoodLogCard handles its own state and doesn't need this property.
            }} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
