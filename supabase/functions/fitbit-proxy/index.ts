import { serve } from "https://deno.land/std@0.131.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const FITBIT_CLIENT_ID = Deno.env.get("FITBIT_CLIENT_ID")!;
const FITBIT_CLIENT_SECRET = Deno.env.get("FITBIT_CLIENT_SECRET")!;
const FITBIT_API_BASE_URL = "https://api.fitbit.com";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const refreshAccessToken = async (refreshToken: string) => {
  const authHeader = btoa(`${FITBIT_CLIENT_ID}:${FITBIT_CLIENT_SECRET}`);
  const response = await fetch(`${FITBIT_API_BASE_URL}/oauth2/token`, {
    method: "POST",
    headers: {
      "Authorization": `Basic ${authHeader}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to refresh access token: ${response.statusText}`);
  }

  return response.json();
};

const getUserAccessToken = async (userId: string) => {
  const { data, error } = await supabase
    .from("user_fitbit")
    .select("access_token, refresh_token, expires_at")
    .eq("user_id", userId)
    .single();

  if (error || !data) {
    throw new Error("Failed to retrieve user tokens from Supabase");
  }

  const { access_token, refresh_token, expires_at } = data;

  // Check if the token is expired
  if (Date.now() >= expires_at * 1000) {
    const refreshedToken = await refreshAccessToken(refresh_token);

    // Update the refreshed token in Supabase
    await supabase
      .from("user_fitbit")
      .update({
        access_token: refreshedToken.access_token,
        refresh_token: refreshedToken.refresh_token,
        expires_at: Math.floor(Date.now() / 1000) + refreshedToken.expires_in,
      })
      .eq("user_id", userId);

    return refreshedToken.access_token;
  }

  return access_token;
};

const relayRequest = async (userId: string, endpoint: string, method: string, body: any) => {
  if (!endpoint) {
    return new Response("Missing 'endpoint' query parameter", {
      headers: { ...corsHeaders },
      status: 400,
    });
  }

  const accessToken = await getUserAccessToken(userId);

  const fitbitResponse = await fetch(`${FITBIT_API_BASE_URL}${endpoint}`, {
    method,
    headers: {
      "Authorization": `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body,
  });

  const responseBody = await fitbitResponse.text();
  return new Response(responseBody, {
    status: fitbitResponse.status,
    headers: {
      ...corsHeaders,
      "Content-Type": fitbitResponse.headers.get("Content-Type") || "application/json",
    },
  });
};

serve(async (req) => {
  try {
    // Handle CORS preflight requests
    if (req.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    const { userId, endpoint, method, body } = await req.json();
    return await relayRequest(userId, endpoint, method, body);
  } catch (error) {
    return new Response(error.message, {
      headers: { ...corsHeaders },
      status: 500,
    });
  }
});
