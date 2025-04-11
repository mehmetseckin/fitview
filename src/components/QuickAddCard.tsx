import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FitbitFood, FrequentFood } from "@/types";

type QuickAddCardProps = {
  frequentFoods: FrequentFood[];
  onFoodSelect: (food: FitbitFood) => void;
};

const ITEMS_PER_PAGE = 6; // Number of items to display per page

const QuickAddCard = ({ frequentFoods, onFoodSelect }: QuickAddCardProps) => {
  const [currentPage, setCurrentPage] = useState(1);

  // Calculate the total number of pages
  const totalPages = Math.ceil(frequentFoods.length / ITEMS_PER_PAGE);

  // Get the foods for the current page
  const paginatedFoods = frequentFoods.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Add</CardTitle>
        <CardDescription>Frequently logged foods</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {paginatedFoods.map((food) => (
            <Card
              key={food.foodId}
              className="hover:bg-muted cursor-pointer"
              onClick={() =>
                onFoodSelect({
                  foodId: food.foodId,
                  name: food.name,
                  brand: food.brand,
                  calories: food.calories,
                  units: [food.unit.id],
                  defaultServingSize: food.amount,
                  defaultUnit: food.unit,
                })
              }
            >
              <CardContent className="p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-medium">{food.name}</h4>
                    <p className="text-sm text-muted-foreground">{food.brand}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{food.calories} cal</p>
                    <p className="text-sm text-muted-foreground">
                      {food.amount} {food.amount !== 1 ? food.unit.plural : food.unit.name}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="flex justify-between mt-4">
          <button
            className="px-4 py-2 bg-gray-200 rounded"
            onClick={handlePreviousPage}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          <button
            className="px-4 py-2 bg-gray-200 rounded"
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickAddCard;