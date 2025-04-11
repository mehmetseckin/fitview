import { serve } from "https://deno.land/std@0.131.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const FITBIT_API_BASE_URL = "https://api.fitbit.com";
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type"
};

const getUserAccessToken = async (userId)=>{
  const { data, error } = await supabase.from("user_fitbit").select("access_token, expires_at").eq("user_id", userId).single();
  if (error || !data) {
    throw new Error("Failed to retrieve user tokens from Supabase");
  }
  const { access_token, expires_at } = data;
  // Check if the token is expired
  if (new Date() >= new Date(expires_at)) {
    const { error: refreshError } = await supabase.functions.invoke("fitbit-auth/refresh", {
      body: {
        userId
      }
    });

    if (refreshError) {
      throw new Error("Failed to refresh access token from Supabase function");
    }

    const { data: newData, error } = await supabase.from("user_fitbit").select("access_token").eq("user_id", userId).single();
    if (error || !data) {
      throw new Error("Failed to retrieve user tokens from Supabase");
    }

    const { access_token: newAccessToken } = newData;

    return newAccessToken;
  }

  return access_token;
};

const relayRequest = async (userId, endpoint, method, body)=>{
  if (!endpoint) {
    return new Response("Missing 'endpoint' query parameter", {
      headers: {
        ...corsHeaders
      },
      status: 400
    });
  }
  const accessToken = await getUserAccessToken(userId);
  const fitbitResponse = await fetch(`${FITBIT_API_BASE_URL}${endpoint}`, {
    method,
    headers: {
      "Authorization": `Bearer ${accessToken}`,
      "Content-Type": "application/json"
    },
    body
  });
  const responseBody = await fitbitResponse.text();
  return new Response(responseBody, {
    status: fitbitResponse.status,
    headers: {
      ...corsHeaders,
      "Content-Type": fitbitResponse.headers.get("Content-Type") || "application/json"
    }
  });
};
serve(async (req)=>{
  try {
    // Handle CORS preflight requests
    if (req.method === "OPTIONS") {
      return new Response(null, {
        headers: corsHeaders
      });
    }
    const { userId, endpoint, method, body } = await req.json();
    return await relayRequest(userId, endpoint, method, body);
  } catch (error) {
    return new Response(error.message, {
      headers: {
        ...corsHeaders
      },
      status: 500
    });
  }
});
