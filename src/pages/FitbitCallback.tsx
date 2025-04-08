
import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const FitbitCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(true);
  
  useEffect(() => {
    const processOAuthCallback = async () => {
      try {
        const code = searchParams.get("code");
        const state = searchParams.get("state");
        const error = searchParams.get("error");
        
        if (error) {
          console.error("OAuth error:", error);
          toast.error("Failed to connect with Fitbit");
          navigate("/connect-services");
          return;
        }
        
        if (!code || !state || !user) {
          toast.error("Invalid callback parameters");
          navigate("/");
          return;
        }
        
        const { data, error: callbackError } = await supabase.functions.invoke(
          "fitbit-auth", {
            body: {
              path: "callback",
              code,
              state
            }
          }
        );
        
        if (callbackError) {
          console.error("Callback processing error:", callbackError);
          toast.error("Failed to connect with Fitbit");
        } else {
          toast.success("Successfully connected with Fitbit!");
        }
      } catch (err) {
        console.error("Error processing callback:", err);
        toast.error("An unexpected error occurred");
      } finally {
        setIsProcessing(false);
        navigate("/connect-services");
      }
    };
    
    processOAuthCallback();
  }, [searchParams, user, navigate]);
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">
          {isProcessing ? "Connecting with Fitbit..." : "Finishing up..."}
        </h1>
        <p className="text-gray-600">
          {isProcessing ? "Please wait while we process your connection" : "Redirecting you back to the app"}
        </p>
      </div>
    </div>
  );
};

export default FitbitCallback;
