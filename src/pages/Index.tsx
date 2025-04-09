import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import FoodSearch from "@/components/FoodSearch";
import NutritionSummary from "@/components/NutritionSummary";
import FoodLogEntryForm from "@/components/FoodLogEntry";
import DailyGoals from "@/components/DailyGoals";
import { FitbitFood, FoodLogEntry, MealType, NutritionGoals } from "@/types";
import { format } from "date-fns";
import { useFitbitApi } from "@/hooks/useFitbitApi";
import { getFitbitMealName, getFitbitMealType } from "@/lib/utils";

const Index = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [selectedFood, setSelectedFood] = useState<FitbitFood | null>(null);
  const [foodLog, setFoodLog] = useState<FoodLogEntry[]>([]);
  const [summaryData, setSummaryData] = useState({
    totalCalories: 0,
    totalCarbs: 0, 
    totalFat: 0,
    totalProtein: 0
  });
  
  const [nutritionGoals, setNutritionGoals] = useState<NutritionGoals>({
    calories: 2000,
    macros: {
      carbs: 250,
      fat: 65,
      protein: 150
    }
  });

  const { getFoodLog, getNutritionSummary } = useFitbitApi();

  const fetchData = async () => {
    try {
      const log = await getFoodLog();
      setFoodLog(log);
      
      const summary = await getNutritionSummary();
      setSummaryData(summary);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleFoodSelect = (food: FitbitFood) => {
    setSelectedFood(food);
  };

  const handleFoodLog = (entry: FoodLogEntry) => {
    setFoodLog([entry, ...foodLog]);
    
    // Update summary data
    setSummaryData({
      totalCalories: summaryData.totalCalories + entry.nutritionalValues.calories,
      totalCarbs: summaryData.totalCarbs + entry.nutritionalValues.carbs,
      totalFat: summaryData.totalFat + entry.nutritionalValues.fat,
      totalProtein: summaryData.totalProtein + entry.nutritionalValues.protein
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
                    consumed: summaryData.totalCalories,
                    goal: nutritionGoals.calories
                  }}
                  macros={{
                    carbs: {
                      consumed: summaryData.totalCarbs,
                      goal: nutritionGoals.macros.carbs
                    },
                    fat: {
                      consumed: summaryData.totalFat,
                      goal: nutritionGoals.macros.fat
                    },
                    protein: {
                      consumed: summaryData.totalProtein,
                      goal: nutritionGoals.macros.protein
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
                <Dialog open={isSearchOpen} onOpenChange={setIsSearchOpen}>
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
                    {foodLog.length > 0 ? (
                      foodLog.map((entry) => (
                        <Card key={entry.id}>
                          <CardContent className="p-4">
                            <div className="flex justify-between items-center">
                              <div>
                                <h3 className="font-medium">{entry.name}</h3>
                                <p className="text-sm text-muted-foreground">
                                  {entry.amount} {entry.unit} • {getFitbitMealName(entry.mealTypeId)}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="font-medium">{entry.nutritionalValues.calories.toFixed(0)} cal</p>
                                <p className="text-xs text-muted-foreground">
                                  {format(new Date(entry.loggedAt), "h:mm a")}
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
                      {foodLog.filter(entry => entry.mealTypeId === getFitbitMealType(mealType)).length > 0 ? (
                        foodLog
                          .filter(entry => entry.mealTypeId === getFitbitMealType(mealType))
                          .map((entry) => (
                            <Card key={entry.id}>
                              <CardContent className="p-4">
                                <div className="flex justify-between items-center">
                                  <div>
                                    <h3 className="font-medium">{entry.name}</h3>
                                    <p className="text-sm text-muted-foreground">
                                      {entry.amount} {entry.unit}
                                    </p>
                                  </div>
                                  <div className="text-right">
                                    <p className="font-medium">{entry.nutritionalValues.calories.toFixed(0)} cal</p>
                                    <p className="text-xs text-muted-foreground">
                                      {format(new Date(entry.loggedAt), "h:mm a")}
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
            
            <Card>
              <CardHeader>
                <CardTitle>Quick Add</CardTitle>
                <CardDescription>Frequently logged foods</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-start" onClick={() => setIsSearchOpen(true)}>
                    Search for foods
                  </Button>
                  {/* We'd add favorite/frequent foods here once the user logs more items */}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
