import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { RefreshCcw, Database, Moon, Cog, Sun, Settings2, SettingsIcon } from "lucide-react"; 
import fitbitAppIcon from '@/assets/images/fitbit-app-icon.png';

const Settings = () => {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<"connected" | "disconnected" | "checking">("checking");
  
  // Check connection status on mount
  useEffect(() => {
    if (user) {
      checkConnectionStatus();
    }
  }, [user]);
  
  // Check FitBit connection status
  const checkConnectionStatus = async () => {
    if (!user) return;
    
    setConnectionStatus("checking");
    try {
      const { data, error } = await supabase
        .from("user_fitbit")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      
      if (error) throw error;
      
      if (data) {
        setConnectionStatus("connected");
      } else {
        setConnectionStatus("disconnected");
      }
    } catch (err) {
      console.error("Error checking connection status:", err);
      setConnectionStatus("disconnected");
    }
  };
  
  // Connect to FitBit
  const connectFitbit = async () => {
    if (!user) return;
    
    setIsConnecting(true);
    
    try {
      const { data, error } = await supabase.functions.invoke(
        "fitbit-auth/authorize", {
          body: {
            userId: user.id
          }
        }
      );
      
      if (error) {
        console.error("Error starting OAuth flow:", error);
        toast.error("Failed to start Fitbit connection");
      } else if (data?.url) {
        // Redirect to Fitbit authorization page
        window.location.href = data.url;
        return;
      }
    } catch (err) {
      console.error("Error connecting to Fitbit:", err);
      toast.error("Failed to connect with Fitbit");
    } finally {
      setIsConnecting(false);
    }
  };
  
  // Disconnect FitBit
  const disconnectFitbit = async () => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from("user_fitbit")
        .delete()
        .eq("user_id", user.id);
      
      if (error) {
        console.error("Error disconnecting Fitbit:", error);
        toast.error("Failed to disconnect from Fitbit");
      } else {
        toast.success("Successfully disconnected from Fitbit");
        setConnectionStatus("disconnected");
      }
    } catch (err) {
      console.error("Error disconnecting from Fitbit:", err);
      toast.error("An unexpected error occurred");
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      
      <div className="container py-6">
        <h1 className="text-3xl font-bold mb-6">Settings</h1>
        
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <img 
                  src={fitbitAppIcon} 
                  alt="Fitbit Logo" 
                  className="h-6 mr-2" 
                />
                Fitbit
              </CardTitle>
              <CardDescription>
                Connect your Fitbit account to sync your activities, nutrition data, and more.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <div className="flex-1">
                  {connectionStatus === "checking" ? (
                    <p className="text-sm text-gray-500">Checking connection status...</p>
                  ) : connectionStatus === "connected" ? (
                    <p className="text-sm text-green-600 font-medium">Connected to Fitbit</p>
                  ) : (
                    <p className="text-sm text-gray-600">Not connected</p>
                  )}
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={checkConnectionStatus}
                >
                  <RefreshCcw className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
            <CardFooter>
              {connectionStatus === "connected" ? (
                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={disconnectFitbit}
                >
                  Disconnect
                </Button>
              ) : (
                <Button 
                  className="w-full bg-fitview-primary hover:bg-fitview-accent" 
                  onClick={connectFitbit}
                  disabled={isConnecting}
                >
                  {isConnecting ? "Connecting..." : "Connect to Fitbit"}
                </Button>
              )}
            </CardFooter>
          </Card>
        </div>
        <div className="max-w-md mx-auto mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Theme</CardTitle>
              <CardDescription>
                Choose your preferred appearance. Default is system setting.
              </CardDescription>
            </CardHeader>
            <CardContent>

              <div className="flex flex-col gap-2">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="theme"
                    value="system"
                    checked={theme === "system"}
                    onChange={() => setTheme("system")}
                  />
                  <SettingsIcon className="h-5 w-5 mr-2" />
                  Use System Setting (Default)
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="theme"
                    value="light"
                    checked={theme === "light"}
                    onChange={() => setTheme("light")}
                  />
                  <Sun className="h-5 w-5 mr-2" />
                  Light
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="theme"
                    value="dark"
                    checked={theme === "dark"}
                    onChange={() => setTheme("dark")}
                  />
                  <Moon className="h-5 w-5 mr-2" />
                  Dark
                </label>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Settings;
