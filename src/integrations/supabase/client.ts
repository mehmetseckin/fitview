// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://bmiktsasypmrivtldoyk.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJtaWt0c2FzeXBtcml2dGxkb3lrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQxMTg1ODEsImV4cCI6MjA1OTY5NDU4MX0.F1kNKTAUTdUz1coeMDYe9fIouxKRbKQEg51k_pDmTG4";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);