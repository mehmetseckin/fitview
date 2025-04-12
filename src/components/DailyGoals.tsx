
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { FitbitNutritionGoals } from "@/types";
import { useToast } from "@/components/ui/use-toast";

interface DailyGoalsProps {
  goals: FitbitNutritionGoals;
  onSave: (goals: FitbitNutritionGoals) => void;
}

const DailyGoals = ({ goals, onSave }: DailyGoalsProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedGoals, setEditedGoals] = useState<FitbitNutritionGoals>({
    calories: goals.calories,
    macros: {
      carbs: goals.macros?.carbs || 0,
      fat: goals.macros?.fat || 0,
      protein: goals.macros?.protein || 0,
    }
  });
  const { toast } = useToast();

  useEffect(() => {
    setEditedGoals({
      calories: goals.calories,
      macros: {
        carbs: goals.macros?.carbs || 0,
        fat: goals.macros?.fat || 0,
        protein: goals.macros?.protein || 0,
      }
    });
  }, [goals]);

  const handleSave = () => {
    onSave(editedGoals);
    setIsEditing(false);
    toast({
      title: "Goals updated",
      description: "Your nutrition goals have been updated",
    });
  };

  const handleCancel = () => {
    setEditedGoals({
      calories: goals.calories,
      macros: {
        carbs: goals.macros?.carbs || 0,
        fat: goals.macros?.fat || 0,  
        protein: goals.macros?.protein || 0
      }
    });
    setIsEditing(false);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg">Daily Nutrition Goals</CardTitle>
        {!isEditing ? (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditing(true)}
          >
            Edit
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCancel}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              className="bg-fitview-primary hover:bg-fitview-accent"
              onClick={handleSave}
            >
              Save
            </Button>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium block mb-1">
                Daily Calories
              </label>
              {isEditing ? (
                <Input
                  type="number"
                  value={editedGoals.calories}
                  onChange={(e) =>
                    setEditedGoals({
                      ...editedGoals,
                      calories: parseInt(e.target.value) || 0,
                    })
                  }
                  min="0"
                />
              ) : (
                <p>{editedGoals.calories} cal</p>
              )}
            </div>
          </div>

          <div className="pt-2">
            <h4 className="text-sm font-medium mb-3">Macronutrients</h4>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-sm block mb-1">Carbohydrates</label>
                {isEditing ? (
                  <Input
                    type="number"
                    value={editedGoals.macros?.carbs || 0}
                    onChange={(e) =>
                      setEditedGoals({
                        ...editedGoals,
                        macros: {
                          ...editedGoals.macros,
                          carbs: parseInt(e.target.value) || 0,
                        },
                      })
                    }
                    min="0"
                  />
                ) : (
                  <p>{editedGoals.macros?.carbs || 0}g</p>
                )}
              </div>
              <div>
                <label className="text-sm block mb-1">Fat</label>
                {isEditing ? (
                  <Input
                    type="number"
                    value={editedGoals.macros?.fat}
                    onChange={(e) =>
                      setEditedGoals({
                        ...editedGoals,
                        macros: {
                          ...editedGoals.macros,
                          fat: parseInt(e.target.value) || 0,
                        },
                      })
                    }
                    min="0"
                  />
                ) : (
                  <p>{editedGoals.macros?.fat || 0}g</p>
                )}
              </div>
              <div>
                <label className="text-sm block mb-1">Protein</label>
                {isEditing ? (
                  <Input
                    type="number"
                    value={editedGoals.macros?.protein}
                    onChange={(e) =>
                      setEditedGoals({
                        ...editedGoals,
                        macros: {
                          ...editedGoals.macros,
                          protein: parseInt(e.target.value) || 0,
                        },
                      })
                    }
                    min="0"
                  />
                ) : (
                  <p>{editedGoals.macros?.protein || 0}g</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DailyGoals;
