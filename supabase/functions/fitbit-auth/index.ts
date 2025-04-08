
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const FITBIT_CLIENT_ID = Deno.env.get("FITBIT_CLIENT_ID");
const FITBIT_CLIENT_SECRET = Deno.env.get("FITBIT_CLIENT_SECRET");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const APP_URL = Deno.env.get("APP_URL");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const path = url.pathname.split("/").pop();

    if (!FITBIT_CLIENT_ID || !FITBIT_CLIENT_SECRET) {
      return new Response(
        JSON.stringify({
          error: "Missing FitBit API credentials",
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Initialize Supabase client
    const supabase = createClient(
      SUPABASE_URL!,
      SUPABASE_SERVICE_ROLE_KEY!
    );

    // Step 1: Authorize URL generation
    if (path === "authorize") {
      const { userId } = await req.json();

      if (!userId) {
        return new Response(
          JSON.stringify({ error: "User ID is required" }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      const state = crypto.randomUUID();

      // Store the state and user ID
      const { error } = await supabase
        .from("auth_states")
        .insert([{ state, user_id: userId }]);

      if (error) {
        return new Response(
          JSON.stringify({ error: "Failed to create auth state" }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      const scopes = encodeURIComponent(
        "activity nutrition profile settings sleep weight"
      );
      const redirectUri = encodeURIComponent(
        `${req.headers.get("origin")}/fitbit-callback`
      );
      const authUrl = `https://www.fitbit.com/oauth2/authorize?client_id=${FITBIT_CLIENT_ID}&response_type=code&scope=${scopes}&redirect_uri=${redirectUri}&state=${state}`;

      return new Response(
        JSON.stringify({ url: authUrl }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Step 2: Handle the callback and token exchange
    if (path === "callback") {
      const { code, state } = await req.json();

      if (!code || !state) {
        return new Response(
          JSON.stringify({ error: "Code and state are required" }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      // Verify state and get user ID
      const { data: stateData, error: stateError } = await supabase
        .from("auth_states")
        .select("user_id")
        .eq("state", state)
        .single();

      if (stateError || !stateData) {
        return new Response(
          JSON.stringify({ error: "Invalid state" }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      const userId = stateData.user_id;

      // Exchange code for token
      const redirectUri = `${req.headers.get("origin")}/fitbit-callback`;
      const tokenResponse = await fetch("https://api.fitbit.com/oauth2/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${btoa(`${FITBIT_CLIENT_ID}:${FITBIT_CLIENT_SECRET}`)}`,
        },
        body: new URLSearchParams({
          grant_type: "authorization_code",
          code,
          redirect_uri: redirectUri,
        }),
      });

      if (!tokenResponse.ok) {
        const error = await tokenResponse.text();
        return new Response(
          JSON.stringify({ error: "Failed to exchange token", details: error }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      const tokenData = await tokenResponse.json();

      // Store tokens in user's profile
      const { error: updateError } = await supabase
        .from("user_fitbit")
        .upsert({
          user_id: userId,
          access_token: tokenData.access_token,
          refresh_token: tokenData.refresh_token,
          expires_at: new Date(Date.now() + tokenData.expires_in * 1000).toISOString(),
          scope: tokenData.scope,
          token_type: tokenData.token_type,
          user_id_fitbit: tokenData.user_id,
        });

      if (updateError) {
        return new Response(
          JSON.stringify({ error: "Failed to store token", details: updateError }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      // Clean up the state
      await supabase.from("auth_states").delete().eq("state", state);

      return new Response(
        JSON.stringify({ success: true }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Step 3: Refresh token when needed
    if (path === "refresh") {
      const { userId } = await req.json();

      if (!userId) {
        return new Response(
          JSON.stringify({ error: "User ID is required" }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      // Get current tokens
      const { data: userData, error: userDataError } = await supabase
        .from("user_fitbit")
        .select("refresh_token")
        .eq("user_id", userId)
        .single();

      if (userDataError || !userData) {
        return new Response(
          JSON.stringify({ error: "No FitBit connection found" }),
          {
            status: 404,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      // Refresh the token
      const tokenResponse = await fetch("https://api.fitbit.com/oauth2/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${btoa(`${FITBIT_CLIENT_ID}:${FITBIT_CLIENT_SECRET}`)}`,
        },
        body: new URLSearchParams({
          grant_type: "refresh_token",
          refresh_token: userData.refresh_token,
        }),
      });

      if (!tokenResponse.ok) {
        const error = await tokenResponse.text();
        return new Response(
          JSON.stringify({ error: "Failed to refresh token", details: error }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      const tokenData = await tokenResponse.json();

      // Update tokens in database
      const { error: updateError } = await supabase
        .from("user_fitbit")
        .update({
          access_token: tokenData.access_token,
          refresh_token: tokenData.refresh_token,
          expires_at: new Date(Date.now() + tokenData.expires_in * 1000).toISOString(),
          scope: tokenData.scope,
          token_type: tokenData.token_type,
        })
        .eq("user_id", userId);

      if (updateError) {
        return new Response(
          JSON.stringify({ error: "Failed to update token", details: updateError }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      return new Response(
        JSON.stringify({ success: true }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    return new Response(
      JSON.stringify({ error: "Invalid endpoint" }),
      {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error processing request:", error);
    
    return new Response(
      JSON.stringify({ error: "Internal server error", details: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
