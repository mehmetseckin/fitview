
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { FitbitFood, FitbitFoodUnit, FoodLogEntry, MealType } from "@/types";
import { useToast } from "@/components/ui/use-toast";
import { useFitbitApi } from "@/hooks/useFitbitApi";
import { getFitbitMealName } from "@/lib/utils";

interface FoodLogEntryProps {
  food: FitbitFood;
  onClose: () => void;
  onLog: (entry: FoodLogEntry) => void;
}

const FoodLogEntryForm = ({ food, onClose, onLog }: FoodLogEntryProps) => {
  const [mealType, setMealType] = useState<MealType>(MealType.breakfast);
  const [amount, setAmount] = useState(1);
  const [unit, setUnit] = useState(food.defaultUnit);
  const [isLogging, setIsLogging] = useState(false);
  const { toast } = useToast();
  const { getFoodDetails, logFood } = useFitbitApi();
  const [isDetailsLoaded, setIsDetailsLoaded] = useState(false);
  const [foodDetails, setFoodDetails] = useState<FitbitFood | null>(food);
  const [calories, setCalories] = useState(food.calories);

  useEffect(() => {
    if(isDetailsLoaded)
      return;

    getFoodDetails(food.foodId)
      .then((data) => {
        setFoodDetails(data.food);
        setIsDetailsLoaded(true);
      })
      .catch((error) => {
        console.error("Error fetching food details:", error);
      });
  }, [isDetailsLoaded, food]);
  
  useEffect(() => {
    let serving = foodDetails.servings?.find((s) => s.unit.id === unit.id);
    if (serving) {
      setCalories(amount * serving.multiplier * food.calories);
    }
  }, [amount, unit]);

  const handleSubmit = async () => {
    try {
      setIsLogging(true);
      
      if (amount <= 0) {
        toast({
          title: "Invalid amount",
          description: "Please enter a valid amount greater than zero",
          variant: "destructive"
        });
        return;
      }
      
      const entry = await logFood({
        loggedFood: {
          foodId: foodDetails.foodId,
          name: foodDetails.name,
          brand: foodDetails.brand,
          mealTypeId: mealType,
          amount: amount,
          unit: unit,
          calories: foodDetails.calories
        }
      });
      
      toast({
        title: "Food logged successfully",
        description: `Added ${foodDetails.name} to your ${getFitbitMealName(mealType)} log`,
      });
      
      onLog(entry);
      onClose();
    } catch (error) {
      console.error("Error logging food:", error);
      toast({
        title: "Error",
        description: "Failed to log food. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLogging(false);
    }
  };

  return isDetailsLoaded ? (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-medium">{foodDetails.name}</h3>
            <p className="text-sm text-muted-foreground">{foodDetails.brand}</p>
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Amount</label>
              <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(parseFloat(e.target.value))}
                min="0"
                step="0.1"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Unit</label>
              <Select value={unit.id} onValueChange={(value) => setUnit(foodDetails.servings.find((s) => s.unit.id === value).unit)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {foodDetails.servings.map((serving) => {
                    const u = serving.unit;
                    return (
                      <SelectItem key={u.id} value={u.id}>
                        {amount !== 1 ? u.plural : u.name}
                      </SelectItem>
                    );
                  }
                )}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Meal</label>
              <Select value={mealType.toString()} onValueChange={(value: any) => setMealType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={MealType.breakfast.toString()}>{getFitbitMealName(MealType.breakfast)}</SelectItem>
                  <SelectItem value={MealType.morningSnack.toString()}>{getFitbitMealName(MealType.morningSnack)}</SelectItem>
                  <SelectItem value={MealType.lunch.toString()}>{getFitbitMealName(MealType.lunch)}</SelectItem>
                  <SelectItem value={MealType.afternoonSnack.toString()}>{getFitbitMealName(MealType.afternoonSnack)}</SelectItem>
                  <SelectItem value={MealType.dinner.toString()}>{getFitbitMealName(MealType.dinner)}</SelectItem>
                  <SelectItem value={MealType.eveningSnack.toString()}>{getFitbitMealName(MealType.eveningSnack)}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="pt-2">
            <h4 className="text-sm font-medium mb-2">Nutrition</h4>
            <div className="grid grid-cols-4 gap-2 text-sm">
              <div>
                <p className="font-medium">{calories.toFixed(0)}</p>
                <p className="text-xs text-muted-foreground">calories</p>
              </div>
              <div>
                <p className="font-medium">{foodDetails.nutritionalValues?.carbs.toFixed(1)}g</p>
                <p className="text-xs text-muted-foreground">carbs</p>
              </div>
              <div>
                <p className="font-medium">{foodDetails.nutritionalValues?.fat.toFixed(1)}g</p>
                <p className="text-xs text-muted-foreground">fat</p>
              </div>
              <div>
                <p className="font-medium">{foodDetails.nutritionalValues?.protein.toFixed(1)}g</p>
                <p className="text-xs text-muted-foreground">protein</p>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              className="bg-fitview-primary hover:bg-fitview-accent" 
              onClick={handleSubmit}
              disabled={isLogging}
            >
              {isLogging ? "Logging..." : "Log Food"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
  : <p>Loading...</p>;
};

export default FoodLogEntryForm;
