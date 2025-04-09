
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FitbitFood } from "@/types";
import { SearchIcon } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useFitbitApi } from "@/hooks/useFitbitApi";

interface FoodSearchProps {
  onFoodSelect: (food: FitbitFood) => void;
}

const FoodSearch = ({ onFoodSelect }: FoodSearchProps) => {
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<FitbitFood[]>([]);
  const { toast } = useToast();
  const { searchFoods } = useFitbitApi();

  const handleSearch = async () => {
    if (!query.trim()) return;
    
    try {
      setIsLoading(true);
      const data = await searchFoods(query);
      setResults(data.foods);
      
      if (data.foods.length === 0) {
        toast({
          title: "No foods found",
          description: "Try adjusting your search terms.",
        });
      }
    } catch (error) {
      console.error("Error searching foods:", error);
      toast({
        title: "Error",
        description: "Failed to search foods. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="w-full">
      <div className="flex mb-4">
        <Input
          placeholder="Search for foods (e.g., apple, chicken breast)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          className="mr-2"
        />
        <Button onClick={handleSearch} disabled={isLoading}>
          <SearchIcon className="h-4 w-4 mr-2" />
          {isLoading ? "Searching..." : "Search"}
        </Button>
      </div>

      {results.length > 0 && (
        <div className="mt-4 space-y-2">
          <h3 className="text-sm font-medium">Search Results</h3>
          {results.map((food) => (
            <Card key={food.foodId} className="hover:bg-muted cursor-pointer" onClick={() => onFoodSelect(food)}>
              <CardContent className="p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-medium">{food.name}</h4>
                    <p className="text-sm text-muted-foreground">{food.brand}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{food.nutritionalValues.calories} cal</p>
                    <p className="text-sm text-muted-foreground">
                      {food.servingSize} {food.servingSizeUnit}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default FoodSearch;
