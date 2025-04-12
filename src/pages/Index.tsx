import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import FoodSearch from "@/components/FoodSearch";
import FoodLogEntryForm from "@/components/FoodLogEntry";
import DailyGoals from "@/components/DailyGoals";
import { FitbitFood, FoodLogEntry, MealType, FitbitNutritionGoals, FitbitNutritionSummary } from "@/types";
import { format } from "date-fns";
import { getFitbitMealName, getFitbitMealType } from "@/lib/utils";
import { useFitbit } from "@/contexts/FitbitContext";
import { DialogTitle } from "@radix-ui/react-dialog";
import NutritionSummary from "@/components/NutritionSummary";
import QuickAddCard from "@/components/QuickAddCard";

const Index = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [selectedFood, setSelectedFood] = useState<FitbitFood | null>(null);
  
  const { foodLog, units, frequentFoods, addFoodLogEntry } = useFitbit();

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
  }, [foodLog])

  const handleFoodSelect = (food: FitbitFood) => {
    setSelectedFood(food);
  };

  const handleFoodLog = (entry: FoodLogEntry) => {
    addFoodLogEntry(entry);
    
    // Update summary data
    setSummaryData({
      ...summaryData,
      calories: summaryData.calories + (entry.nutritionalValues?.calories || 0),
      carbs: summaryData.carbs + (entry.nutritionalValues?.carbs || 0),
      fat: summaryData.fat + (entry.nutritionalValues?.fat || 0),
      protein: summaryData.protein + entry.nutritionalValues?.protein,
      fiber: summaryData.fiber + (entry.nutritionalValues?.fiber || 0),
      sodium: summaryData.sodium + (entry.nutritionalValues?.sodium || 0),
      sugar: summaryData.sugar + (entry.nutritionalValues?.sugar || 0),
    });
    
    setIsSearchOpen(false);
  };

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
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Food Log</CardTitle>
                  <CardDescription>Today's logged foods</CardDescription>
                </div>
                <Dialog open={isSearchOpen || !!selectedFood} onOpenChange={(open) => { 
                  setIsSearchOpen(open); 
                  setSelectedFood(open ? selectedFood : null); 
                }}>
                  <DialogTrigger asChild>
                    <Button className="bg-fitview-primary hover:bg-fitview-accent">
                      Log Food
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[600px]">
                    {selectedFood ? (
                      <FoodLogEntryForm 
                        food={selectedFood}
                        onClose={() => setSelectedFood(null)} 
                        onLog={handleFoodLog}
                      />
                    ) : (
                      <div>
                        <h2 className="text-2xl font-bold mb-4">Search Foods</h2>
                        <FoodSearch onFoodSelect={handleFoodSelect} />
                      </div>
                    )}
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="all">
                  <TabsList className="mb-4">
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="breakfast">Breakfast</TabsTrigger>
                    <TabsTrigger value="morning snack">Morning Snack</TabsTrigger>
                    <TabsTrigger value="lunch">Lunch</TabsTrigger>
                    <TabsTrigger value="afternoon snack">Afternoon Snack</TabsTrigger>
                    <TabsTrigger value="dinner">Dinner</TabsTrigger>
                    <TabsTrigger value="evening snack">Evening Snack</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="all" className="space-y-4">
                    {foodLog.foods.length > 0 ? (
                      foodLog.foods.map((entry) => (
                        <Card key={entry.logId}>
                          <CardContent className="p-4">
                            <div className="flex justify-between items-center">
                              <div>
                                <h3 className="font-medium">{entry.loggedFood.name}</h3>
                                <p className="text-sm text-muted-foreground">
                                  {entry.loggedFood.amount} {entry.loggedFood.amount !== 1 ? entry.loggedFood.unit.plural : entry.loggedFood.unit.name} • {getFitbitMealName(entry.loggedFood.mealTypeId)}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="font-medium">{entry.nutritionalValues.calories.toFixed(0)} cal</p>
                                <p className="text-xs text-muted-foreground">
                                  {format(new Date(entry.logDate), "h:mm a")}
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    ) : (
                      <div className="text-center py-6">
                        <p className="text-muted-foreground">No foods logged today</p>
                        <Button 
                          variant="outline" 
                          onClick={() => setIsSearchOpen(true)}
                          className="mt-2"
                        >
                          Log your first meal
                        </Button>
                      </div>
                    )}
                  </TabsContent>
                  
                  {/* Similar TabsContent for breakfast, lunch, dinner, snack */}
                  {["breakfast", "morning snack", "lunch", "afternoon snack", "dinner", "evening snack"].map((mealType) => (
                    <TabsContent key={mealType} value={mealType} className="space-y-4">
                      {foodLog.foods.filter(entry => entry.loggedFood.mealTypeId === getFitbitMealType(mealType)).length > 0 ? (
                        foodLog.foods
                          .filter(entry => entry.loggedFood.mealTypeId === getFitbitMealType(mealType))
                          .map((entry) => (
                            <Card key={entry.logId}>
                              <CardContent className="p-4">
                                <div className="flex justify-between items-center">
                                  <div>
                                    <h3 className="font-medium">{entry.loggedFood.name}</h3>
                                    <p className="text-sm text-muted-foreground">
                                      {entry.loggedFood.amount} {entry.loggedFood.amount !== 1 ? entry.loggedFood.unit.plural : entry.loggedFood.unit.name} • {getFitbitMealName(entry.loggedFood.mealTypeId)}
                                    </p>
                                  </div>
                                  <div className="text-right">
                                    <p className="font-medium">{entry.nutritionalValues.calories.toFixed(0)} cal</p>
                                    <p className="text-xs text-muted-foreground">
                                      {format(new Date(entry.logDate), "h:mm a")}
                                    </p>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))
                      ) : (
                        <div className="text-center py-6">
                          <p className="text-muted-foreground">No {mealType} foods logged</p>
                          <Button 
                            variant="outline" 
                            onClick={() => setIsSearchOpen(true)}
                            className="mt-2"
                          >
                            Log {mealType}
                          </Button>
                        </div>
                      )}
                    </TabsContent>
                  ))}
                </Tabs>
              </CardContent>
            </Card>
          </div>
          
          {/* Sidebar - 2 columns on medium+ screens */}
          <div className="md:col-span-2 space-y-6">
            <DailyGoals 
              goals={nutritionGoals} 
              onSave={setNutritionGoals} 
            />
            
            <QuickAddCard frequentFoods={frequentFoods} onFoodSelect={(food) => {
              handleFoodSelect(food);
              setIsSearchOpen(true); 
            }} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
