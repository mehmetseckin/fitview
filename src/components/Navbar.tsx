
import { Button } from "@/components/ui/button";
import { SearchIcon } from "lucide-react";
import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <div className="border-b">
      <div className="flex h-16 items-center px-4 container">
        <div className="flex items-center gap-2">
          <img src="" alt="" className="h-8 w-8" />
          <Link to="/" className="font-bold text-xl text-fitview-primary">
            FitView
          </Link>
        </div>
        
        <nav className="ml-auto flex items-center space-x-4 lg:space-x-6 mx-6">
          <Link
            to="/"
            className="text-sm font-medium transition-colors hover:text-primary"
          >
            Dashboard
          </Link>
          <Link
            to="/nutrition"
            className="text-sm font-medium transition-colors hover:text-primary"
          >
            Nutrition
          </Link>
          <Link
            to="/goals"
            className="text-sm font-medium transition-colors hover:text-primary"
          >
            Goals
          </Link>
        </nav>
        
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm">
            <SearchIcon className="h-4 w-4 mr-2" />
            Search
          </Button>
          <Button className="bg-fitview-primary hover:bg-fitview-accent" size="sm">
            Log Food
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
