import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const FitbitCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, isLoading } = useAuth(); // Include isLoading from useAuth
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (isLoading) {
      // Wait until AuthContext finishes loading
      return;
    }

    const processOAuthCallback = async () => {
      try {
        const code = searchParams.get("code");
        const state = searchParams.get("state");
        const error = searchParams.get("error");

        if (error) {
          console.error("OAuth error:", error);
          toast.error("Failed to connect with Fitbit");
          navigate("/settings");
          return;
        }

        if (!code || !state || !user) {
          toast.error("Invalid callback parameters");
          navigate("/");
          return;
        }

        const { data, error: callbackError } = await supabase.functions.invoke(
          "fitbit-auth/callback",
          {
            body: {
              path: "callback",
              code,
              state,
            },
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
        navigate("/settings");
      }
    };
    
    if(!isProcessing) {
      processOAuthCallback();
    }
  }, [searchParams, user?.id, isLoading, navigate]);

  if (isLoading) {
    // Show a loading state while AuthContext is loading
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Loading...</h1>
          <p className="text-gray-600">Please wait while we load your account</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">
          {isProcessing ? "Connecting with Fitbit..." : "Finishing up..."}
        </h1>
        <p className="text-gray-600">
          {isProcessing
            ? "Please wait while we process your connection"
            : "Redirecting you back to the app"}
        </p>
      </div>
    </div>
  );
};

export default FitbitCallback;
