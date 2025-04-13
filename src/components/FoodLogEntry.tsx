
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input";
import { FitbitFood, FitbitFoodUnit, FitbitNutritionSummary, FoodLogEntry, MealType } from "@/types";
import { useToast } from "@/components/ui/use-toast";
import { useFitbitApi } from "@/hooks/useFitbitApi";
import { getFitbitMealName } from "@/lib/utils";

interface FoodLogEntryProps {
  foodLog?: FoodLogEntry;
  food: FitbitFood;
  onClose: () => void;
  onLog: (entry: FoodLogEntry, summary: FitbitNutritionSummary) => void;
  onDelete: (logId: string) => void;
}

const FoodLogEntryForm = ({ foodLog, food, onClose, onLog, onDelete }: FoodLogEntryProps) => {
  const [mealType, setMealType] = useState<MealType>(foodLog?.loggedFood.mealTypeId || MealType.breakfast);
  const [amount, setAmount] = useState(foodLog?.loggedFood.amount || food?.defaultServingSize || 1);
  const [unit, setUnit] = useState(foodLog?.loggedFood.unit || food?.defaultUnit);
  const [isLogging, setIsLogging] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();
  const { getFoodDetails, logFood, deleteFoodLog } = useFitbitApi();
  const [isDetailsLoaded, setIsDetailsLoaded] = useState(false);
  const [foodDetails, setFoodDetails] = useState<FitbitFood | null>(food);
  const [calories, setCalories] = useState(foodLog?.loggedFood.calories || food?.calories);
  const nutritionalValues = foodLog?.nutritionalValues || foodDetails?.nutritionalValues;
  useEffect(() => {
    if(isDetailsLoaded)
      return;

    let foodId = foodLog?.loggedFood.foodId || food?.foodId;
    if(!foodId)
      return;

    getFoodDetails(foodId)
      .then((data) => {
        setFoodDetails(data.food);
        setUnit(foodLog?.loggedFood.unit || data.food.defaultUnit)
        setIsDetailsLoaded(true);
      })
      .catch((error) => {
        console.error("Error fetching food details:", error);
      });
  }, [isDetailsLoaded, food]);
  
  useEffect(() => {
    if(!foodDetails)
      return;

    let serving = foodDetails.servings?.find((s) => s.unit.id === unit.id);
    if (serving) {
      setCalories((amount / serving.servingSize) * serving.multiplier * foodDetails.calories);
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

      const isUpdate = !!(foodLog?.logId);
      const response = await logFood({
        logId: foodLog?.logId,
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
        description: `${isUpdate ? 'Updated' : 'Added'} ${foodDetails.name} ${isUpdate ? 'in' : 'to'} your ${getFitbitMealName(mealType)} log`,
      });
      
      onLog(response.foodLog, response.foodDay?.summary);
    } catch (error) {
      console.error("Error logging food:", error);
      toast({
        title: "Error",
        description: "Failed to log food. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLogging(false);
      onClose();
    }
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      
      const logId = foodLog?.logId;
      if(!!logId) {
        const response = await deleteFoodLog(logId);
        toast({
          title: "Food log deleted successfully",
          description: `Deleted ${foodDetails.name} from your ${getFitbitMealName(mealType)} log.`,
        });
        
        onDelete(logId);
      }
    } catch (error) {
      console.error("Error deleting food log:", error);
      toast({
        title: "Error",
        description: "Failed to delete food log. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
      onClose();
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
              <Select value={mealType.toString()} onValueChange={(value: any) => setMealType(parseFloat(value))}>
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
              {nutritionalValues && (<>
                <div>
                  <p className="font-medium">{nutritionalValues.carbs.toFixed(1)}g</p>
                  <p className="text-xs text-muted-foreground">carbs</p>
                </div>
                <div>
                  <p className="font-medium">{nutritionalValues.fat.toFixed(1)}g</p>
                  <p className="text-xs text-muted-foreground">fat</p>
                </div>
                <div>
                  <p className="font-medium">{nutritionalValues.protein.toFixed(1)}g</p>
                  <p className="text-xs text-muted-foreground">protein</p>
                </div>
              </>)}
            </div>
          </div>
          <div className="flex justify-between">
            {
              !!foodLog && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button 
                      variant="destructive"
                      disabled={isLogging || isDeleting}
                    >
                      {isDeleting ? "Deleting..." : "Delete"}
                    </Button>                    
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete your
                        food log entry.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDelete}>Continue</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )
            }

            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button 
                className="bg-fitview-primary hover:bg-fitview-accent" 
                onClick={handleSubmit}
                disabled={isLogging || isDeleting}
              >
                {isLogging ? "Logging..." : "Log Food"}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
  : <p>Loading...</p>;
};

export default FoodLogEntryForm;
