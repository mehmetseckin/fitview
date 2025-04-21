

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgjwt" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";





SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."auth_states" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "state" "text" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."auth_states" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."edge_function_cache" (
    "cache_key" "text" NOT NULL,
    "user_id" "uuid",
    "endpoint" "text" NOT NULL,
    "response_body" "jsonb",
    "response_status" integer,
    "response_headers" "jsonb",
    "expires_at" timestamp with time zone NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."edge_function_cache" OWNER TO "postgres";


COMMENT ON TABLE "public"."edge_function_cache" IS 'Cache storage for Supabase edge functions.';



COMMENT ON COLUMN "public"."edge_function_cache"."cache_key" IS 'Unique key for the cache entry (e.g., global:<endpoint> or user:<user_id>:<endpoint>).';



COMMENT ON COLUMN "public"."edge_function_cache"."user_id" IS 'Associated user ID for user-specific cache entries. NULL for global cache.';



COMMENT ON COLUMN "public"."edge_function_cache"."endpoint" IS 'The API endpoint being cached.';



COMMENT ON COLUMN "public"."edge_function_cache"."response_body" IS 'The JSON body of the cached response.';



COMMENT ON COLUMN "public"."edge_function_cache"."response_status" IS 'The HTTP status code of the cached response.';



COMMENT ON COLUMN "public"."edge_function_cache"."response_headers" IS 'The relevant HTTP headers of the cached response.';



COMMENT ON COLUMN "public"."edge_function_cache"."expires_at" IS 'Timestamp when the cache entry expires.';



CREATE TABLE IF NOT EXISTS "public"."user_fitbit" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "access_token" "text" NOT NULL,
    "refresh_token" "text" NOT NULL,
    "expires_at" timestamp with time zone NOT NULL,
    "scope" "text" NOT NULL,
    "token_type" "text" NOT NULL,
    "user_id_fitbit" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."user_fitbit" OWNER TO "postgres";


ALTER TABLE ONLY "public"."auth_states"
    ADD CONSTRAINT "auth_states_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."auth_states"
    ADD CONSTRAINT "auth_states_state_key" UNIQUE ("state");



ALTER TABLE ONLY "public"."edge_function_cache"
    ADD CONSTRAINT "edge_function_cache_pkey" PRIMARY KEY ("cache_key");



ALTER TABLE ONLY "public"."user_fitbit"
    ADD CONSTRAINT "user_fitbit_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_fitbit"
    ADD CONSTRAINT "user_fitbit_user_id_key" UNIQUE ("user_id");



CREATE INDEX "idx_edge_function_cache_endpoint" ON "public"."edge_function_cache" USING "btree" ("endpoint");



CREATE INDEX "idx_edge_function_cache_expires_at" ON "public"."edge_function_cache" USING "btree" ("expires_at");



CREATE INDEX "idx_edge_function_cache_user_id" ON "public"."edge_function_cache" USING "btree" ("user_id");



ALTER TABLE ONLY "public"."auth_states"
    ADD CONSTRAINT "auth_states_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."edge_function_cache"
    ADD CONSTRAINT "edge_function_cache_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_fitbit"
    ADD CONSTRAINT "user_fitbit_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



CREATE POLICY "Users can only access their own auth states" ON "public"."auth_states" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can only access their own fitbit connections" ON "public"."user_fitbit" USING (("auth"."uid"() = "user_id"));



ALTER TABLE "public"."auth_states" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."edge_function_cache" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_fitbit" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";


























































































































































































GRANT ALL ON TABLE "public"."auth_states" TO "anon";
GRANT ALL ON TABLE "public"."auth_states" TO "authenticated";
GRANT ALL ON TABLE "public"."auth_states" TO "service_role";



GRANT ALL ON TABLE "public"."edge_function_cache" TO "anon";
GRANT ALL ON TABLE "public"."edge_function_cache" TO "authenticated";
GRANT ALL ON TABLE "public"."edge_function_cache" TO "service_role";



GRANT ALL ON TABLE "public"."user_fitbit" TO "anon";
GRANT ALL ON TABLE "public"."user_fitbit" TO "authenticated";
GRANT ALL ON TABLE "public"."user_fitbit" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "service_role";






























RESET ALL;
