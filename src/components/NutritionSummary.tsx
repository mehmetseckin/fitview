
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface NutritionSummaryProps {
  calories: {
    consumed: number;
    goal: number;
  };
  macros: {
    carbs: { consumed: number; goal: number };
    fat: { consumed: number; goal: number };
    protein: { consumed: number; goal: number };
  };
}

const NutritionSummary = ({ calories, macros }: NutritionSummaryProps) => {
  const macroData = [
    { name: 'Carbs', value: macros.carbs.consumed, color: '#2196F3' },
    { name: 'Fat', value: macros.fat.consumed, color: '#FFC107' },
    { name: 'Protein', value: macros.protein.consumed, color: '#FF5722' },
  ];

  const caloriePercentage = Math.min(Math.round((calories.consumed / calories.goal) * 100), 100);
  
  const formatMacroPercentage = (macro: { consumed: number; goal: number }): number => {
    return Math.min(Math.round((macro.consumed / macro.goal) * 100), 100);
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card className="col-span-full md:col-span-2">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Daily Calories</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-muted-foreground">
              {calories.consumed.toFixed(0)} / {calories.goal} cal
            </div>
            <div className="text-sm font-medium">{caloriePercentage}%</div>
          </div>
          <Progress value={caloriePercentage} className="h-2" />
        </CardContent>
      </Card>
      
      <Card className="lg:col-span-1">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Macros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[150px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart className="nutrition-chart">
                <Pie
                  data={macroData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={70}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {macroData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          <div className="grid grid-cols-3 gap-2 mt-2">
            <div className="flex items-center text-xs">
              <div className="w-3 h-3 rounded mr-1" style={{backgroundColor: '#2196F3'}}></div>
              <span>Carbs</span>
            </div>
            <div className="flex items-center text-xs">
              <div className="w-3 h-3 rounded mr-1" style={{backgroundColor: '#FFC107'}}></div>
              <span>Fat</span>
            </div>
            <div className="flex items-center text-xs">
              <div className="w-3 h-3 rounded mr-1" style={{backgroundColor: '#FF5722'}}></div>
              <span>Protein</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Macro Nutrients</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm">Carbs</span>
                <span className="text-sm text-muted-foreground">
                  {macros.carbs.consumed.toFixed(1)}g / {macros.carbs.goal}g
                </span>
              </div>
              <Progress value={formatMacroPercentage(macros.carbs)} className="h-2 bg-muted" />
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm">Fat</span>
                <span className="text-sm text-muted-foreground">
                  {macros.fat.consumed.toFixed(1)}g / {macros.fat.goal}g
                </span>
              </div>
              <Progress value={formatMacroPercentage(macros.fat)} className="h-2 bg-muted" />
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm">Protein</span>
                <span className="text-sm text-muted-foreground">
                  {macros.protein.consumed.toFixed(1)}g / {macros.protein.goal}g
                </span>
              </div>
              <Progress value={formatMacroPercentage(macros.protein)} className="h-2 bg-muted" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NutritionSummary;
