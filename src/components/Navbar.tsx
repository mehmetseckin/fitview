
import { Button } from "@/components/ui/button";
import { SearchIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import fitviewLogo from "@/assets/images/fitview-symbol.png";

const Navbar = () => {
  const { user, signOut } = useAuth();

  return (
    <div className="border-b">
      <div className="flex h-16 items-center px-4 container">
        <div className="flex items-center gap-2">
          <img src={fitviewLogo} alt="" className="h-8 w-8" />
          <Link to="/" className="font-bold text-xl">
            FitView
          </Link>
        </div>
        
        {user && (
          <nav className="ml-auto flex items-center space-x-4 lg:space-x-6 mx-6">
            <Link
              to="/"
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              Dashboard
            </Link>
            <Link
              to="/settings"
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              Settings
            </Link>
          </nav>
        )}
        
        <div className="flex items-center space-x-4 ml-auto">
          {user ? (
            <>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => signOut()}
              >
                Sign Out
              </Button>
            </>
          ) : (
            <Link to="/auth">
              <Button className="bg-fitview-primary hover:bg-fitview-accent" size="sm">
                Sign In
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;
