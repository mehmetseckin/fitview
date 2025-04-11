
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import FoodSearch from "@/components/FoodSearch";
import FoodLogEntryForm from "@/components/FoodLogEntry";
import { FitbitFood, FoodLogEntry } from "@/types";
import { format } from "date-fns";
import { getFitbitMealName, getFitbitMealType } from "@/lib/utils";
import { useFitbit } from "@/contexts/FitbitContext";

const FoodLogCard = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [selectedFood, setSelectedFood] = useState<FitbitFood | null>(null);
  
  const { foodLog, units, addFoodLogEntry } = useFitbit();

  const handleFoodSelect = (food: FitbitFood) => {
    setSelectedFood(food);
  };

  const handleFoodLog = (entry: FoodLogEntry) => {
    addFoodLogEntry(entry);
    setIsSearchOpen(false);
  };

  return (
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
                units={units}
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
  );
};

export default FoodLogCard;
