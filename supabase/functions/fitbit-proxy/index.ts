import { serve } from "https://deno.land/std@0.131.0/http/server.ts";
import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

// --- Removed KV Store Initialization ---

const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const FITBIT_API_BASE_URL = "https://api.fitbit.com";
const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-invalidate-cache",
  "Access-Control-Expose-Headers": "X-Cache-Status",
};

// Cache TTLs in milliseconds
const TTL_4_HOURS = 4 * 60 * 60 * 1000;
const TTL_1_DAY = 24 * 60 * 60 * 1000;
const CACHE_TABLE_NAME = 'edge_function_cache';

const getUserAccessToken = async (userId: string): Promise<string> => {
  // ...existing code... (no changes needed here)
  const { data, error } = await supabase.from("user_fitbit").select("access_token, expires_at").eq("user_id", userId).single();
  if (error || !data) {
    console.error("Failed to retrieve user tokens from Supabase:", error);
    throw new Error("Failed to retrieve user tokens from Supabase");
  }
  const { access_token, expires_at } = data;
  // Check if the token is expired
  if (new Date() >= new Date(expires_at)) {
    console.log(`Token expired for user ${userId}, attempting refresh...`);
    try {
      const { error: refreshError } = await supabase.functions.invoke("fitbit-auth/refresh", {
        body: { userId }
      });

      if (refreshError) {
        console.error("Failed to refresh access token via Supabase function:", refreshError);
        throw new Error("Failed to refresh access token via Supabase function");
      }

      // Re-fetch the token after refresh
      const { data: newData, error: fetchAfterRefreshError } = await supabase.from("user_fitbit").select("access_token").eq("user_id", userId).single();
      if (fetchAfterRefreshError || !newData) {
        console.error("Failed to retrieve refreshed user token from Supabase:", fetchAfterRefreshError);
        throw new Error("Failed to retrieve refreshed user token from Supabase");
      }
      console.log(`Token refreshed successfully for user ${userId}`);
      return newData.access_token;
    } catch (e) {
       console.error(`Error during token refresh process for user ${userId}:`, e);
       throw e; // Re-throw the error after logging
    }
  }
  return access_token;
};


// --- Modified relayRequest with Postgres Caching ---
const relayRequest = async (
  supabaseClient: SupabaseClient, // Pass client instance
  userId: string,
  endpoint: string,
  method: string,
  body: any,
  invalidateCache: boolean
) => {
  if (!endpoint) {
    return new Response("Missing 'endpoint' parameter", { headers: corsHeaders, status: 400 });
  }

  let cacheKey: string | null = null;
  let cacheTTL: number | undefined = undefined;
  let cacheUserId: string | null = null; // Track user ID for cache entry
  let cacheStatus = "MISS";

  // Determine cache key, TTL, and user association based on endpoint
  if (method === "GET") {
    if (endpoint === "/1/foods/units.json") {
      cacheKey = `global:${endpoint}`;
      cacheTTL = TTL_4_HOURS;
      cacheUserId = null; // Global cache
    } else if (endpoint === `/1/user/-/foods/log/frequent.json`) {
      cacheKey = `user:${userId}:${endpoint}`;
      cacheTTL = TTL_1_DAY;
      cacheUserId = userId; // User-specific cache
    } else if (endpoint.startsWith(`/1/user/-/foods/log/date/`)) {
      cacheKey = `user:${userId}:${endpoint}`; // Key includes the date
      cacheTTL = TTL_1_DAY;
      cacheUserId = userId; // User-specific cache
    }
  }

  // Handle cache invalidation header
  if (cacheKey && invalidateCache) {
    console.log(`Invalidating cache for key: ${cacheKey}`);
    const { error: deleteError } = await supabaseClient
      .from(CACHE_TABLE_NAME)
      .delete()
      .eq('cache_key', cacheKey);
    if (deleteError) {
      console.error(`Failed to invalidate cache for key ${cacheKey}:`, deleteError);
      // Decide if you want to proceed or return an error. Proceeding might serve stale data once.
    } else {
        cacheStatus = "INVALIDATED";
    }
  }

  // Try fetching from cache if applicable and not invalidated
  if (cacheKey && !invalidateCache) {
    const { data: cachedData, error: cacheError } = await supabaseClient
      .from(CACHE_TABLE_NAME)
      .select('response_body, response_status, response_headers, expires_at')
      .eq('cache_key', cacheKey)
      .maybeSingle(); // Use maybeSingle as the key might not exist

    if (cacheError) {
        console.error(`Error fetching from cache for key ${cacheKey}:`, cacheError);
        // Proceed to fetch from origin, cache miss
    } else if (cachedData && new Date(cachedData.expires_at) > new Date()) {
        console.log(`Cache HIT for key: ${cacheKey}`);
        cacheStatus = "HIT";

        // Reconstruct headers
        const responseHeaders = new Headers(cachedData.response_headers as Record<string, string> || {}); // Ensure headers is an object
        responseHeaders.set("X-Cache-Status", cacheStatus);
        Object.entries(corsHeaders).forEach(([key, value]) => responseHeaders.set(key, value)); // Ensure CORS headers

        return new Response(JSON.stringify(cachedData.response_body), { // Body is stored as JSONB
            status: cachedData.response_status,
            headers: responseHeaders,
        });
    } else if (cachedData) {
        console.log(`Cache STALE for key: ${cacheKey}`);
        // Entry exists but is expired, treat as MISS
    } else {
        console.log(`Cache MISS for key: ${cacheKey}`);
    }
  }

  // Cache miss, stale, invalidated, or not cacheable endpoint: proceed with the actual request
  try {
    const accessToken = await getUserAccessToken(userId);
    const fitbitResponse = await fetch(`${FITBIT_API_BASE_URL}${endpoint}`, {
      method,
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        "Accept-Language": "en_US",
        "Accept-Locale": "en_US",
      },
      body: method !== "GET" && body ? JSON.stringify(body) : undefined,
    });

    // Read body once
    const responseBodyText = await fitbitResponse.text();
    const responseHeaders = new Headers(fitbitResponse.headers);

    // Add CORS headers and cache status to the actual response
    Object.entries(corsHeaders).forEach(([key, value]) => responseHeaders.set(key, value));
    responseHeaders.set("X-Cache-Status", cacheStatus);

    // Cache the response if it was successful (2xx) and the endpoint is cacheable
    if (fitbitResponse.ok && cacheKey && cacheTTL) {
      try {
        const responseBodyJson = JSON.parse(responseBodyText); // Parse body to store as JSONB
        const headersObject: Record<string, string> = {};
        responseHeaders.forEach((value, key) => {
          // Avoid caching sensitive or problematic headers
          const lowerKey = key.toLowerCase();
          if (lowerKey !== 'authorization' && lowerKey !== 'set-cookie' && lowerKey !== 'access-control-allow-origin' && lowerKey !== 'access-control-allow-headers' && lowerKey !== 'access-control-expose-headers') {
            headersObject[key] = value;
          }
        });

        const expiresAt = new Date(Date.now() + cacheTTL).toISOString();

        const { error: upsertError } = await supabaseClient
          .from(CACHE_TABLE_NAME)
          .upsert({
            cache_key: cacheKey,
            user_id: cacheUserId, // Store user_id if applicable
            endpoint: endpoint,
            response_body: responseBodyJson,
            response_status: fitbitResponse.status,
            response_headers: headersObject,
            expires_at: expiresAt,
          });

        if (upsertError) {
          console.error(`Failed to cache response for key ${cacheKey}:`, upsertError);
        } else {
          console.log(`Cached response for key: ${cacheKey} with TTL: ${cacheTTL}ms`);
        }
      } catch (parseError) {
          console.error(`Failed to parse response body as JSON for caching (key: ${cacheKey}):`, parseError);
          // Decide if you still want to return the non-JSON response or handle differently
      }
    } else if (!fitbitResponse.ok) {
       console.error(`Fitbit API request failed for endpoint ${endpoint}: Status ${fitbitResponse.status}, Body: ${responseBodyText.substring(0, 500)}`);
    }

    // Return the actual response from Fitbit API
    return new Response(responseBodyText, {
      status: fitbitResponse.status,
      headers: responseHeaders, // Use headers with CORS and Cache Status
    });

  } catch (error) {
     console.error(`Error in relayRequest for endpoint ${endpoint}:`, error);
     const errorHeaders = new Headers(corsHeaders);
     errorHeaders.set("Content-Type", "application/json");
     return new Response(JSON.stringify({ error: "Internal Server Error", details: error.message }), {
       status: 500,
       headers: errorHeaders,
     });
  }
};
// --- End Modified relayRequest ---


serve(async (req: Request) => {
  try {
    if (req.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    const invalidateCache = req.headers.get("X-Invalidate-Cache") === "true";

    let userId, endpoint, method, body;
    try {
      const payload = await req.json();
      userId = payload.userId;
      endpoint = payload.endpoint;
      method = payload.method || "GET";
      body = payload.body;
    } catch (e) {
      console.error("Failed to parse request JSON:", e);
      return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!userId) {
      return new Response(JSON.stringify({ error: "Missing userId in request body" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Pass Supabase client instance and invalidateCache flag to relayRequest
    return await relayRequest(supabase, userId, endpoint, method, body, invalidateCache); // Pass supabase client

  } catch (error) {
    console.error("Unhandled error in main handler:", error);
    const errorHeaders = new Headers(corsHeaders);
    errorHeaders.set("Content-Type", "application/json");
    return new Response(JSON.stringify({ error: "Internal Server Error", details: error.message }), {
      status: 500,
      headers: errorHeaders,
    });
  }
});