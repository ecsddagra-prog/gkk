--
-- PostgreSQL database dump
--

-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.0

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: auth; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA auth;


--
-- Name: extensions; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA extensions;


--
-- Name: graphql; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA graphql;


--
-- Name: graphql_public; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA graphql_public;


--
-- Name: pgbouncer; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA pgbouncer;


--
-- Name: realtime; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA realtime;


--
-- Name: storage; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA storage;


--
-- Name: vault; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA vault;


--
-- Name: pg_graphql; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_graphql WITH SCHEMA graphql;


--
-- Name: EXTENSION pg_graphql; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pg_graphql IS 'pg_graphql: GraphQL support';


--
-- Name: pg_stat_statements; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_stat_statements WITH SCHEMA extensions;


--
-- Name: EXTENSION pg_stat_statements; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pg_stat_statements IS 'track planning and execution statistics of all SQL statements executed';


--
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;


--
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


--
-- Name: postgis; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS postgis WITH SCHEMA public;


--
-- Name: EXTENSION postgis; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION postgis IS 'PostGIS geometry and geography spatial types and functions';


--
-- Name: supabase_vault; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS supabase_vault WITH SCHEMA vault;


--
-- Name: EXTENSION supabase_vault; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION supabase_vault IS 'Supabase Vault Extension';


--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA extensions;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- Name: aal_level; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.aal_level AS ENUM (
    'aal1',
    'aal2',
    'aal3'
);


--
-- Name: code_challenge_method; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.code_challenge_method AS ENUM (
    's256',
    'plain'
);


--
-- Name: factor_status; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.factor_status AS ENUM (
    'unverified',
    'verified'
);


--
-- Name: factor_type; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.factor_type AS ENUM (
    'totp',
    'webauthn',
    'phone'
);


--
-- Name: oauth_authorization_status; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.oauth_authorization_status AS ENUM (
    'pending',
    'approved',
    'denied',
    'expired'
);


--
-- Name: oauth_client_type; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.oauth_client_type AS ENUM (
    'public',
    'confidential'
);


--
-- Name: oauth_registration_type; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.oauth_registration_type AS ENUM (
    'dynamic',
    'manual'
);


--
-- Name: oauth_response_type; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.oauth_response_type AS ENUM (
    'code'
);


--
-- Name: one_time_token_type; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.one_time_token_type AS ENUM (
    'confirmation_token',
    'reauthentication_token',
    'recovery_token',
    'email_change_token_new',
    'email_change_token_current',
    'phone_change_token'
);


--
-- Name: booking_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.booking_status AS ENUM (
    'pending',
    'quote_requested',
    'quote_sent',
    'quote_accepted',
    'confirmed',
    'on_way',
    'in_progress',
    'completed',
    'cancelled',
    'disputed'
);


--
-- Name: payment_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.payment_status AS ENUM (
    'pending',
    'paid',
    'refunded',
    'failed'
);


--
-- Name: provider_quote_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.provider_quote_status AS ENUM (
    'pending',
    'accepted',
    'rejected',
    'expired'
);


--
-- Name: rate_quote_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.rate_quote_status AS ENUM (
    'open',
    'expired',
    'matched',
    'converted',
    'cancelled'
);


--
-- Name: user_role; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.user_role AS ENUM (
    'user',
    'provider',
    'admin',
    'superadmin'
);


--
-- Name: wallet_transaction_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.wallet_transaction_type AS ENUM (
    'credit',
    'debit',
    'refund',
    'cashback',
    'reward',
    'payout'
);


--
-- Name: action; Type: TYPE; Schema: realtime; Owner: -
--

CREATE TYPE realtime.action AS ENUM (
    'INSERT',
    'UPDATE',
    'DELETE',
    'TRUNCATE',
    'ERROR'
);


--
-- Name: equality_op; Type: TYPE; Schema: realtime; Owner: -
--

CREATE TYPE realtime.equality_op AS ENUM (
    'eq',
    'neq',
    'lt',
    'lte',
    'gt',
    'gte',
    'in'
);


--
-- Name: user_defined_filter; Type: TYPE; Schema: realtime; Owner: -
--

CREATE TYPE realtime.user_defined_filter AS (
	column_name text,
	op realtime.equality_op,
	value text
);


--
-- Name: wal_column; Type: TYPE; Schema: realtime; Owner: -
--

CREATE TYPE realtime.wal_column AS (
	name text,
	type_name text,
	type_oid oid,
	value jsonb,
	is_pkey boolean,
	is_selectable boolean
);


--
-- Name: wal_rls; Type: TYPE; Schema: realtime; Owner: -
--

CREATE TYPE realtime.wal_rls AS (
	wal jsonb,
	is_rls_enabled boolean,
	subscription_ids uuid[],
	errors text[]
);


--
-- Name: buckettype; Type: TYPE; Schema: storage; Owner: -
--

CREATE TYPE storage.buckettype AS ENUM (
    'STANDARD',
    'ANALYTICS',
    'VECTOR'
);


--
-- Name: email(); Type: FUNCTION; Schema: auth; Owner: -
--

CREATE FUNCTION auth.email() RETURNS text
    LANGUAGE sql STABLE
    AS $$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.email', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'email')
  )::text
$$;


--
-- Name: FUNCTION email(); Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON FUNCTION auth.email() IS 'Deprecated. Use auth.jwt() -> ''email'' instead.';


--
-- Name: jwt(); Type: FUNCTION; Schema: auth; Owner: -
--

CREATE FUNCTION auth.jwt() RETURNS jsonb
    LANGUAGE sql STABLE
    AS $$
  select 
    coalesce(
        nullif(current_setting('request.jwt.claim', true), ''),
        nullif(current_setting('request.jwt.claims', true), '')
    )::jsonb
$$;


--
-- Name: role(); Type: FUNCTION; Schema: auth; Owner: -
--

CREATE FUNCTION auth.role() RETURNS text
    LANGUAGE sql STABLE
    AS $$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.role', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'role')
  )::text
$$;


--
-- Name: FUNCTION role(); Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON FUNCTION auth.role() IS 'Deprecated. Use auth.jwt() -> ''role'' instead.';


--
-- Name: uid(); Type: FUNCTION; Schema: auth; Owner: -
--

CREATE FUNCTION auth.uid() RETURNS uuid
    LANGUAGE sql STABLE
    AS $$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.sub', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub')
  )::uuid
$$;


--
-- Name: FUNCTION uid(); Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON FUNCTION auth.uid() IS 'Deprecated. Use auth.jwt() -> ''sub'' instead.';


--
-- Name: grant_pg_cron_access(); Type: FUNCTION; Schema: extensions; Owner: -
--

CREATE FUNCTION extensions.grant_pg_cron_access() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  IF EXISTS (
    SELECT
    FROM pg_event_trigger_ddl_commands() AS ev
    JOIN pg_extension AS ext
    ON ev.objid = ext.oid
    WHERE ext.extname = 'pg_cron'
  )
  THEN
    grant usage on schema cron to postgres with grant option;

    alter default privileges in schema cron grant all on tables to postgres with grant option;
    alter default privileges in schema cron grant all on functions to postgres with grant option;
    alter default privileges in schema cron grant all on sequences to postgres with grant option;

    alter default privileges for user supabase_admin in schema cron grant all
        on sequences to postgres with grant option;
    alter default privileges for user supabase_admin in schema cron grant all
        on tables to postgres with grant option;
    alter default privileges for user supabase_admin in schema cron grant all
        on functions to postgres with grant option;

    grant all privileges on all tables in schema cron to postgres with grant option;
    revoke all on table cron.job from postgres;
    grant select on table cron.job to postgres with grant option;
  END IF;
END;
$$;


--
-- Name: FUNCTION grant_pg_cron_access(); Type: COMMENT; Schema: extensions; Owner: -
--

COMMENT ON FUNCTION extensions.grant_pg_cron_access() IS 'Grants access to pg_cron';


--
-- Name: grant_pg_graphql_access(); Type: FUNCTION; Schema: extensions; Owner: -
--

CREATE FUNCTION extensions.grant_pg_graphql_access() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $_$
DECLARE
    func_is_graphql_resolve bool;
BEGIN
    func_is_graphql_resolve = (
        SELECT n.proname = 'resolve'
        FROM pg_event_trigger_ddl_commands() AS ev
        LEFT JOIN pg_catalog.pg_proc AS n
        ON ev.objid = n.oid
    );

    IF func_is_graphql_resolve
    THEN
        -- Update public wrapper to pass all arguments through to the pg_graphql resolve func
        DROP FUNCTION IF EXISTS graphql_public.graphql;
        create or replace function graphql_public.graphql(
            "operationName" text default null,
            query text default null,
            variables jsonb default null,
            extensions jsonb default null
        )
            returns jsonb
            language sql
        as $$
            select graphql.resolve(
                query := query,
                variables := coalesce(variables, '{}'),
                "operationName" := "operationName",
                extensions := extensions
            );
        $$;

        -- This hook executes when `graphql.resolve` is created. That is not necessarily the last
        -- function in the extension so we need to grant permissions on existing entities AND
        -- update default permissions to any others that are created after `graphql.resolve`
        grant usage on schema graphql to postgres, anon, authenticated, service_role;
        grant select on all tables in schema graphql to postgres, anon, authenticated, service_role;
        grant execute on all functions in schema graphql to postgres, anon, authenticated, service_role;
        grant all on all sequences in schema graphql to postgres, anon, authenticated, service_role;
        alter default privileges in schema graphql grant all on tables to postgres, anon, authenticated, service_role;
        alter default privileges in schema graphql grant all on functions to postgres, anon, authenticated, service_role;
        alter default privileges in schema graphql grant all on sequences to postgres, anon, authenticated, service_role;

        -- Allow postgres role to allow granting usage on graphql and graphql_public schemas to custom roles
        grant usage on schema graphql_public to postgres with grant option;
        grant usage on schema graphql to postgres with grant option;
    END IF;

END;
$_$;


--
-- Name: FUNCTION grant_pg_graphql_access(); Type: COMMENT; Schema: extensions; Owner: -
--

COMMENT ON FUNCTION extensions.grant_pg_graphql_access() IS 'Grants access to pg_graphql';


--
-- Name: grant_pg_net_access(); Type: FUNCTION; Schema: extensions; Owner: -
--

CREATE FUNCTION extensions.grant_pg_net_access() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_event_trigger_ddl_commands() AS ev
    JOIN pg_extension AS ext
    ON ev.objid = ext.oid
    WHERE ext.extname = 'pg_net'
  )
  THEN
    IF NOT EXISTS (
      SELECT 1
      FROM pg_roles
      WHERE rolname = 'supabase_functions_admin'
    )
    THEN
      CREATE USER supabase_functions_admin NOINHERIT CREATEROLE LOGIN NOREPLICATION;
    END IF;

    GRANT USAGE ON SCHEMA net TO supabase_functions_admin, postgres, anon, authenticated, service_role;

    IF EXISTS (
      SELECT FROM pg_extension
      WHERE extname = 'pg_net'
      -- all versions in use on existing projects as of 2025-02-20
      -- version 0.12.0 onwards don't need these applied
      AND extversion IN ('0.2', '0.6', '0.7', '0.7.1', '0.8', '0.10.0', '0.11.0')
    ) THEN
      ALTER function net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) SECURITY DEFINER;
      ALTER function net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) SECURITY DEFINER;

      ALTER function net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) SET search_path = net;
      ALTER function net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) SET search_path = net;

      REVOKE ALL ON FUNCTION net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) FROM PUBLIC;
      REVOKE ALL ON FUNCTION net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) FROM PUBLIC;

      GRANT EXECUTE ON FUNCTION net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) TO supabase_functions_admin, postgres, anon, authenticated, service_role;
      GRANT EXECUTE ON FUNCTION net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) TO supabase_functions_admin, postgres, anon, authenticated, service_role;
    END IF;
  END IF;
END;
$$;


--
-- Name: FUNCTION grant_pg_net_access(); Type: COMMENT; Schema: extensions; Owner: -
--

COMMENT ON FUNCTION extensions.grant_pg_net_access() IS 'Grants access to pg_net';


--
-- Name: pgrst_ddl_watch(); Type: FUNCTION; Schema: extensions; Owner: -
--

CREATE FUNCTION extensions.pgrst_ddl_watch() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
  cmd record;
BEGIN
  FOR cmd IN SELECT * FROM pg_event_trigger_ddl_commands()
  LOOP
    IF cmd.command_tag IN (
      'CREATE SCHEMA', 'ALTER SCHEMA'
    , 'CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO', 'ALTER TABLE'
    , 'CREATE FOREIGN TABLE', 'ALTER FOREIGN TABLE'
    , 'CREATE VIEW', 'ALTER VIEW'
    , 'CREATE MATERIALIZED VIEW', 'ALTER MATERIALIZED VIEW'
    , 'CREATE FUNCTION', 'ALTER FUNCTION'
    , 'CREATE TRIGGER'
    , 'CREATE TYPE', 'ALTER TYPE'
    , 'CREATE RULE'
    , 'COMMENT'
    )
    -- don't notify in case of CREATE TEMP table or other objects created on pg_temp
    AND cmd.schema_name is distinct from 'pg_temp'
    THEN
      NOTIFY pgrst, 'reload schema';
    END IF;
  END LOOP;
END; $$;


--
-- Name: pgrst_drop_watch(); Type: FUNCTION; Schema: extensions; Owner: -
--

CREATE FUNCTION extensions.pgrst_drop_watch() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
  obj record;
BEGIN
  FOR obj IN SELECT * FROM pg_event_trigger_dropped_objects()
  LOOP
    IF obj.object_type IN (
      'schema'
    , 'table'
    , 'foreign table'
    , 'view'
    , 'materialized view'
    , 'function'
    , 'trigger'
    , 'type'
    , 'rule'
    )
    AND obj.is_temporary IS false -- no pg_temp objects
    THEN
      NOTIFY pgrst, 'reload schema';
    END IF;
  END LOOP;
END; $$;


--
-- Name: set_graphql_placeholder(); Type: FUNCTION; Schema: extensions; Owner: -
--

CREATE FUNCTION extensions.set_graphql_placeholder() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $_$
    DECLARE
    graphql_is_dropped bool;
    BEGIN
    graphql_is_dropped = (
        SELECT ev.schema_name = 'graphql_public'
        FROM pg_event_trigger_dropped_objects() AS ev
        WHERE ev.schema_name = 'graphql_public'
    );

    IF graphql_is_dropped
    THEN
        create or replace function graphql_public.graphql(
            "operationName" text default null,
            query text default null,
            variables jsonb default null,
            extensions jsonb default null
        )
            returns jsonb
            language plpgsql
        as $$
            DECLARE
                server_version float;
            BEGIN
                server_version = (SELECT (SPLIT_PART((select version()), ' ', 2))::float);

                IF server_version >= 14 THEN
                    RETURN jsonb_build_object(
                        'errors', jsonb_build_array(
                            jsonb_build_object(
                                'message', 'pg_graphql extension is not enabled.'
                            )
                        )
                    );
                ELSE
                    RETURN jsonb_build_object(
                        'errors', jsonb_build_array(
                            jsonb_build_object(
                                'message', 'pg_graphql is only available on projects running Postgres 14 onwards.'
                            )
                        )
                    );
                END IF;
            END;
        $$;
    END IF;

    END;
$_$;


--
-- Name: FUNCTION set_graphql_placeholder(); Type: COMMENT; Schema: extensions; Owner: -
--

COMMENT ON FUNCTION extensions.set_graphql_placeholder() IS 'Reintroduces placeholder function for graphql_public.graphql';


--
-- Name: get_auth(text); Type: FUNCTION; Schema: pgbouncer; Owner: -
--

CREATE FUNCTION pgbouncer.get_auth(p_usename text) RETURNS TABLE(username text, password text)
    LANGUAGE plpgsql SECURITY DEFINER
    AS $_$
begin
    raise debug 'PgBouncer auth request: %', p_usename;

    return query
    select 
        rolname::text, 
        case when rolvaliduntil < now() 
            then null 
            else rolpassword::text 
        end 
    from pg_authid 
    where rolname=$1 and rolcanlogin;
end;
$_$;


--
-- Name: add_wallet_balance(uuid, numeric, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.add_wallet_balance(user_id uuid, amount numeric, transaction_type text) RETURNS void
    LANGUAGE plpgsql
    AS $$

DECLARE

    current_balance DECIMAL;

    new_balance DECIMAL;

BEGIN

    -- Get current balance

    SELECT wallet_balance INTO current_balance

    FROM users

    WHERE id = user_id;



    -- Calculate new balance

    new_balance := COALESCE(current_balance, 0) + amount;



    -- Update wallet balance

    UPDATE users

    SET wallet_balance = new_balance

    WHERE id = user_id;



    -- Create transaction record (if needed, can be called separately)

    -- This is a helper function, actual transaction creation happens in API

END;

$$;


--
-- Name: check_provider_ratings(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.check_provider_ratings() RETURNS trigger
    LANGUAGE plpgsql
    AS $$

DECLARE

    recent_ratings DECIMAL[];

    all_low BOOLEAN := true;

    suspension_days INT;

BEGIN

    -- Get last 3 ratings for this provider

    SELECT ARRAY_AGG(rating ORDER BY created_at DESC)

    INTO recent_ratings

    FROM ratings

    WHERE provider_id = NEW.provider_id

    ORDER BY created_at DESC

    LIMIT 3;



    -- Check if we have 3 ratings and all are <= 2

    IF array_length(recent_ratings, 1) = 3 THEN

        FOR i IN 1..3 LOOP

            IF recent_ratings[i] > 2 THEN

                all_low := false;

                EXIT;

            END IF;

        END LOOP;



        -- If all 3 are low, suspend provider

        IF all_low THEN

            SELECT value->>'value'::INT INTO suspension_days

            FROM admin_settings

            WHERE key = 'suspension_days'

            LIMIT 1;



            IF suspension_days IS NULL THEN

                suspension_days := 7; -- Default 7 days

            END IF;



            UPDATE providers

            SET 

                is_suspended = true,

                suspension_until = NOW() + (suspension_days || ' days')::INTERVAL

            WHERE id = NEW.provider_id;

        END IF;

    END IF;



    RETURN NEW;

END;

$$;


--
-- Name: generate_booking_number(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.generate_booking_number() RETURNS trigger
    LANGUAGE plpgsql
    AS $$

BEGIN

    NEW.booking_number := 'HS' || TO_CHAR(NOW(), 'YYYYMMDD') || LPAD(NEXTVAL('booking_seq')::TEXT, 6, '0');

    RETURN NEW;

END;

$$;


--
-- Name: get_nearby_providers(uuid, numeric, numeric, numeric); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_nearby_providers(service_id_param uuid, lat_param numeric, lng_param numeric, radius_km_param numeric DEFAULT 10) RETURNS TABLE(provider_id uuid, distance_km numeric, provider_data jsonb)
    LANGUAGE plpgsql
    AS $$

BEGIN

    RETURN QUERY

    SELECT 

        p.id,

        -- Haversine formula for distance calculation

        (

            6371 * acos(

                cos(radians(lat_param)) *

                cos(radians(COALESCE(p.current_lat, p.fixed_location_lat))) *

                cos(radians(COALESCE(p.current_lng, p.fixed_location_lng)) - radians(lng_param)) +

                sin(radians(lat_param)) *

                sin(radians(COALESCE(p.current_lat, p.fixed_location_lat)))

            )

        ) AS distance,

        row_to_json(p)::JSONB AS provider_data

    FROM providers p

    INNER JOIN provider_services ps ON ps.provider_id = p.id

    WHERE 

        ps.service_id = service_id_param

        AND p.is_verified = true

        AND p.is_suspended = false

        AND p.is_available = true

        AND p.is_online = true

        AND (

            p.current_lat IS NOT NULL OR p.fixed_location_lat IS NOT NULL

        )

    HAVING (

        6371 * acos(

            cos(radians(lat_param)) *

            cos(radians(COALESCE(p.current_lat, p.fixed_location_lat))) *

            cos(radians(COALESCE(p.current_lng, p.fixed_location_lng)) - radians(lng_param)) +

            sin(radians(lat_param)) *

            sin(radians(COALESCE(p.current_lat, p.fixed_location_lat)))

        )

    ) <= radius_km_param

    ORDER BY distance;

END;

$$;


--
-- Name: is_admin(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.is_admin() RETURNS boolean
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$

BEGIN

  -- Check if the user has the admin role in the users table

  -- SECURITY DEFINER allows this function to bypass RLS on the users table

  RETURN EXISTS (

    SELECT 1

    FROM users

    WHERE id = auth.uid()

    AND role IN ('admin', 'superadmin')

  );

END;

$$;


--
-- Name: update_doc_change_request_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_doc_change_request_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$

BEGIN

  NEW.updated_at = NOW();

  RETURN NEW;

END;

$$;


--
-- Name: update_provider_payment_settings_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_provider_payment_settings_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$

BEGIN

  NEW.updated_at = NOW();

  RETURN NEW;

END;

$$;


--
-- Name: update_provider_rating(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_provider_rating() RETURNS trigger
    LANGUAGE plpgsql
    AS $$

BEGIN

    UPDATE providers

    SET 

        total_ratings = (SELECT COUNT(*) FROM ratings WHERE provider_id = NEW.provider_id),

        average_rating = (SELECT AVG(rating) FROM ratings WHERE provider_id = NEW.provider_id)

    WHERE id = NEW.provider_id;

    RETURN NEW;

END;

$$;


--
-- Name: update_provider_service_rates_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_provider_service_rates_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$

BEGIN

  NEW.updated_at = NOW();

  RETURN NEW;

END;

$$;


--
-- Name: update_sub_subservices_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_sub_subservices_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$

BEGIN

    NEW.updated_at = NOW();

    RETURN NEW;

END;

$$;


--
-- Name: update_subscriptions_timestamp(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_subscriptions_timestamp() RETURNS trigger
    LANGUAGE plpgsql
    AS $$

BEGIN

  NEW.updated_at = now();

  RETURN NEW;

END;

$$;


--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$

BEGIN

    NEW.updated_at = NOW();

    RETURN NEW;

END;

$$;


--
-- Name: update_user_subscriptions_timestamp(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_user_subscriptions_timestamp() RETURNS trigger
    LANGUAGE plpgsql
    AS $$

BEGIN

  NEW.updated_at = now();

  RETURN NEW;

END;

$$;


--
-- Name: update_wallet_timestamp(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_wallet_timestamp() RETURNS trigger
    LANGUAGE plpgsql
    AS $$

BEGIN

    NEW.updated_at = NOW();

    RETURN NEW;

END;

$$;


--
-- Name: update_wallet_topup_timestamp(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_wallet_topup_timestamp() RETURNS trigger
    LANGUAGE plpgsql
    AS $$

BEGIN

    NEW.updated_at = NOW();

    RETURN NEW;

END;

$$;


--
-- Name: apply_rls(jsonb, integer); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer DEFAULT (1024 * 1024)) RETURNS SETOF realtime.wal_rls
    LANGUAGE plpgsql
    AS $$
declare
-- Regclass of the table e.g. public.notes
entity_ regclass = (quote_ident(wal ->> 'schema') || '.' || quote_ident(wal ->> 'table'))::regclass;

-- I, U, D, T: insert, update ...
action realtime.action = (
    case wal ->> 'action'
        when 'I' then 'INSERT'
        when 'U' then 'UPDATE'
        when 'D' then 'DELETE'
        else 'ERROR'
    end
);

-- Is row level security enabled for the table
is_rls_enabled bool = relrowsecurity from pg_class where oid = entity_;

subscriptions realtime.subscription[] = array_agg(subs)
    from
        realtime.subscription subs
    where
        subs.entity = entity_;

-- Subscription vars
roles regrole[] = array_agg(distinct us.claims_role::text)
    from
        unnest(subscriptions) us;

working_role regrole;
claimed_role regrole;
claims jsonb;

subscription_id uuid;
subscription_has_access bool;
visible_to_subscription_ids uuid[] = '{}';

-- structured info for wal's columns
columns realtime.wal_column[];
-- previous identity values for update/delete
old_columns realtime.wal_column[];

error_record_exceeds_max_size boolean = octet_length(wal::text) > max_record_bytes;

-- Primary jsonb output for record
output jsonb;

begin
perform set_config('role', null, true);

columns =
    array_agg(
        (
            x->>'name',
            x->>'type',
            x->>'typeoid',
            realtime.cast(
                (x->'value') #>> '{}',
                coalesce(
                    (x->>'typeoid')::regtype, -- null when wal2json version <= 2.4
                    (x->>'type')::regtype
                )
            ),
            (pks ->> 'name') is not null,
            true
        )::realtime.wal_column
    )
    from
        jsonb_array_elements(wal -> 'columns') x
        left join jsonb_array_elements(wal -> 'pk') pks
            on (x ->> 'name') = (pks ->> 'name');

old_columns =
    array_agg(
        (
            x->>'name',
            x->>'type',
            x->>'typeoid',
            realtime.cast(
                (x->'value') #>> '{}',
                coalesce(
                    (x->>'typeoid')::regtype, -- null when wal2json version <= 2.4
                    (x->>'type')::regtype
                )
            ),
            (pks ->> 'name') is not null,
            true
        )::realtime.wal_column
    )
    from
        jsonb_array_elements(wal -> 'identity') x
        left join jsonb_array_elements(wal -> 'pk') pks
            on (x ->> 'name') = (pks ->> 'name');

for working_role in select * from unnest(roles) loop

    -- Update `is_selectable` for columns and old_columns
    columns =
        array_agg(
            (
                c.name,
                c.type_name,
                c.type_oid,
                c.value,
                c.is_pkey,
                pg_catalog.has_column_privilege(working_role, entity_, c.name, 'SELECT')
            )::realtime.wal_column
        )
        from
            unnest(columns) c;

    old_columns =
            array_agg(
                (
                    c.name,
                    c.type_name,
                    c.type_oid,
                    c.value,
                    c.is_pkey,
                    pg_catalog.has_column_privilege(working_role, entity_, c.name, 'SELECT')
                )::realtime.wal_column
            )
            from
                unnest(old_columns) c;

    if action <> 'DELETE' and count(1) = 0 from unnest(columns) c where c.is_pkey then
        return next (
            jsonb_build_object(
                'schema', wal ->> 'schema',
                'table', wal ->> 'table',
                'type', action
            ),
            is_rls_enabled,
            -- subscriptions is already filtered by entity
            (select array_agg(s.subscription_id) from unnest(subscriptions) as s where claims_role = working_role),
            array['Error 400: Bad Request, no primary key']
        )::realtime.wal_rls;

    -- The claims role does not have SELECT permission to the primary key of entity
    elsif action <> 'DELETE' and sum(c.is_selectable::int) <> count(1) from unnest(columns) c where c.is_pkey then
        return next (
            jsonb_build_object(
                'schema', wal ->> 'schema',
                'table', wal ->> 'table',
                'type', action
            ),
            is_rls_enabled,
            (select array_agg(s.subscription_id) from unnest(subscriptions) as s where claims_role = working_role),
            array['Error 401: Unauthorized']
        )::realtime.wal_rls;

    else
        output = jsonb_build_object(
            'schema', wal ->> 'schema',
            'table', wal ->> 'table',
            'type', action,
            'commit_timestamp', to_char(
                ((wal ->> 'timestamp')::timestamptz at time zone 'utc'),
                'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'
            ),
            'columns', (
                select
                    jsonb_agg(
                        jsonb_build_object(
                            'name', pa.attname,
                            'type', pt.typname
                        )
                        order by pa.attnum asc
                    )
                from
                    pg_attribute pa
                    join pg_type pt
                        on pa.atttypid = pt.oid
                where
                    attrelid = entity_
                    and attnum > 0
                    and pg_catalog.has_column_privilege(working_role, entity_, pa.attname, 'SELECT')
            )
        )
        -- Add "record" key for insert and update
        || case
            when action in ('INSERT', 'UPDATE') then
                jsonb_build_object(
                    'record',
                    (
                        select
                            jsonb_object_agg(
                                -- if unchanged toast, get column name and value from old record
                                coalesce((c).name, (oc).name),
                                case
                                    when (c).name is null then (oc).value
                                    else (c).value
                                end
                            )
                        from
                            unnest(columns) c
                            full outer join unnest(old_columns) oc
                                on (c).name = (oc).name
                        where
                            coalesce((c).is_selectable, (oc).is_selectable)
                            and ( not error_record_exceeds_max_size or (octet_length((c).value::text) <= 64))
                    )
                )
            else '{}'::jsonb
        end
        -- Add "old_record" key for update and delete
        || case
            when action = 'UPDATE' then
                jsonb_build_object(
                        'old_record',
                        (
                            select jsonb_object_agg((c).name, (c).value)
                            from unnest(old_columns) c
                            where
                                (c).is_selectable
                                and ( not error_record_exceeds_max_size or (octet_length((c).value::text) <= 64))
                        )
                    )
            when action = 'DELETE' then
                jsonb_build_object(
                    'old_record',
                    (
                        select jsonb_object_agg((c).name, (c).value)
                        from unnest(old_columns) c
                        where
                            (c).is_selectable
                            and ( not error_record_exceeds_max_size or (octet_length((c).value::text) <= 64))
                            and ( not is_rls_enabled or (c).is_pkey ) -- if RLS enabled, we can't secure deletes so filter to pkey
                    )
                )
            else '{}'::jsonb
        end;

        -- Create the prepared statement
        if is_rls_enabled and action <> 'DELETE' then
            if (select 1 from pg_prepared_statements where name = 'walrus_rls_stmt' limit 1) > 0 then
                deallocate walrus_rls_stmt;
            end if;
            execute realtime.build_prepared_statement_sql('walrus_rls_stmt', entity_, columns);
        end if;

        visible_to_subscription_ids = '{}';

        for subscription_id, claims in (
                select
                    subs.subscription_id,
                    subs.claims
                from
                    unnest(subscriptions) subs
                where
                    subs.entity = entity_
                    and subs.claims_role = working_role
                    and (
                        realtime.is_visible_through_filters(columns, subs.filters)
                        or (
                          action = 'DELETE'
                          and realtime.is_visible_through_filters(old_columns, subs.filters)
                        )
                    )
        ) loop

            if not is_rls_enabled or action = 'DELETE' then
                visible_to_subscription_ids = visible_to_subscription_ids || subscription_id;
            else
                -- Check if RLS allows the role to see the record
                perform
                    -- Trim leading and trailing quotes from working_role because set_config
                    -- doesn't recognize the role as valid if they are included
                    set_config('role', trim(both '"' from working_role::text), true),
                    set_config('request.jwt.claims', claims::text, true);

                execute 'execute walrus_rls_stmt' into subscription_has_access;

                if subscription_has_access then
                    visible_to_subscription_ids = visible_to_subscription_ids || subscription_id;
                end if;
            end if;
        end loop;

        perform set_config('role', null, true);

        return next (
            output,
            is_rls_enabled,
            visible_to_subscription_ids,
            case
                when error_record_exceeds_max_size then array['Error 413: Payload Too Large']
                else '{}'
            end
        )::realtime.wal_rls;

    end if;
end loop;

perform set_config('role', null, true);
end;
$$;


--
-- Name: broadcast_changes(text, text, text, text, text, record, record, text); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.broadcast_changes(topic_name text, event_name text, operation text, table_name text, table_schema text, new record, old record, level text DEFAULT 'ROW'::text) RETURNS void
    LANGUAGE plpgsql
    AS $$
DECLARE
    -- Declare a variable to hold the JSONB representation of the row
    row_data jsonb := '{}'::jsonb;
BEGIN
    IF level = 'STATEMENT' THEN
        RAISE EXCEPTION 'function can only be triggered for each row, not for each statement';
    END IF;
    -- Check the operation type and handle accordingly
    IF operation = 'INSERT' OR operation = 'UPDATE' OR operation = 'DELETE' THEN
        row_data := jsonb_build_object('old_record', OLD, 'record', NEW, 'operation', operation, 'table', table_name, 'schema', table_schema);
        PERFORM realtime.send (row_data, event_name, topic_name);
    ELSE
        RAISE EXCEPTION 'Unexpected operation type: %', operation;
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Failed to process the row: %', SQLERRM;
END;

$$;


--
-- Name: build_prepared_statement_sql(text, regclass, realtime.wal_column[]); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) RETURNS text
    LANGUAGE sql
    AS $$
      /*
      Builds a sql string that, if executed, creates a prepared statement to
      tests retrive a row from *entity* by its primary key columns.
      Example
          select realtime.build_prepared_statement_sql('public.notes', '{"id"}'::text[], '{"bigint"}'::text[])
      */
          select
      'prepare ' || prepared_statement_name || ' as
          select
              exists(
                  select
                      1
                  from
                      ' || entity || '
                  where
                      ' || string_agg(quote_ident(pkc.name) || '=' || quote_nullable(pkc.value #>> '{}') , ' and ') || '
              )'
          from
              unnest(columns) pkc
          where
              pkc.is_pkey
          group by
              entity
      $$;


--
-- Name: cast(text, regtype); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime."cast"(val text, type_ regtype) RETURNS jsonb
    LANGUAGE plpgsql IMMUTABLE
    AS $$
    declare
      res jsonb;
    begin
      execute format('select to_jsonb(%L::'|| type_::text || ')', val)  into res;
      return res;
    end
    $$;


--
-- Name: check_equality_op(realtime.equality_op, regtype, text, text); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) RETURNS boolean
    LANGUAGE plpgsql IMMUTABLE
    AS $$
      /*
      Casts *val_1* and *val_2* as type *type_* and check the *op* condition for truthiness
      */
      declare
          op_symbol text = (
              case
                  when op = 'eq' then '='
                  when op = 'neq' then '!='
                  when op = 'lt' then '<'
                  when op = 'lte' then '<='
                  when op = 'gt' then '>'
                  when op = 'gte' then '>='
                  when op = 'in' then '= any'
                  else 'UNKNOWN OP'
              end
          );
          res boolean;
      begin
          execute format(
              'select %L::'|| type_::text || ' ' || op_symbol
              || ' ( %L::'
              || (
                  case
                      when op = 'in' then type_::text || '[]'
                      else type_::text end
              )
              || ')', val_1, val_2) into res;
          return res;
      end;
      $$;


--
-- Name: is_visible_through_filters(realtime.wal_column[], realtime.user_defined_filter[]); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) RETURNS boolean
    LANGUAGE sql IMMUTABLE
    AS $_$
    /*
    Should the record be visible (true) or filtered out (false) after *filters* are applied
    */
        select
            -- Default to allowed when no filters present
            $2 is null -- no filters. this should not happen because subscriptions has a default
            or array_length($2, 1) is null -- array length of an empty array is null
            or bool_and(
                coalesce(
                    realtime.check_equality_op(
                        op:=f.op,
                        type_:=coalesce(
                            col.type_oid::regtype, -- null when wal2json version <= 2.4
                            col.type_name::regtype
                        ),
                        -- cast jsonb to text
                        val_1:=col.value #>> '{}',
                        val_2:=f.value
                    ),
                    false -- if null, filter does not match
                )
            )
        from
            unnest(filters) f
            join unnest(columns) col
                on f.column_name = col.name;
    $_$;


--
-- Name: list_changes(name, name, integer, integer); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) RETURNS SETOF realtime.wal_rls
    LANGUAGE sql
    SET log_min_messages TO 'fatal'
    AS $$
      with pub as (
        select
          concat_ws(
            ',',
            case when bool_or(pubinsert) then 'insert' else null end,
            case when bool_or(pubupdate) then 'update' else null end,
            case when bool_or(pubdelete) then 'delete' else null end
          ) as w2j_actions,
          coalesce(
            string_agg(
              realtime.quote_wal2json(format('%I.%I', schemaname, tablename)::regclass),
              ','
            ) filter (where ppt.tablename is not null and ppt.tablename not like '% %'),
            ''
          ) w2j_add_tables
        from
          pg_publication pp
          left join pg_publication_tables ppt
            on pp.pubname = ppt.pubname
        where
          pp.pubname = publication
        group by
          pp.pubname
        limit 1
      ),
      w2j as (
        select
          x.*, pub.w2j_add_tables
        from
          pub,
          pg_logical_slot_get_changes(
            slot_name, null, max_changes,
            'include-pk', 'true',
            'include-transaction', 'false',
            'include-timestamp', 'true',
            'include-type-oids', 'true',
            'format-version', '2',
            'actions', pub.w2j_actions,
            'add-tables', pub.w2j_add_tables
          ) x
      )
      select
        xyz.wal,
        xyz.is_rls_enabled,
        xyz.subscription_ids,
        xyz.errors
      from
        w2j,
        realtime.apply_rls(
          wal := w2j.data::jsonb,
          max_record_bytes := max_record_bytes
        ) xyz(wal, is_rls_enabled, subscription_ids, errors)
      where
        w2j.w2j_add_tables <> ''
        and xyz.subscription_ids[1] is not null
    $$;


--
-- Name: quote_wal2json(regclass); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.quote_wal2json(entity regclass) RETURNS text
    LANGUAGE sql IMMUTABLE STRICT
    AS $$
      select
        (
          select string_agg('' || ch,'')
          from unnest(string_to_array(nsp.nspname::text, null)) with ordinality x(ch, idx)
          where
            not (x.idx = 1 and x.ch = '"')
            and not (
              x.idx = array_length(string_to_array(nsp.nspname::text, null), 1)
              and x.ch = '"'
            )
        )
        || '.'
        || (
          select string_agg('' || ch,'')
          from unnest(string_to_array(pc.relname::text, null)) with ordinality x(ch, idx)
          where
            not (x.idx = 1 and x.ch = '"')
            and not (
              x.idx = array_length(string_to_array(nsp.nspname::text, null), 1)
              and x.ch = '"'
            )
          )
      from
        pg_class pc
        join pg_namespace nsp
          on pc.relnamespace = nsp.oid
      where
        pc.oid = entity
    $$;


--
-- Name: send(jsonb, text, text, boolean); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.send(payload jsonb, event text, topic text, private boolean DEFAULT true) RETURNS void
    LANGUAGE plpgsql
    AS $$
DECLARE
  generated_id uuid;
  final_payload jsonb;
BEGIN
  BEGIN
    -- Generate a new UUID for the id
    generated_id := gen_random_uuid();

    -- Check if payload has an 'id' key, if not, add the generated UUID
    IF payload ? 'id' THEN
      final_payload := payload;
    ELSE
      final_payload := jsonb_set(payload, '{id}', to_jsonb(generated_id));
    END IF;

    -- Set the topic configuration
    EXECUTE format('SET LOCAL realtime.topic TO %L', topic);

    -- Attempt to insert the message
    INSERT INTO realtime.messages (id, payload, event, topic, private, extension)
    VALUES (generated_id, final_payload, event, topic, private, 'broadcast');
  EXCEPTION
    WHEN OTHERS THEN
      -- Capture and notify the error
      RAISE WARNING 'ErrorSendingBroadcastMessage: %', SQLERRM;
  END;
END;
$$;


--
-- Name: subscription_check_filters(); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.subscription_check_filters() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
    /*
    Validates that the user defined filters for a subscription:
    - refer to valid columns that the claimed role may access
    - values are coercable to the correct column type
    */
    declare
        col_names text[] = coalesce(
                array_agg(c.column_name order by c.ordinal_position),
                '{}'::text[]
            )
            from
                information_schema.columns c
            where
                format('%I.%I', c.table_schema, c.table_name)::regclass = new.entity
                and pg_catalog.has_column_privilege(
                    (new.claims ->> 'role'),
                    format('%I.%I', c.table_schema, c.table_name)::regclass,
                    c.column_name,
                    'SELECT'
                );
        filter realtime.user_defined_filter;
        col_type regtype;

        in_val jsonb;
    begin
        for filter in select * from unnest(new.filters) loop
            -- Filtered column is valid
            if not filter.column_name = any(col_names) then
                raise exception 'invalid column for filter %', filter.column_name;
            end if;

            -- Type is sanitized and safe for string interpolation
            col_type = (
                select atttypid::regtype
                from pg_catalog.pg_attribute
                where attrelid = new.entity
                      and attname = filter.column_name
            );
            if col_type is null then
                raise exception 'failed to lookup type for column %', filter.column_name;
            end if;

            -- Set maximum number of entries for in filter
            if filter.op = 'in'::realtime.equality_op then
                in_val = realtime.cast(filter.value, (col_type::text || '[]')::regtype);
                if coalesce(jsonb_array_length(in_val), 0) > 100 then
                    raise exception 'too many values for `in` filter. Maximum 100';
                end if;
            else
                -- raises an exception if value is not coercable to type
                perform realtime.cast(filter.value, col_type);
            end if;

        end loop;

        -- Apply consistent order to filters so the unique constraint on
        -- (subscription_id, entity, filters) can't be tricked by a different filter order
        new.filters = coalesce(
            array_agg(f order by f.column_name, f.op, f.value),
            '{}'
        ) from unnest(new.filters) f;

        return new;
    end;
    $$;


--
-- Name: to_regrole(text); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.to_regrole(role_name text) RETURNS regrole
    LANGUAGE sql IMMUTABLE
    AS $$ select role_name::regrole $$;


--
-- Name: topic(); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.topic() RETURNS text
    LANGUAGE sql STABLE
    AS $$
select nullif(current_setting('realtime.topic', true), '')::text;
$$;


--
-- Name: add_prefixes(text, text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.add_prefixes(_bucket_id text, _name text) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    prefixes text[];
BEGIN
    prefixes := "storage"."get_prefixes"("_name");

    IF array_length(prefixes, 1) > 0 THEN
        INSERT INTO storage.prefixes (name, bucket_id)
        SELECT UNNEST(prefixes) as name, "_bucket_id" ON CONFLICT DO NOTHING;
    END IF;
END;
$$;


--
-- Name: can_insert_object(text, text, uuid, jsonb); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.can_insert_object(bucketid text, name text, owner uuid, metadata jsonb) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
  INSERT INTO "storage"."objects" ("bucket_id", "name", "owner", "metadata") VALUES (bucketid, name, owner, metadata);
  -- hack to rollback the successful insert
  RAISE sqlstate 'PT200' using
  message = 'ROLLBACK',
  detail = 'rollback successful insert';
END
$$;


--
-- Name: delete_leaf_prefixes(text[], text[]); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.delete_leaf_prefixes(bucket_ids text[], names text[]) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    v_rows_deleted integer;
BEGIN
    LOOP
        WITH candidates AS (
            SELECT DISTINCT
                t.bucket_id,
                unnest(storage.get_prefixes(t.name)) AS name
            FROM unnest(bucket_ids, names) AS t(bucket_id, name)
        ),
        uniq AS (
             SELECT
                 bucket_id,
                 name,
                 storage.get_level(name) AS level
             FROM candidates
             WHERE name <> ''
             GROUP BY bucket_id, name
        ),
        leaf AS (
             SELECT
                 p.bucket_id,
                 p.name,
                 p.level
             FROM storage.prefixes AS p
                  JOIN uniq AS u
                       ON u.bucket_id = p.bucket_id
                           AND u.name = p.name
                           AND u.level = p.level
             WHERE NOT EXISTS (
                 SELECT 1
                 FROM storage.objects AS o
                 WHERE o.bucket_id = p.bucket_id
                   AND o.level = p.level + 1
                   AND o.name COLLATE "C" LIKE p.name || '/%'
             )
             AND NOT EXISTS (
                 SELECT 1
                 FROM storage.prefixes AS c
                 WHERE c.bucket_id = p.bucket_id
                   AND c.level = p.level + 1
                   AND c.name COLLATE "C" LIKE p.name || '/%'
             )
        )
        DELETE
        FROM storage.prefixes AS p
            USING leaf AS l
        WHERE p.bucket_id = l.bucket_id
          AND p.name = l.name
          AND p.level = l.level;

        GET DIAGNOSTICS v_rows_deleted = ROW_COUNT;
        EXIT WHEN v_rows_deleted = 0;
    END LOOP;
END;
$$;


--
-- Name: delete_prefix(text, text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.delete_prefix(_bucket_id text, _name text) RETURNS boolean
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
    -- Check if we can delete the prefix
    IF EXISTS(
        SELECT FROM "storage"."prefixes"
        WHERE "prefixes"."bucket_id" = "_bucket_id"
          AND level = "storage"."get_level"("_name") + 1
          AND "prefixes"."name" COLLATE "C" LIKE "_name" || '/%'
        LIMIT 1
    )
    OR EXISTS(
        SELECT FROM "storage"."objects"
        WHERE "objects"."bucket_id" = "_bucket_id"
          AND "storage"."get_level"("objects"."name") = "storage"."get_level"("_name") + 1
          AND "objects"."name" COLLATE "C" LIKE "_name" || '/%'
        LIMIT 1
    ) THEN
    -- There are sub-objects, skip deletion
    RETURN false;
    ELSE
        DELETE FROM "storage"."prefixes"
        WHERE "prefixes"."bucket_id" = "_bucket_id"
          AND level = "storage"."get_level"("_name")
          AND "prefixes"."name" = "_name";
        RETURN true;
    END IF;
END;
$$;


--
-- Name: delete_prefix_hierarchy_trigger(); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.delete_prefix_hierarchy_trigger() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
    prefix text;
BEGIN
    prefix := "storage"."get_prefix"(OLD."name");

    IF coalesce(prefix, '') != '' THEN
        PERFORM "storage"."delete_prefix"(OLD."bucket_id", prefix);
    END IF;

    RETURN OLD;
END;
$$;


--
-- Name: enforce_bucket_name_length(); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.enforce_bucket_name_length() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
begin
    if length(new.name) > 100 then
        raise exception 'bucket name "%" is too long (% characters). Max is 100.', new.name, length(new.name);
    end if;
    return new;
end;
$$;


--
-- Name: extension(text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.extension(name text) RETURNS text
    LANGUAGE plpgsql IMMUTABLE
    AS $$
DECLARE
    _parts text[];
    _filename text;
BEGIN
    SELECT string_to_array(name, '/') INTO _parts;
    SELECT _parts[array_length(_parts,1)] INTO _filename;
    RETURN reverse(split_part(reverse(_filename), '.', 1));
END
$$;


--
-- Name: filename(text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.filename(name text) RETURNS text
    LANGUAGE plpgsql
    AS $$
DECLARE
_parts text[];
BEGIN
	select string_to_array(name, '/') into _parts;
	return _parts[array_length(_parts,1)];
END
$$;


--
-- Name: foldername(text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.foldername(name text) RETURNS text[]
    LANGUAGE plpgsql IMMUTABLE
    AS $$
DECLARE
    _parts text[];
BEGIN
    -- Split on "/" to get path segments
    SELECT string_to_array(name, '/') INTO _parts;
    -- Return everything except the last segment
    RETURN _parts[1 : array_length(_parts,1) - 1];
END
$$;


--
-- Name: get_level(text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.get_level(name text) RETURNS integer
    LANGUAGE sql IMMUTABLE STRICT
    AS $$
SELECT array_length(string_to_array("name", '/'), 1);
$$;


--
-- Name: get_prefix(text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.get_prefix(name text) RETURNS text
    LANGUAGE sql IMMUTABLE STRICT
    AS $_$
SELECT
    CASE WHEN strpos("name", '/') > 0 THEN
             regexp_replace("name", '[\/]{1}[^\/]+\/?$', '')
         ELSE
             ''
        END;
$_$;


--
-- Name: get_prefixes(text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.get_prefixes(name text) RETURNS text[]
    LANGUAGE plpgsql IMMUTABLE STRICT
    AS $$
DECLARE
    parts text[];
    prefixes text[];
    prefix text;
BEGIN
    -- Split the name into parts by '/'
    parts := string_to_array("name", '/');
    prefixes := '{}';

    -- Construct the prefixes, stopping one level below the last part
    FOR i IN 1..array_length(parts, 1) - 1 LOOP
            prefix := array_to_string(parts[1:i], '/');
            prefixes := array_append(prefixes, prefix);
    END LOOP;

    RETURN prefixes;
END;
$$;


--
-- Name: get_size_by_bucket(); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.get_size_by_bucket() RETURNS TABLE(size bigint, bucket_id text)
    LANGUAGE plpgsql STABLE
    AS $$
BEGIN
    return query
        select sum((metadata->>'size')::bigint) as size, obj.bucket_id
        from "storage".objects as obj
        group by obj.bucket_id;
END
$$;


--
-- Name: list_multipart_uploads_with_delimiter(text, text, text, integer, text, text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.list_multipart_uploads_with_delimiter(bucket_id text, prefix_param text, delimiter_param text, max_keys integer DEFAULT 100, next_key_token text DEFAULT ''::text, next_upload_token text DEFAULT ''::text) RETURNS TABLE(key text, id text, created_at timestamp with time zone)
    LANGUAGE plpgsql
    AS $_$
BEGIN
    RETURN QUERY EXECUTE
        'SELECT DISTINCT ON(key COLLATE "C") * from (
            SELECT
                CASE
                    WHEN position($2 IN substring(key from length($1) + 1)) > 0 THEN
                        substring(key from 1 for length($1) + position($2 IN substring(key from length($1) + 1)))
                    ELSE
                        key
                END AS key, id, created_at
            FROM
                storage.s3_multipart_uploads
            WHERE
                bucket_id = $5 AND
                key ILIKE $1 || ''%'' AND
                CASE
                    WHEN $4 != '''' AND $6 = '''' THEN
                        CASE
                            WHEN position($2 IN substring(key from length($1) + 1)) > 0 THEN
                                substring(key from 1 for length($1) + position($2 IN substring(key from length($1) + 1))) COLLATE "C" > $4
                            ELSE
                                key COLLATE "C" > $4
                            END
                    ELSE
                        true
                END AND
                CASE
                    WHEN $6 != '''' THEN
                        id COLLATE "C" > $6
                    ELSE
                        true
                    END
            ORDER BY
                key COLLATE "C" ASC, created_at ASC) as e order by key COLLATE "C" LIMIT $3'
        USING prefix_param, delimiter_param, max_keys, next_key_token, bucket_id, next_upload_token;
END;
$_$;


--
-- Name: list_objects_with_delimiter(text, text, text, integer, text, text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.list_objects_with_delimiter(bucket_id text, prefix_param text, delimiter_param text, max_keys integer DEFAULT 100, start_after text DEFAULT ''::text, next_token text DEFAULT ''::text) RETURNS TABLE(name text, id uuid, metadata jsonb, updated_at timestamp with time zone)
    LANGUAGE plpgsql
    AS $_$
BEGIN
    RETURN QUERY EXECUTE
        'SELECT DISTINCT ON(name COLLATE "C") * from (
            SELECT
                CASE
                    WHEN position($2 IN substring(name from length($1) + 1)) > 0 THEN
                        substring(name from 1 for length($1) + position($2 IN substring(name from length($1) + 1)))
                    ELSE
                        name
                END AS name, id, metadata, updated_at
            FROM
                storage.objects
            WHERE
                bucket_id = $5 AND
                name ILIKE $1 || ''%'' AND
                CASE
                    WHEN $6 != '''' THEN
                    name COLLATE "C" > $6
                ELSE true END
                AND CASE
                    WHEN $4 != '''' THEN
                        CASE
                            WHEN position($2 IN substring(name from length($1) + 1)) > 0 THEN
                                substring(name from 1 for length($1) + position($2 IN substring(name from length($1) + 1))) COLLATE "C" > $4
                            ELSE
                                name COLLATE "C" > $4
                            END
                    ELSE
                        true
                END
            ORDER BY
                name COLLATE "C" ASC) as e order by name COLLATE "C" LIMIT $3'
        USING prefix_param, delimiter_param, max_keys, next_token, bucket_id, start_after;
END;
$_$;


--
-- Name: lock_top_prefixes(text[], text[]); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.lock_top_prefixes(bucket_ids text[], names text[]) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    v_bucket text;
    v_top text;
BEGIN
    FOR v_bucket, v_top IN
        SELECT DISTINCT t.bucket_id,
            split_part(t.name, '/', 1) AS top
        FROM unnest(bucket_ids, names) AS t(bucket_id, name)
        WHERE t.name <> ''
        ORDER BY 1, 2
        LOOP
            PERFORM pg_advisory_xact_lock(hashtextextended(v_bucket || '/' || v_top, 0));
        END LOOP;
END;
$$;


--
-- Name: objects_delete_cleanup(); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.objects_delete_cleanup() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    v_bucket_ids text[];
    v_names      text[];
BEGIN
    IF current_setting('storage.gc.prefixes', true) = '1' THEN
        RETURN NULL;
    END IF;

    PERFORM set_config('storage.gc.prefixes', '1', true);

    SELECT COALESCE(array_agg(d.bucket_id), '{}'),
           COALESCE(array_agg(d.name), '{}')
    INTO v_bucket_ids, v_names
    FROM deleted AS d
    WHERE d.name <> '';

    PERFORM storage.lock_top_prefixes(v_bucket_ids, v_names);
    PERFORM storage.delete_leaf_prefixes(v_bucket_ids, v_names);

    RETURN NULL;
END;
$$;


--
-- Name: objects_insert_prefix_trigger(); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.objects_insert_prefix_trigger() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    PERFORM "storage"."add_prefixes"(NEW."bucket_id", NEW."name");
    NEW.level := "storage"."get_level"(NEW."name");

    RETURN NEW;
END;
$$;


--
-- Name: objects_update_cleanup(); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.objects_update_cleanup() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    -- NEW - OLD (destinations to create prefixes for)
    v_add_bucket_ids text[];
    v_add_names      text[];

    -- OLD - NEW (sources to prune)
    v_src_bucket_ids text[];
    v_src_names      text[];
BEGIN
    IF TG_OP <> 'UPDATE' THEN
        RETURN NULL;
    END IF;

    -- 1) Compute NEWΓêÆOLD (added paths) and OLDΓêÆNEW (moved-away paths)
    WITH added AS (
        SELECT n.bucket_id, n.name
        FROM new_rows n
        WHERE n.name <> '' AND position('/' in n.name) > 0
        EXCEPT
        SELECT o.bucket_id, o.name FROM old_rows o WHERE o.name <> ''
    ),
    moved AS (
         SELECT o.bucket_id, o.name
         FROM old_rows o
         WHERE o.name <> ''
         EXCEPT
         SELECT n.bucket_id, n.name FROM new_rows n WHERE n.name <> ''
    )
    SELECT
        -- arrays for ADDED (dest) in stable order
        COALESCE( (SELECT array_agg(a.bucket_id ORDER BY a.bucket_id, a.name) FROM added a), '{}' ),
        COALESCE( (SELECT array_agg(a.name      ORDER BY a.bucket_id, a.name) FROM added a), '{}' ),
        -- arrays for MOVED (src) in stable order
        COALESCE( (SELECT array_agg(m.bucket_id ORDER BY m.bucket_id, m.name) FROM moved m), '{}' ),
        COALESCE( (SELECT array_agg(m.name      ORDER BY m.bucket_id, m.name) FROM moved m), '{}' )
    INTO v_add_bucket_ids, v_add_names, v_src_bucket_ids, v_src_names;

    -- Nothing to do?
    IF (array_length(v_add_bucket_ids, 1) IS NULL) AND (array_length(v_src_bucket_ids, 1) IS NULL) THEN
        RETURN NULL;
    END IF;

    -- 2) Take per-(bucket, top) locks: ALL prefixes in consistent global order to prevent deadlocks
    DECLARE
        v_all_bucket_ids text[];
        v_all_names text[];
    BEGIN
        -- Combine source and destination arrays for consistent lock ordering
        v_all_bucket_ids := COALESCE(v_src_bucket_ids, '{}') || COALESCE(v_add_bucket_ids, '{}');
        v_all_names := COALESCE(v_src_names, '{}') || COALESCE(v_add_names, '{}');

        -- Single lock call ensures consistent global ordering across all transactions
        IF array_length(v_all_bucket_ids, 1) IS NOT NULL THEN
            PERFORM storage.lock_top_prefixes(v_all_bucket_ids, v_all_names);
        END IF;
    END;

    -- 3) Create destination prefixes (NEWΓêÆOLD) BEFORE pruning sources
    IF array_length(v_add_bucket_ids, 1) IS NOT NULL THEN
        WITH candidates AS (
            SELECT DISTINCT t.bucket_id, unnest(storage.get_prefixes(t.name)) AS name
            FROM unnest(v_add_bucket_ids, v_add_names) AS t(bucket_id, name)
            WHERE name <> ''
        )
        INSERT INTO storage.prefixes (bucket_id, name)
        SELECT c.bucket_id, c.name
        FROM candidates c
        ON CONFLICT DO NOTHING;
    END IF;

    -- 4) Prune source prefixes bottom-up for OLDΓêÆNEW
    IF array_length(v_src_bucket_ids, 1) IS NOT NULL THEN
        -- re-entrancy guard so DELETE on prefixes won't recurse
        IF current_setting('storage.gc.prefixes', true) <> '1' THEN
            PERFORM set_config('storage.gc.prefixes', '1', true);
        END IF;

        PERFORM storage.delete_leaf_prefixes(v_src_bucket_ids, v_src_names);
    END IF;

    RETURN NULL;
END;
$$;


--
-- Name: objects_update_level_trigger(); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.objects_update_level_trigger() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    -- Ensure this is an update operation and the name has changed
    IF TG_OP = 'UPDATE' AND (NEW."name" <> OLD."name" OR NEW."bucket_id" <> OLD."bucket_id") THEN
        -- Set the new level
        NEW."level" := "storage"."get_level"(NEW."name");
    END IF;
    RETURN NEW;
END;
$$;


--
-- Name: objects_update_prefix_trigger(); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.objects_update_prefix_trigger() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
    old_prefixes TEXT[];
BEGIN
    -- Ensure this is an update operation and the name has changed
    IF TG_OP = 'UPDATE' AND (NEW."name" <> OLD."name" OR NEW."bucket_id" <> OLD."bucket_id") THEN
        -- Retrieve old prefixes
        old_prefixes := "storage"."get_prefixes"(OLD."name");

        -- Remove old prefixes that are only used by this object
        WITH all_prefixes as (
            SELECT unnest(old_prefixes) as prefix
        ),
        can_delete_prefixes as (
             SELECT prefix
             FROM all_prefixes
             WHERE NOT EXISTS (
                 SELECT 1 FROM "storage"."objects"
                 WHERE "bucket_id" = OLD."bucket_id"
                   AND "name" <> OLD."name"
                   AND "name" LIKE (prefix || '%')
             )
         )
        DELETE FROM "storage"."prefixes" WHERE name IN (SELECT prefix FROM can_delete_prefixes);

        -- Add new prefixes
        PERFORM "storage"."add_prefixes"(NEW."bucket_id", NEW."name");
    END IF;
    -- Set the new level
    NEW."level" := "storage"."get_level"(NEW."name");

    RETURN NEW;
END;
$$;


--
-- Name: operation(); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.operation() RETURNS text
    LANGUAGE plpgsql STABLE
    AS $$
BEGIN
    RETURN current_setting('storage.operation', true);
END;
$$;


--
-- Name: prefixes_delete_cleanup(); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.prefixes_delete_cleanup() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    v_bucket_ids text[];
    v_names      text[];
BEGIN
    IF current_setting('storage.gc.prefixes', true) = '1' THEN
        RETURN NULL;
    END IF;

    PERFORM set_config('storage.gc.prefixes', '1', true);

    SELECT COALESCE(array_agg(d.bucket_id), '{}'),
           COALESCE(array_agg(d.name), '{}')
    INTO v_bucket_ids, v_names
    FROM deleted AS d
    WHERE d.name <> '';

    PERFORM storage.lock_top_prefixes(v_bucket_ids, v_names);
    PERFORM storage.delete_leaf_prefixes(v_bucket_ids, v_names);

    RETURN NULL;
END;
$$;


--
-- Name: prefixes_insert_trigger(); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.prefixes_insert_trigger() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    PERFORM "storage"."add_prefixes"(NEW."bucket_id", NEW."name");
    RETURN NEW;
END;
$$;


--
-- Name: search(text, text, integer, integer, integer, text, text, text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.search(prefix text, bucketname text, limits integer DEFAULT 100, levels integer DEFAULT 1, offsets integer DEFAULT 0, search text DEFAULT ''::text, sortcolumn text DEFAULT 'name'::text, sortorder text DEFAULT 'asc'::text) RETURNS TABLE(name text, id uuid, updated_at timestamp with time zone, created_at timestamp with time zone, last_accessed_at timestamp with time zone, metadata jsonb)
    LANGUAGE plpgsql
    AS $$
declare
    can_bypass_rls BOOLEAN;
begin
    SELECT rolbypassrls
    INTO can_bypass_rls
    FROM pg_roles
    WHERE rolname = coalesce(nullif(current_setting('role', true), 'none'), current_user);

    IF can_bypass_rls THEN
        RETURN QUERY SELECT * FROM storage.search_v1_optimised(prefix, bucketname, limits, levels, offsets, search, sortcolumn, sortorder);
    ELSE
        RETURN QUERY SELECT * FROM storage.search_legacy_v1(prefix, bucketname, limits, levels, offsets, search, sortcolumn, sortorder);
    END IF;
end;
$$;


--
-- Name: search_legacy_v1(text, text, integer, integer, integer, text, text, text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.search_legacy_v1(prefix text, bucketname text, limits integer DEFAULT 100, levels integer DEFAULT 1, offsets integer DEFAULT 0, search text DEFAULT ''::text, sortcolumn text DEFAULT 'name'::text, sortorder text DEFAULT 'asc'::text) RETURNS TABLE(name text, id uuid, updated_at timestamp with time zone, created_at timestamp with time zone, last_accessed_at timestamp with time zone, metadata jsonb)
    LANGUAGE plpgsql STABLE
    AS $_$
declare
    v_order_by text;
    v_sort_order text;
begin
    case
        when sortcolumn = 'name' then
            v_order_by = 'name';
        when sortcolumn = 'updated_at' then
            v_order_by = 'updated_at';
        when sortcolumn = 'created_at' then
            v_order_by = 'created_at';
        when sortcolumn = 'last_accessed_at' then
            v_order_by = 'last_accessed_at';
        else
            v_order_by = 'name';
        end case;

    case
        when sortorder = 'asc' then
            v_sort_order = 'asc';
        when sortorder = 'desc' then
            v_sort_order = 'desc';
        else
            v_sort_order = 'asc';
        end case;

    v_order_by = v_order_by || ' ' || v_sort_order;

    return query execute
        'with folders as (
           select path_tokens[$1] as folder
           from storage.objects
             where objects.name ilike $2 || $3 || ''%''
               and bucket_id = $4
               and array_length(objects.path_tokens, 1) <> $1
           group by folder
           order by folder ' || v_sort_order || '
     )
     (select folder as "name",
            null as id,
            null as updated_at,
            null as created_at,
            null as last_accessed_at,
            null as metadata from folders)
     union all
     (select path_tokens[$1] as "name",
            id,
            updated_at,
            created_at,
            last_accessed_at,
            metadata
     from storage.objects
     where objects.name ilike $2 || $3 || ''%''
       and bucket_id = $4
       and array_length(objects.path_tokens, 1) = $1
     order by ' || v_order_by || ')
     limit $5
     offset $6' using levels, prefix, search, bucketname, limits, offsets;
end;
$_$;


--
-- Name: search_v1_optimised(text, text, integer, integer, integer, text, text, text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.search_v1_optimised(prefix text, bucketname text, limits integer DEFAULT 100, levels integer DEFAULT 1, offsets integer DEFAULT 0, search text DEFAULT ''::text, sortcolumn text DEFAULT 'name'::text, sortorder text DEFAULT 'asc'::text) RETURNS TABLE(name text, id uuid, updated_at timestamp with time zone, created_at timestamp with time zone, last_accessed_at timestamp with time zone, metadata jsonb)
    LANGUAGE plpgsql STABLE
    AS $_$
declare
    v_order_by text;
    v_sort_order text;
begin
    case
        when sortcolumn = 'name' then
            v_order_by = 'name';
        when sortcolumn = 'updated_at' then
            v_order_by = 'updated_at';
        when sortcolumn = 'created_at' then
            v_order_by = 'created_at';
        when sortcolumn = 'last_accessed_at' then
            v_order_by = 'last_accessed_at';
        else
            v_order_by = 'name';
        end case;

    case
        when sortorder = 'asc' then
            v_sort_order = 'asc';
        when sortorder = 'desc' then
            v_sort_order = 'desc';
        else
            v_sort_order = 'asc';
        end case;

    v_order_by = v_order_by || ' ' || v_sort_order;

    return query execute
        'with folders as (
           select (string_to_array(name, ''/''))[level] as name
           from storage.prefixes
             where lower(prefixes.name) like lower($2 || $3) || ''%''
               and bucket_id = $4
               and level = $1
           order by name ' || v_sort_order || '
     )
     (select name,
            null as id,
            null as updated_at,
            null as created_at,
            null as last_accessed_at,
            null as metadata from folders)
     union all
     (select path_tokens[level] as "name",
            id,
            updated_at,
            created_at,
            last_accessed_at,
            metadata
     from storage.objects
     where lower(objects.name) like lower($2 || $3) || ''%''
       and bucket_id = $4
       and level = $1
     order by ' || v_order_by || ')
     limit $5
     offset $6' using levels, prefix, search, bucketname, limits, offsets;
end;
$_$;


--
-- Name: search_v2(text, text, integer, integer, text, text, text, text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.search_v2(prefix text, bucket_name text, limits integer DEFAULT 100, levels integer DEFAULT 1, start_after text DEFAULT ''::text, sort_order text DEFAULT 'asc'::text, sort_column text DEFAULT 'name'::text, sort_column_after text DEFAULT ''::text) RETURNS TABLE(key text, name text, id uuid, updated_at timestamp with time zone, created_at timestamp with time zone, last_accessed_at timestamp with time zone, metadata jsonb)
    LANGUAGE plpgsql STABLE
    AS $_$
DECLARE
    sort_col text;
    sort_ord text;
    cursor_op text;
    cursor_expr text;
    sort_expr text;
BEGIN
    -- Validate sort_order
    sort_ord := lower(sort_order);
    IF sort_ord NOT IN ('asc', 'desc') THEN
        sort_ord := 'asc';
    END IF;

    -- Determine cursor comparison operator
    IF sort_ord = 'asc' THEN
        cursor_op := '>';
    ELSE
        cursor_op := '<';
    END IF;
    
    sort_col := lower(sort_column);
    -- Validate sort column  
    IF sort_col IN ('updated_at', 'created_at') THEN
        cursor_expr := format(
            '($5 = '''' OR ROW(date_trunc(''milliseconds'', %I), name COLLATE "C") %s ROW(COALESCE(NULLIF($6, '''')::timestamptz, ''epoch''::timestamptz), $5))',
            sort_col, cursor_op
        );
        sort_expr := format(
            'COALESCE(date_trunc(''milliseconds'', %I), ''epoch''::timestamptz) %s, name COLLATE "C" %s',
            sort_col, sort_ord, sort_ord
        );
    ELSE
        cursor_expr := format('($5 = '''' OR name COLLATE "C" %s $5)', cursor_op);
        sort_expr := format('name COLLATE "C" %s', sort_ord);
    END IF;

    RETURN QUERY EXECUTE format(
        $sql$
        SELECT * FROM (
            (
                SELECT
                    split_part(name, '/', $4) AS key,
                    name,
                    NULL::uuid AS id,
                    updated_at,
                    created_at,
                    NULL::timestamptz AS last_accessed_at,
                    NULL::jsonb AS metadata
                FROM storage.prefixes
                WHERE name COLLATE "C" LIKE $1 || '%%'
                    AND bucket_id = $2
                    AND level = $4
                    AND %s
                ORDER BY %s
                LIMIT $3
            )
            UNION ALL
            (
                SELECT
                    split_part(name, '/', $4) AS key,
                    name,
                    id,
                    updated_at,
                    created_at,
                    last_accessed_at,
                    metadata
                FROM storage.objects
                WHERE name COLLATE "C" LIKE $1 || '%%'
                    AND bucket_id = $2
                    AND level = $4
                    AND %s
                ORDER BY %s
                LIMIT $3
            )
        ) obj
        ORDER BY %s
        LIMIT $3
        $sql$,
        cursor_expr,    -- prefixes WHERE
        sort_expr,      -- prefixes ORDER BY
        cursor_expr,    -- objects WHERE
        sort_expr,      -- objects ORDER BY
        sort_expr       -- final ORDER BY
    )
    USING prefix, bucket_name, limits, levels, start_after, sort_column_after;
END;
$_$;


--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW; 
END;
$$;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: audit_log_entries; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.audit_log_entries (
    instance_id uuid,
    id uuid NOT NULL,
    payload json,
    created_at timestamp with time zone,
    ip_address character varying(64) DEFAULT ''::character varying NOT NULL
);


--
-- Name: TABLE audit_log_entries; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.audit_log_entries IS 'Auth: Audit trail for user actions.';


--
-- Name: flow_state; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.flow_state (
    id uuid NOT NULL,
    user_id uuid,
    auth_code text NOT NULL,
    code_challenge_method auth.code_challenge_method NOT NULL,
    code_challenge text NOT NULL,
    provider_type text NOT NULL,
    provider_access_token text,
    provider_refresh_token text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    authentication_method text NOT NULL,
    auth_code_issued_at timestamp with time zone
);


--
-- Name: TABLE flow_state; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.flow_state IS 'stores metadata for pkce logins';


--
-- Name: identities; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.identities (
    provider_id text NOT NULL,
    user_id uuid NOT NULL,
    identity_data jsonb NOT NULL,
    provider text NOT NULL,
    last_sign_in_at timestamp with time zone,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    email text GENERATED ALWAYS AS (lower((identity_data ->> 'email'::text))) STORED,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


--
-- Name: TABLE identities; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.identities IS 'Auth: Stores identities associated to a user.';


--
-- Name: COLUMN identities.email; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON COLUMN auth.identities.email IS 'Auth: Email is a generated column that references the optional email property in the identity_data';


--
-- Name: instances; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.instances (
    id uuid NOT NULL,
    uuid uuid,
    raw_base_config text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone
);


--
-- Name: TABLE instances; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.instances IS 'Auth: Manages users across multiple sites.';


--
-- Name: mfa_amr_claims; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.mfa_amr_claims (
    session_id uuid NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    authentication_method text NOT NULL,
    id uuid NOT NULL
);


--
-- Name: TABLE mfa_amr_claims; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.mfa_amr_claims IS 'auth: stores authenticator method reference claims for multi factor authentication';


--
-- Name: mfa_challenges; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.mfa_challenges (
    id uuid NOT NULL,
    factor_id uuid NOT NULL,
    created_at timestamp with time zone NOT NULL,
    verified_at timestamp with time zone,
    ip_address inet NOT NULL,
    otp_code text,
    web_authn_session_data jsonb
);


--
-- Name: TABLE mfa_challenges; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.mfa_challenges IS 'auth: stores metadata about challenge requests made';


--
-- Name: mfa_factors; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.mfa_factors (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    friendly_name text,
    factor_type auth.factor_type NOT NULL,
    status auth.factor_status NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    secret text,
    phone text,
    last_challenged_at timestamp with time zone,
    web_authn_credential jsonb,
    web_authn_aaguid uuid,
    last_webauthn_challenge_data jsonb
);


--
-- Name: TABLE mfa_factors; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.mfa_factors IS 'auth: stores metadata about factors';


--
-- Name: COLUMN mfa_factors.last_webauthn_challenge_data; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON COLUMN auth.mfa_factors.last_webauthn_challenge_data IS 'Stores the latest WebAuthn challenge data including attestation/assertion for customer verification';


--
-- Name: oauth_authorizations; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.oauth_authorizations (
    id uuid NOT NULL,
    authorization_id text NOT NULL,
    client_id uuid NOT NULL,
    user_id uuid,
    redirect_uri text NOT NULL,
    scope text NOT NULL,
    state text,
    resource text,
    code_challenge text,
    code_challenge_method auth.code_challenge_method,
    response_type auth.oauth_response_type DEFAULT 'code'::auth.oauth_response_type NOT NULL,
    status auth.oauth_authorization_status DEFAULT 'pending'::auth.oauth_authorization_status NOT NULL,
    authorization_code text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    expires_at timestamp with time zone DEFAULT (now() + '00:03:00'::interval) NOT NULL,
    approved_at timestamp with time zone,
    nonce text,
    CONSTRAINT oauth_authorizations_authorization_code_length CHECK ((char_length(authorization_code) <= 255)),
    CONSTRAINT oauth_authorizations_code_challenge_length CHECK ((char_length(code_challenge) <= 128)),
    CONSTRAINT oauth_authorizations_expires_at_future CHECK ((expires_at > created_at)),
    CONSTRAINT oauth_authorizations_nonce_length CHECK ((char_length(nonce) <= 255)),
    CONSTRAINT oauth_authorizations_redirect_uri_length CHECK ((char_length(redirect_uri) <= 2048)),
    CONSTRAINT oauth_authorizations_resource_length CHECK ((char_length(resource) <= 2048)),
    CONSTRAINT oauth_authorizations_scope_length CHECK ((char_length(scope) <= 4096)),
    CONSTRAINT oauth_authorizations_state_length CHECK ((char_length(state) <= 4096))
);


--
-- Name: oauth_clients; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.oauth_clients (
    id uuid NOT NULL,
    client_secret_hash text,
    registration_type auth.oauth_registration_type NOT NULL,
    redirect_uris text NOT NULL,
    grant_types text NOT NULL,
    client_name text,
    client_uri text,
    logo_uri text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    client_type auth.oauth_client_type DEFAULT 'confidential'::auth.oauth_client_type NOT NULL,
    CONSTRAINT oauth_clients_client_name_length CHECK ((char_length(client_name) <= 1024)),
    CONSTRAINT oauth_clients_client_uri_length CHECK ((char_length(client_uri) <= 2048)),
    CONSTRAINT oauth_clients_logo_uri_length CHECK ((char_length(logo_uri) <= 2048))
);


--
-- Name: oauth_consents; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.oauth_consents (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    client_id uuid NOT NULL,
    scopes text NOT NULL,
    granted_at timestamp with time zone DEFAULT now() NOT NULL,
    revoked_at timestamp with time zone,
    CONSTRAINT oauth_consents_revoked_after_granted CHECK (((revoked_at IS NULL) OR (revoked_at >= granted_at))),
    CONSTRAINT oauth_consents_scopes_length CHECK ((char_length(scopes) <= 2048)),
    CONSTRAINT oauth_consents_scopes_not_empty CHECK ((char_length(TRIM(BOTH FROM scopes)) > 0))
);


--
-- Name: one_time_tokens; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.one_time_tokens (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    token_type auth.one_time_token_type NOT NULL,
    token_hash text NOT NULL,
    relates_to text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    CONSTRAINT one_time_tokens_token_hash_check CHECK ((char_length(token_hash) > 0))
);


--
-- Name: refresh_tokens; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.refresh_tokens (
    instance_id uuid,
    id bigint NOT NULL,
    token character varying(255),
    user_id character varying(255),
    revoked boolean,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    parent character varying(255),
    session_id uuid
);


--
-- Name: TABLE refresh_tokens; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.refresh_tokens IS 'Auth: Store of tokens used to refresh JWT tokens once they expire.';


--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE; Schema: auth; Owner: -
--

CREATE SEQUENCE auth.refresh_tokens_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE OWNED BY; Schema: auth; Owner: -
--

ALTER SEQUENCE auth.refresh_tokens_id_seq OWNED BY auth.refresh_tokens.id;


--
-- Name: saml_providers; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.saml_providers (
    id uuid NOT NULL,
    sso_provider_id uuid NOT NULL,
    entity_id text NOT NULL,
    metadata_xml text NOT NULL,
    metadata_url text,
    attribute_mapping jsonb,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    name_id_format text,
    CONSTRAINT "entity_id not empty" CHECK ((char_length(entity_id) > 0)),
    CONSTRAINT "metadata_url not empty" CHECK (((metadata_url = NULL::text) OR (char_length(metadata_url) > 0))),
    CONSTRAINT "metadata_xml not empty" CHECK ((char_length(metadata_xml) > 0))
);


--
-- Name: TABLE saml_providers; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.saml_providers IS 'Auth: Manages SAML Identity Provider connections.';


--
-- Name: saml_relay_states; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.saml_relay_states (
    id uuid NOT NULL,
    sso_provider_id uuid NOT NULL,
    request_id text NOT NULL,
    for_email text,
    redirect_to text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    flow_state_id uuid,
    CONSTRAINT "request_id not empty" CHECK ((char_length(request_id) > 0))
);


--
-- Name: TABLE saml_relay_states; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.saml_relay_states IS 'Auth: Contains SAML Relay State information for each Service Provider initiated login.';


--
-- Name: schema_migrations; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.schema_migrations (
    version character varying(255) NOT NULL
);


--
-- Name: TABLE schema_migrations; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.schema_migrations IS 'Auth: Manages updates to the auth system.';


--
-- Name: sessions; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.sessions (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    factor_id uuid,
    aal auth.aal_level,
    not_after timestamp with time zone,
    refreshed_at timestamp without time zone,
    user_agent text,
    ip inet,
    tag text,
    oauth_client_id uuid,
    refresh_token_hmac_key text,
    refresh_token_counter bigint,
    scopes text,
    CONSTRAINT sessions_scopes_length CHECK ((char_length(scopes) <= 4096))
);


--
-- Name: TABLE sessions; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.sessions IS 'Auth: Stores session data associated to a user.';


--
-- Name: COLUMN sessions.not_after; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON COLUMN auth.sessions.not_after IS 'Auth: Not after is a nullable column that contains a timestamp after which the session should be regarded as expired.';


--
-- Name: COLUMN sessions.refresh_token_hmac_key; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON COLUMN auth.sessions.refresh_token_hmac_key IS 'Holds a HMAC-SHA256 key used to sign refresh tokens for this session.';


--
-- Name: COLUMN sessions.refresh_token_counter; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON COLUMN auth.sessions.refresh_token_counter IS 'Holds the ID (counter) of the last issued refresh token.';


--
-- Name: sso_domains; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.sso_domains (
    id uuid NOT NULL,
    sso_provider_id uuid NOT NULL,
    domain text NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    CONSTRAINT "domain not empty" CHECK ((char_length(domain) > 0))
);


--
-- Name: TABLE sso_domains; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.sso_domains IS 'Auth: Manages SSO email address domain mapping to an SSO Identity Provider.';


--
-- Name: sso_providers; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.sso_providers (
    id uuid NOT NULL,
    resource_id text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    disabled boolean,
    CONSTRAINT "resource_id not empty" CHECK (((resource_id = NULL::text) OR (char_length(resource_id) > 0)))
);


--
-- Name: TABLE sso_providers; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.sso_providers IS 'Auth: Manages SSO identity provider information; see saml_providers for SAML.';


--
-- Name: COLUMN sso_providers.resource_id; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON COLUMN auth.sso_providers.resource_id IS 'Auth: Uniquely identifies a SSO provider according to a user-chosen resource ID (case insensitive), useful in infrastructure as code.';


--
-- Name: users; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.users (
    instance_id uuid,
    id uuid NOT NULL,
    aud character varying(255),
    role character varying(255),
    email character varying(255),
    encrypted_password character varying(255),
    email_confirmed_at timestamp with time zone,
    invited_at timestamp with time zone,
    confirmation_token character varying(255),
    confirmation_sent_at timestamp with time zone,
    recovery_token character varying(255),
    recovery_sent_at timestamp with time zone,
    email_change_token_new character varying(255),
    email_change character varying(255),
    email_change_sent_at timestamp with time zone,
    last_sign_in_at timestamp with time zone,
    raw_app_meta_data jsonb,
    raw_user_meta_data jsonb,
    is_super_admin boolean,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    phone text DEFAULT NULL::character varying,
    phone_confirmed_at timestamp with time zone,
    phone_change text DEFAULT ''::character varying,
    phone_change_token character varying(255) DEFAULT ''::character varying,
    phone_change_sent_at timestamp with time zone,
    confirmed_at timestamp with time zone GENERATED ALWAYS AS (LEAST(email_confirmed_at, phone_confirmed_at)) STORED,
    email_change_token_current character varying(255) DEFAULT ''::character varying,
    email_change_confirm_status smallint DEFAULT 0,
    banned_until timestamp with time zone,
    reauthentication_token character varying(255) DEFAULT ''::character varying,
    reauthentication_sent_at timestamp with time zone,
    is_sso_user boolean DEFAULT false NOT NULL,
    deleted_at timestamp with time zone,
    is_anonymous boolean DEFAULT false NOT NULL,
    CONSTRAINT users_email_change_confirm_status_check CHECK (((email_change_confirm_status >= 0) AND (email_change_confirm_status <= 2)))
);


--
-- Name: TABLE users; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.users IS 'Auth: Stores user login data within a secure schema.';


--
-- Name: COLUMN users.is_sso_user; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON COLUMN auth.users.is_sso_user IS 'Auth: Set this column to true when the account comes from SSO. These accounts can have duplicate emails.';


--
-- Name: admin_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.admin_settings (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    key character varying(100) NOT NULL,
    value jsonb,
    description text,
    updated_by uuid,
    updated_at timestamp with time zone DEFAULT now(),
    service_id uuid
);


--
-- Name: booking_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.booking_items (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    booking_id uuid,
    sub_service_id uuid,
    sub_service_name character varying(200) NOT NULL,
    price numeric(10,2) NOT NULL,
    quantity integer DEFAULT 1,
    created_at timestamp with time zone DEFAULT now(),
    sub_subservice_id uuid,
    item_type character varying(20) DEFAULT 'sub_service'::character varying,
    CONSTRAINT booking_items_id_check CHECK (((((item_type)::text = 'sub_service'::text) AND (sub_service_id IS NOT NULL) AND (sub_subservice_id IS NULL)) OR (((item_type)::text = 'addon'::text) AND (sub_subservice_id IS NOT NULL) AND (sub_service_id IS NULL)))),
    CONSTRAINT booking_items_item_type_check CHECK (((item_type)::text = ANY ((ARRAY['sub_service'::character varying, 'addon'::character varying])::text[])))
);


--
-- Name: COLUMN booking_items.sub_subservice_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.booking_items.sub_subservice_id IS 'Reference to service_sub_subservices for addon items';


--
-- Name: COLUMN booking_items.item_type; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.booking_items.item_type IS 'Type of item: sub_service or addon (sub-sub-service)';


--
-- Name: booking_quotes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.booking_quotes (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    booking_id uuid,
    quoted_by character varying(20) NOT NULL,
    quoted_price numeric(10,2) NOT NULL,
    message text,
    is_accepted boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: booking_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.booking_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: booking_status_history; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.booking_status_history (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    booking_id uuid,
    status text NOT NULL,
    changed_by uuid,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: bookings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.bookings (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    booking_number character varying(20) NOT NULL,
    user_id uuid,
    provider_id uuid,
    service_id uuid,
    city_id uuid,
    address_id uuid,
    service_address text NOT NULL,
    service_lat numeric(10,8),
    service_lng numeric(11,8),
    scheduled_date timestamp with time zone,
    status public.booking_status DEFAULT 'pending'::public.booking_status,
    user_quoted_price numeric(10,2),
    provider_quoted_price numeric(10,2),
    final_price numeric(10,2),
    payment_status public.payment_status DEFAULT 'pending'::public.payment_status,
    payment_method character varying(50),
    discount_amount numeric(10,2) DEFAULT 0.00,
    cashback_earned numeric(10,2) DEFAULT 0.00,
    rewards_earned numeric(10,2) DEFAULT 0.00,
    wallet_used numeric(10,2) DEFAULT 0.00,
    notes text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    completed_at timestamp with time zone,
    sub_service_id uuid,
    sub_service_name character varying(200),
    base_charge numeric(10,2),
    hourly_charge numeric(10,2),
    for_whom character varying(20) DEFAULT 'self'::character varying,
    other_contact jsonb,
    rate_quote_id uuid,
    provider_counter_price numeric(10,2),
    final_agreed_price numeric(10,2),
    quote_status text DEFAULT 'none'::text,
    payment_confirmed_at timestamp with time zone,
    quote_expires_at timestamp with time zone,
    cancelled_by character varying(20),
    cancellation_reason text,
    cancelled_by_provider_id uuid,
    CONSTRAINT bookings_cancelled_by_check CHECK (((cancelled_by)::text = ANY ((ARRAY['user'::character varying, 'provider'::character varying])::text[]))),
    CONSTRAINT bookings_quote_status_check CHECK ((quote_status = ANY (ARRAY['none'::text, 'user_quoted'::text, 'provider_countered'::text, 'accepted'::text, 'rejected'::text])))
);


--
-- Name: COLUMN bookings.quote_expires_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.bookings.quote_expires_at IS 'Expiry timestamp for quote negotiations, set to 24 hours from creation';


--
-- Name: COLUMN bookings.cancelled_by; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.bookings.cancelled_by IS 'Tracks who cancelled the booking: user or provider';


--
-- Name: COLUMN bookings.cancellation_reason; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.bookings.cancellation_reason IS 'Stores the reason/remarks for cancellation';


--
-- Name: cashback_transactions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cashback_transactions (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    user_id uuid,
    booking_id uuid,
    amount numeric(10,2) NOT NULL,
    percentage numeric(5,2),
    expiry_date timestamp with time zone,
    is_used boolean DEFAULT false,
    used_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: chat_messages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.chat_messages (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    booking_id uuid,
    sender_id uuid,
    receiver_id uuid,
    message text NOT NULL,
    is_read boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: cities; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cities (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    name character varying(100) NOT NULL,
    state character varying(100),
    country character varying(100) DEFAULT 'India'::character varying,
    is_active boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: city_services; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.city_services (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    city_id uuid,
    service_id uuid,
    is_enabled boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: discount_codes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.discount_codes (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    code character varying(50) NOT NULL,
    discount_type character varying(20) NOT NULL,
    discount_value numeric(10,2) NOT NULL,
    min_order_amount numeric(10,2) DEFAULT 0.00,
    max_discount numeric(10,2),
    usage_limit integer,
    used_count integer DEFAULT 0,
    is_active boolean DEFAULT true,
    valid_from timestamp with time zone DEFAULT now(),
    valid_until timestamp with time zone,
    applicable_services uuid[],
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: notifications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.notifications (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    user_id uuid,
    title character varying(200) NOT NULL,
    message text NOT NULL,
    type character varying(50),
    reference_id uuid,
    is_read boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: payments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.payments (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    booking_id uuid,
    user_id uuid,
    amount numeric(10,2) NOT NULL,
    payment_method character varying(50) NOT NULL,
    payment_status public.payment_status DEFAULT 'pending'::public.payment_status,
    razorpay_order_id character varying(100),
    razorpay_payment_id character varying(100),
    razorpay_signature character varying(200),
    transaction_id character varying(100),
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: provider_document_change_requests; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.provider_document_change_requests (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    provider_id uuid,
    old_document_id uuid,
    document_type text NOT NULL,
    new_document_url text NOT NULL,
    new_document_number text,
    change_reason text NOT NULL,
    status text DEFAULT 'pending'::text,
    reviewed_by uuid,
    reviewed_at timestamp with time zone,
    rejection_reason text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT provider_document_change_requests_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'approved'::text, 'rejected'::text])))
);


--
-- Name: provider_documents; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.provider_documents (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    provider_id uuid,
    document_type character varying(50) NOT NULL,
    document_number character varying(100),
    document_url text,
    metadata jsonb,
    status character varying(20) DEFAULT 'pending'::character varying,
    rejection_reason text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: provider_payment_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.provider_payment_settings (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    provider_id uuid,
    account_holder_name text,
    bank_name text,
    account_number text,
    ifsc_code text,
    upi_id text,
    qr_code_url text,
    primary_method text,
    verification_status text DEFAULT 'pending'::text,
    admin_notes text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT provider_payment_settings_primary_method_check CHECK ((primary_method = ANY (ARRAY['bank'::text, 'upi'::text, 'cash'::text, 'all'::text]))),
    CONSTRAINT provider_payment_settings_verification_status_check CHECK ((verification_status = ANY (ARRAY['pending'::text, 'verified'::text, 'rejected'::text])))
);


--
-- Name: provider_portfolio; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.provider_portfolio (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    provider_id uuid,
    image_url text NOT NULL,
    description text,
    work_experience_years integer,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: provider_quotes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.provider_quotes (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    rate_quote_id uuid,
    provider_id uuid,
    quoted_price numeric(10,2) NOT NULL,
    message text,
    status public.provider_quote_status DEFAULT 'pending'::public.provider_quote_status,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: provider_service_rates; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.provider_service_rates (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    provider_id uuid,
    sub_service_id uuid,
    rate numeric(10,2) NOT NULL,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);


--
-- Name: provider_services; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.provider_services (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    provider_id uuid,
    service_id uuid,
    base_price numeric(10,2),
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    inspection_fee numeric(10,2) DEFAULT 0.00,
    emergency_fee numeric(10,2) DEFAULT 0.00,
    sub_service_id uuid,
    sub_sub_service_id uuid
);


--
-- Name: provider_staff; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.provider_staff (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    provider_id uuid,
    full_name character varying(200) NOT NULL,
    phone character varying(20),
    role character varying(100),
    id_proof_url text,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: provider_staff_services; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.provider_staff_services (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    staff_id uuid,
    service_id uuid,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: providers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.providers (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    user_id uuid,
    business_name character varying(200),
    aadhar_number character varying(20),
    pan_number character varying(20),
    bank_account_number character varying(50),
    ifsc_code character varying(20),
    service_radius_km numeric(5,2) DEFAULT 10.0,
    is_fixed_location boolean DEFAULT false,
    fixed_location_lat numeric(10,8),
    fixed_location_lng numeric(11,8),
    fixed_location_address text,
    current_lat numeric(10,8),
    current_lng numeric(11,8),
    last_location_update timestamp with time zone,
    is_online boolean DEFAULT false,
    is_available boolean DEFAULT true,
    total_jobs_completed integer DEFAULT 0,
    average_rating numeric(3,2) DEFAULT 0.00,
    total_ratings integer DEFAULT 0,
    is_verified boolean DEFAULT false,
    is_suspended boolean DEFAULT false,
    suspension_until timestamp with time zone,
    training_completed boolean DEFAULT false,
    exam_passed boolean DEFAULT false,
    exam_score numeric(5,2),
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    business_address text,
    business_lat numeric(10,8),
    business_lng numeric(11,8),
    business_category_id uuid,
    business_subcategory_id uuid,
    gst_number character varying(15),
    travel_charge_type character varying(20) DEFAULT 'per_km'::character varying,
    travel_charge_amount numeric(10,2) DEFAULT 0.00,
    free_travel_radius_km numeric(5,2) DEFAULT 0.00,
    enable_travel_charges boolean DEFAULT false,
    enable_rental_charges boolean DEFAULT false,
    gst_enabled boolean DEFAULT false,
    gst_percentage numeric(5,2) DEFAULT 18.00,
    short_bio text,
    experience_years integer DEFAULT 0,
    past_companies text,
    city_id uuid,
    verification_status text DEFAULT 'pending'::text,
    CONSTRAINT providers_verification_status_check CHECK ((verification_status = ANY (ARRAY['pending'::text, 'partially_verified'::text, 'verified'::text, 'rejected'::text])))
);


--
-- Name: quote_negotiations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.quote_negotiations (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    booking_id uuid,
    quoted_by text NOT NULL,
    quoted_price numeric(10,2) NOT NULL,
    message text,
    status text DEFAULT 'pending'::text,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT quote_negotiations_quoted_by_check CHECK ((quoted_by = ANY (ARRAY['user'::text, 'provider'::text]))),
    CONSTRAINT quote_negotiations_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'accepted'::text, 'rejected'::text])))
);


--
-- Name: rate_quotes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.rate_quotes (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    user_id uuid,
    service_id uuid,
    sub_service_id uuid,
    city_id uuid,
    address_id uuid,
    requested_price numeric(10,2),
    status public.rate_quote_status DEFAULT 'open'::public.rate_quote_status,
    expires_at timestamp with time zone NOT NULL,
    details jsonb,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: ratings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ratings (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    booking_id uuid,
    user_id uuid,
    provider_id uuid,
    rating numeric(2,1) NOT NULL,
    review_text text,
    review_photos text[],
    created_at timestamp with time zone DEFAULT now(),
    behavior_rating integer,
    nature_rating integer,
    work_knowledge_rating integer,
    work_quality_rating integer,
    punctuality_rating integer,
    image_urls text[] DEFAULT '{}'::text[],
    rated_by text DEFAULT 'user'::text,
    CONSTRAINT ratings_behavior_rating_check CHECK (((behavior_rating >= 1) AND (behavior_rating <= 5))),
    CONSTRAINT ratings_nature_rating_check CHECK (((nature_rating >= 1) AND (nature_rating <= 5))),
    CONSTRAINT ratings_punctuality_rating_check CHECK (((punctuality_rating >= 1) AND (punctuality_rating <= 5))),
    CONSTRAINT ratings_rated_by_check CHECK ((rated_by = ANY (ARRAY['user'::text, 'provider'::text]))),
    CONSTRAINT ratings_rating_check CHECK (((rating >= (1)::numeric) AND (rating <= (5)::numeric))),
    CONSTRAINT ratings_work_knowledge_rating_check CHECK (((work_knowledge_rating >= 1) AND (work_knowledge_rating <= 5))),
    CONSTRAINT ratings_work_quality_rating_check CHECK (((work_quality_rating >= 1) AND (work_quality_rating <= 5)))
);


--
-- Name: referrals; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.referrals (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    referrer_id uuid,
    referred_id uuid,
    referral_code character varying(20) NOT NULL,
    reward_amount numeric(10,2) DEFAULT 0.00,
    is_rewarded boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: reward_transactions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.reward_transactions (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    user_id uuid,
    booking_id uuid,
    points numeric(10,2) NOT NULL,
    expiry_date timestamp with time zone,
    is_converted boolean DEFAULT false,
    converted_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: service_categories; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.service_categories (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    name character varying(100) NOT NULL,
    icon character varying(50),
    description text,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    image_url text
);


--
-- Name: service_requests; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.service_requests (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    provider_id uuid,
    service_name text NOT NULL,
    category_id uuid,
    description text,
    status text DEFAULT 'pending'::text,
    admin_notes text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT service_requests_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'approved'::text, 'rejected'::text])))
);


--
-- Name: service_sub_subservices; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.service_sub_subservices (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    sub_service_id uuid,
    name character varying(200) NOT NULL,
    description text,
    base_charge numeric(10,2) DEFAULT 0.00,
    image_url text,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: service_subservices; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.service_subservices (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    service_id uuid,
    name character varying(200) NOT NULL,
    description text,
    pricing_type character varying(20) DEFAULT 'fixed'::character varying,
    base_charge numeric(10,2) DEFAULT 0,
    per_hour_charge numeric(10,2),
    is_active boolean DEFAULT true,
    created_by_provider_id uuid,
    created_by_user_id uuid,
    created_at timestamp with time zone DEFAULT now(),
    image_url text
);


--
-- Name: services; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.services (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    category_id uuid,
    name character varying(200) NOT NULL,
    description text,
    base_price numeric(10,2),
    min_price numeric(10,2),
    max_price numeric(10,2),
    is_fixed_location boolean DEFAULT false,
    min_radius_km numeric(5,2) DEFAULT 5.0,
    max_radius_km numeric(5,2) DEFAULT 50.0,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    image_url text
);


--
-- Name: subscriptions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.subscriptions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    provider_id uuid NOT NULL,
    service_id uuid NOT NULL,
    title text NOT NULL,
    description text,
    price numeric NOT NULL,
    "interval" text NOT NULL,
    active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT subscriptions_interval_check CHECK (("interval" = ANY (ARRAY['monthly'::text, 'yearly'::text])))
);


--
-- Name: user_addresses; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_addresses (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    user_id uuid,
    address_type character varying(50) DEFAULT 'home'::character varying,
    address_line1 text NOT NULL,
    address_line2 text,
    city character varying(100) NOT NULL,
    state character varying(100),
    pincode character varying(10),
    latitude numeric(10,8),
    longitude numeric(11,8),
    is_default boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: user_subscriptions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_subscriptions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    subscription_id uuid NOT NULL,
    status text DEFAULT 'active'::text NOT NULL,
    started_at timestamp with time zone DEFAULT now(),
    ends_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT user_subscriptions_status_check CHECK ((status = ANY (ARRAY['active'::text, 'canceled'::text, 'past_due'::text])))
);


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id uuid NOT NULL,
    email character varying(255),
    phone character varying(20),
    full_name character varying(200),
    role public.user_role DEFAULT 'user'::public.user_role,
    is_verified boolean DEFAULT false,
    is_active boolean DEFAULT true,
    referral_code character varying(20),
    referred_by uuid,
    wallet_balance numeric(10,2) DEFAULT 0.00,
    total_cashback numeric(10,2) DEFAULT 0.00,
    total_rewards numeric(10,2) DEFAULT 0.00,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    default_city_id uuid,
    current_city_id uuid,
    current_lat numeric(10,8),
    current_lng numeric(11,8),
    profile_picture_url text,
    city_id uuid,
    avatar_url text
);


--
-- Name: wallet_topups; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.wallet_topups (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    user_id uuid,
    amount numeric(10,2) NOT NULL,
    status character varying(20) DEFAULT 'pending'::character varying,
    reference_id text,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: wallet_transactions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.wallet_transactions (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    user_id uuid,
    amount numeric(10,2) NOT NULL,
    transaction_type public.wallet_transaction_type NOT NULL,
    booking_id uuid,
    description text,
    balance_after numeric(10,2),
    created_at timestamp with time zone DEFAULT now(),
    wallet_id uuid
);


--
-- Name: wallets; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.wallets (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    user_id uuid,
    balance numeric(10,2) DEFAULT 0,
    locked_balance numeric(10,2) DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: messages; Type: TABLE; Schema: realtime; Owner: -
--

CREATE TABLE realtime.messages (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL
)
PARTITION BY RANGE (inserted_at);


--
-- Name: messages_2025_12_01; Type: TABLE; Schema: realtime; Owner: -
--

CREATE TABLE realtime.messages_2025_12_01 (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


--
-- Name: messages_2025_12_02; Type: TABLE; Schema: realtime; Owner: -
--

CREATE TABLE realtime.messages_2025_12_02 (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


--
-- Name: messages_2025_12_03; Type: TABLE; Schema: realtime; Owner: -
--

CREATE TABLE realtime.messages_2025_12_03 (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


--
-- Name: messages_2025_12_04; Type: TABLE; Schema: realtime; Owner: -
--

CREATE TABLE realtime.messages_2025_12_04 (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


--
-- Name: messages_2025_12_05; Type: TABLE; Schema: realtime; Owner: -
--

CREATE TABLE realtime.messages_2025_12_05 (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


--
-- Name: messages_2025_12_06; Type: TABLE; Schema: realtime; Owner: -
--

CREATE TABLE realtime.messages_2025_12_06 (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


--
-- Name: messages_2025_12_07; Type: TABLE; Schema: realtime; Owner: -
--

CREATE TABLE realtime.messages_2025_12_07 (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


--
-- Name: schema_migrations; Type: TABLE; Schema: realtime; Owner: -
--

CREATE TABLE realtime.schema_migrations (
    version bigint NOT NULL,
    inserted_at timestamp(0) without time zone
);


--
-- Name: subscription; Type: TABLE; Schema: realtime; Owner: -
--

CREATE TABLE realtime.subscription (
    id bigint NOT NULL,
    subscription_id uuid NOT NULL,
    entity regclass NOT NULL,
    filters realtime.user_defined_filter[] DEFAULT '{}'::realtime.user_defined_filter[] NOT NULL,
    claims jsonb NOT NULL,
    claims_role regrole GENERATED ALWAYS AS (realtime.to_regrole((claims ->> 'role'::text))) STORED NOT NULL,
    created_at timestamp without time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);


--
-- Name: subscription_id_seq; Type: SEQUENCE; Schema: realtime; Owner: -
--

ALTER TABLE realtime.subscription ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME realtime.subscription_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: buckets; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.buckets (
    id text NOT NULL,
    name text NOT NULL,
    owner uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    public boolean DEFAULT false,
    avif_autodetection boolean DEFAULT false,
    file_size_limit bigint,
    allowed_mime_types text[],
    owner_id text,
    type storage.buckettype DEFAULT 'STANDARD'::storage.buckettype NOT NULL
);


--
-- Name: COLUMN buckets.owner; Type: COMMENT; Schema: storage; Owner: -
--

COMMENT ON COLUMN storage.buckets.owner IS 'Field is deprecated, use owner_id instead';


--
-- Name: buckets_analytics; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.buckets_analytics (
    name text NOT NULL,
    type storage.buckettype DEFAULT 'ANALYTICS'::storage.buckettype NOT NULL,
    format text DEFAULT 'ICEBERG'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    deleted_at timestamp with time zone
);


--
-- Name: buckets_vectors; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.buckets_vectors (
    id text NOT NULL,
    type storage.buckettype DEFAULT 'VECTOR'::storage.buckettype NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: migrations; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.migrations (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    hash character varying(40) NOT NULL,
    executed_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: objects; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.objects (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    bucket_id text,
    name text,
    owner uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    last_accessed_at timestamp with time zone DEFAULT now(),
    metadata jsonb,
    path_tokens text[] GENERATED ALWAYS AS (string_to_array(name, '/'::text)) STORED,
    version text,
    owner_id text,
    user_metadata jsonb,
    level integer
);


--
-- Name: COLUMN objects.owner; Type: COMMENT; Schema: storage; Owner: -
--

COMMENT ON COLUMN storage.objects.owner IS 'Field is deprecated, use owner_id instead';


--
-- Name: prefixes; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.prefixes (
    bucket_id text NOT NULL,
    name text NOT NULL COLLATE pg_catalog."C",
    level integer GENERATED ALWAYS AS (storage.get_level(name)) STORED NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: s3_multipart_uploads; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.s3_multipart_uploads (
    id text NOT NULL,
    in_progress_size bigint DEFAULT 0 NOT NULL,
    upload_signature text NOT NULL,
    bucket_id text NOT NULL,
    key text NOT NULL COLLATE pg_catalog."C",
    version text NOT NULL,
    owner_id text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    user_metadata jsonb
);


--
-- Name: s3_multipart_uploads_parts; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.s3_multipart_uploads_parts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    upload_id text NOT NULL,
    size bigint DEFAULT 0 NOT NULL,
    part_number integer NOT NULL,
    bucket_id text NOT NULL,
    key text NOT NULL COLLATE pg_catalog."C",
    etag text NOT NULL,
    owner_id text,
    version text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: vector_indexes; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.vector_indexes (
    id text DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL COLLATE pg_catalog."C",
    bucket_id text NOT NULL,
    data_type text NOT NULL,
    dimension integer NOT NULL,
    distance_metric text NOT NULL,
    metadata_configuration jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: messages_2025_12_01; Type: TABLE ATTACH; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.messages ATTACH PARTITION realtime.messages_2025_12_01 FOR VALUES FROM ('2025-12-01 00:00:00') TO ('2025-12-02 00:00:00');


--
-- Name: messages_2025_12_02; Type: TABLE ATTACH; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.messages ATTACH PARTITION realtime.messages_2025_12_02 FOR VALUES FROM ('2025-12-02 00:00:00') TO ('2025-12-03 00:00:00');


--
-- Name: messages_2025_12_03; Type: TABLE ATTACH; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.messages ATTACH PARTITION realtime.messages_2025_12_03 FOR VALUES FROM ('2025-12-03 00:00:00') TO ('2025-12-04 00:00:00');


--
-- Name: messages_2025_12_04; Type: TABLE ATTACH; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.messages ATTACH PARTITION realtime.messages_2025_12_04 FOR VALUES FROM ('2025-12-04 00:00:00') TO ('2025-12-05 00:00:00');


--
-- Name: messages_2025_12_05; Type: TABLE ATTACH; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.messages ATTACH PARTITION realtime.messages_2025_12_05 FOR VALUES FROM ('2025-12-05 00:00:00') TO ('2025-12-06 00:00:00');


--
-- Name: messages_2025_12_06; Type: TABLE ATTACH; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.messages ATTACH PARTITION realtime.messages_2025_12_06 FOR VALUES FROM ('2025-12-06 00:00:00') TO ('2025-12-07 00:00:00');


--
-- Name: messages_2025_12_07; Type: TABLE ATTACH; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.messages ATTACH PARTITION realtime.messages_2025_12_07 FOR VALUES FROM ('2025-12-07 00:00:00') TO ('2025-12-08 00:00:00');


--
-- Name: refresh_tokens id; Type: DEFAULT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.refresh_tokens ALTER COLUMN id SET DEFAULT nextval('auth.refresh_tokens_id_seq'::regclass);


--
-- Data for Name: audit_log_entries; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.audit_log_entries (instance_id, id, payload, created_at, ip_address) FROM stdin;
\.


--
-- Data for Name: flow_state; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.flow_state (id, user_id, auth_code, code_challenge_method, code_challenge, provider_type, provider_access_token, provider_refresh_token, created_at, updated_at, authentication_method, auth_code_issued_at) FROM stdin;
\.


--
-- Data for Name: identities; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.identities (provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at, id) FROM stdin;
aa979816-d19c-42c6-9343-c58b55f5311d	aa979816-d19c-42c6-9343-c58b55f5311d	{"sub": "aa979816-d19c-42c6-9343-c58b55f5311d", "email": "majid@admin.com", "email_verified": false, "phone_verified": false}	email	2025-11-23 20:32:26.194026+00	2025-11-23 20:32:26.194084+00	2025-11-23 20:32:26.194084+00	21e31fc0-e319-4b87-80e3-b11ddd67c242
a24a3864-36bd-4d9a-bde1-46b246f50458	a24a3864-36bd-4d9a-bde1-46b246f50458	{"sub": "a24a3864-36bd-4d9a-bde1-46b246f50458", "phone": "9897796616", "email_verified": false, "phone_verified": false}	phone	2025-11-23 20:44:16.044375+00	2025-11-23 20:44:16.044432+00	2025-11-23 20:44:16.044432+00	a8324dfe-314d-4a96-8b43-7d04df7b44b9
cfd6e26b-e085-4768-ae59-e711a65dfbda	cfd6e26b-e085-4768-ae59-e711a65dfbda	{"sub": "cfd6e26b-e085-4768-ae59-e711a65dfbda", "phone": "9876543210", "email_verified": false, "phone_verified": false}	phone	2025-11-23 21:17:50.547042+00	2025-11-23 21:17:50.548239+00	2025-11-23 21:17:50.548239+00	5236b794-0794-4b5c-9de2-ac58675d474b
95210bf2-d377-4a0b-9db3-fc95e97f6d09	95210bf2-d377-4a0b-9db3-fc95e97f6d09	{"sub": "95210bf2-d377-4a0b-9db3-fc95e97f6d09", "phone": "9897796617", "email_verified": false, "phone_verified": false}	phone	2025-11-24 14:26:25.328116+00	2025-11-24 14:26:25.328188+00	2025-11-24 14:26:25.328188+00	8794cab5-5738-4152-a1cc-3e8d44d7c939
d44017ab-3858-4ff4-89ea-e675b64916ac	d44017ab-3858-4ff4-89ea-e675b64916ac	{"sub": "d44017ab-3858-4ff4-89ea-e675b64916ac", "email": "majid@gmail.com", "email_verified": false, "phone_verified": false}	email	2025-11-24 14:27:35.524507+00	2025-11-24 14:27:35.524586+00	2025-11-24 14:27:35.524586+00	a3fe2d3f-3b35-42ab-97c3-154617fa9104
4fe682c8-521d-46ee-9585-8368b5b3282d	4fe682c8-521d-46ee-9585-8368b5b3282d	{"sub": "4fe682c8-521d-46ee-9585-8368b5b3282d", "email": "ecsddagra@gmail.com", "email_verified": false, "phone_verified": false}	email	2025-11-24 16:42:36.046371+00	2025-11-24 16:42:36.046442+00	2025-11-24 16:42:36.046442+00	d47d67f3-927b-4c96-9034-af044f7cac2b
62ba3539-985e-4902-9fc8-07d1e4a9f70d	62ba3539-985e-4902-9fc8-07d1e4a9f70d	{"sub": "62ba3539-985e-4902-9fc8-07d1e4a9f70d", "email": "mess@gmail.com", "email_verified": false, "phone_verified": false}	email	2025-11-26 15:00:18.449976+00	2025-11-26 15:00:18.450054+00	2025-11-26 15:00:18.450054+00	da7a0792-f6bd-4110-9799-cd5a4cb001dd
a75d2995-1604-45b3-a48e-e696b48df99b	a75d2995-1604-45b3-a48e-e696b48df99b	{"sub": "a75d2995-1604-45b3-a48e-e696b48df99b", "email": "khan@gmail.com", "email_verified": false, "phone_verified": false}	email	2025-11-26 15:47:26.022572+00	2025-11-26 15:47:26.022641+00	2025-11-26 15:47:26.022641+00	d0364254-5b5a-4471-9993-2ac71de8e58b
0d9eed24-256f-48ce-8180-2a9f1cd0ee04	0d9eed24-256f-48ce-8180-2a9f1cd0ee04	{"sub": "0d9eed24-256f-48ce-8180-2a9f1cd0ee04", "email": "admin@homesolution.com", "email_verified": false, "phone_verified": false}	email	2025-11-26 16:13:47.080522+00	2025-11-26 16:13:47.080618+00	2025-11-26 16:13:47.080618+00	23dc3858-63e4-410e-85bb-a93a0a5f7990
e391e4ca-6d57-4e97-9267-92187a1c8911	e391e4ca-6d57-4e97-9267-92187a1c8911	{"sub": "e391e4ca-6d57-4e97-9267-92187a1c8911", "email": "m@gmail.com", "email_verified": false, "phone_verified": false}	email	2025-11-26 16:59:00.596919+00	2025-11-26 16:59:00.596982+00	2025-11-26 16:59:00.596982+00	9f0c91e7-2566-46df-9766-e9a972434f89
1e90bb2c-2aae-490c-997d-2dc0cff18925	1e90bb2c-2aae-490c-997d-2dc0cff18925	{"sub": "1e90bb2c-2aae-490c-997d-2dc0cff18925", "email": "admin@admin.com", "email_verified": false, "phone_verified": false}	email	2025-11-26 17:09:28.442231+00	2025-11-26 17:09:28.442302+00	2025-11-26 17:09:28.442302+00	634374f6-3568-46e5-a900-470e4d964013
e3be8daa-6372-42ec-901f-29c4ef81a6ac	e3be8daa-6372-42ec-901f-29c4ef81a6ac	{"sub": "e3be8daa-6372-42ec-901f-29c4ef81a6ac", "email": "a@gmail.com", "email_verified": false, "phone_verified": false}	email	2025-11-26 17:51:51.060926+00	2025-11-26 17:51:51.060998+00	2025-11-26 17:51:51.060998+00	e0a2d6b7-cc89-4171-b4f4-a10a56b555a0
985c38d1-4718-44d7-bd1f-5fc6da623b83	985c38d1-4718-44d7-bd1f-5fc6da623b83	{"sub": "985c38d1-4718-44d7-bd1f-5fc6da623b83", "email": "j@gmail.com", "email_verified": false, "phone_verified": false}	email	2025-11-27 10:11:39.744723+00	2025-11-27 10:11:39.745429+00	2025-11-27 10:11:39.745429+00	8db223ac-dba8-4ce1-96c2-1904240e8b2b
739775bc-0f1f-47a1-90f3-f12beaa0f4ad	739775bc-0f1f-47a1-90f3-f12beaa0f4ad	{"sub": "739775bc-0f1f-47a1-90f3-f12beaa0f4ad", "email": "y@gmail.com", "email_verified": false, "phone_verified": false}	email	2025-11-27 12:01:05.164391+00	2025-11-27 12:01:05.164457+00	2025-11-27 12:01:05.164457+00	9ceb5a39-5166-475e-b05e-3cf31fed0eda
c2215a77-f7a7-4aad-9c40-3149734d7f11	c2215a77-f7a7-4aad-9c40-3149734d7f11	{"sub": "c2215a77-f7a7-4aad-9c40-3149734d7f11", "email": "i@gmail.com", "email_verified": false, "phone_verified": false}	email	2025-11-27 17:03:04.999308+00	2025-11-27 17:03:04.999385+00	2025-11-27 17:03:04.999385+00	2def7b66-ba0d-4eed-bf02-54b236d2adc0
ffb3098f-db08-4c63-8193-0a31cb9b4e22	ffb3098f-db08-4c63-8193-0a31cb9b4e22	{"sub": "ffb3098f-db08-4c63-8193-0a31cb9b4e22", "email": "d@gmail.com", "email_verified": false, "phone_verified": false}	email	2025-11-27 17:29:41.347395+00	2025-11-27 17:29:41.347463+00	2025-11-27 17:29:41.347463+00	8a00d209-4acd-46d6-bed4-cb5ccf66291a
c0313e8a-434b-4ec7-bc40-f221f7581ac3	c0313e8a-434b-4ec7-bc40-f221f7581ac3	{"sub": "c0313e8a-434b-4ec7-bc40-f221f7581ac3", "email": "k@gmail.com", "email_verified": false, "phone_verified": false}	email	2025-11-27 17:36:50.118494+00	2025-11-27 17:36:50.118578+00	2025-11-27 17:36:50.118578+00	42bd2704-7f22-4e98-8626-8b60552e3c37
0d259525-97d9-4fdc-9716-4522f9fd733c	0d259525-97d9-4fdc-9716-4522f9fd733c	{"sub": "0d259525-97d9-4fdc-9716-4522f9fd733c", "role": "admin", "email": "yogi@admin.com", "full_name": "yogendra", "email_verified": false, "phone_verified": false}	email	2025-11-28 12:42:07.647813+00	2025-11-28 12:42:07.647869+00	2025-11-28 12:42:07.647869+00	95e5c484-50c6-4dd1-a658-3db4eeb59fb1
0bb17a30-8f3d-4c8f-83f3-f75a1da9766c	0bb17a30-8f3d-4c8f-83f3-f75a1da9766c	{"sub": "0bb17a30-8f3d-4c8f-83f3-f75a1da9766c", "role": "admin", "email": "s@admin.com", "full_name": "satyanarayan", "email_verified": false, "phone_verified": false}	email	2025-11-28 12:49:34.327341+00	2025-11-28 12:49:34.327393+00	2025-11-28 12:49:34.327393+00	76cddc47-7628-4b25-b9ec-a5f82c739343
c5686080-3064-407d-8eb8-f68e67ac26ad	c5686080-3064-407d-8eb8-f68e67ac26ad	{"sub": "c5686080-3064-407d-8eb8-f68e67ac26ad", "role": "admin", "email": "sa@admin.com", "full_name": "satyanarayan", "email_verified": false, "phone_verified": false}	email	2025-11-28 12:51:03.020965+00	2025-11-28 12:51:03.021032+00	2025-11-28 12:51:03.021032+00	e3a633a4-2b66-417f-9e0c-89818b8a089a
a589e561-114b-4a6f-9e58-9db8c9882a45	a589e561-114b-4a6f-9e58-9db8c9882a45	{"sub": "a589e561-114b-4a6f-9e58-9db8c9882a45", "role": "admin", "email": "admin2@admin.com", "full_name": "sajid", "email_verified": false, "phone_verified": false}	email	2025-11-28 12:57:14.895767+00	2025-11-28 12:57:14.895819+00	2025-11-28 12:57:14.895819+00	557d9ade-c215-4e4f-a94b-3cbcd8cb5b98
4952a4cd-b36a-4234-a7ca-cbdad8a4f8e8	4952a4cd-b36a-4234-a7ca-cbdad8a4f8e8	{"sub": "4952a4cd-b36a-4234-a7ca-cbdad8a4f8e8", "role": "admin", "email": "admin3@admin.com", "full_name": "satyanarayan sd", "email_verified": false, "phone_verified": false}	email	2025-11-28 13:00:10.985044+00	2025-11-28 13:00:10.985102+00	2025-11-28 13:00:10.985102+00	3a32a691-8db2-410b-aef5-84d0c07d5786
7ee84136-cb9a-477e-8990-c171dce0c612	7ee84136-cb9a-477e-8990-c171dce0c612	{"sub": "7ee84136-cb9a-477e-8990-c171dce0c612", "email": "admin4@admin.com", "email_verified": false, "phone_verified": false}	email	2025-11-28 13:16:02.51489+00	2025-11-28 13:16:02.51495+00	2025-11-28 13:16:02.51495+00	02a490d9-3a93-4469-badc-ea37787e858d
00c204f6-4584-42c9-94d0-03ea21dfcf94	00c204f6-4584-42c9-94d0-03ea21dfcf94	{"sub": "00c204f6-4584-42c9-94d0-03ea21dfcf94", "email": "majid.khan@uppcl.org", "email_verified": false, "phone_verified": false}	email	2025-11-28 14:07:48.972412+00	2025-11-28 14:07:48.972478+00	2025-11-28 14:07:48.972478+00	cb06917d-1672-46da-93eb-d324cedf042f
057e2aa7-9db5-46e6-b6b2-b1cbead41bab	057e2aa7-9db5-46e6-b6b2-b1cbead41bab	{"sub": "057e2aa7-9db5-46e6-b6b2-b1cbead41bab", "email": "b@gmail.com", "email_verified": false, "phone_verified": false}	email	2025-12-01 12:05:37.501441+00	2025-12-01 12:05:37.501509+00	2025-12-01 12:05:37.501509+00	491587e5-40e3-4b76-96b9-710b4757a8ec
3e076c78-e86b-4be1-83c2-8627cbe72a86	3e076c78-e86b-4be1-83c2-8627cbe72a86	{"sub": "3e076c78-e86b-4be1-83c2-8627cbe72a86", "email": "yogi1@gmail.com", "email_verified": false, "phone_verified": false}	email	2025-12-01 12:16:25.295923+00	2025-12-01 12:16:25.29598+00	2025-12-01 12:16:25.29598+00	75856dc5-12ef-4610-a6a3-7c364fac014f
7961dd5b-891f-48f5-89ce-f2fb84842db2	7961dd5b-891f-48f5-89ce-f2fb84842db2	{"sub": "7961dd5b-891f-48f5-89ce-f2fb84842db2", "email": "rbs@gmail.com", "email_verified": false, "phone_verified": false}	email	2025-12-01 12:43:10.125016+00	2025-12-01 12:43:10.125092+00	2025-12-01 12:43:10.125092+00	9933c96c-34d8-43b8-aae0-ae30c04c49e4
c33046ea-ac53-43a0-bbb5-4bfb55ad757a	c33046ea-ac53-43a0-bbb5-4bfb55ad757a	{"sub": "c33046ea-ac53-43a0-bbb5-4bfb55ad757a", "email": "f@gmail.com", "email_verified": false, "phone_verified": false}	email	2025-12-01 13:41:29.519031+00	2025-12-01 13:41:29.519099+00	2025-12-01 13:41:29.519099+00	7a65d601-f15d-47f7-8abf-ff58153d41af
c5476153-e15f-4183-90d2-5216d1014cf8	c5476153-e15f-4183-90d2-5216d1014cf8	{"sub": "c5476153-e15f-4183-90d2-5216d1014cf8", "email": "e@admin.com", "email_verified": false, "phone_verified": false}	email	2025-12-01 15:36:59.125444+00	2025-12-01 15:36:59.12551+00	2025-12-01 15:36:59.12551+00	11c99319-56ad-4f47-89c3-da3823c2e2b4
34533694-0bbb-4853-9693-a2da2c05ee94	34533694-0bbb-4853-9693-a2da2c05ee94	{"sub": "34533694-0bbb-4853-9693-a2da2c05ee94", "email": "g@gmail.com", "email_verified": false, "phone_verified": false}	email	2025-12-02 15:11:30.314333+00	2025-12-02 15:11:30.315121+00	2025-12-02 15:11:30.315121+00	03968940-5674-4957-a047-46553c5e4a23
70685fb9-eb02-4884-b8fb-a96401f6e663	70685fb9-eb02-4884-b8fb-a96401f6e663	{"sub": "70685fb9-eb02-4884-b8fb-a96401f6e663", "email": "yogiuppcl@gmail.com", "email_verified": false, "phone_verified": false}	email	2025-12-02 16:52:51.102056+00	2025-12-02 16:52:51.102116+00	2025-12-02 16:52:51.102116+00	915c424c-207a-457a-8190-1b1633674326
9f7cbe52-d1e4-4310-aa79-6a300f5ccb6c	9f7cbe52-d1e4-4310-aa79-6a300f5ccb6c	{"sub": "9f7cbe52-d1e4-4310-aa79-6a300f5ccb6c", "email": "u1@gmail.com", "email_verified": false, "phone_verified": false}	email	2025-12-02 17:58:12.496297+00	2025-12-02 17:58:12.49637+00	2025-12-02 17:58:12.49637+00	0e5d2578-b62c-4515-a4a3-4329ec34d122
6633dc36-aa0b-431e-a1d1-0a5993941950	6633dc36-aa0b-431e-a1d1-0a5993941950	{"sub": "6633dc36-aa0b-431e-a1d1-0a5993941950", "email": "u2@gmail.com", "email_verified": false, "phone_verified": false}	email	2025-12-02 17:58:52.237244+00	2025-12-02 17:58:52.237924+00	2025-12-02 17:58:52.237924+00	bd841f71-860f-4d0a-b3ec-c59c8fbe3380
6f8e22c4-af75-4865-bad3-8494742c5047	6f8e22c4-af75-4865-bad3-8494742c5047	{"sub": "6f8e22c4-af75-4865-bad3-8494742c5047", "email": "p2@gmail.com", "email_verified": false, "phone_verified": false}	email	2025-12-02 18:03:38.222468+00	2025-12-02 18:03:38.222534+00	2025-12-02 18:03:38.222534+00	873f4ae7-7a2b-4a0d-b7af-9f0ab9a69f8d
5ca81099-f4c1-4f7d-879d-061f6c393022	5ca81099-f4c1-4f7d-879d-061f6c393022	{"sub": "5ca81099-f4c1-4f7d-879d-061f6c393022", "email": "p1@gmail.com", "email_verified": false, "phone_verified": false}	email	2025-12-02 18:33:06.611783+00	2025-12-02 18:33:06.611847+00	2025-12-02 18:33:06.611847+00	920c99ef-5aab-47c6-9071-7c756c707d28
\.


--
-- Data for Name: instances; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.instances (id, uuid, raw_base_config, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: mfa_amr_claims; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.mfa_amr_claims (session_id, created_at, updated_at, authentication_method, id) FROM stdin;
314c7281-dd42-4932-9b68-8544ee70ed88	2025-11-23 20:43:49.680846+00	2025-11-23 20:43:49.680846+00	password	7c30dc7a-d28d-479f-b46b-38e84f87eb42
25a90fbe-2df0-419c-ac89-cd484b82fd7a	2025-12-02 16:47:49.66719+00	2025-12-02 16:47:49.66719+00	password	0c8261f6-13b9-4299-ab91-f52f4337d27c
f171a1a7-8be1-49ba-9e93-7058dddd8708	2025-12-02 16:47:50.147313+00	2025-12-02 16:47:50.147313+00	password	261de45b-2db2-4d63-99d7-baa3d02c3973
53d2136e-c97e-4ec9-835d-be95b9de7a6f	2025-12-02 17:17:36.523774+00	2025-12-02 17:17:36.523774+00	password	8d3e4a81-1bc4-4da7-ba00-d15f2feb6830
1808d7f0-632e-48e2-8bc1-356023d26f6e	2025-12-02 17:17:37.065009+00	2025-12-02 17:17:37.065009+00	password	e786e698-f347-4e4b-be91-80e353c07937
5ee7b89e-0b82-41f8-8cc8-1ffd9627ec36	2025-12-02 17:19:35.595337+00	2025-12-02 17:19:35.595337+00	password	a1e3f669-675b-4a82-9e8e-cb42f06d89a0
06c66b62-aba4-4e32-af6c-735784e9daf3	2025-12-02 17:19:36.178508+00	2025-12-02 17:19:36.178508+00	password	33491ec3-17ed-41d7-abca-03c5a4269ce6
11f1a603-cca7-4256-aa42-0251dee78be8	2025-12-01 15:36:13.531217+00	2025-12-01 15:36:13.531217+00	password	1112a6cb-b7f7-48b0-899b-df4fdfe2b220
d2d2732e-25d5-4e1c-b2dc-311d407a4148	2025-12-01 15:36:23.588138+00	2025-12-01 15:36:23.588138+00	password	bc8fbdf1-0076-4500-975d-f59b208c38d9
854f35dd-2587-4c1c-9054-3fe1203c5116	2025-12-01 15:37:17.656281+00	2025-12-01 15:37:17.656281+00	password	fe1821a0-b928-41b7-a026-d384c4f5d94b
264562c1-919c-4cb9-b087-35de9a339df6	2025-11-26 15:00:41.68557+00	2025-11-26 15:00:41.68557+00	password	c990fe77-fb80-42d0-82e0-c0cda4e4377f
9c9cc82d-ac2f-4cae-9bfb-d134d5b73c0a	2025-11-26 15:00:43.813002+00	2025-11-26 15:00:43.813002+00	password	2419b157-c475-4e00-8a6e-2014eeb0297e
21fa1d13-5d5d-4278-8037-91801a5830ea	2025-11-26 15:47:40.968531+00	2025-11-26 15:47:40.968531+00	password	0ea458e8-b191-4267-885b-597dc6a11519
656d7645-f029-4111-8ee3-140147574a0c	2025-11-26 15:47:42.650406+00	2025-11-26 15:47:42.650406+00	password	0da981ba-d32f-45af-bc52-3c9e844bf78e
dd367520-c2d0-4d6f-87e5-f25f8e9b75d0	2025-12-01 15:37:41.304981+00	2025-12-01 15:37:41.304981+00	password	5579ea7c-c939-42d4-a5c4-2d0b50756e72
908a6f2f-6773-4e07-a686-da9c6a780b0b	2025-11-26 16:50:24.481615+00	2025-11-26 16:50:24.481615+00	password	1331b986-e4c7-487f-8488-eef58770d50e
990daa41-f0bc-4e8b-887b-af875ce0ef2e	2025-11-26 16:50:24.804056+00	2025-11-26 16:50:24.804056+00	password	bc906685-1ace-45b0-a0c7-6642593c946c
4fce5e23-5398-4e12-b562-0e9b421aa5af	2025-12-01 15:39:11.120209+00	2025-12-01 15:39:11.120209+00	password	eaf438d9-f088-4cdf-86c7-7d3bd92b789a
c52bd62d-8048-4b9d-ba31-bb6f104a0d20	2025-12-01 15:39:21.250092+00	2025-12-01 15:39:21.250092+00	password	c2dcc715-a38f-421c-90e9-0406a2e584de
4139053c-c77e-4818-829a-f0c54a8c49d7	2025-12-01 15:39:28.852436+00	2025-12-01 15:39:28.852436+00	password	2ae10043-3556-430b-b614-7ebe857680c3
bba770db-95db-4176-9e95-b936e1f2ddd3	2025-12-01 15:40:29.26206+00	2025-12-01 15:40:29.26206+00	password	a6ac208b-068a-4417-9854-162ae5fb7a5f
aa73373c-0847-4dfe-8017-ed6b9c1906aa	2025-12-01 15:47:28.667572+00	2025-12-01 15:47:28.667572+00	password	67a4bf7f-18ed-42b8-baaf-f056b0dedb52
8add6a55-4e43-4cc9-a685-2275e89cdc1f	2025-12-01 15:47:45.17055+00	2025-12-01 15:47:45.17055+00	password	02f4216e-fbf5-433e-b0e1-d369503c5deb
25246687-15f6-4985-95a3-52c1e1c1b98e	2025-12-01 15:47:54.05829+00	2025-12-01 15:47:54.05829+00	password	cc26af4d-4092-44a5-90be-ce418cc45283
9b7b0043-7d30-4c7b-b88a-b4ef6226735c	2025-12-01 15:48:09.568681+00	2025-12-01 15:48:09.568681+00	password	f748006d-915c-409a-8514-c95431307f2c
34b25e6a-613a-4368-920f-fea353f1163b	2025-12-01 15:48:24.196842+00	2025-12-01 15:48:24.196842+00	password	91499de5-8221-4929-b391-ad5ec6ed9856
7babd138-e1e1-45c5-95f2-1e1c3408570d	2025-12-01 15:54:24.199534+00	2025-12-01 15:54:24.199534+00	password	5003ce6c-fb53-4b9a-b730-652bae47b54c
4997b0c6-1a03-4ca0-b2fc-3e831bc938a3	2025-12-01 15:54:25.009889+00	2025-12-01 15:54:25.009889+00	password	5769c4a0-7e7d-4d18-980a-a3056f7f2926
f0caf471-7946-4ed7-b290-03db199bcf3c	2025-12-01 15:54:38.818886+00	2025-12-01 15:54:38.818886+00	password	03e76ccd-3fc5-4312-bd3b-c9d423787841
4b18daf7-8a87-4a45-a4e8-6a16ea46f55d	2025-12-01 15:54:39.341957+00	2025-12-01 15:54:39.341957+00	password	b7d4e35d-a3c6-4a91-8023-450b1f040362
5242a8f1-7155-43f1-ac57-359eff61459d	2025-12-01 15:54:50.710511+00	2025-12-01 15:54:50.710511+00	password	617c7398-9ced-4331-9f45-9261233df8b8
2f910e7d-e5ea-4b80-a8ff-cd5655dcc842	2025-12-01 15:54:51.192633+00	2025-12-01 15:54:51.192633+00	password	2c3647d2-d2a1-4eff-864f-06160cba50b9
f956c228-98bf-4dd9-89d3-c3132e3b7475	2025-12-01 16:05:23.573377+00	2025-12-01 16:05:23.573377+00	password	77bcd253-4fd3-47dc-ace6-fba1c8cc4e8f
b5e82d08-0699-4eb2-81bf-2807a1720546	2025-12-01 16:05:24.567574+00	2025-12-01 16:05:24.567574+00	password	32dcf76b-bcf2-408a-8d83-8795a8327771
ebc59462-733e-4eff-b214-38ee27c2c111	2025-12-01 16:06:23.151089+00	2025-12-01 16:06:23.151089+00	password	c49e1b62-b2a6-4d65-a828-f584e02a7403
7aaa1305-d340-4827-8466-c8bb7ef2d570	2025-12-01 16:06:23.838024+00	2025-12-01 16:06:23.838024+00	password	9869e7d9-126d-499f-a86b-28c239892924
42dcdb9c-025f-4e61-a360-256e9ab4026b	2025-12-01 16:07:16.690324+00	2025-12-01 16:07:16.690324+00	password	ec654347-2c4b-415e-bf32-c70679952101
2fba46ed-9e45-43a0-9ec6-347246b1577f	2025-12-01 16:07:17.185381+00	2025-12-01 16:07:17.185381+00	password	f8a1c53b-e2b3-46a1-b773-79b028e9a0c7
0534a187-94d6-469d-8bea-ac39831848b1	2025-12-01 16:26:56.195931+00	2025-12-01 16:26:56.195931+00	password	2d8d2d73-f2b5-4e5e-86ee-7a8f46c02bed
054f951c-4c50-4c16-8eae-880ecfa2b484	2025-12-01 16:27:00.13636+00	2025-12-01 16:27:00.13636+00	password	d8ff4705-2e7e-493e-bc75-7475dd82d1a0
f8ad5c97-3e9b-4204-b37c-f80f082e88f2	2025-12-01 16:30:39.337244+00	2025-12-01 16:30:39.337244+00	password	4d790eb4-ac6e-4c2a-8288-3cc94a0f2de9
ff38a84c-95d9-4840-82dd-f19248a50dbf	2025-12-01 16:30:40.089986+00	2025-12-01 16:30:40.089986+00	password	64fd9728-2dd5-4a68-84f4-ce18eaf4742f
578b3b29-1318-4dfa-801c-21bfb0231744	2025-12-01 16:32:37.208119+00	2025-12-01 16:32:37.208119+00	password	ff036ce9-f158-481b-91b4-10ff154600c5
486ed95c-e1bc-40c3-a993-22fb26f1eab1	2025-12-01 16:32:38.104495+00	2025-12-01 16:32:38.104495+00	password	bdee1109-6467-4c07-9bf9-ff8c02824e3d
6736ee7a-9371-439f-9b34-df1d3ce4fcef	2025-12-01 16:47:42.478111+00	2025-12-01 16:47:42.478111+00	password	d587716e-3978-4382-bb12-c956a1fb3fda
d77f071d-f31d-4e99-afd1-a62566f14e51	2025-12-01 16:47:43.180801+00	2025-12-01 16:47:43.180801+00	password	8c18bc6f-06ad-4eb7-858b-8d154c56537d
1de702dd-df40-489c-8900-50202c2f6b8c	2025-12-01 16:48:34.611389+00	2025-12-01 16:48:34.611389+00	password	94fbf017-ce90-4007-9722-a9f8f856e3dd
ad959f9e-8a60-452d-840b-c4c51c41634b	2025-12-01 16:48:35.283237+00	2025-12-01 16:48:35.283237+00	password	4712de7a-95ea-45d9-8d1c-fbd27eb0eeb2
d64da3ea-53a1-42a8-8ffc-1c054fc2652a	2025-12-01 17:35:38.972164+00	2025-12-01 17:35:38.972164+00	password	2afc7da8-8ac6-4566-8277-1c520c85e54d
8382b738-9265-4cc1-ab64-54b20d9b0a6a	2025-12-01 17:35:39.487334+00	2025-12-01 17:35:39.487334+00	password	123b796f-65c2-419d-954f-6ac3dce36555
771e9866-6fe5-41e8-a220-c86b41557ff3	2025-12-01 17:36:48.916649+00	2025-12-01 17:36:48.916649+00	password	4884b9df-9204-4af3-8f37-638d9c104eeb
44d0dbb0-73ab-493d-b635-0bdbd5e2b6a0	2025-12-01 17:36:49.336252+00	2025-12-01 17:36:49.336252+00	password	f3e893fa-0012-4655-9691-b9bc4c06486b
79cbdc75-16bc-48a3-bd99-948b6ce30679	2025-12-01 17:58:33.684725+00	2025-12-01 17:58:33.684725+00	password	b3cd82a4-4a89-47b9-97b8-3e47297e29b2
9d794018-4ac7-4066-8a62-eb910f60c6cc	2025-12-01 17:58:35.717079+00	2025-12-01 17:58:35.717079+00	password	fbbc41ae-4c2d-4ef9-8bc5-db0ab48781b5
7fcd0ca9-5959-4b2f-b233-6dc387eb49a8	2025-12-02 05:35:46.876757+00	2025-12-02 05:35:46.876757+00	password	24ba148b-c769-4bb8-98c4-2b5ff09d9fc4
4bb91e76-cbca-47cd-8574-d36ba81c970c	2025-12-02 05:35:47.902171+00	2025-12-02 05:35:47.902171+00	password	9a16a2b3-bd21-4271-8735-b6b88247930f
8ba978c7-da88-497e-b81a-3a3fe2ae59da	2025-12-02 06:19:26.628348+00	2025-12-02 06:19:26.628348+00	password	f3c5bec4-8064-48bd-9a18-af157448e431
82224825-a3ed-41ac-b66a-152332d7e856	2025-12-02 06:19:26.859445+00	2025-12-02 06:19:26.859445+00	password	08de5d61-2dfa-4a15-802d-1729be3b1ee0
17fa6aad-963c-4fd5-b246-ea2603e92e77	2025-12-02 06:20:57.400369+00	2025-12-02 06:20:57.400369+00	password	c328cd48-a260-4023-b73f-a8623abc4fa6
905331be-4ad9-4e96-ac23-0ffe92a25e87	2025-12-02 06:20:57.607522+00	2025-12-02 06:20:57.607522+00	password	49390c74-58e6-41d9-b72d-5abd56f902fd
a64425a5-7309-4734-b339-df0779bbbf54	2025-12-02 06:26:55.067626+00	2025-12-02 06:26:55.067626+00	password	8db190ee-17f8-4cbe-8e40-509f12bb4b51
b8732b68-f732-4988-8509-4e6d47269790	2025-12-02 06:26:55.294146+00	2025-12-02 06:26:55.294146+00	password	c7ff7716-52e6-408b-9116-f59d5f36c3fb
3a88e849-6db8-4271-852a-7ec138dbf972	2025-12-02 08:21:40.899632+00	2025-12-02 08:21:40.899632+00	password	91cf929c-2a15-4724-adbb-0389d8dbcbdc
75539137-b68b-4462-b22f-e8be55751cca	2025-12-02 08:21:42.179011+00	2025-12-02 08:21:42.179011+00	password	a789d99f-6986-4996-b56a-8f94d7e33db4
0c96264a-ecc5-4fa7-af68-255c5b139cd6	2025-12-02 08:43:32.100474+00	2025-12-02 08:43:32.100474+00	password	702fcf4a-2832-43fa-b7dd-2d49345faa0f
83c8b64b-029f-447c-9077-3180539aaf21	2025-12-02 08:43:32.310695+00	2025-12-02 08:43:32.310695+00	password	0f933c72-db83-4aeb-a88b-defffa0a22a1
97cd56da-5524-485b-9371-8b9c0c59ee59	2025-12-02 10:26:13.943807+00	2025-12-02 10:26:13.943807+00	password	46caeca2-a3fb-4b7c-bb83-a5683818b9a8
d00fa953-d198-4d4c-9829-c979fb9e80f7	2025-12-02 10:26:14.865768+00	2025-12-02 10:26:14.865768+00	password	eaf87bfc-6472-41bc-afae-dc4343b040c5
b33d0c61-1095-4e63-8605-84d3295b2914	2025-12-02 10:49:37.134978+00	2025-12-02 10:49:37.134978+00	password	8df44426-6ecc-4206-a45d-9d3562b0a61e
c4cb457d-e9a6-4856-ad9f-2e7588ac876a	2025-12-02 10:49:37.401516+00	2025-12-02 10:49:37.401516+00	password	bfdf7e24-a0da-42c2-ac0c-718a9686ed68
9472713e-eeb9-4945-9233-b1cb384f869d	2025-12-02 10:54:12.489317+00	2025-12-02 10:54:12.489317+00	password	8db3b3fe-726f-430d-b6dd-a4bdd29808e9
ba91ecd6-ef65-4986-8390-67fcce61c00a	2025-12-02 10:54:12.973945+00	2025-12-02 10:54:12.973945+00	password	792a274f-1b06-4c87-bc7c-11414aacb2c0
4a9c7bd8-cbcd-416a-b62f-808d9db484f1	2025-12-02 11:33:43.312845+00	2025-12-02 11:33:43.312845+00	password	ba8f8c93-8333-4d27-818c-b8de08492d13
31e317a4-e0de-4ae9-a242-ca0912d2bc48	2025-12-02 11:33:43.75744+00	2025-12-02 11:33:43.75744+00	password	bf6b7c36-7c5a-4947-a3b7-f0b40f8c83a7
23b7c982-c9f9-44d5-849c-2af0004911a0	2025-12-02 13:19:26.389428+00	2025-12-02 13:19:26.389428+00	password	03952ce6-aa2e-4dd6-9197-50e30012f862
1185d613-5947-41a8-a5ce-f083f37ba676	2025-12-02 13:19:28.723767+00	2025-12-02 13:19:28.723767+00	password	dc1e2647-54cb-4a07-b9f0-04bc14972bb7
1ffea53e-ac25-4ed5-abdb-282c4d4c114d	2025-12-02 13:19:59.559629+00	2025-12-02 13:19:59.559629+00	password	bb1b5e5d-5635-4f7e-aa05-03a6d8b70c97
9a3526c4-e526-4fc3-b27d-8d1c86a0920e	2025-12-02 13:20:00.408084+00	2025-12-02 13:20:00.408084+00	password	dafcec71-6037-407d-8bbc-1d19fa93c64f
b15c7062-7fa7-4b4d-b001-7587350d63c1	2025-12-02 13:29:23.986887+00	2025-12-02 13:29:23.986887+00	password	d0ec8e86-ae85-4a09-af11-e18e2a96d2b2
79088611-2389-4c23-8bf3-1f62f1683e38	2025-12-02 13:29:25.086384+00	2025-12-02 13:29:25.086384+00	password	06bae8da-a767-4e14-83b8-f5249fb8e83d
7ded0828-8514-415b-8373-1397f62327c8	2025-12-02 14:58:09.135313+00	2025-12-02 14:58:09.135313+00	password	cef08f27-4a54-4759-8894-fe3b826dbf12
0d730f05-088d-4b49-88aa-0c86cdb0a8f8	2025-12-02 14:58:10.32302+00	2025-12-02 14:58:10.32302+00	password	79e2daa3-2214-4319-a378-7cf132544899
63ffd90b-fef2-4e63-be34-60dca8043fe8	2025-12-02 15:11:32.148914+00	2025-12-02 15:11:32.148914+00	password	c912d80b-a4b4-475c-a40e-5759ebddcd54
a1ae078f-3d2e-4c6c-8f07-ee9b7c892cfb	2025-12-02 15:54:52.634641+00	2025-12-02 15:54:52.634641+00	password	1d06d84c-399c-428a-97cd-982dc144c20f
50d72b23-ba40-42f8-a130-7f4d92b1626a	2025-12-02 15:54:53.310675+00	2025-12-02 15:54:53.310675+00	password	7145184a-0e4e-4aa4-b488-dfd1e94cf861
711369f2-ec7a-4d75-a9e7-f8db086cabf0	2025-12-02 16:52:53.491862+00	2025-12-02 16:52:53.491862+00	password	fa45006e-9bfc-4894-9512-68a86c15d378
ee8863b6-62ef-4eb3-9b23-126c3b330b29	2025-12-02 17:24:30.138548+00	2025-12-02 17:24:30.138548+00	password	9e9d3451-84a0-4eae-9cd3-991488993801
31c3bfb2-294f-4775-be97-7a7b782017e4	2025-12-02 17:24:30.713122+00	2025-12-02 17:24:30.713122+00	password	50d621f8-420b-4020-b9d5-bde27245b309
c2de6c07-dd01-4041-99ad-dbf5b847b883	2025-12-02 17:43:46.524059+00	2025-12-02 17:43:46.524059+00	password	972a39e1-536d-4897-851c-9578750532ea
429ee685-84a9-491c-8976-8d1a1e11674f	2025-12-02 17:43:47.079106+00	2025-12-02 17:43:47.079106+00	password	95695874-1c48-401c-b5fb-d3fa45d2523e
0e1de774-1416-472e-9bce-19ed3614cbb6	2025-12-02 17:58:13.10142+00	2025-12-02 17:58:13.10142+00	password	3b4dbf66-8e66-4009-a84f-7c2bdc016af2
76055859-70c9-4d1b-b1a5-2cc7e7dfd656	2025-12-02 17:58:52.909976+00	2025-12-02 17:58:52.909976+00	password	e6271bef-5026-4e75-b05b-839a33783824
c5a5d14e-5ba2-40be-b3aa-9a2ecbb53543	2025-12-02 18:08:45.768649+00	2025-12-02 18:08:45.768649+00	password	e1dbbec3-eea4-43c9-8c66-d086c86fb547
212c2cdd-ef72-435e-a34e-f5c79326ce19	2025-12-02 18:08:46.359023+00	2025-12-02 18:08:46.359023+00	password	f94339de-77b7-4524-afbf-0e79312c19a6
be3642d9-eaee-4d35-b6e0-cbf622bc77a7	2025-12-02 18:10:16.073483+00	2025-12-02 18:10:16.073483+00	password	e126bdb6-9332-40a9-a917-efceb73487b2
18919b04-d3b3-4c36-b58b-616b7514f326	2025-12-02 18:10:16.539251+00	2025-12-02 18:10:16.539251+00	password	91962313-0dd7-4bd2-98dc-0a3c3fd61bc2
6cdda472-61e6-4650-b478-3603d3d79060	2025-12-02 18:59:15.984276+00	2025-12-02 18:59:15.984276+00	password	8a57151c-a60d-4950-aa7a-80ffc2dbee8b
43538a7e-6d24-434b-89e1-62e3ab1d48a5	2025-12-02 18:59:16.462097+00	2025-12-02 18:59:16.462097+00	password	4aabab2f-6dfe-4fe5-a217-7d37221e3bac
dabdfbda-97d1-461d-b25e-67f0c4d213ef	2025-12-03 05:02:23.323577+00	2025-12-03 05:02:23.323577+00	password	05d6b845-323e-4570-b5ba-bbfcf9a40954
cdca2535-4910-40c4-9466-ab4328b1215b	2025-12-03 05:02:24.669655+00	2025-12-03 05:02:24.669655+00	password	52fc1c7f-28fd-4bb7-a54a-7ede59986d84
087aa6ec-b447-45ec-80e2-07f3601612c1	2025-12-03 05:15:16.45706+00	2025-12-03 05:15:16.45706+00	password	1cc5b887-05da-4043-a54f-88a026daea24
b8186dc8-768a-49b6-a26f-75eb9fd0c1ed	2025-12-03 05:15:17.37625+00	2025-12-03 05:15:17.37625+00	password	f47ac334-aba7-43f6-89f5-f91c9cfa60fb
6ce8291a-158c-41fe-8d02-977a398278ba	2025-12-03 05:17:43.967984+00	2025-12-03 05:17:43.967984+00	password	33a04a8e-42ba-4b5d-a96e-bd5ba5dc472a
e96538bb-c8fc-4b79-826f-765193e5474a	2025-12-03 05:17:44.485013+00	2025-12-03 05:17:44.485013+00	password	eeb890c4-1be3-4082-afd0-9f8db35c4444
1ba8a8d8-7394-4e9d-a2e6-21a9b705a6de	2025-12-03 05:27:13.24075+00	2025-12-03 05:27:13.24075+00	password	a300d9d5-570c-4d85-b886-3dae013968eb
1108d6cb-2344-440e-9a08-eca301469fb6	2025-12-03 05:27:13.9482+00	2025-12-03 05:27:13.9482+00	password	3e9563c8-56e4-4fc1-91d6-678b2507e909
7718f6ac-64a9-42f3-8af5-2a4211a3f80d	2025-12-03 05:28:03.385759+00	2025-12-03 05:28:03.385759+00	password	1ea0c08a-ad86-443f-bff5-34e9bdc35826
2cb7cd27-0616-4b1e-aa1e-33643d9722eb	2025-12-03 05:28:03.668057+00	2025-12-03 05:28:03.668057+00	password	a8f9dd47-2ccc-4db8-9136-e85210fd2230
bb468a87-e2c3-497b-b56a-9264f030477e	2025-12-03 05:42:54.993387+00	2025-12-03 05:42:54.993387+00	password	4d20d1a7-1ca0-4e5a-b232-6e33e77d79a2
9b6e4d1c-894e-4271-91d1-a228e13f421f	2025-12-03 05:42:55.309617+00	2025-12-03 05:42:55.309617+00	password	7cd96937-7ed6-44ba-b572-00564b8761fb
18a4198b-7b79-4414-9876-072387de4397	2025-12-03 05:44:14.427023+00	2025-12-03 05:44:14.427023+00	password	6ba47ede-9552-49d3-93a9-fda7d9d50a5b
5e6ebdd0-d210-4085-b47e-aa5aaefb4193	2025-12-03 05:44:14.663664+00	2025-12-03 05:44:14.663664+00	password	cf4dde76-6010-45fc-89c9-d2afe16ee85f
68147b61-b7cb-442a-9183-d6f70179b486	2025-12-03 05:48:31.742458+00	2025-12-03 05:48:31.742458+00	password	be0551ee-1d68-42a2-a842-f9c516363c85
c253988c-5916-4a6f-9bd6-c004f5a395c3	2025-12-03 05:48:32.014628+00	2025-12-03 05:48:32.014628+00	password	871e614d-2176-4bc7-9de8-e9d1a1684fae
9d758a45-ff1e-415f-a0c6-a2b4744318b3	2025-12-03 05:51:32.359535+00	2025-12-03 05:51:32.359535+00	password	74d8c2e2-dae2-4bae-9799-58268c794abe
d5e16d25-31da-40f3-924b-406f8ca0a5f2	2025-12-03 05:51:32.678037+00	2025-12-03 05:51:32.678037+00	password	140e9a8c-16db-4515-a208-38bbf0c9903c
c534dab9-da36-4cf6-bec0-ba5426fcf931	2025-12-03 06:05:39.752544+00	2025-12-03 06:05:39.752544+00	password	095b40ae-ad84-40c3-9984-ea26dee0da5d
1fcd3d16-8ffb-4c3a-9d5b-c02364c19415	2025-12-03 06:05:40.012502+00	2025-12-03 06:05:40.012502+00	password	250c6b0a-bdeb-45c1-adb5-aa2a18f0bb19
b561a38a-3b35-4d11-b044-b3e910b00c15	2025-12-03 06:08:19.305232+00	2025-12-03 06:08:19.305232+00	password	cfcaf45f-aa24-4299-8142-8a2484fedbdc
30b4a224-ca43-46cf-8255-20144b16a821	2025-12-03 06:08:19.585185+00	2025-12-03 06:08:19.585185+00	password	508ae707-ebd1-4b84-8c16-f5169279b0fd
482f187d-af46-4090-8d63-3a18f290af2a	2025-12-03 06:16:11.885703+00	2025-12-03 06:16:11.885703+00	password	9cf864ce-0b3b-49f1-a2e3-1a3e1d8dec14
5f8a88c2-8eee-44bf-a270-7ddfd6f9f816	2025-12-03 06:16:12.43879+00	2025-12-03 06:16:12.43879+00	password	c77df288-4f21-41df-b689-dd2ae2057a9d
19544976-d400-4f22-a01a-a7247327d0fe	2025-12-03 08:24:50.749865+00	2025-12-03 08:24:50.749865+00	password	cc63c923-d90a-485e-9413-3e5167528dd2
7f8e29f3-22ce-4ba3-8dbe-9ec9d9502b57	2025-12-03 08:24:51.024807+00	2025-12-03 08:24:51.024807+00	password	22d3200a-fd85-4c08-8ac4-8c3173288742
4a300d0c-5961-49a9-bdea-cff6de4c9fb5	2025-12-03 08:25:39.12149+00	2025-12-03 08:25:39.12149+00	password	ad452e87-4f1f-44cc-8dfc-b27a3f4d0473
c47be8dc-b77c-4365-960e-acac8d494d96	2025-12-03 08:25:39.402131+00	2025-12-03 08:25:39.402131+00	password	596ff6ec-41d5-435b-a004-97dafd0aefee
fb8e951f-cdaa-40f5-ac69-2a3ee03e21d7	2025-12-03 13:45:48.168612+00	2025-12-03 13:45:48.168612+00	password	10fd4f1a-d971-4925-af72-03a945478544
819c1fd5-7e0c-49f2-b0be-76144bc1d305	2025-12-03 13:45:48.820838+00	2025-12-03 13:45:48.820838+00	password	ce3f8f3f-7175-423d-8123-cf4da2543315
4e930e71-ee57-4bc6-9e62-759a4235a3a1	2025-12-03 15:33:56.119449+00	2025-12-03 15:33:56.119449+00	password	c5561d40-c9b0-4383-b361-d46679106f3b
f25fbc19-4a6b-4eb6-8714-272fe7ddcce9	2025-12-03 15:33:56.725831+00	2025-12-03 15:33:56.725831+00	password	74576f85-d86b-4563-a673-8d4df3efd9f0
04707c19-b84a-407f-a019-85195cb35cbc	2025-12-03 15:35:23.264299+00	2025-12-03 15:35:23.264299+00	password	e93cd0a0-bc19-4ede-8f9c-844b7b11c2e0
b873cac1-d533-488c-bdea-0e34c513b604	2025-12-03 15:35:23.694368+00	2025-12-03 15:35:23.694368+00	password	e185f823-c41d-468d-8a9b-3e2b876ead54
3824e28f-89e8-4f19-bc7f-b38dd8b33845	2025-12-03 15:35:42.282009+00	2025-12-03 15:35:42.282009+00	password	3574942a-79d8-429b-ac10-3620208f462c
44964f0a-2cbf-4383-8408-15ef03c79f12	2025-12-03 15:35:42.799874+00	2025-12-03 15:35:42.799874+00	password	867de1f2-e40a-409f-8168-dd714b0ff08a
d4192267-ff11-4ff9-8351-7944c516e011	2025-12-03 17:04:47.799504+00	2025-12-03 17:04:47.799504+00	password	efff57d0-594f-4ee1-af74-8412abaf0746
28389e73-2e65-4bef-ae56-8dd0f4cac6e5	2025-12-03 17:04:48.589953+00	2025-12-03 17:04:48.589953+00	password	aac0494d-c202-49dd-9a68-a2e200c4471d
f7c4bd8e-5ef5-46d0-9fa1-1319c695eb40	2025-12-03 17:06:28.678434+00	2025-12-03 17:06:28.678434+00	password	c1175853-fcae-422e-82db-6865daed23de
72770526-23aa-457c-8dea-d8a902e5fd6d	2025-12-03 17:06:29.920909+00	2025-12-03 17:06:29.920909+00	password	fcaf08a9-e9a8-4c33-a348-e9bf8301527d
821717bd-2356-470b-8f1b-73899772008e	2025-12-03 17:06:43.829632+00	2025-12-03 17:06:43.829632+00	password	9dcd7b80-dbfa-4d57-912f-a45cd842bda0
c9554983-a2fe-4194-9856-7d2f0da4bcf7	2025-12-03 17:06:44.675334+00	2025-12-03 17:06:44.675334+00	password	eda942bc-8ee8-4d69-8fb8-878c31764f1d
0b53fe3b-d554-4589-867e-285de725db59	2025-12-03 17:15:50.631925+00	2025-12-03 17:15:50.631925+00	password	dec29a7d-da84-4e3a-ab66-d47894269d6d
28477f6a-2317-43e8-9ca1-28506807348d	2025-12-03 17:15:51.26217+00	2025-12-03 17:15:51.26217+00	password	52f424e0-1ab6-4139-bb53-1dac4d3c6f91
7e271af5-594f-4f33-8871-bf60bb535e72	2025-12-03 17:45:26.484388+00	2025-12-03 17:45:26.484388+00	password	3a98a473-4da7-4b16-9fe1-91fc5091c98c
197004c6-c400-4123-80a8-922f5c7e0aa9	2025-12-03 17:45:27.618318+00	2025-12-03 17:45:27.618318+00	password	a77edc9b-aeff-4939-8339-9462a4a906f1
9a2c4217-da3b-4286-807d-2185058afb0d	2025-12-03 17:46:02.383312+00	2025-12-03 17:46:02.383312+00	password	91c94739-5cb5-4c56-994f-8b42a139a11a
e8b8d12e-d09a-460c-a75e-0e5000d2820e	2025-12-03 17:46:03.875994+00	2025-12-03 17:46:03.875994+00	password	71c6b77d-4131-4946-94bd-21140057061b
\.


--
-- Data for Name: mfa_challenges; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.mfa_challenges (id, factor_id, created_at, verified_at, ip_address, otp_code, web_authn_session_data) FROM stdin;
\.


--
-- Data for Name: mfa_factors; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.mfa_factors (id, user_id, friendly_name, factor_type, status, created_at, updated_at, secret, phone, last_challenged_at, web_authn_credential, web_authn_aaguid, last_webauthn_challenge_data) FROM stdin;
\.


--
-- Data for Name: oauth_authorizations; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.oauth_authorizations (id, authorization_id, client_id, user_id, redirect_uri, scope, state, resource, code_challenge, code_challenge_method, response_type, status, authorization_code, created_at, expires_at, approved_at, nonce) FROM stdin;
\.


--
-- Data for Name: oauth_clients; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.oauth_clients (id, client_secret_hash, registration_type, redirect_uris, grant_types, client_name, client_uri, logo_uri, created_at, updated_at, deleted_at, client_type) FROM stdin;
\.


--
-- Data for Name: oauth_consents; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.oauth_consents (id, user_id, client_id, scopes, granted_at, revoked_at) FROM stdin;
\.


--
-- Data for Name: one_time_tokens; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.one_time_tokens (id, user_id, token_type, token_hash, relates_to, created_at, updated_at) FROM stdin;
8c4aa828-c624-46f7-a375-2a2b4925b9ab	0d259525-97d9-4fdc-9716-4522f9fd733c	confirmation_token	dbff5228d1d830ef14787ae8f56bcace4da88266d0b3bbca8bd83b65	yogi@admin.com	2025-11-28 12:42:10.458068	2025-11-28 12:42:10.458068
b351d9d7-15aa-420c-b8c1-459987c55b40	0bb17a30-8f3d-4c8f-83f3-f75a1da9766c	confirmation_token	f65b81f5959c4de7f3de216c7af8597e17d6b3926047582cbeda0d00	s@admin.com	2025-11-28 12:50:39.862304	2025-11-28 12:50:39.862304
4c712b6e-02a1-42ea-a8f0-b3f68ccb9f8b	c5686080-3064-407d-8eb8-f68e67ac26ad	confirmation_token	4a8aa53cd2c1c115ac3742f2da06f582ae6d0f7cff8aeba724fc6e31	sa@admin.com	2025-11-28 12:51:05.585853	2025-11-28 12:51:05.585853
59f3e2cc-de8f-4c25-b9c3-68eda01c2e14	a589e561-114b-4a6f-9e58-9db8c9882a45	confirmation_token	536e0a9d084c36d25d8572979bd2d652743b6868e8f39df55f12ac89	admin2@admin.com	2025-11-28 12:57:17.589545	2025-11-28 12:57:17.589545
5608cbb2-c3bd-4275-9a83-807aa3bc1983	4952a4cd-b36a-4234-a7ca-cbdad8a4f8e8	confirmation_token	f22a390cd5e0baacc52f76eed27bd74bfefbb7ce6ea848cc35fb713e	admin3@admin.com	2025-11-28 13:00:13.624605	2025-11-28 13:00:13.624605
\.


--
-- Data for Name: refresh_tokens; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.refresh_tokens (instance_id, id, token, user_id, revoked, created_at, updated_at, parent, session_id) FROM stdin;
00000000-0000-0000-0000-000000000000	1	bih4e5afsfdw	aa979816-d19c-42c6-9343-c58b55f5311d	f	2025-11-23 20:43:49.664527+00	2025-11-23 20:43:49.664527+00	\N	314c7281-dd42-4932-9b68-8544ee70ed88
00000000-0000-0000-0000-000000000000	248	glougxf3dijz	1e90bb2c-2aae-490c-997d-2dc0cff18925	f	2025-12-02 06:20:57.397614+00	2025-12-02 06:20:57.397614+00	\N	17fa6aad-963c-4fd5-b246-ea2603e92e77
00000000-0000-0000-0000-000000000000	249	adfrkcezqs6i	1e90bb2c-2aae-490c-997d-2dc0cff18925	f	2025-12-02 06:20:57.605331+00	2025-12-02 06:20:57.605331+00	\N	905331be-4ad9-4e96-ac23-0ffe92a25e87
00000000-0000-0000-0000-000000000000	393	p3mwd2lxrxux	1e90bb2c-2aae-490c-997d-2dc0cff18925	f	2025-12-03 12:46:46.216929+00	2025-12-03 12:46:46.216929+00	pe2cp5zyy64g	7f8e29f3-22ce-4ba3-8dbe-9ec9d9502b57
00000000-0000-0000-0000-000000000000	254	g65jgh2knr4b	7961dd5b-891f-48f5-89ce-f2fb84842db2	f	2025-12-02 06:26:55.043967+00	2025-12-02 06:26:55.043967+00	\N	a64425a5-7309-4734-b339-df0779bbbf54
00000000-0000-0000-0000-000000000000	400	wkkofuy7nous	1e90bb2c-2aae-490c-997d-2dc0cff18925	t	2025-12-03 13:45:13.517267+00	2025-12-03 14:43:45.737923+00	lui3phm77xjg	212c2cdd-ef72-435e-a34e-f5c79326ce19
00000000-0000-0000-0000-000000000000	255	p4fpfchwbzay	7961dd5b-891f-48f5-89ce-f2fb84842db2	t	2025-12-02 06:26:55.291629+00	2025-12-02 08:42:48.009541+00	\N	b8732b68-f732-4988-8509-4e6d47269790
00000000-0000-0000-0000-000000000000	263	bh775jz5mpsf	7961dd5b-891f-48f5-89ce-f2fb84842db2	f	2025-12-02 08:43:32.098805+00	2025-12-02 08:43:32.098805+00	\N	0c96264a-ecc5-4fa7-af68-255c5b139cd6
00000000-0000-0000-0000-000000000000	264	khrq6ldkbkzl	7961dd5b-891f-48f5-89ce-f2fb84842db2	t	2025-12-02 08:43:32.306572+00	2025-12-02 10:14:46.01809+00	\N	83c8b64b-029f-447c-9077-3180539aaf21
00000000-0000-0000-0000-000000000000	267	oeekoqx6goqq	7961dd5b-891f-48f5-89ce-f2fb84842db2	f	2025-12-02 10:26:13.937179+00	2025-12-02 10:26:13.937179+00	\N	97cd56da-5524-485b-9371-8b9c0c59ee59
00000000-0000-0000-0000-000000000000	274	hwdojt4bih6h	e391e4ca-6d57-4e97-9267-92187a1c8911	f	2025-12-02 10:54:12.466225+00	2025-12-02 10:54:12.466225+00	\N	9472713e-eeb9-4945-9233-b1cb384f869d
00000000-0000-0000-0000-000000000000	268	e5ho4sg4jkpa	7961dd5b-891f-48f5-89ce-f2fb84842db2	t	2025-12-02 10:26:14.861512+00	2025-12-02 11:25:37.046757+00	\N	d00fa953-d198-4d4c-9829-c979fb9e80f7
00000000-0000-0000-0000-000000000000	171	zoks72nega6j	1e90bb2c-2aae-490c-997d-2dc0cff18925	f	2025-12-01 15:36:13.514665+00	2025-12-01 15:36:13.514665+00	\N	11f1a603-cca7-4256-aa42-0251dee78be8
00000000-0000-0000-0000-000000000000	173	2xi2hdyw6ufr	1e90bb2c-2aae-490c-997d-2dc0cff18925	f	2025-12-01 15:36:23.586751+00	2025-12-01 15:36:23.586751+00	\N	d2d2732e-25d5-4e1c-b2dc-311d407a4148
00000000-0000-0000-0000-000000000000	175	recnqw4qh23o	1e90bb2c-2aae-490c-997d-2dc0cff18925	f	2025-12-01 15:37:17.654889+00	2025-12-01 15:37:17.654889+00	\N	854f35dd-2587-4c1c-9054-3fe1203c5116
00000000-0000-0000-0000-000000000000	177	7lz45z2dkzgv	1e90bb2c-2aae-490c-997d-2dc0cff18925	f	2025-12-01 15:37:41.303785+00	2025-12-01 15:37:41.303785+00	\N	dd367520-c2d0-4d6f-87e5-f25f8e9b75d0
00000000-0000-0000-0000-000000000000	179	hfnef3xejwz3	1e90bb2c-2aae-490c-997d-2dc0cff18925	f	2025-12-01 15:39:11.116962+00	2025-12-01 15:39:11.116962+00	\N	4fce5e23-5398-4e12-b562-0e9b421aa5af
00000000-0000-0000-0000-000000000000	33	e6vkdxghl63b	62ba3539-985e-4902-9fc8-07d1e4a9f70d	f	2025-11-26 15:00:41.640433+00	2025-11-26 15:00:41.640433+00	\N	264562c1-919c-4cb9-b087-35de9a339df6
00000000-0000-0000-0000-000000000000	181	cez3rywcd6ku	1e90bb2c-2aae-490c-997d-2dc0cff18925	f	2025-12-01 15:39:21.248773+00	2025-12-01 15:39:21.248773+00	\N	c52bd62d-8048-4b9d-ba31-bb6f104a0d20
00000000-0000-0000-0000-000000000000	35	2psnof2ekio6	a75d2995-1604-45b3-a48e-e696b48df99b	f	2025-11-26 15:47:40.955191+00	2025-11-26 15:47:40.955191+00	\N	21fa1d13-5d5d-4278-8037-91801a5830ea
00000000-0000-0000-0000-000000000000	34	oz2ofr3zvha4	62ba3539-985e-4902-9fc8-07d1e4a9f70d	t	2025-11-26 15:00:43.806079+00	2025-11-26 15:58:29.047274+00	\N	9c9cc82d-ac2f-4cae-9bfb-d134d5b73c0a
00000000-0000-0000-0000-000000000000	183	f5pzcoabacwl	1e90bb2c-2aae-490c-997d-2dc0cff18925	f	2025-12-01 15:39:28.851192+00	2025-12-01 15:39:28.851192+00	\N	4139053c-c77e-4818-829a-f0c54a8c49d7
00000000-0000-0000-0000-000000000000	41	u7cjjxylwjnv	62ba3539-985e-4902-9fc8-07d1e4a9f70d	f	2025-11-26 16:50:24.479538+00	2025-11-26 16:50:24.479538+00	\N	908a6f2f-6773-4e07-a686-da9c6a780b0b
00000000-0000-0000-0000-000000000000	42	ohkljfctdn65	62ba3539-985e-4902-9fc8-07d1e4a9f70d	f	2025-11-26 16:50:24.801767+00	2025-11-26 16:50:24.801767+00	\N	990daa41-f0bc-4e8b-887b-af875ce0ef2e
00000000-0000-0000-0000-000000000000	37	ono7x3o2qg3b	62ba3539-985e-4902-9fc8-07d1e4a9f70d	t	2025-11-26 15:58:29.066853+00	2025-11-26 16:56:24.216836+00	oz2ofr3zvha4	9c9cc82d-ac2f-4cae-9bfb-d134d5b73c0a
00000000-0000-0000-0000-000000000000	43	d7dii6lkrshp	62ba3539-985e-4902-9fc8-07d1e4a9f70d	f	2025-11-26 16:56:24.219731+00	2025-11-26 16:56:24.219731+00	ono7x3o2qg3b	9c9cc82d-ac2f-4cae-9bfb-d134d5b73c0a
00000000-0000-0000-0000-000000000000	185	mgsy754ugg4g	1e90bb2c-2aae-490c-997d-2dc0cff18925	f	2025-12-01 15:40:29.260379+00	2025-12-01 15:40:29.260379+00	\N	bba770db-95db-4176-9e95-b936e1f2ddd3
00000000-0000-0000-0000-000000000000	187	d7durxn6fsy5	1e90bb2c-2aae-490c-997d-2dc0cff18925	f	2025-12-01 15:47:28.661019+00	2025-12-01 15:47:28.661019+00	\N	aa73373c-0847-4dfe-8017-ed6b9c1906aa
00000000-0000-0000-0000-000000000000	189	ot4zmceffjqp	1e90bb2c-2aae-490c-997d-2dc0cff18925	f	2025-12-01 15:47:45.169102+00	2025-12-01 15:47:45.169102+00	\N	8add6a55-4e43-4cc9-a685-2275e89cdc1f
00000000-0000-0000-0000-000000000000	191	2i7xsemopzd5	1e90bb2c-2aae-490c-997d-2dc0cff18925	f	2025-12-01 15:47:54.05699+00	2025-12-01 15:47:54.05699+00	\N	25246687-15f6-4985-95a3-52c1e1c1b98e
00000000-0000-0000-0000-000000000000	193	qx3mwnjxc4sf	1e90bb2c-2aae-490c-997d-2dc0cff18925	f	2025-12-01 15:48:09.567409+00	2025-12-01 15:48:09.567409+00	\N	9b7b0043-7d30-4c7b-b88a-b4ef6226735c
00000000-0000-0000-0000-000000000000	195	h3766nd47z2q	1e90bb2c-2aae-490c-997d-2dc0cff18925	f	2025-12-01 15:48:24.195614+00	2025-12-01 15:48:24.195614+00	\N	34b25e6a-613a-4368-920f-fea353f1163b
00000000-0000-0000-0000-000000000000	197	oawuba7idz27	1e90bb2c-2aae-490c-997d-2dc0cff18925	f	2025-12-01 15:54:24.18817+00	2025-12-01 15:54:24.18817+00	\N	7babd138-e1e1-45c5-95f2-1e1c3408570d
00000000-0000-0000-0000-000000000000	198	bi344vmzz4gy	1e90bb2c-2aae-490c-997d-2dc0cff18925	f	2025-12-01 15:54:25.008332+00	2025-12-01 15:54:25.008332+00	\N	4997b0c6-1a03-4ca0-b2fc-3e831bc938a3
00000000-0000-0000-0000-000000000000	199	qd3bs7okzp4d	1e90bb2c-2aae-490c-997d-2dc0cff18925	f	2025-12-01 15:54:38.817449+00	2025-12-01 15:54:38.817449+00	\N	f0caf471-7946-4ed7-b290-03db199bcf3c
00000000-0000-0000-0000-000000000000	200	wxzytd7k3vac	1e90bb2c-2aae-490c-997d-2dc0cff18925	f	2025-12-01 15:54:39.339785+00	2025-12-01 15:54:39.339785+00	\N	4b18daf7-8a87-4a45-a4e8-6a16ea46f55d
00000000-0000-0000-0000-000000000000	201	lpatc2nkbz6p	1e90bb2c-2aae-490c-997d-2dc0cff18925	f	2025-12-01 15:54:50.707889+00	2025-12-01 15:54:50.707889+00	\N	5242a8f1-7155-43f1-ac57-359eff61459d
00000000-0000-0000-0000-000000000000	202	cggkjm24bogq	1e90bb2c-2aae-490c-997d-2dc0cff18925	f	2025-12-01 15:54:51.187728+00	2025-12-01 15:54:51.187728+00	\N	2f910e7d-e5ea-4b80-a8ff-cd5655dcc842
00000000-0000-0000-0000-000000000000	203	hlpbk533jmrq	1e90bb2c-2aae-490c-997d-2dc0cff18925	f	2025-12-01 16:05:23.554369+00	2025-12-01 16:05:23.554369+00	\N	f956c228-98bf-4dd9-89d3-c3132e3b7475
00000000-0000-0000-0000-000000000000	204	pwn76txoeeyr	1e90bb2c-2aae-490c-997d-2dc0cff18925	f	2025-12-01 16:05:24.563995+00	2025-12-01 16:05:24.563995+00	\N	b5e82d08-0699-4eb2-81bf-2807a1720546
00000000-0000-0000-0000-000000000000	205	xj33jwucg7ei	057e2aa7-9db5-46e6-b6b2-b1cbead41bab	f	2025-12-01 16:06:23.148363+00	2025-12-01 16:06:23.148363+00	\N	ebc59462-733e-4eff-b214-38ee27c2c111
00000000-0000-0000-0000-000000000000	206	72l27rieid74	057e2aa7-9db5-46e6-b6b2-b1cbead41bab	f	2025-12-01 16:06:23.836599+00	2025-12-01 16:06:23.836599+00	\N	7aaa1305-d340-4827-8466-c8bb7ef2d570
00000000-0000-0000-0000-000000000000	207	eir4qs737cex	1e90bb2c-2aae-490c-997d-2dc0cff18925	f	2025-12-01 16:07:16.688301+00	2025-12-01 16:07:16.688301+00	\N	42dcdb9c-025f-4e61-a360-256e9ab4026b
00000000-0000-0000-0000-000000000000	208	jhr5yx5xkp3i	1e90bb2c-2aae-490c-997d-2dc0cff18925	f	2025-12-01 16:07:17.184029+00	2025-12-01 16:07:17.184029+00	\N	2fba46ed-9e45-43a0-9ec6-347246b1577f
00000000-0000-0000-0000-000000000000	209	zo3rjlvqxuld	1e90bb2c-2aae-490c-997d-2dc0cff18925	f	2025-12-01 16:26:56.169943+00	2025-12-01 16:26:56.169943+00	\N	0534a187-94d6-469d-8bea-ac39831848b1
00000000-0000-0000-0000-000000000000	211	tbluycyscub7	1e90bb2c-2aae-490c-997d-2dc0cff18925	f	2025-12-01 16:30:39.334901+00	2025-12-01 16:30:39.334901+00	\N	f8ad5c97-3e9b-4204-b37c-f80f082e88f2
00000000-0000-0000-0000-000000000000	212	7tz5lif52rme	1e90bb2c-2aae-490c-997d-2dc0cff18925	f	2025-12-01 16:30:40.088493+00	2025-12-01 16:30:40.088493+00	\N	ff38a84c-95d9-4840-82dd-f19248a50dbf
00000000-0000-0000-0000-000000000000	215	saeno333pfsy	1e90bb2c-2aae-490c-997d-2dc0cff18925	f	2025-12-01 16:32:37.206723+00	2025-12-01 16:32:37.206723+00	\N	578b3b29-1318-4dfa-801c-21bfb0231744
00000000-0000-0000-0000-000000000000	216	k5g3af2fua5p	1e90bb2c-2aae-490c-997d-2dc0cff18925	f	2025-12-01 16:32:38.10165+00	2025-12-01 16:32:38.10165+00	\N	486ed95c-e1bc-40c3-a993-22fb26f1eab1
00000000-0000-0000-0000-000000000000	36	msgtaythdosf	a75d2995-1604-45b3-a48e-e696b48df99b	t	2025-11-26 15:47:42.64908+00	2025-12-01 17:02:54.939725+00	\N	656d7645-f029-4111-8ee3-140147574a0c
00000000-0000-0000-0000-000000000000	210	kac75cftzxqd	1e90bb2c-2aae-490c-997d-2dc0cff18925	t	2025-12-01 16:27:00.132944+00	2025-12-01 17:58:09.217573+00	\N	054f951c-4c50-4c16-8eae-880ecfa2b484
00000000-0000-0000-0000-000000000000	256	yxunzk4u74bq	7961dd5b-891f-48f5-89ce-f2fb84842db2	f	2025-12-02 08:21:40.866023+00	2025-12-02 08:21:40.866023+00	\N	3a88e849-6db8-4271-852a-7ec138dbf972
00000000-0000-0000-0000-000000000000	257	avzcozossuyg	7961dd5b-891f-48f5-89ce-f2fb84842db2	f	2025-12-02 08:21:42.17454+00	2025-12-02 08:21:42.17454+00	\N	75539137-b68b-4462-b22f-e8be55751cca
00000000-0000-0000-0000-000000000000	219	63edcsh5zs5l	7961dd5b-891f-48f5-89ce-f2fb84842db2	f	2025-12-01 16:47:42.468253+00	2025-12-01 16:47:42.468253+00	\N	6736ee7a-9371-439f-9b34-df1d3ce4fcef
00000000-0000-0000-0000-000000000000	220	xqcugvlluuoj	7961dd5b-891f-48f5-89ce-f2fb84842db2	f	2025-12-01 16:47:43.179493+00	2025-12-01 16:47:43.179493+00	\N	d77f071d-f31d-4e99-afd1-a62566f14e51
00000000-0000-0000-0000-000000000000	221	5ngo3q4mjdsb	1e90bb2c-2aae-490c-997d-2dc0cff18925	f	2025-12-01 16:48:34.609224+00	2025-12-01 16:48:34.609224+00	\N	1de702dd-df40-489c-8900-50202c2f6b8c
00000000-0000-0000-0000-000000000000	222	phfqhrmadl3d	1e90bb2c-2aae-490c-997d-2dc0cff18925	f	2025-12-01 16:48:35.281973+00	2025-12-01 16:48:35.281973+00	\N	ad959f9e-8a60-452d-840b-c4c51c41634b
00000000-0000-0000-0000-000000000000	260	4fdqmwghqhoo	7961dd5b-891f-48f5-89ce-f2fb84842db2	f	2025-12-02 08:42:48.014123+00	2025-12-02 08:42:48.014123+00	p4fpfchwbzay	b8732b68-f732-4988-8509-4e6d47269790
00000000-0000-0000-0000-000000000000	225	pm6gt2e7fdd7	a75d2995-1604-45b3-a48e-e696b48df99b	f	2025-12-01 17:02:54.956099+00	2025-12-01 17:02:54.956099+00	msgtaythdosf	656d7645-f029-4111-8ee3-140147574a0c
00000000-0000-0000-0000-000000000000	266	awm77cjtk235	7961dd5b-891f-48f5-89ce-f2fb84842db2	f	2025-12-02 10:14:46.034235+00	2025-12-02 10:14:46.034235+00	khrq6ldkbkzl	83c8b64b-029f-447c-9077-3180539aaf21
00000000-0000-0000-0000-000000000000	270	fnpyuqgnp4y4	1e90bb2c-2aae-490c-997d-2dc0cff18925	f	2025-12-02 10:49:37.120263+00	2025-12-02 10:49:37.120263+00	\N	b33d0c61-1095-4e63-8605-84d3295b2914
00000000-0000-0000-0000-000000000000	271	4tj75ihepurb	1e90bb2c-2aae-490c-997d-2dc0cff18925	f	2025-12-02 10:49:37.397703+00	2025-12-02 10:49:37.397703+00	\N	c4cb457d-e9a6-4856-ad9f-2e7588ac876a
00000000-0000-0000-0000-000000000000	230	lzyokecwazwd	7961dd5b-891f-48f5-89ce-f2fb84842db2	f	2025-12-01 17:35:38.965401+00	2025-12-01 17:35:38.965401+00	\N	d64da3ea-53a1-42a8-8ffc-1c054fc2652a
00000000-0000-0000-0000-000000000000	231	hz7235ccqhkn	7961dd5b-891f-48f5-89ce-f2fb84842db2	f	2025-12-01 17:35:39.48455+00	2025-12-01 17:35:39.48455+00	\N	8382b738-9265-4cc1-ab64-54b20d9b0a6a
00000000-0000-0000-0000-000000000000	232	q75azgn52e6p	e391e4ca-6d57-4e97-9267-92187a1c8911	f	2025-12-01 17:36:48.914459+00	2025-12-01 17:36:48.914459+00	\N	771e9866-6fe5-41e8-a220-c86b41557ff3
00000000-0000-0000-0000-000000000000	233	hciyhdurjumf	e391e4ca-6d57-4e97-9267-92187a1c8911	f	2025-12-01 17:36:49.334224+00	2025-12-01 17:36:49.334224+00	\N	44d0dbb0-73ab-493d-b635-0bdbd5e2b6a0
00000000-0000-0000-0000-000000000000	401	j2n7rif6r56t	9f7cbe52-d1e4-4310-aa79-6a300f5ccb6c	f	2025-12-03 13:45:48.165306+00	2025-12-03 13:45:48.165306+00	\N	fb8e951f-cdaa-40f5-ac69-2a3ee03e21d7
00000000-0000-0000-0000-000000000000	236	fxyxe6zcnihi	1e90bb2c-2aae-490c-997d-2dc0cff18925	f	2025-12-01 17:58:09.228407+00	2025-12-01 17:58:09.228407+00	kac75cftzxqd	054f951c-4c50-4c16-8eae-880ecfa2b484
00000000-0000-0000-0000-000000000000	237	vmywuzmh6tc3	1e90bb2c-2aae-490c-997d-2dc0cff18925	f	2025-12-01 17:58:33.682777+00	2025-12-01 17:58:33.682777+00	\N	79cbdc75-16bc-48a3-bd99-948b6ce30679
00000000-0000-0000-0000-000000000000	316	n22kfg736foy	7961dd5b-891f-48f5-89ce-f2fb84842db2	t	2025-12-02 17:17:37.063506+00	2025-12-03 15:33:28.504351+00	\N	1808d7f0-632e-48e2-8bc1-356023d26f6e
00000000-0000-0000-0000-000000000000	275	kcdddshp64pu	e391e4ca-6d57-4e97-9267-92187a1c8911	f	2025-12-02 10:54:12.969257+00	2025-12-02 10:54:12.969257+00	\N	ba91ecd6-ef65-4986-8390-67fcce61c00a
00000000-0000-0000-0000-000000000000	240	buqlcuxxs5ay	7961dd5b-891f-48f5-89ce-f2fb84842db2	f	2025-12-02 05:35:46.865306+00	2025-12-02 05:35:46.865306+00	\N	7fcd0ca9-5959-4b2f-b233-6dc387eb49a8
00000000-0000-0000-0000-000000000000	241	vcehqqolm7w3	7961dd5b-891f-48f5-89ce-f2fb84842db2	f	2025-12-02 05:35:47.90007+00	2025-12-02 05:35:47.90007+00	\N	4bb91e76-cbca-47cd-8574-d36ba81c970c
00000000-0000-0000-0000-000000000000	299	2p7bl27bw3a3	34533694-0bbb-4853-9693-a2da2c05ee94	t	2025-12-02 15:11:32.128823+00	2025-12-03 17:04:20.086112+00	\N	63ffd90b-fef2-4e63-be34-60dca8043fe8
00000000-0000-0000-0000-000000000000	244	jbpekzb2n3kj	e391e4ca-6d57-4e97-9267-92187a1c8911	f	2025-12-02 06:19:26.613972+00	2025-12-02 06:19:26.613972+00	\N	8ba978c7-da88-497e-b81a-3a3fe2ae59da
00000000-0000-0000-0000-000000000000	245	cck56jcjjbth	e391e4ca-6d57-4e97-9267-92187a1c8911	f	2025-12-02 06:19:26.857967+00	2025-12-02 06:19:26.857967+00	\N	82224825-a3ed-41ac-b66a-152332d7e856
00000000-0000-0000-0000-000000000000	279	fwj7n7lezvez	1e90bb2c-2aae-490c-997d-2dc0cff18925	f	2025-12-02 11:33:43.301778+00	2025-12-02 11:33:43.301778+00	\N	4a9c7bd8-cbcd-416a-b62f-808d9db484f1
00000000-0000-0000-0000-000000000000	280	yyglougekphx	1e90bb2c-2aae-490c-997d-2dc0cff18925	f	2025-12-02 11:33:43.754631+00	2025-12-02 11:33:43.754631+00	\N	31e317a4-e0de-4ae9-a242-ca0912d2bc48
00000000-0000-0000-0000-000000000000	278	6g4waquqmlaw	7961dd5b-891f-48f5-89ce-f2fb84842db2	t	2025-12-02 11:25:37.061955+00	2025-12-02 12:24:06.191957+00	e5ho4sg4jkpa	d00fa953-d198-4d4c-9829-c979fb9e80f7
00000000-0000-0000-0000-000000000000	238	22oywzkwfuav	1e90bb2c-2aae-490c-997d-2dc0cff18925	t	2025-12-01 17:58:35.715235+00	2025-12-02 13:17:36.418499+00	\N	9d794018-4ac7-4066-8a62-eb910f60c6cc
00000000-0000-0000-0000-000000000000	285	ocusw73f4gpd	1e90bb2c-2aae-490c-997d-2dc0cff18925	f	2025-12-02 13:17:36.444453+00	2025-12-02 13:17:36.444453+00	22oywzkwfuav	9d794018-4ac7-4066-8a62-eb910f60c6cc
00000000-0000-0000-0000-000000000000	286	w2dydbpjcdr5	e391e4ca-6d57-4e97-9267-92187a1c8911	f	2025-12-02 13:19:26.385985+00	2025-12-02 13:19:26.385985+00	\N	23b7c982-c9f9-44d5-849c-2af0004911a0
00000000-0000-0000-0000-000000000000	287	lcwjcoiqtq46	e391e4ca-6d57-4e97-9267-92187a1c8911	f	2025-12-02 13:19:28.718247+00	2025-12-02 13:19:28.718247+00	\N	1185d613-5947-41a8-a5ce-f083f37ba676
00000000-0000-0000-0000-000000000000	288	zu37ngh4prz5	e391e4ca-6d57-4e97-9267-92187a1c8911	f	2025-12-02 13:19:59.553548+00	2025-12-02 13:19:59.553548+00	\N	1ffea53e-ac25-4ed5-abdb-282c4d4c114d
00000000-0000-0000-0000-000000000000	289	67tl6lih56ne	e391e4ca-6d57-4e97-9267-92187a1c8911	f	2025-12-02 13:20:00.405632+00	2025-12-02 13:20:00.405632+00	\N	9a3526c4-e526-4fc3-b27d-8d1c86a0920e
00000000-0000-0000-0000-000000000000	292	wvbengqgedw7	e391e4ca-6d57-4e97-9267-92187a1c8911	f	2025-12-02 13:29:23.973814+00	2025-12-02 13:29:23.973814+00	\N	b15c7062-7fa7-4b4d-b001-7587350d63c1
00000000-0000-0000-0000-000000000000	293	kuc4edshjo5c	e391e4ca-6d57-4e97-9267-92187a1c8911	f	2025-12-02 13:29:25.084926+00	2025-12-02 13:29:25.084926+00	\N	79088611-2389-4c23-8bf3-1f62f1683e38
00000000-0000-0000-0000-000000000000	297	t3i3qtwkdm7d	1e90bb2c-2aae-490c-997d-2dc0cff18925	f	2025-12-02 14:58:09.119388+00	2025-12-02 14:58:09.119388+00	\N	7ded0828-8514-415b-8373-1397f62327c8
00000000-0000-0000-0000-000000000000	298	yyhrphkivrgv	1e90bb2c-2aae-490c-997d-2dc0cff18925	f	2025-12-02 14:58:10.32162+00	2025-12-02 14:58:10.32162+00	\N	0d730f05-088d-4b49-88aa-0c86cdb0a8f8
00000000-0000-0000-0000-000000000000	300	aftrb3ioywum	34533694-0bbb-4853-9693-a2da2c05ee94	f	2025-12-02 15:54:52.609893+00	2025-12-02 15:54:52.609893+00	\N	a1ae078f-3d2e-4c6c-8f07-ee9b7c892cfb
00000000-0000-0000-0000-000000000000	301	573mxiblxy7a	34533694-0bbb-4853-9693-a2da2c05ee94	f	2025-12-02 15:54:53.308027+00	2025-12-02 15:54:53.308027+00	\N	50d72b23-ba40-42f8-a130-7f4d92b1626a
00000000-0000-0000-0000-000000000000	307	lumx4b2mvbdn	7961dd5b-891f-48f5-89ce-f2fb84842db2	f	2025-12-02 16:47:49.665826+00	2025-12-02 16:47:49.665826+00	\N	25a90fbe-2df0-419c-ac89-cd484b82fd7a
00000000-0000-0000-0000-000000000000	309	7pe2wywt2nmx	70685fb9-eb02-4884-b8fb-a96401f6e663	t	2025-12-02 16:52:53.480298+00	2025-12-02 16:58:25.092747+00	\N	711369f2-ec7a-4d75-a9e7-f8db086cabf0
00000000-0000-0000-0000-000000000000	310	tjlscko3auq6	70685fb9-eb02-4884-b8fb-a96401f6e663	f	2025-12-02 16:58:25.09651+00	2025-12-02 16:58:25.09651+00	7pe2wywt2nmx	711369f2-ec7a-4d75-a9e7-f8db086cabf0
00000000-0000-0000-0000-000000000000	315	6mtv3s2kxtif	7961dd5b-891f-48f5-89ce-f2fb84842db2	f	2025-12-02 17:17:36.520376+00	2025-12-02 17:17:36.520376+00	\N	53d2136e-c97e-4ec9-835d-be95b9de7a6f
00000000-0000-0000-0000-000000000000	317	5gxacp3v4wcd	e391e4ca-6d57-4e97-9267-92187a1c8911	f	2025-12-02 17:19:35.594006+00	2025-12-02 17:19:35.594006+00	\N	5ee7b89e-0b82-41f8-8cc8-1ffd9627ec36
00000000-0000-0000-0000-000000000000	318	5vj2vy7n7vly	e391e4ca-6d57-4e97-9267-92187a1c8911	f	2025-12-02 17:19:36.177241+00	2025-12-02 17:19:36.177241+00	\N	06c66b62-aba4-4e32-af6c-735784e9daf3
00000000-0000-0000-0000-000000000000	323	you3xfg37lye	1e90bb2c-2aae-490c-997d-2dc0cff18925	f	2025-12-02 17:24:30.132731+00	2025-12-02 17:24:30.132731+00	\N	ee8863b6-62ef-4eb3-9b23-126c3b330b29
00000000-0000-0000-0000-000000000000	324	5akyuxcnnt34	1e90bb2c-2aae-490c-997d-2dc0cff18925	f	2025-12-02 17:24:30.711729+00	2025-12-02 17:24:30.711729+00	\N	31c3bfb2-294f-4775-be97-7a7b782017e4
00000000-0000-0000-0000-000000000000	308	r7r574du37nn	7961dd5b-891f-48f5-89ce-f2fb84842db2	t	2025-12-02 16:47:50.144611+00	2025-12-02 17:57:44.088227+00	\N	f171a1a7-8be1-49ba-9e93-7058dddd8708
00000000-0000-0000-0000-000000000000	283	3i5zr5r36vpu	7961dd5b-891f-48f5-89ce-f2fb84842db2	t	2025-12-02 12:24:06.205197+00	2025-12-03 05:42:33.486367+00	6g4waquqmlaw	d00fa953-d198-4d4c-9829-c979fb9e80f7
00000000-0000-0000-0000-000000000000	329	kpeou2gpjy6b	3e076c78-e86b-4be1-83c2-8627cbe72a86	f	2025-12-02 17:43:46.519475+00	2025-12-02 17:43:46.519475+00	\N	c2de6c07-dd01-4041-99ad-dbf5b847b883
00000000-0000-0000-0000-000000000000	331	j3ivpfvzaad7	7961dd5b-891f-48f5-89ce-f2fb84842db2	f	2025-12-02 17:57:44.101009+00	2025-12-02 17:57:44.101009+00	r7r574du37nn	f171a1a7-8be1-49ba-9e93-7058dddd8708
00000000-0000-0000-0000-000000000000	332	o3tdwtvsiquv	9f7cbe52-d1e4-4310-aa79-6a300f5ccb6c	f	2025-12-02 17:58:13.099915+00	2025-12-02 17:58:13.099915+00	\N	0e1de774-1416-472e-9bce-19ed3614cbb6
00000000-0000-0000-0000-000000000000	333	4psahimhgcsr	6633dc36-aa0b-431e-a1d1-0a5993941950	f	2025-12-02 17:58:52.90763+00	2025-12-02 17:58:52.90763+00	\N	76055859-70c9-4d1b-b1a5-2cc7e7dfd656
00000000-0000-0000-0000-000000000000	390	pe2cp5zyy64g	1e90bb2c-2aae-490c-997d-2dc0cff18925	t	2025-12-03 10:59:09.618579+00	2025-12-03 12:46:46.203893+00	j5zxuutej6gb	7f8e29f3-22ce-4ba3-8dbe-9ec9d9502b57
00000000-0000-0000-0000-000000000000	396	pe325y3qt3pd	9f7cbe52-d1e4-4310-aa79-6a300f5ccb6c	f	2025-12-03 12:53:16.463084+00	2025-12-03 12:53:16.463084+00	a2tla6kvu3ae	c47be8dc-b77c-4365-960e-acac8d494d96
00000000-0000-0000-0000-000000000000	358	pzmlqdqeiqe5	9f7cbe52-d1e4-4310-aa79-6a300f5ccb6c	t	2025-12-03 05:27:13.944092+00	2025-12-03 13:43:47.640617+00	\N	1108d6cb-2344-440e-9a08-eca301469fb6
00000000-0000-0000-0000-000000000000	336	w5qno24ttxku	1e90bb2c-2aae-490c-997d-2dc0cff18925	f	2025-12-02 18:08:45.766574+00	2025-12-02 18:08:45.766574+00	\N	c5a5d14e-5ba2-40be-b3aa-9a2ecbb53543
00000000-0000-0000-0000-000000000000	344	lui3phm77xjg	1e90bb2c-2aae-490c-997d-2dc0cff18925	t	2025-12-02 19:06:51.851985+00	2025-12-03 13:45:13.515805+00	hcxww6wzldmr	212c2cdd-ef72-435e-a34e-f5c79326ce19
00000000-0000-0000-0000-000000000000	338	gbotm32vp4k6	9f7cbe52-d1e4-4310-aa79-6a300f5ccb6c	f	2025-12-02 18:10:16.072133+00	2025-12-02 18:10:16.072133+00	\N	be3642d9-eaee-4d35-b6e0-cbf622bc77a7
00000000-0000-0000-0000-000000000000	339	r3qk3umprxm2	9f7cbe52-d1e4-4310-aa79-6a300f5ccb6c	f	2025-12-02 18:10:16.537077+00	2025-12-02 18:10:16.537077+00	\N	18919b04-d3b3-4c36-b58b-616b7514f326
00000000-0000-0000-0000-000000000000	342	rw5zs3uqmsla	9f7cbe52-d1e4-4310-aa79-6a300f5ccb6c	f	2025-12-02 18:59:15.981698+00	2025-12-02 18:59:15.981698+00	\N	6cdda472-61e6-4650-b478-3603d3d79060
00000000-0000-0000-0000-000000000000	402	6q3etpp3ouiv	9f7cbe52-d1e4-4310-aa79-6a300f5ccb6c	t	2025-12-03 13:45:48.817827+00	2025-12-03 14:44:38.382512+00	\N	819c1fd5-7e0c-49f2-b0be-76144bc1d305
00000000-0000-0000-0000-000000000000	337	hcxww6wzldmr	1e90bb2c-2aae-490c-997d-2dc0cff18925	t	2025-12-02 18:08:46.357483+00	2025-12-02 19:06:51.840756+00	\N	212c2cdd-ef72-435e-a34e-f5c79326ce19
00000000-0000-0000-0000-000000000000	330	hdx6y75df7uy	3e076c78-e86b-4be1-83c2-8627cbe72a86	t	2025-12-02 17:43:47.077842+00	2025-12-03 15:33:37.067749+00	\N	429ee685-84a9-491c-8976-8d1a1e11674f
00000000-0000-0000-0000-000000000000	404	b6fjly4jpoa6	1e90bb2c-2aae-490c-997d-2dc0cff18925	t	2025-12-03 14:43:45.743957+00	2025-12-03 15:55:49.339357+00	wkkofuy7nous	212c2cdd-ef72-435e-a34e-f5c79326ce19
00000000-0000-0000-0000-000000000000	343	cjt5gqh5gchj	9f7cbe52-d1e4-4310-aa79-6a300f5ccb6c	t	2025-12-02 18:59:16.460799+00	2025-12-02 19:58:21.139806+00	\N	43538a7e-6d24-434b-89e1-62e3ab1d48a5
00000000-0000-0000-0000-000000000000	347	zmxqwlzhi7zp	9f7cbe52-d1e4-4310-aa79-6a300f5ccb6c	t	2025-12-02 19:58:21.155985+00	2025-12-03 04:57:40.367533+00	cjt5gqh5gchj	43538a7e-6d24-434b-89e1-62e3ab1d48a5
00000000-0000-0000-0000-000000000000	348	l44rw6bpfmol	9f7cbe52-d1e4-4310-aa79-6a300f5ccb6c	f	2025-12-03 04:57:40.376285+00	2025-12-03 04:57:40.376285+00	zmxqwlzhi7zp	43538a7e-6d24-434b-89e1-62e3ab1d48a5
00000000-0000-0000-0000-000000000000	349	n7dfe2mjuajx	1e90bb2c-2aae-490c-997d-2dc0cff18925	f	2025-12-03 05:02:23.305485+00	2025-12-03 05:02:23.305485+00	\N	dabdfbda-97d1-461d-b25e-67f0c4d213ef
00000000-0000-0000-0000-000000000000	350	jrduayserfi7	1e90bb2c-2aae-490c-997d-2dc0cff18925	f	2025-12-03 05:02:24.666967+00	2025-12-03 05:02:24.666967+00	\N	cdca2535-4910-40c4-9466-ab4328b1215b
00000000-0000-0000-0000-000000000000	351	75j324cngszo	9f7cbe52-d1e4-4310-aa79-6a300f5ccb6c	f	2025-12-03 05:15:16.443509+00	2025-12-03 05:15:16.443509+00	\N	087aa6ec-b447-45ec-80e2-07f3601612c1
00000000-0000-0000-0000-000000000000	352	u3x42t6cqwhp	9f7cbe52-d1e4-4310-aa79-6a300f5ccb6c	f	2025-12-03 05:15:17.372706+00	2025-12-03 05:15:17.372706+00	\N	b8186dc8-768a-49b6-a26f-75eb9fd0c1ed
00000000-0000-0000-0000-000000000000	355	6buxtijqvejd	1e90bb2c-2aae-490c-997d-2dc0cff18925	f	2025-12-03 05:17:43.964039+00	2025-12-03 05:17:43.964039+00	\N	6ce8291a-158c-41fe-8d02-977a398278ba
00000000-0000-0000-0000-000000000000	356	gurlbbuuoroc	1e90bb2c-2aae-490c-997d-2dc0cff18925	f	2025-12-03 05:17:44.481518+00	2025-12-03 05:17:44.481518+00	\N	e96538bb-c8fc-4b79-826f-765193e5474a
00000000-0000-0000-0000-000000000000	357	upgiwabsoz2a	9f7cbe52-d1e4-4310-aa79-6a300f5ccb6c	f	2025-12-03 05:27:13.222253+00	2025-12-03 05:27:13.222253+00	\N	1ba8a8d8-7394-4e9d-a2e6-21a9b705a6de
00000000-0000-0000-0000-000000000000	359	24dc5f4hcz3q	9f7cbe52-d1e4-4310-aa79-6a300f5ccb6c	f	2025-12-03 05:28:03.383693+00	2025-12-03 05:28:03.383693+00	\N	7718f6ac-64a9-42f3-8af5-2a4211a3f80d
00000000-0000-0000-0000-000000000000	360	jxuhxt2oe3w2	9f7cbe52-d1e4-4310-aa79-6a300f5ccb6c	f	2025-12-03 05:28:03.665412+00	2025-12-03 05:28:03.665412+00	\N	2cb7cd27-0616-4b1e-aa1e-33643d9722eb
00000000-0000-0000-0000-000000000000	361	oqq5uomumnp3	7961dd5b-891f-48f5-89ce-f2fb84842db2	f	2025-12-03 05:42:33.509688+00	2025-12-03 05:42:33.509688+00	3i5zr5r36vpu	d00fa953-d198-4d4c-9829-c979fb9e80f7
00000000-0000-0000-0000-000000000000	362	en3ighnhsu76	9f7cbe52-d1e4-4310-aa79-6a300f5ccb6c	f	2025-12-03 05:42:54.992049+00	2025-12-03 05:42:54.992049+00	\N	bb468a87-e2c3-497b-b56a-9264f030477e
00000000-0000-0000-0000-000000000000	363	w4lb57vojq6a	9f7cbe52-d1e4-4310-aa79-6a300f5ccb6c	f	2025-12-03 05:42:55.304191+00	2025-12-03 05:42:55.304191+00	\N	9b6e4d1c-894e-4271-91d1-a228e13f421f
00000000-0000-0000-0000-000000000000	364	4h5pcuqlrpfh	9f7cbe52-d1e4-4310-aa79-6a300f5ccb6c	f	2025-12-03 05:44:14.423637+00	2025-12-03 05:44:14.423637+00	\N	18a4198b-7b79-4414-9876-072387de4397
00000000-0000-0000-0000-000000000000	365	a2smc6cyzs6k	9f7cbe52-d1e4-4310-aa79-6a300f5ccb6c	f	2025-12-03 05:44:14.661719+00	2025-12-03 05:44:14.661719+00	\N	5e6ebdd0-d210-4085-b47e-aa5aaefb4193
00000000-0000-0000-0000-000000000000	366	fomrazqjx3lc	9f7cbe52-d1e4-4310-aa79-6a300f5ccb6c	f	2025-12-03 05:48:31.737926+00	2025-12-03 05:48:31.737926+00	\N	68147b61-b7cb-442a-9183-d6f70179b486
00000000-0000-0000-0000-000000000000	367	vne6txy7ue66	9f7cbe52-d1e4-4310-aa79-6a300f5ccb6c	f	2025-12-03 05:48:32.011198+00	2025-12-03 05:48:32.011198+00	\N	c253988c-5916-4a6f-9bd6-c004f5a395c3
00000000-0000-0000-0000-000000000000	368	hyqw23pfbs5h	9f7cbe52-d1e4-4310-aa79-6a300f5ccb6c	f	2025-12-03 05:51:32.352916+00	2025-12-03 05:51:32.352916+00	\N	9d758a45-ff1e-415f-a0c6-a2b4744318b3
00000000-0000-0000-0000-000000000000	370	6csiqfdf6w5p	9f7cbe52-d1e4-4310-aa79-6a300f5ccb6c	f	2025-12-03 06:05:39.720694+00	2025-12-03 06:05:39.720694+00	\N	c534dab9-da36-4cf6-bec0-ba5426fcf931
00000000-0000-0000-0000-000000000000	371	r5va2kb5dpcq	9f7cbe52-d1e4-4310-aa79-6a300f5ccb6c	f	2025-12-03 06:05:40.009475+00	2025-12-03 06:05:40.009475+00	\N	1fcd3d16-8ffb-4c3a-9d5b-c02364c19415
00000000-0000-0000-0000-000000000000	372	jinjganglpfe	1e90bb2c-2aae-490c-997d-2dc0cff18925	f	2025-12-03 06:08:19.300433+00	2025-12-03 06:08:19.300433+00	\N	b561a38a-3b35-4d11-b044-b3e910b00c15
00000000-0000-0000-0000-000000000000	373	jdmvnldeyina	1e90bb2c-2aae-490c-997d-2dc0cff18925	f	2025-12-03 06:08:19.582456+00	2025-12-03 06:08:19.582456+00	\N	30b4a224-ca43-46cf-8255-20144b16a821
00000000-0000-0000-0000-000000000000	378	g7hlw7allbwq	1e90bb2c-2aae-490c-997d-2dc0cff18925	f	2025-12-03 06:16:11.871405+00	2025-12-03 06:16:11.871405+00	\N	482f187d-af46-4090-8d63-3a18f290af2a
00000000-0000-0000-0000-000000000000	369	3l34nzxiaryk	9f7cbe52-d1e4-4310-aa79-6a300f5ccb6c	t	2025-12-03 05:51:32.675341+00	2025-12-03 07:01:10.498217+00	\N	d5e16d25-31da-40f3-924b-406f8ca0a5f2
00000000-0000-0000-0000-000000000000	380	nofvf6b22cdn	9f7cbe52-d1e4-4310-aa79-6a300f5ccb6c	t	2025-12-03 07:01:10.5243+00	2025-12-03 08:24:18.872245+00	3l34nzxiaryk	d5e16d25-31da-40f3-924b-406f8ca0a5f2
00000000-0000-0000-0000-000000000000	381	ug7nt23l36gd	9f7cbe52-d1e4-4310-aa79-6a300f5ccb6c	f	2025-12-03 08:24:18.890836+00	2025-12-03 08:24:18.890836+00	nofvf6b22cdn	d5e16d25-31da-40f3-924b-406f8ca0a5f2
00000000-0000-0000-0000-000000000000	379	3ye2r2nlogjy	1e90bb2c-2aae-490c-997d-2dc0cff18925	t	2025-12-03 06:16:12.436789+00	2025-12-03 08:24:44.742071+00	\N	5f8a88c2-8eee-44bf-a270-7ddfd6f9f816
00000000-0000-0000-0000-000000000000	382	ods5yuvwjwdy	1e90bb2c-2aae-490c-997d-2dc0cff18925	f	2025-12-03 08:24:44.743528+00	2025-12-03 08:24:44.743528+00	3ye2r2nlogjy	5f8a88c2-8eee-44bf-a270-7ddfd6f9f816
00000000-0000-0000-0000-000000000000	383	tqyjayn7b45q	1e90bb2c-2aae-490c-997d-2dc0cff18925	f	2025-12-03 08:24:50.746309+00	2025-12-03 08:24:50.746309+00	\N	19544976-d400-4f22-a01a-a7247327d0fe
00000000-0000-0000-0000-000000000000	386	xetj5aiyue3z	9f7cbe52-d1e4-4310-aa79-6a300f5ccb6c	f	2025-12-03 08:25:39.119432+00	2025-12-03 08:25:39.119432+00	\N	4a300d0c-5961-49a9-bdea-cff6de4c9fb5
00000000-0000-0000-0000-000000000000	387	7rfnoh7i4xn5	9f7cbe52-d1e4-4310-aa79-6a300f5ccb6c	t	2025-12-03 08:25:39.400354+00	2025-12-03 10:55:51.151526+00	\N	c47be8dc-b77c-4365-960e-acac8d494d96
00000000-0000-0000-0000-000000000000	384	j5zxuutej6gb	1e90bb2c-2aae-490c-997d-2dc0cff18925	t	2025-12-03 08:24:51.022458+00	2025-12-03 10:59:09.616367+00	\N	7f8e29f3-22ce-4ba3-8dbe-9ec9d9502b57
00000000-0000-0000-0000-000000000000	389	hs7kql4ysoc7	9f7cbe52-d1e4-4310-aa79-6a300f5ccb6c	t	2025-12-03 10:55:51.180467+00	2025-12-03 11:54:33.705644+00	7rfnoh7i4xn5	c47be8dc-b77c-4365-960e-acac8d494d96
00000000-0000-0000-0000-000000000000	392	a2tla6kvu3ae	9f7cbe52-d1e4-4310-aa79-6a300f5ccb6c	t	2025-12-03 11:54:33.73146+00	2025-12-03 12:53:16.444722+00	hs7kql4ysoc7	c47be8dc-b77c-4365-960e-acac8d494d96
00000000-0000-0000-0000-000000000000	397	e7op374ywxeu	9f7cbe52-d1e4-4310-aa79-6a300f5ccb6c	f	2025-12-03 13:43:47.658811+00	2025-12-03 13:43:47.658811+00	pzmlqdqeiqe5	1108d6cb-2344-440e-9a08-eca301469fb6
00000000-0000-0000-0000-000000000000	406	6kbw76qlorul	7961dd5b-891f-48f5-89ce-f2fb84842db2	f	2025-12-03 15:33:28.530325+00	2025-12-03 15:33:28.530325+00	n22kfg736foy	1808d7f0-632e-48e2-8bc1-356023d26f6e
00000000-0000-0000-0000-000000000000	407	2joulzbw3otn	3e076c78-e86b-4be1-83c2-8627cbe72a86	f	2025-12-03 15:33:37.068584+00	2025-12-03 15:33:37.068584+00	hdx6y75df7uy	429ee685-84a9-491c-8976-8d1a1e11674f
00000000-0000-0000-0000-000000000000	408	miqcqvsaddvd	9f7cbe52-d1e4-4310-aa79-6a300f5ccb6c	f	2025-12-03 15:33:56.117947+00	2025-12-03 15:33:56.117947+00	\N	4e930e71-ee57-4bc6-9e62-759a4235a3a1
00000000-0000-0000-0000-000000000000	412	ytxvmnrxbfm7	1e90bb2c-2aae-490c-997d-2dc0cff18925	f	2025-12-03 15:35:23.262983+00	2025-12-03 15:35:23.262983+00	\N	04707c19-b84a-407f-a019-85195cb35cbc
00000000-0000-0000-0000-000000000000	414	yrpxeky6gwr5	5ca81099-f4c1-4f7d-879d-061f6c393022	f	2025-12-03 15:35:42.280581+00	2025-12-03 15:35:42.280581+00	\N	3824e28f-89e8-4f19-bc7f-b38dd8b33845
00000000-0000-0000-0000-000000000000	409	dabwqcwtjnqo	9f7cbe52-d1e4-4310-aa79-6a300f5ccb6c	t	2025-12-03 15:33:56.724396+00	2025-12-03 16:41:28.737267+00	\N	f25fbc19-4a6b-4eb6-8714-272fe7ddcce9
00000000-0000-0000-0000-000000000000	417	335dixfgnda4	9f7cbe52-d1e4-4310-aa79-6a300f5ccb6c	f	2025-12-03 16:41:28.75706+00	2025-12-03 16:41:28.75706+00	dabwqcwtjnqo	f25fbc19-4a6b-4eb6-8714-272fe7ddcce9
00000000-0000-0000-0000-000000000000	415	6fcxlj5qm6gs	5ca81099-f4c1-4f7d-879d-061f6c393022	t	2025-12-03 15:35:42.798663+00	2025-12-03 16:41:59.05382+00	\N	44964f0a-2cbf-4383-8408-15ef03c79f12
00000000-0000-0000-0000-000000000000	418	z6gg7p5ywktw	5ca81099-f4c1-4f7d-879d-061f6c393022	f	2025-12-03 16:41:59.055788+00	2025-12-03 16:41:59.055788+00	6fcxlj5qm6gs	44964f0a-2cbf-4383-8408-15ef03c79f12
00000000-0000-0000-0000-000000000000	413	3prpxho5jspq	1e90bb2c-2aae-490c-997d-2dc0cff18925	t	2025-12-03 15:35:23.693163+00	2025-12-03 16:54:01.220674+00	\N	b873cac1-d533-488c-bdea-0e34c513b604
00000000-0000-0000-0000-000000000000	419	33nvu4o6zegm	1e90bb2c-2aae-490c-997d-2dc0cff18925	f	2025-12-03 16:54:01.230624+00	2025-12-03 16:54:01.230624+00	3prpxho5jspq	b873cac1-d533-488c-bdea-0e34c513b604
00000000-0000-0000-0000-000000000000	416	2hcyck7bdfet	1e90bb2c-2aae-490c-997d-2dc0cff18925	t	2025-12-03 15:55:49.359334+00	2025-12-03 16:54:01.258327+00	b6fjly4jpoa6	212c2cdd-ef72-435e-a34e-f5c79326ce19
00000000-0000-0000-0000-000000000000	421	io54nnuddqge	34533694-0bbb-4853-9693-a2da2c05ee94	f	2025-12-03 17:04:20.1008+00	2025-12-03 17:04:20.1008+00	2p7bl27bw3a3	63ffd90b-fef2-4e63-be34-60dca8043fe8
00000000-0000-0000-0000-000000000000	422	szrqsalafbzr	1e90bb2c-2aae-490c-997d-2dc0cff18925	f	2025-12-03 17:04:47.798202+00	2025-12-03 17:04:47.798202+00	\N	d4192267-ff11-4ff9-8351-7944c516e011
00000000-0000-0000-0000-000000000000	424	puyjh6ytfu7u	9f7cbe52-d1e4-4310-aa79-6a300f5ccb6c	f	2025-12-03 17:06:28.67689+00	2025-12-03 17:06:28.67689+00	\N	f7c4bd8e-5ef5-46d0-9fa1-1319c695eb40
00000000-0000-0000-0000-000000000000	426	wdaok4algwm5	5ca81099-f4c1-4f7d-879d-061f6c393022	f	2025-12-03 17:06:43.825488+00	2025-12-03 17:06:43.825488+00	\N	821717bd-2356-470b-8f1b-73899772008e
00000000-0000-0000-0000-000000000000	428	eqz5bzblhvot	5ca81099-f4c1-4f7d-879d-061f6c393022	f	2025-12-03 17:15:50.610439+00	2025-12-03 17:15:50.610439+00	\N	0b53fe3b-d554-4589-867e-285de725db59
00000000-0000-0000-0000-000000000000	405	s7qg63drpr67	9f7cbe52-d1e4-4310-aa79-6a300f5ccb6c	t	2025-12-03 14:44:38.402784+00	2025-12-03 17:15:57.548948+00	6q3etpp3ouiv	819c1fd5-7e0c-49f2-b0be-76144bc1d305
00000000-0000-0000-0000-000000000000	431	harsey4k33rn	9f7cbe52-d1e4-4310-aa79-6a300f5ccb6c	f	2025-12-03 17:45:26.453175+00	2025-12-03 17:45:26.453175+00	\N	7e271af5-594f-4f33-8871-bf60bb535e72
00000000-0000-0000-0000-000000000000	432	2jb5y357htrx	9f7cbe52-d1e4-4310-aa79-6a300f5ccb6c	f	2025-12-03 17:45:27.615463+00	2025-12-03 17:45:27.615463+00	\N	197004c6-c400-4123-80a8-922f5c7e0aa9
00000000-0000-0000-0000-000000000000	433	l2vnkpx3xrwx	5ca81099-f4c1-4f7d-879d-061f6c393022	f	2025-12-03 17:46:02.381213+00	2025-12-03 17:46:02.381213+00	\N	9a2c4217-da3b-4286-807d-2185058afb0d
00000000-0000-0000-0000-000000000000	420	o2xqghmf5ili	1e90bb2c-2aae-490c-997d-2dc0cff18925	t	2025-12-03 16:54:01.259285+00	2025-12-03 17:56:22.70505+00	2hcyck7bdfet	212c2cdd-ef72-435e-a34e-f5c79326ce19
00000000-0000-0000-0000-000000000000	435	hpdoemhm4gi5	1e90bb2c-2aae-490c-997d-2dc0cff18925	f	2025-12-03 17:56:22.711085+00	2025-12-03 17:56:22.711085+00	o2xqghmf5ili	212c2cdd-ef72-435e-a34e-f5c79326ce19
00000000-0000-0000-0000-000000000000	423	phahmvnft5q5	1e90bb2c-2aae-490c-997d-2dc0cff18925	t	2025-12-03 17:04:48.587714+00	2025-12-03 18:03:05.893892+00	\N	28389e73-2e65-4bef-ae56-8dd0f4cac6e5
00000000-0000-0000-0000-000000000000	425	pmpyw43wo5og	9f7cbe52-d1e4-4310-aa79-6a300f5ccb6c	t	2025-12-03 17:06:29.918793+00	2025-12-03 18:04:35.609501+00	\N	72770526-23aa-457c-8dea-d8a902e5fd6d
00000000-0000-0000-0000-000000000000	427	ofrbv5dmief7	5ca81099-f4c1-4f7d-879d-061f6c393022	t	2025-12-03 17:06:44.673504+00	2025-12-03 18:05:35.638128+00	\N	c9554983-a2fe-4194-9856-7d2f0da4bcf7
00000000-0000-0000-0000-000000000000	438	csles4jbojjb	5ca81099-f4c1-4f7d-879d-061f6c393022	f	2025-12-03 18:05:35.638521+00	2025-12-03 18:05:35.638521+00	ofrbv5dmief7	c9554983-a2fe-4194-9856-7d2f0da4bcf7
00000000-0000-0000-0000-000000000000	429	ni65rbq4g7bi	5ca81099-f4c1-4f7d-879d-061f6c393022	t	2025-12-03 17:15:51.260306+00	2025-12-03 18:14:36.144441+00	\N	28477f6a-2317-43e8-9ca1-28506807348d
00000000-0000-0000-0000-000000000000	439	oqpiakbt773u	5ca81099-f4c1-4f7d-879d-061f6c393022	f	2025-12-03 18:14:36.174896+00	2025-12-03 18:14:36.174896+00	ni65rbq4g7bi	28477f6a-2317-43e8-9ca1-28506807348d
00000000-0000-0000-0000-000000000000	430	dwksolm223vp	9f7cbe52-d1e4-4310-aa79-6a300f5ccb6c	t	2025-12-03 17:15:57.550745+00	2025-12-03 18:14:36.23554+00	s7qg63drpr67	819c1fd5-7e0c-49f2-b0be-76144bc1d305
00000000-0000-0000-0000-000000000000	440	ux7op5kmxnbo	9f7cbe52-d1e4-4310-aa79-6a300f5ccb6c	f	2025-12-03 18:14:36.237049+00	2025-12-03 18:14:36.237049+00	dwksolm223vp	819c1fd5-7e0c-49f2-b0be-76144bc1d305
00000000-0000-0000-0000-000000000000	436	iml7lpic7z5f	1e90bb2c-2aae-490c-997d-2dc0cff18925	t	2025-12-03 18:03:05.912741+00	2025-12-03 19:01:35.99121+00	phahmvnft5q5	28389e73-2e65-4bef-ae56-8dd0f4cac6e5
00000000-0000-0000-0000-000000000000	437	w6g64tnbnwmn	9f7cbe52-d1e4-4310-aa79-6a300f5ccb6c	t	2025-12-03 18:04:35.609952+00	2025-12-03 19:02:39.848572+00	pmpyw43wo5og	72770526-23aa-457c-8dea-d8a902e5fd6d
00000000-0000-0000-0000-000000000000	441	2wy7llvdb4bd	1e90bb2c-2aae-490c-997d-2dc0cff18925	t	2025-12-03 19:01:36.015311+00	2025-12-03 20:00:36.542303+00	iml7lpic7z5f	28389e73-2e65-4bef-ae56-8dd0f4cac6e5
00000000-0000-0000-0000-000000000000	442	r43yncomltma	9f7cbe52-d1e4-4310-aa79-6a300f5ccb6c	t	2025-12-03 19:02:39.850827+00	2025-12-03 20:01:35.744904+00	w6g64tnbnwmn	72770526-23aa-457c-8dea-d8a902e5fd6d
00000000-0000-0000-0000-000000000000	443	rjk3rcowrheo	1e90bb2c-2aae-490c-997d-2dc0cff18925	t	2025-12-03 20:00:36.567839+00	2025-12-04 03:14:10.906016+00	2wy7llvdb4bd	28389e73-2e65-4bef-ae56-8dd0f4cac6e5
00000000-0000-0000-0000-000000000000	444	wxfiuboxlovq	9f7cbe52-d1e4-4310-aa79-6a300f5ccb6c	t	2025-12-03 20:01:35.745513+00	2025-12-04 03:14:11.861153+00	r43yncomltma	72770526-23aa-457c-8dea-d8a902e5fd6d
00000000-0000-0000-0000-000000000000	446	ns7rgxyowghs	9f7cbe52-d1e4-4310-aa79-6a300f5ccb6c	t	2025-12-04 03:14:11.863738+00	2025-12-04 04:12:28.985803+00	wxfiuboxlovq	72770526-23aa-457c-8dea-d8a902e5fd6d
00000000-0000-0000-0000-000000000000	445	mc2br64iqede	1e90bb2c-2aae-490c-997d-2dc0cff18925	t	2025-12-04 03:14:10.940635+00	2025-12-04 04:12:28.989449+00	rjk3rcowrheo	28389e73-2e65-4bef-ae56-8dd0f4cac6e5
00000000-0000-0000-0000-000000000000	447	4mof7yqbogpx	1e90bb2c-2aae-490c-997d-2dc0cff18925	f	2025-12-04 04:12:29.004085+00	2025-12-04 04:12:29.004085+00	mc2br64iqede	28389e73-2e65-4bef-ae56-8dd0f4cac6e5
00000000-0000-0000-0000-000000000000	448	56nojccsl2kb	9f7cbe52-d1e4-4310-aa79-6a300f5ccb6c	f	2025-12-04 04:12:29.004872+00	2025-12-04 04:12:29.004872+00	ns7rgxyowghs	72770526-23aa-457c-8dea-d8a902e5fd6d
00000000-0000-0000-0000-000000000000	434	qpdrwrnnzkr6	5ca81099-f4c1-4f7d-879d-061f6c393022	t	2025-12-03 17:46:03.873321+00	2025-12-04 06:33:15.257737+00	\N	e8b8d12e-d09a-460c-a75e-0e5000d2820e
00000000-0000-0000-0000-000000000000	449	h4kj732gkssw	5ca81099-f4c1-4f7d-879d-061f6c393022	f	2025-12-04 06:33:15.290586+00	2025-12-04 06:33:15.290586+00	qpdrwrnnzkr6	e8b8d12e-d09a-460c-a75e-0e5000d2820e
\.


--
-- Data for Name: saml_providers; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.saml_providers (id, sso_provider_id, entity_id, metadata_xml, metadata_url, attribute_mapping, created_at, updated_at, name_id_format) FROM stdin;
\.


--
-- Data for Name: saml_relay_states; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.saml_relay_states (id, sso_provider_id, request_id, for_email, redirect_to, created_at, updated_at, flow_state_id) FROM stdin;
\.


--
-- Data for Name: schema_migrations; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.schema_migrations (version) FROM stdin;
20171026211738
20171026211808
20171026211834
20180103212743
20180108183307
20180119214651
20180125194653
00
20210710035447
20210722035447
20210730183235
20210909172000
20210927181326
20211122151130
20211124214934
20211202183645
20220114185221
20220114185340
20220224000811
20220323170000
20220429102000
20220531120530
20220614074223
20220811173540
20221003041349
20221003041400
20221011041400
20221020193600
20221021073300
20221021082433
20221027105023
20221114143122
20221114143410
20221125140132
20221208132122
20221215195500
20221215195800
20221215195900
20230116124310
20230116124412
20230131181311
20230322519590
20230402418590
20230411005111
20230508135423
20230523124323
20230818113222
20230914180801
20231027141322
20231114161723
20231117164230
20240115144230
20240214120130
20240306115329
20240314092811
20240427152123
20240612123726
20240729123726
20240802193726
20240806073726
20241009103726
20250717082212
20250731150234
20250804100000
20250901200500
20250903112500
20250904133000
20250925093508
20251007112900
20251104100000
20251111201300
\.


--
-- Data for Name: sessions; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.sessions (id, user_id, created_at, updated_at, factor_id, aal, not_after, refreshed_at, user_agent, ip, tag, oauth_client_id, refresh_token_hmac_key, refresh_token_counter, scopes) FROM stdin;
314c7281-dd42-4932-9b68-8544ee70ed88	aa979816-d19c-42c6-9343-c58b55f5311d	2025-11-23 20:43:49.637856+00	2025-11-23 20:43:49.637856+00	\N	aal1	\N	\N	node	117.234.58.31	\N	\N	\N	\N	\N
97cd56da-5524-485b-9371-8b9c0c59ee59	7961dd5b-891f-48f5-89ce-f2fb84842db2	2025-12-02 10:26:13.915149+00	2025-12-02 10:26:13.915149+00	\N	aal1	\N	\N	node	59.183.62.70	\N	\N	\N	\N	\N
9c9cc82d-ac2f-4cae-9bfb-d134d5b73c0a	62ba3539-985e-4902-9fc8-07d1e4a9f70d	2025-11-26 15:00:43.796529+00	2025-11-26 16:56:24.229944+00	\N	aal1	\N	2025-11-26 16:56:24.227819	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	106.219.192.33	\N	\N	\N	\N	\N
c253988c-5916-4a6f-9bd6-c004f5a395c3	9f7cbe52-d1e4-4310-aa79-6a300f5ccb6c	2025-12-03 05:48:32.009337+00	2025-12-03 05:48:32.009337+00	\N	aal1	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	59.89.132.97	\N	\N	\N	\N	\N
711369f2-ec7a-4d75-a9e7-f8db086cabf0	70685fb9-eb02-4884-b8fb-a96401f6e663	2025-12-02 16:52:53.470647+00	2025-12-02 16:58:25.107795+00	\N	aal1	\N	2025-12-02 16:58:25.104106	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Mobile Safari/537.36	49.43.163.42	\N	\N	\N	\N	\N
ee8863b6-62ef-4eb3-9b23-126c3b330b29	1e90bb2c-2aae-490c-997d-2dc0cff18925	2025-12-02 17:24:30.125319+00	2025-12-02 17:24:30.125319+00	\N	aal1	\N	\N	node	106.205.175.104	\N	\N	\N	\N	\N
31c3bfb2-294f-4775-be97-7a7b782017e4	1e90bb2c-2aae-490c-997d-2dc0cff18925	2025-12-02 17:24:30.710574+00	2025-12-02 17:24:30.710574+00	\N	aal1	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	106.205.175.104	\N	\N	\N	\N	\N
dabdfbda-97d1-461d-b25e-67f0c4d213ef	1e90bb2c-2aae-490c-997d-2dc0cff18925	2025-12-03 05:02:23.274105+00	2025-12-03 05:02:23.274105+00	\N	aal1	\N	\N	node	106.205.175.104	\N	\N	\N	\N	\N
1ba8a8d8-7394-4e9d-a2e6-21a9b705a6de	9f7cbe52-d1e4-4310-aa79-6a300f5ccb6c	2025-12-03 05:27:13.199382+00	2025-12-03 05:27:13.199382+00	\N	aal1	\N	\N	node	106.205.175.104	\N	\N	\N	\N	\N
68147b61-b7cb-442a-9183-d6f70179b486	9f7cbe52-d1e4-4310-aa79-6a300f5ccb6c	2025-12-03 05:48:31.734128+00	2025-12-03 05:48:31.734128+00	\N	aal1	\N	\N	node	59.89.132.97	\N	\N	\N	\N	\N
7fcd0ca9-5959-4b2f-b233-6dc387eb49a8	7961dd5b-891f-48f5-89ce-f2fb84842db2	2025-12-02 05:35:46.848695+00	2025-12-02 05:35:46.848695+00	\N	aal1	\N	\N	node	59.183.62.70	\N	\N	\N	\N	\N
4139053c-c77e-4818-829a-f0c54a8c49d7	1e90bb2c-2aae-490c-997d-2dc0cff18925	2025-12-01 15:39:28.850015+00	2025-12-01 15:39:28.850015+00	\N	aal1	\N	\N	node	110.226.193.243	\N	\N	\N	\N	\N
11f1a603-cca7-4256-aa42-0251dee78be8	1e90bb2c-2aae-490c-997d-2dc0cff18925	2025-12-01 15:36:13.496111+00	2025-12-01 15:36:13.496111+00	\N	aal1	\N	\N	node	110.226.193.243	\N	\N	\N	\N	\N
d2d2732e-25d5-4e1c-b2dc-311d407a4148	1e90bb2c-2aae-490c-997d-2dc0cff18925	2025-12-01 15:36:23.585608+00	2025-12-01 15:36:23.585608+00	\N	aal1	\N	\N	node	110.226.193.243	\N	\N	\N	\N	\N
264562c1-919c-4cb9-b087-35de9a339df6	62ba3539-985e-4902-9fc8-07d1e4a9f70d	2025-11-26 15:00:41.476346+00	2025-11-26 15:00:41.476346+00	\N	aal1	\N	\N	node	106.219.192.33	\N	\N	\N	\N	\N
21fa1d13-5d5d-4278-8037-91801a5830ea	a75d2995-1604-45b3-a48e-e696b48df99b	2025-11-26 15:47:40.939172+00	2025-11-26 15:47:40.939172+00	\N	aal1	\N	\N	node	106.219.192.33	\N	\N	\N	\N	\N
854f35dd-2587-4c1c-9054-3fe1203c5116	1e90bb2c-2aae-490c-997d-2dc0cff18925	2025-12-01 15:37:17.653717+00	2025-12-01 15:37:17.653717+00	\N	aal1	\N	\N	node	110.226.193.243	\N	\N	\N	\N	\N
dd367520-c2d0-4d6f-87e5-f25f8e9b75d0	1e90bb2c-2aae-490c-997d-2dc0cff18925	2025-12-01 15:37:41.302803+00	2025-12-01 15:37:41.302803+00	\N	aal1	\N	\N	node	110.226.193.243	\N	\N	\N	\N	\N
908a6f2f-6773-4e07-a686-da9c6a780b0b	62ba3539-985e-4902-9fc8-07d1e4a9f70d	2025-11-26 16:50:24.471548+00	2025-11-26 16:50:24.471548+00	\N	aal1	\N	\N	node	106.219.192.33	\N	\N	\N	\N	\N
990daa41-f0bc-4e8b-887b-af875ce0ef2e	62ba3539-985e-4902-9fc8-07d1e4a9f70d	2025-11-26 16:50:24.798479+00	2025-11-26 16:50:24.798479+00	\N	aal1	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	106.219.192.33	\N	\N	\N	\N	\N
4fce5e23-5398-4e12-b562-0e9b421aa5af	1e90bb2c-2aae-490c-997d-2dc0cff18925	2025-12-01 15:39:11.115195+00	2025-12-01 15:39:11.115195+00	\N	aal1	\N	\N	node	110.226.193.243	\N	\N	\N	\N	\N
c52bd62d-8048-4b9d-ba31-bb6f104a0d20	1e90bb2c-2aae-490c-997d-2dc0cff18925	2025-12-01 15:39:21.247534+00	2025-12-01 15:39:21.247534+00	\N	aal1	\N	\N	node	110.226.193.243	\N	\N	\N	\N	\N
bba770db-95db-4176-9e95-b936e1f2ddd3	1e90bb2c-2aae-490c-997d-2dc0cff18925	2025-12-01 15:40:29.257781+00	2025-12-01 15:40:29.257781+00	\N	aal1	\N	\N	node	110.226.193.243	\N	\N	\N	\N	\N
aa73373c-0847-4dfe-8017-ed6b9c1906aa	1e90bb2c-2aae-490c-997d-2dc0cff18925	2025-12-01 15:47:28.652081+00	2025-12-01 15:47:28.652081+00	\N	aal1	\N	\N	node	110.226.193.243	\N	\N	\N	\N	\N
8add6a55-4e43-4cc9-a685-2275e89cdc1f	1e90bb2c-2aae-490c-997d-2dc0cff18925	2025-12-01 15:47:45.167972+00	2025-12-01 15:47:45.167972+00	\N	aal1	\N	\N	node	110.226.193.243	\N	\N	\N	\N	\N
25246687-15f6-4985-95a3-52c1e1c1b98e	1e90bb2c-2aae-490c-997d-2dc0cff18925	2025-12-01 15:47:54.055748+00	2025-12-01 15:47:54.055748+00	\N	aal1	\N	\N	node	110.226.193.243	\N	\N	\N	\N	\N
9b7b0043-7d30-4c7b-b88a-b4ef6226735c	1e90bb2c-2aae-490c-997d-2dc0cff18925	2025-12-01 15:48:09.565728+00	2025-12-01 15:48:09.565728+00	\N	aal1	\N	\N	node	110.226.193.243	\N	\N	\N	\N	\N
34b25e6a-613a-4368-920f-fea353f1163b	1e90bb2c-2aae-490c-997d-2dc0cff18925	2025-12-01 15:48:24.19472+00	2025-12-01 15:48:24.19472+00	\N	aal1	\N	\N	node	110.226.193.243	\N	\N	\N	\N	\N
7babd138-e1e1-45c5-95f2-1e1c3408570d	1e90bb2c-2aae-490c-997d-2dc0cff18925	2025-12-01 15:54:24.17604+00	2025-12-01 15:54:24.17604+00	\N	aal1	\N	\N	node	110.226.193.243	\N	\N	\N	\N	\N
4997b0c6-1a03-4ca0-b2fc-3e831bc938a3	1e90bb2c-2aae-490c-997d-2dc0cff18925	2025-12-01 15:54:25.007237+00	2025-12-01 15:54:25.007237+00	\N	aal1	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	110.226.193.243	\N	\N	\N	\N	\N
f0caf471-7946-4ed7-b290-03db199bcf3c	1e90bb2c-2aae-490c-997d-2dc0cff18925	2025-12-01 15:54:38.814494+00	2025-12-01 15:54:38.814494+00	\N	aal1	\N	\N	node	110.226.193.243	\N	\N	\N	\N	\N
4b18daf7-8a87-4a45-a4e8-6a16ea46f55d	1e90bb2c-2aae-490c-997d-2dc0cff18925	2025-12-01 15:54:39.337357+00	2025-12-01 15:54:39.337357+00	\N	aal1	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	110.226.193.243	\N	\N	\N	\N	\N
5242a8f1-7155-43f1-ac57-359eff61459d	1e90bb2c-2aae-490c-997d-2dc0cff18925	2025-12-01 15:54:50.705662+00	2025-12-01 15:54:50.705662+00	\N	aal1	\N	\N	node	110.226.193.243	\N	\N	\N	\N	\N
2f910e7d-e5ea-4b80-a8ff-cd5655dcc842	1e90bb2c-2aae-490c-997d-2dc0cff18925	2025-12-01 15:54:51.185655+00	2025-12-01 15:54:51.185655+00	\N	aal1	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	110.226.193.243	\N	\N	\N	\N	\N
f956c228-98bf-4dd9-89d3-c3132e3b7475	1e90bb2c-2aae-490c-997d-2dc0cff18925	2025-12-01 16:05:23.536788+00	2025-12-01 16:05:23.536788+00	\N	aal1	\N	\N	node	110.226.193.243	\N	\N	\N	\N	\N
b5e82d08-0699-4eb2-81bf-2807a1720546	1e90bb2c-2aae-490c-997d-2dc0cff18925	2025-12-01 16:05:24.56276+00	2025-12-01 16:05:24.56276+00	\N	aal1	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	110.226.193.243	\N	\N	\N	\N	\N
ebc59462-733e-4eff-b214-38ee27c2c111	057e2aa7-9db5-46e6-b6b2-b1cbead41bab	2025-12-01 16:06:23.146016+00	2025-12-01 16:06:23.146016+00	\N	aal1	\N	\N	node	110.226.193.243	\N	\N	\N	\N	\N
7aaa1305-d340-4827-8466-c8bb7ef2d570	057e2aa7-9db5-46e6-b6b2-b1cbead41bab	2025-12-01 16:06:23.834152+00	2025-12-01 16:06:23.834152+00	\N	aal1	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	110.226.193.243	\N	\N	\N	\N	\N
42dcdb9c-025f-4e61-a360-256e9ab4026b	1e90bb2c-2aae-490c-997d-2dc0cff18925	2025-12-01 16:07:16.687243+00	2025-12-01 16:07:16.687243+00	\N	aal1	\N	\N	node	110.226.193.243	\N	\N	\N	\N	\N
2fba46ed-9e45-43a0-9ec6-347246b1577f	1e90bb2c-2aae-490c-997d-2dc0cff18925	2025-12-01 16:07:17.182984+00	2025-12-01 16:07:17.182984+00	\N	aal1	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	110.226.193.243	\N	\N	\N	\N	\N
0534a187-94d6-469d-8bea-ac39831848b1	1e90bb2c-2aae-490c-997d-2dc0cff18925	2025-12-01 16:26:56.128401+00	2025-12-01 16:26:56.128401+00	\N	aal1	\N	\N	node	3.233.220.242	\N	\N	\N	\N	\N
f8ad5c97-3e9b-4204-b37c-f80f082e88f2	1e90bb2c-2aae-490c-997d-2dc0cff18925	2025-12-01 16:30:39.332109+00	2025-12-01 16:30:39.332109+00	\N	aal1	\N	\N	node	106.205.175.59	\N	\N	\N	\N	\N
ff38a84c-95d9-4840-82dd-f19248a50dbf	1e90bb2c-2aae-490c-997d-2dc0cff18925	2025-12-01 16:30:40.087311+00	2025-12-01 16:30:40.087311+00	\N	aal1	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	106.205.175.59	\N	\N	\N	\N	\N
578b3b29-1318-4dfa-801c-21bfb0231744	1e90bb2c-2aae-490c-997d-2dc0cff18925	2025-12-01 16:32:37.20499+00	2025-12-01 16:32:37.20499+00	\N	aal1	\N	\N	node	106.205.175.59	\N	\N	\N	\N	\N
486ed95c-e1bc-40c3-a993-22fb26f1eab1	1e90bb2c-2aae-490c-997d-2dc0cff18925	2025-12-01 16:32:38.100618+00	2025-12-01 16:32:38.100618+00	\N	aal1	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	106.205.175.59	\N	\N	\N	\N	\N
6736ee7a-9371-439f-9b34-df1d3ce4fcef	7961dd5b-891f-48f5-89ce-f2fb84842db2	2025-12-01 16:47:42.454734+00	2025-12-01 16:47:42.454734+00	\N	aal1	\N	\N	node	106.205.175.59	\N	\N	\N	\N	\N
d77f071d-f31d-4e99-afd1-a62566f14e51	7961dd5b-891f-48f5-89ce-f2fb84842db2	2025-12-01 16:47:43.178468+00	2025-12-01 16:47:43.178468+00	\N	aal1	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	106.205.175.59	\N	\N	\N	\N	\N
1de702dd-df40-489c-8900-50202c2f6b8c	1e90bb2c-2aae-490c-997d-2dc0cff18925	2025-12-01 16:48:34.607971+00	2025-12-01 16:48:34.607971+00	\N	aal1	\N	\N	node	106.205.175.59	\N	\N	\N	\N	\N
ad959f9e-8a60-452d-840b-c4c51c41634b	1e90bb2c-2aae-490c-997d-2dc0cff18925	2025-12-01 16:48:35.280898+00	2025-12-01 16:48:35.280898+00	\N	aal1	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	106.205.175.59	\N	\N	\N	\N	\N
656d7645-f029-4111-8ee3-140147574a0c	a75d2995-1604-45b3-a48e-e696b48df99b	2025-11-26 15:47:42.647966+00	2025-12-01 17:02:54.970499+00	\N	aal1	\N	2025-12-01 17:02:54.969797	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	106.205.175.59	\N	\N	\N	\N	\N
d64da3ea-53a1-42a8-8ffc-1c054fc2652a	7961dd5b-891f-48f5-89ce-f2fb84842db2	2025-12-01 17:35:38.948621+00	2025-12-01 17:35:38.948621+00	\N	aal1	\N	\N	node	106.205.175.59	\N	\N	\N	\N	\N
8382b738-9265-4cc1-ab64-54b20d9b0a6a	7961dd5b-891f-48f5-89ce-f2fb84842db2	2025-12-01 17:35:39.48216+00	2025-12-01 17:35:39.48216+00	\N	aal1	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	106.205.175.59	\N	\N	\N	\N	\N
771e9866-6fe5-41e8-a220-c86b41557ff3	e391e4ca-6d57-4e97-9267-92187a1c8911	2025-12-01 17:36:48.910946+00	2025-12-01 17:36:48.910946+00	\N	aal1	\N	\N	node	106.205.175.59	\N	\N	\N	\N	\N
44d0dbb0-73ab-493d-b635-0bdbd5e2b6a0	e391e4ca-6d57-4e97-9267-92187a1c8911	2025-12-01 17:36:49.33314+00	2025-12-01 17:36:49.33314+00	\N	aal1	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	106.205.175.59	\N	\N	\N	\N	\N
4bb91e76-cbca-47cd-8574-d36ba81c970c	7961dd5b-891f-48f5-89ce-f2fb84842db2	2025-12-02 05:35:47.898963+00	2025-12-02 05:35:47.898963+00	\N	aal1	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	59.183.62.70	\N	\N	\N	\N	\N
8ba978c7-da88-497e-b81a-3a3fe2ae59da	e391e4ca-6d57-4e97-9267-92187a1c8911	2025-12-02 06:19:26.598508+00	2025-12-02 06:19:26.598508+00	\N	aal1	\N	\N	node	59.183.62.70	\N	\N	\N	\N	\N
054f951c-4c50-4c16-8eae-880ecfa2b484	1e90bb2c-2aae-490c-997d-2dc0cff18925	2025-12-01 16:27:00.131544+00	2025-12-01 17:58:09.24294+00	\N	aal1	\N	2025-12-01 17:58:09.242829	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	106.205.175.59	\N	\N	\N	\N	\N
79cbdc75-16bc-48a3-bd99-948b6ce30679	1e90bb2c-2aae-490c-997d-2dc0cff18925	2025-12-01 17:58:33.680051+00	2025-12-01 17:58:33.680051+00	\N	aal1	\N	\N	node	100.27.242.227	\N	\N	\N	\N	\N
b33d0c61-1095-4e63-8605-84d3295b2914	1e90bb2c-2aae-490c-997d-2dc0cff18925	2025-12-02 10:49:37.104409+00	2025-12-02 10:49:37.104409+00	\N	aal1	\N	\N	node	59.183.62.70	\N	\N	\N	\N	\N
c4cb457d-e9a6-4856-ad9f-2e7588ac876a	1e90bb2c-2aae-490c-997d-2dc0cff18925	2025-12-02 10:49:37.396662+00	2025-12-02 10:49:37.396662+00	\N	aal1	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	59.183.62.70	\N	\N	\N	\N	\N
9d794018-4ac7-4066-8a62-eb910f60c6cc	1e90bb2c-2aae-490c-997d-2dc0cff18925	2025-12-01 17:58:35.713593+00	2025-12-02 13:17:36.478969+00	\N	aal1	\N	2025-12-02 13:17:36.478265	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	106.205.175.104	\N	\N	\N	\N	\N
23b7c982-c9f9-44d5-849c-2af0004911a0	e391e4ca-6d57-4e97-9267-92187a1c8911	2025-12-02 13:19:26.375901+00	2025-12-02 13:19:26.375901+00	\N	aal1	\N	\N	node	54.173.55.92	\N	\N	\N	\N	\N
1185d613-5947-41a8-a5ce-f083f37ba676	e391e4ca-6d57-4e97-9267-92187a1c8911	2025-12-02 13:19:28.716497+00	2025-12-02 13:19:28.716497+00	\N	aal1	\N	\N	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	106.205.175.104	\N	\N	\N	\N	\N
1ffea53e-ac25-4ed5-abdb-282c4d4c114d	e391e4ca-6d57-4e97-9267-92187a1c8911	2025-12-02 13:19:59.551589+00	2025-12-02 13:19:59.551589+00	\N	aal1	\N	\N	node	54.173.55.92	\N	\N	\N	\N	\N
9a3526c4-e526-4fc3-b27d-8d1c86a0920e	e391e4ca-6d57-4e97-9267-92187a1c8911	2025-12-02 13:20:00.403585+00	2025-12-02 13:20:00.403585+00	\N	aal1	\N	\N	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	106.205.175.104	\N	\N	\N	\N	\N
a1ae078f-3d2e-4c6c-8f07-ee9b7c892cfb	34533694-0bbb-4853-9693-a2da2c05ee94	2025-12-02 15:54:52.574422+00	2025-12-02 15:54:52.574422+00	\N	aal1	\N	\N	node	106.205.175.104	\N	\N	\N	\N	\N
50d72b23-ba40-42f8-a130-7f4d92b1626a	34533694-0bbb-4853-9693-a2da2c05ee94	2025-12-02 15:54:53.305419+00	2025-12-02 15:54:53.305419+00	\N	aal1	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	106.205.175.104	\N	\N	\N	\N	\N
0e1de774-1416-472e-9bce-19ed3614cbb6	9f7cbe52-d1e4-4310-aa79-6a300f5ccb6c	2025-12-02 17:58:13.091605+00	2025-12-02 17:58:13.091605+00	\N	aal1	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	106.205.175.104	\N	\N	\N	\N	\N
76055859-70c9-4d1b-b1a5-2cc7e7dfd656	6633dc36-aa0b-431e-a1d1-0a5993941950	2025-12-02 17:58:52.905068+00	2025-12-02 17:58:52.905068+00	\N	aal1	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	106.205.175.104	\N	\N	\N	\N	\N
cdca2535-4910-40c4-9466-ab4328b1215b	1e90bb2c-2aae-490c-997d-2dc0cff18925	2025-12-03 05:02:24.66215+00	2025-12-03 05:02:24.66215+00	\N	aal1	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	106.205.175.104	\N	\N	\N	\N	\N
7718f6ac-64a9-42f3-8af5-2a4211a3f80d	9f7cbe52-d1e4-4310-aa79-6a300f5ccb6c	2025-12-03 05:28:03.380041+00	2025-12-03 05:28:03.380041+00	\N	aal1	\N	\N	node	59.89.132.97	\N	\N	\N	\N	\N
2cb7cd27-0616-4b1e-aa1e-33643d9722eb	9f7cbe52-d1e4-4310-aa79-6a300f5ccb6c	2025-12-03 05:28:03.662945+00	2025-12-03 05:28:03.662945+00	\N	aal1	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	59.89.132.97	\N	\N	\N	\N	\N
9d758a45-ff1e-415f-a0c6-a2b4744318b3	9f7cbe52-d1e4-4310-aa79-6a300f5ccb6c	2025-12-03 05:51:32.348247+00	2025-12-03 05:51:32.348247+00	\N	aal1	\N	\N	node	59.89.132.97	\N	\N	\N	\N	\N
482f187d-af46-4090-8d63-3a18f290af2a	1e90bb2c-2aae-490c-997d-2dc0cff18925	2025-12-03 06:16:11.844486+00	2025-12-03 06:16:11.844486+00	\N	aal1	\N	\N	node	59.89.132.97	\N	\N	\N	\N	\N
63ffd90b-fef2-4e63-be34-60dca8043fe8	34533694-0bbb-4853-9693-a2da2c05ee94	2025-12-02 15:11:32.105299+00	2025-12-03 17:04:20.117187+00	\N	aal1	\N	2025-12-03 17:04:20.117067	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	106.205.175.26	\N	\N	\N	\N	\N
d4192267-ff11-4ff9-8351-7944c516e011	1e90bb2c-2aae-490c-997d-2dc0cff18925	2025-12-03 17:04:47.79519+00	2025-12-03 17:04:47.79519+00	\N	aal1	\N	\N	node	3.208.71.158	\N	\N	\N	\N	\N
d5e16d25-31da-40f3-924b-406f8ca0a5f2	9f7cbe52-d1e4-4310-aa79-6a300f5ccb6c	2025-12-03 05:51:32.672946+00	2025-12-03 08:24:19.72442+00	\N	aal1	\N	2025-12-03 08:24:19.724309	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	59.183.50.150	\N	\N	\N	\N	\N
5f8a88c2-8eee-44bf-a270-7ddfd6f9f816	1e90bb2c-2aae-490c-997d-2dc0cff18925	2025-12-03 06:16:12.43571+00	2025-12-03 08:24:44.748045+00	\N	aal1	\N	2025-12-03 08:24:44.746348	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	59.183.50.150	\N	\N	\N	\N	\N
1108d6cb-2344-440e-9a08-eca301469fb6	9f7cbe52-d1e4-4310-aa79-6a300f5ccb6c	2025-12-03 05:27:13.941594+00	2025-12-03 13:43:47.94037+00	\N	aal1	\N	2025-12-03 13:43:47.940255	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	106.205.175.26	\N	\N	\N	\N	\N
fb8e951f-cdaa-40f5-ac69-2a3ee03e21d7	9f7cbe52-d1e4-4310-aa79-6a300f5ccb6c	2025-12-03 13:45:48.163647+00	2025-12-03 13:45:48.163647+00	\N	aal1	\N	\N	node	106.205.175.26	\N	\N	\N	\N	\N
f7c4bd8e-5ef5-46d0-9fa1-1319c695eb40	9f7cbe52-d1e4-4310-aa79-6a300f5ccb6c	2025-12-03 17:06:28.675711+00	2025-12-03 17:06:28.675711+00	\N	aal1	\N	\N	node	100.31.102.84	\N	\N	\N	\N	\N
821717bd-2356-470b-8f1b-73899772008e	5ca81099-f4c1-4f7d-879d-061f6c393022	2025-12-03 17:06:43.822261+00	2025-12-03 17:06:43.822261+00	\N	aal1	\N	\N	node	100.31.102.84	\N	\N	\N	\N	\N
0b53fe3b-d554-4589-867e-285de725db59	5ca81099-f4c1-4f7d-879d-061f6c393022	2025-12-03 17:15:50.583218+00	2025-12-03 17:15:50.583218+00	\N	aal1	\N	\N	node	106.205.175.26	\N	\N	\N	\N	\N
c9554983-a2fe-4194-9856-7d2f0da4bcf7	5ca81099-f4c1-4f7d-879d-061f6c393022	2025-12-03 17:06:44.672502+00	2025-12-03 18:05:35.641634+00	\N	aal1	\N	2025-12-03 18:05:35.641492	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	117.234.255.87	\N	\N	\N	\N	\N
28477f6a-2317-43e8-9ca1-28506807348d	5ca81099-f4c1-4f7d-879d-061f6c393022	2025-12-03 17:15:51.258605+00	2025-12-03 18:14:36.203242+00	\N	aal1	\N	2025-12-03 18:14:36.202496	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	117.234.255.87	\N	\N	\N	\N	\N
819c1fd5-7e0c-49f2-b0be-76144bc1d305	9f7cbe52-d1e4-4310-aa79-6a300f5ccb6c	2025-12-03 13:45:48.815456+00	2025-12-03 18:14:36.246925+00	\N	aal1	\N	2025-12-03 18:14:36.244376	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	117.234.255.87	\N	\N	\N	\N	\N
72770526-23aa-457c-8dea-d8a902e5fd6d	9f7cbe52-d1e4-4310-aa79-6a300f5ccb6c	2025-12-03 17:06:29.917708+00	2025-12-04 04:12:29.021978+00	\N	aal1	\N	2025-12-04 04:12:29.02071	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	223.184.173.240	\N	\N	\N	\N	\N
28389e73-2e65-4bef-ae56-8dd0f4cac6e5	1e90bb2c-2aae-490c-997d-2dc0cff18925	2025-12-03 17:04:48.586663+00	2025-12-04 04:12:29.02152+00	\N	aal1	\N	2025-12-04 04:12:29.02015	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	223.184.173.240	\N	\N	\N	\N	\N
9472713e-eeb9-4945-9233-b1cb384f869d	e391e4ca-6d57-4e97-9267-92187a1c8911	2025-12-02 10:54:12.44092+00	2025-12-02 10:54:12.44092+00	\N	aal1	\N	\N	node	59.183.62.70	\N	\N	\N	\N	\N
ba91ecd6-ef65-4986-8390-67fcce61c00a	e391e4ca-6d57-4e97-9267-92187a1c8911	2025-12-02 10:54:12.966191+00	2025-12-02 10:54:12.966191+00	\N	aal1	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	59.183.62.70	\N	\N	\N	\N	\N
b15c7062-7fa7-4b4d-b001-7587350d63c1	e391e4ca-6d57-4e97-9267-92187a1c8911	2025-12-02 13:29:23.951301+00	2025-12-02 13:29:23.951301+00	\N	aal1	\N	\N	node	106.205.175.104	\N	\N	\N	\N	\N
79088611-2389-4c23-8bf3-1f62f1683e38	e391e4ca-6d57-4e97-9267-92187a1c8911	2025-12-02 13:29:25.08366+00	2025-12-02 13:29:25.08366+00	\N	aal1	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	106.205.175.104	\N	\N	\N	\N	\N
e8b8d12e-d09a-460c-a75e-0e5000d2820e	5ca81099-f4c1-4f7d-879d-061f6c393022	2025-12-03 17:46:03.870274+00	2025-12-04 06:33:15.316732+00	\N	aal1	\N	2025-12-04 06:33:15.315332	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	59.183.50.150	\N	\N	\N	\N	\N
6cdda472-61e6-4650-b478-3603d3d79060	9f7cbe52-d1e4-4310-aa79-6a300f5ccb6c	2025-12-02 18:59:15.973278+00	2025-12-02 18:59:15.973278+00	\N	aal1	\N	\N	node	106.205.175.104	\N	\N	\N	\N	\N
43538a7e-6d24-434b-89e1-62e3ab1d48a5	9f7cbe52-d1e4-4310-aa79-6a300f5ccb6c	2025-12-02 18:59:16.459799+00	2025-12-03 04:57:40.393786+00	\N	aal1	\N	2025-12-03 04:57:40.393035	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	106.205.175.104	\N	\N	\N	\N	\N
087aa6ec-b447-45ec-80e2-07f3601612c1	9f7cbe52-d1e4-4310-aa79-6a300f5ccb6c	2025-12-03 05:15:16.426348+00	2025-12-03 05:15:16.426348+00	\N	aal1	\N	\N	node	106.205.175.104	\N	\N	\N	\N	\N
b8186dc8-768a-49b6-a26f-75eb9fd0c1ed	9f7cbe52-d1e4-4310-aa79-6a300f5ccb6c	2025-12-03 05:15:17.371004+00	2025-12-03 05:15:17.371004+00	\N	aal1	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	106.205.175.104	\N	\N	\N	\N	\N
d00fa953-d198-4d4c-9829-c979fb9e80f7	7961dd5b-891f-48f5-89ce-f2fb84842db2	2025-12-02 10:26:14.857737+00	2025-12-03 05:42:33.534868+00	\N	aal1	\N	2025-12-03 05:42:33.534763	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	59.89.132.97	\N	\N	\N	\N	\N
bb468a87-e2c3-497b-b56a-9264f030477e	9f7cbe52-d1e4-4310-aa79-6a300f5ccb6c	2025-12-03 05:42:54.987051+00	2025-12-03 05:42:54.987051+00	\N	aal1	\N	\N	node	59.89.132.97	\N	\N	\N	\N	\N
9b6e4d1c-894e-4271-91d1-a228e13f421f	9f7cbe52-d1e4-4310-aa79-6a300f5ccb6c	2025-12-03 05:42:55.302015+00	2025-12-03 05:42:55.302015+00	\N	aal1	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	59.89.132.97	\N	\N	\N	\N	\N
c534dab9-da36-4cf6-bec0-ba5426fcf931	9f7cbe52-d1e4-4310-aa79-6a300f5ccb6c	2025-12-03 06:05:39.68219+00	2025-12-03 06:05:39.68219+00	\N	aal1	\N	\N	node	59.89.132.97	\N	\N	\N	\N	\N
1fcd3d16-8ffb-4c3a-9d5b-c02364c19415	9f7cbe52-d1e4-4310-aa79-6a300f5ccb6c	2025-12-03 06:05:40.006568+00	2025-12-03 06:05:40.006568+00	\N	aal1	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	59.89.132.97	\N	\N	\N	\N	\N
19544976-d400-4f22-a01a-a7247327d0fe	1e90bb2c-2aae-490c-997d-2dc0cff18925	2025-12-03 08:24:50.734152+00	2025-12-03 08:24:50.734152+00	\N	aal1	\N	\N	node	59.183.50.150	\N	\N	\N	\N	\N
4a300d0c-5961-49a9-bdea-cff6de4c9fb5	9f7cbe52-d1e4-4310-aa79-6a300f5ccb6c	2025-12-03 08:25:39.117703+00	2025-12-03 08:25:39.117703+00	\N	aal1	\N	\N	node	59.183.50.150	\N	\N	\N	\N	\N
7f8e29f3-22ce-4ba3-8dbe-9ec9d9502b57	1e90bb2c-2aae-490c-997d-2dc0cff18925	2025-12-03 08:24:51.01977+00	2025-12-03 12:46:46.240375+00	\N	aal1	\N	2025-12-03 12:46:46.240266	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	59.183.50.150	\N	\N	\N	\N	\N
c47be8dc-b77c-4365-960e-acac8d494d96	9f7cbe52-d1e4-4310-aa79-6a300f5ccb6c	2025-12-03 08:25:39.39862+00	2025-12-03 12:53:16.485243+00	\N	aal1	\N	2025-12-03 12:53:16.48513	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	59.183.50.150	\N	\N	\N	\N	\N
4e930e71-ee57-4bc6-9e62-759a4235a3a1	9f7cbe52-d1e4-4310-aa79-6a300f5ccb6c	2025-12-03 15:33:56.103969+00	2025-12-03 15:33:56.103969+00	\N	aal1	\N	\N	node	106.205.175.26	\N	\N	\N	\N	\N
f25fbc19-4a6b-4eb6-8714-272fe7ddcce9	9f7cbe52-d1e4-4310-aa79-6a300f5ccb6c	2025-12-03 15:33:56.723308+00	2025-12-03 16:41:28.78098+00	\N	aal1	\N	2025-12-03 16:41:28.78087	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	106.205.175.26	\N	\N	\N	\N	\N
7e271af5-594f-4f33-8871-bf60bb535e72	9f7cbe52-d1e4-4310-aa79-6a300f5ccb6c	2025-12-03 17:45:26.427249+00	2025-12-03 17:45:26.427249+00	\N	aal1	\N	\N	node	184.72.209.233	\N	\N	\N	\N	\N
197004c6-c400-4123-80a8-922f5c7e0aa9	9f7cbe52-d1e4-4310-aa79-6a300f5ccb6c	2025-12-03 17:45:27.613651+00	2025-12-03 17:45:27.613651+00	\N	aal1	\N	\N	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	117.234.255.87	\N	\N	\N	\N	\N
9a2c4217-da3b-4286-807d-2185058afb0d	5ca81099-f4c1-4f7d-879d-061f6c393022	2025-12-03 17:46:02.38+00	2025-12-03 17:46:02.38+00	\N	aal1	\N	\N	node	184.72.209.233	\N	\N	\N	\N	\N
82224825-a3ed-41ac-b66a-152332d7e856	e391e4ca-6d57-4e97-9267-92187a1c8911	2025-12-02 06:19:26.854332+00	2025-12-02 06:19:26.854332+00	\N	aal1	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	59.183.62.70	\N	\N	\N	\N	\N
83c8b64b-029f-447c-9077-3180539aaf21	7961dd5b-891f-48f5-89ce-f2fb84842db2	2025-12-02 08:43:32.305309+00	2025-12-02 10:14:46.054697+00	\N	aal1	\N	2025-12-02 10:14:46.052938	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	59.183.62.70	\N	\N	\N	\N	\N
b561a38a-3b35-4d11-b044-b3e910b00c15	1e90bb2c-2aae-490c-997d-2dc0cff18925	2025-12-03 06:08:19.295724+00	2025-12-03 06:08:19.295724+00	\N	aal1	\N	\N	node	59.89.132.97	\N	\N	\N	\N	\N
17fa6aad-963c-4fd5-b246-ea2603e92e77	1e90bb2c-2aae-490c-997d-2dc0cff18925	2025-12-02 06:20:57.394594+00	2025-12-02 06:20:57.394594+00	\N	aal1	\N	\N	node	59.183.62.70	\N	\N	\N	\N	\N
905331be-4ad9-4e96-ac23-0ffe92a25e87	1e90bb2c-2aae-490c-997d-2dc0cff18925	2025-12-02 06:20:57.604285+00	2025-12-02 06:20:57.604285+00	\N	aal1	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	59.183.62.70	\N	\N	\N	\N	\N
4a9c7bd8-cbcd-416a-b62f-808d9db484f1	1e90bb2c-2aae-490c-997d-2dc0cff18925	2025-12-02 11:33:43.290244+00	2025-12-02 11:33:43.290244+00	\N	aal1	\N	\N	node	59.183.62.70	\N	\N	\N	\N	\N
31e317a4-e0de-4ae9-a242-ca0912d2bc48	1e90bb2c-2aae-490c-997d-2dc0cff18925	2025-12-02 11:33:43.753437+00	2025-12-02 11:33:43.753437+00	\N	aal1	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	59.183.62.70	\N	\N	\N	\N	\N
a64425a5-7309-4734-b339-df0779bbbf54	7961dd5b-891f-48f5-89ce-f2fb84842db2	2025-12-02 06:26:55.009255+00	2025-12-02 06:26:55.009255+00	\N	aal1	\N	\N	node	59.183.62.70	\N	\N	\N	\N	\N
3a88e849-6db8-4271-852a-7ec138dbf972	7961dd5b-891f-48f5-89ce-f2fb84842db2	2025-12-02 08:21:40.81506+00	2025-12-02 08:21:40.81506+00	\N	aal1	\N	\N	node	54.158.110.43	\N	\N	\N	\N	\N
75539137-b68b-4462-b22f-e8be55751cca	7961dd5b-891f-48f5-89ce-f2fb84842db2	2025-12-02 08:21:42.171426+00	2025-12-02 08:21:42.171426+00	\N	aal1	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	59.183.62.70	\N	\N	\N	\N	\N
7ded0828-8514-415b-8373-1397f62327c8	1e90bb2c-2aae-490c-997d-2dc0cff18925	2025-12-02 14:58:09.080398+00	2025-12-02 14:58:09.080398+00	\N	aal1	\N	\N	node	18.212.60.95	\N	\N	\N	\N	\N
0d730f05-088d-4b49-88aa-0c86cdb0a8f8	1e90bb2c-2aae-490c-997d-2dc0cff18925	2025-12-02 14:58:10.317345+00	2025-12-02 14:58:10.317345+00	\N	aal1	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	106.205.175.104	\N	\N	\N	\N	\N
b8732b68-f732-4988-8509-4e6d47269790	7961dd5b-891f-48f5-89ce-f2fb84842db2	2025-12-02 06:26:55.287672+00	2025-12-02 08:42:48.020861+00	\N	aal1	\N	2025-12-02 08:42:48.020752	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	59.183.62.70	\N	\N	\N	\N	\N
0c96264a-ecc5-4fa7-af68-255c5b139cd6	7961dd5b-891f-48f5-89ce-f2fb84842db2	2025-12-02 08:43:32.097193+00	2025-12-02 08:43:32.097193+00	\N	aal1	\N	\N	node	59.183.62.70	\N	\N	\N	\N	\N
30b4a224-ca43-46cf-8255-20144b16a821	1e90bb2c-2aae-490c-997d-2dc0cff18925	2025-12-03 06:08:19.580523+00	2025-12-03 06:08:19.580523+00	\N	aal1	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	59.89.132.97	\N	\N	\N	\N	\N
25a90fbe-2df0-419c-ac89-cd484b82fd7a	7961dd5b-891f-48f5-89ce-f2fb84842db2	2025-12-02 16:47:49.664623+00	2025-12-02 16:47:49.664623+00	\N	aal1	\N	\N	node	106.205.175.104	\N	\N	\N	\N	\N
53d2136e-c97e-4ec9-835d-be95b9de7a6f	7961dd5b-891f-48f5-89ce-f2fb84842db2	2025-12-02 17:17:36.516901+00	2025-12-02 17:17:36.516901+00	\N	aal1	\N	\N	node	106.205.175.104	\N	\N	\N	\N	\N
5ee7b89e-0b82-41f8-8cc8-1ffd9627ec36	e391e4ca-6d57-4e97-9267-92187a1c8911	2025-12-02 17:19:35.592609+00	2025-12-02 17:19:35.592609+00	\N	aal1	\N	\N	node	106.205.175.104	\N	\N	\N	\N	\N
06c66b62-aba4-4e32-af6c-735784e9daf3	e391e4ca-6d57-4e97-9267-92187a1c8911	2025-12-02 17:19:36.176193+00	2025-12-02 17:19:36.176193+00	\N	aal1	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	106.205.175.104	\N	\N	\N	\N	\N
c2de6c07-dd01-4041-99ad-dbf5b847b883	3e076c78-e86b-4be1-83c2-8627cbe72a86	2025-12-02 17:43:46.512658+00	2025-12-02 17:43:46.512658+00	\N	aal1	\N	\N	node	106.205.175.104	\N	\N	\N	\N	\N
f171a1a7-8be1-49ba-9e93-7058dddd8708	7961dd5b-891f-48f5-89ce-f2fb84842db2	2025-12-02 16:47:50.143583+00	2025-12-02 17:57:44.109908+00	\N	aal1	\N	2025-12-02 17:57:44.10908	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	106.205.175.104	\N	\N	\N	\N	\N
c5a5d14e-5ba2-40be-b3aa-9a2ecbb53543	1e90bb2c-2aae-490c-997d-2dc0cff18925	2025-12-02 18:08:45.763157+00	2025-12-02 18:08:45.763157+00	\N	aal1	\N	\N	node	106.205.175.104	\N	\N	\N	\N	\N
be3642d9-eaee-4d35-b6e0-cbf622bc77a7	9f7cbe52-d1e4-4310-aa79-6a300f5ccb6c	2025-12-02 18:10:16.070705+00	2025-12-02 18:10:16.070705+00	\N	aal1	\N	\N	node	106.205.175.104	\N	\N	\N	\N	\N
18919b04-d3b3-4c36-b58b-616b7514f326	9f7cbe52-d1e4-4310-aa79-6a300f5ccb6c	2025-12-02 18:10:16.536045+00	2025-12-02 18:10:16.536045+00	\N	aal1	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	106.205.175.104	\N	\N	\N	\N	\N
6ce8291a-158c-41fe-8d02-977a398278ba	1e90bb2c-2aae-490c-997d-2dc0cff18925	2025-12-03 05:17:43.962785+00	2025-12-03 05:17:43.962785+00	\N	aal1	\N	\N	node	106.205.175.104	\N	\N	\N	\N	\N
e96538bb-c8fc-4b79-826f-765193e5474a	1e90bb2c-2aae-490c-997d-2dc0cff18925	2025-12-03 05:17:44.478466+00	2025-12-03 05:17:44.478466+00	\N	aal1	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	106.205.175.104	\N	\N	\N	\N	\N
18a4198b-7b79-4414-9876-072387de4397	9f7cbe52-d1e4-4310-aa79-6a300f5ccb6c	2025-12-03 05:44:14.421191+00	2025-12-03 05:44:14.421191+00	\N	aal1	\N	\N	node	59.89.132.97	\N	\N	\N	\N	\N
5e6ebdd0-d210-4085-b47e-aa5aaefb4193	9f7cbe52-d1e4-4310-aa79-6a300f5ccb6c	2025-12-03 05:44:14.655432+00	2025-12-03 05:44:14.655432+00	\N	aal1	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	59.89.132.97	\N	\N	\N	\N	\N
04707c19-b84a-407f-a019-85195cb35cbc	1e90bb2c-2aae-490c-997d-2dc0cff18925	2025-12-03 15:35:23.260933+00	2025-12-03 15:35:23.260933+00	\N	aal1	\N	\N	node	106.205.175.26	\N	\N	\N	\N	\N
3824e28f-89e8-4f19-bc7f-b38dd8b33845	5ca81099-f4c1-4f7d-879d-061f6c393022	2025-12-03 15:35:42.278771+00	2025-12-03 15:35:42.278771+00	\N	aal1	\N	\N	node	106.205.175.26	\N	\N	\N	\N	\N
1808d7f0-632e-48e2-8bc1-356023d26f6e	7961dd5b-891f-48f5-89ce-f2fb84842db2	2025-12-02 17:17:37.060136+00	2025-12-03 15:33:28.556646+00	\N	aal1	\N	2025-12-03 15:33:28.556513	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	106.205.175.26	\N	\N	\N	\N	\N
429ee685-84a9-491c-8976-8d1a1e11674f	3e076c78-e86b-4be1-83c2-8627cbe72a86	2025-12-02 17:43:47.076176+00	2025-12-03 15:33:37.071411+00	\N	aal1	\N	2025-12-03 15:33:37.071321	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	106.205.175.26	\N	\N	\N	\N	\N
44964f0a-2cbf-4383-8408-15ef03c79f12	5ca81099-f4c1-4f7d-879d-061f6c393022	2025-12-03 15:35:42.797736+00	2025-12-03 16:41:59.061901+00	\N	aal1	\N	2025-12-03 16:41:59.06179	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	106.205.175.26	\N	\N	\N	\N	\N
b873cac1-d533-488c-bdea-0e34c513b604	1e90bb2c-2aae-490c-997d-2dc0cff18925	2025-12-03 15:35:23.692001+00	2025-12-03 16:54:01.242294+00	\N	aal1	\N	2025-12-03 16:54:01.242175	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	106.205.175.26	\N	\N	\N	\N	\N
212c2cdd-ef72-435e-a34e-f5c79326ce19	1e90bb2c-2aae-490c-997d-2dc0cff18925	2025-12-02 18:08:46.356542+00	2025-12-03 17:56:22.723439+00	\N	aal1	\N	2025-12-03 17:56:22.722771	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	117.234.255.87	\N	\N	\N	\N	\N
\.


--
-- Data for Name: sso_domains; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.sso_domains (id, sso_provider_id, domain, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: sso_providers; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.sso_providers (id, resource_id, created_at, updated_at, disabled) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, invited_at, confirmation_token, confirmation_sent_at, recovery_token, recovery_sent_at, email_change_token_new, email_change, email_change_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, is_super_admin, created_at, updated_at, phone, phone_confirmed_at, phone_change, phone_change_token, phone_change_sent_at, email_change_token_current, email_change_confirm_status, banned_until, reauthentication_token, reauthentication_sent_at, is_sso_user, deleted_at, is_anonymous) FROM stdin;
00000000-0000-0000-0000-000000000000	d44017ab-3858-4ff4-89ea-e675b64916ac	authenticated	authenticated	majid@gmail.com	$2a$10$aIeuEHMujOzXuPlpzrpjIeA.jXixYZDKQq3z4vJpqMZ58Zb8wNbjm	2025-11-24 14:27:35.52668+00	\N		\N		\N			\N	2025-11-26 14:22:24.142922+00	{"provider": "email", "providers": ["email"]}	{"email_verified": true}	\N	2025-11-24 14:27:35.521466+00	2025-11-26 14:42:23.904049+00	\N	2025-11-24 14:27:35.53237+00			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	aa979816-d19c-42c6-9343-c58b55f5311d	authenticated	authenticated	majid@admin.com	$2a$10$/Gk1svjggTvejF9JJuCuYuNEo/TVGILwS7CWafEsucpQOfQR7oOlK	2025-11-23 20:32:26.204408+00	\N		\N		\N			\N	2025-11-23 20:43:49.636494+00	{"provider": "email", "providers": ["email"]}	{"email_verified": true}	\N	2025-11-23 20:32:26.175308+00	2025-11-23 20:43:49.676885+00	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	a24a3864-36bd-4d9a-bde1-46b246f50458	authenticated	authenticated	\N	$2a$10$KNRZkzKgW3R/xBeUh4U2OOyrf00nridTYUQlguo38KZ4jlODLM0Zu	2025-11-23 20:44:16.049057+00	\N		\N		\N			\N	\N	{"provider": "phone", "providers": ["phone"]}	{"email_verified": true}	\N	2025-11-23 20:44:16.041441+00	2025-11-23 20:44:16.055285+00	9897796616	2025-11-23 20:44:16.055043+00			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	a75d2995-1604-45b3-a48e-e696b48df99b	authenticated	authenticated	khan@gmail.com	$2a$10$RfvoROhRvxQLbH4NvKQqheR53eUEVc03snNcPjstGVMD2iDNOdPsm	2025-11-26 15:47:26.037815+00	\N		\N		\N			\N	2025-11-26 15:47:42.64785+00	{"provider": "email", "providers": ["email"]}	{"email_verified": true}	\N	2025-11-26 15:47:25.995715+00	2025-12-01 17:02:54.964481+00	\N	2025-11-26 15:47:26.051811+00			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	0d9eed24-256f-48ce-8180-2a9f1cd0ee04	authenticated	authenticated	admin@homesolution.com	$2a$10$hB0DBy3OELYoRl1JdMWO2.bSdu80gZAp6hk1FHCOXk/h0Zx9xHbtO	2025-11-26 16:13:47.098391+00	\N		\N		\N			\N	2025-11-26 16:13:54.216403+00	{"provider": "email", "providers": ["email"]}	{"email_verified": true}	\N	2025-11-26 16:13:47.062336+00	2025-11-26 16:13:54.21861+00	\N	2025-11-26 16:13:47.109578+00			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	4fe682c8-521d-46ee-9585-8368b5b3282d	authenticated	authenticated	ecsddagra@gmail.com	$2a$10$TZisXwE38KcIi7MjuM37y.i8AS0DrMjB4XQ4VYXGjxOMyBILOBwvK	2025-11-24 16:42:36.065588+00	\N		\N		\N			\N	2025-11-25 08:15:01.339164+00	{"provider": "email", "providers": ["email"]}	{"email_verified": true}	\N	2025-11-24 16:42:36.007405+00	2025-11-26 16:50:10.519838+00	\N	2025-11-24 16:42:36.078258+00			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	cfd6e26b-e085-4768-ae59-e711a65dfbda	authenticated	authenticated	\N	$2a$10$LVDf4S1pkFsJMnXzNrq2DeWiIfSyo/0YOJqQNfsXWifP9rd3guNv.	2025-11-23 21:17:50.564927+00	\N		\N		\N			\N	\N	{"provider": "phone", "providers": ["phone"]}	{"email_verified": true}	\N	2025-11-23 21:17:50.531858+00	2025-11-23 21:17:50.584097+00	9876543210	2025-11-23 21:17:50.58275+00			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	c0313e8a-434b-4ec7-bc40-f221f7581ac3	authenticated	authenticated	k@gmail.com	$2a$10$.tB/obNsl0gmY5nXarRvHecmzY42O6NHrTEZFeofwNWTj.UWNHqJO	2025-11-27 17:36:50.127018+00	\N		\N		\N			\N	2025-11-27 17:36:50.883064+00	{"provider": "email", "providers": ["email"]}	{"email_verified": true}	\N	2025-11-27 17:36:50.104247+00	2025-12-01 15:12:12.023398+00	\N	2025-11-27 17:36:50.136195+00			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	95210bf2-d377-4a0b-9db3-fc95e97f6d09	authenticated	authenticated	\N	$2a$10$B.duvLeizVsupstiQAbOaOMAARBeBmNKsgWyPXLgsjsN0aq7Iv9aW	2025-11-24 14:26:25.3366+00	\N		\N		\N			\N	\N	{"provider": "phone", "providers": ["phone"]}	{"email_verified": true}	\N	2025-11-24 14:26:25.305229+00	2025-11-24 14:26:25.346229+00	9897796617	2025-11-24 14:26:25.344131+00			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	985c38d1-4718-44d7-bd1f-5fc6da623b83	authenticated	authenticated	j@gmail.com	$2a$10$8U.xgcXEW.og5VbD1dneA.ANE5ZPvArB9eIGmjptYffmruMLykDx6	2025-11-27 10:11:39.767582+00	\N		\N		\N			\N	2025-12-01 12:33:34.963312+00	{"provider": "email", "providers": ["email"]}	{"email_verified": true}	\N	2025-11-27 10:11:39.713623+00	2025-12-01 12:33:34.966478+00	\N	2025-11-27 10:11:39.790666+00			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	62ba3539-985e-4902-9fc8-07d1e4a9f70d	authenticated	authenticated	mess@gmail.com	$2a$10$EMw8KR28pbSS5sdv3e4J4eLw1ndV3do15hBGsKdLNq/W9MQQSuM4i	2025-11-26 15:00:18.456235+00	\N		\N		\N			\N	2025-11-26 16:50:24.798378+00	{"provider": "email", "providers": ["email"]}	{"email_verified": true}	\N	2025-11-26 15:00:18.432538+00	2025-11-26 16:56:24.224463+00	\N	2025-11-26 15:00:18.461939+00			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	1e90bb2c-2aae-490c-997d-2dc0cff18925	authenticated	authenticated	admin@admin.com	$2a$10$r7MIbsnY8ws2rRjU5VQsb.PNNlKO.uuQteVk7anhTv3Ya8n520EyG	2025-11-26 17:09:28.44646+00	\N		\N		\N			\N	2025-12-03 17:04:48.586553+00	{"provider": "email", "providers": ["email"]}	{"email_verified": true}	\N	2025-11-26 17:09:28.423515+00	2025-12-04 04:12:29.012959+00	\N	2025-11-26 17:09:28.454485+00			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	c2215a77-f7a7-4aad-9c40-3149734d7f11	authenticated	authenticated	i@gmail.com	$2a$10$uhUf0FQ8E2dlRiwlbmWxxOj91mzWXKGoykCDYOGeuwsHstyVU.MBO	2025-11-27 17:03:05.013268+00	\N		\N		\N			\N	2025-11-27 17:03:05.453196+00	{"provider": "email", "providers": ["email"]}	{"email_verified": true}	\N	2025-11-27 17:03:04.958504+00	2025-11-27 17:06:57.552769+00	\N	2025-11-27 17:03:05.030387+00			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	0d259525-97d9-4fdc-9716-4522f9fd733c	authenticated	authenticated	yogi@admin.com	$2a$10$TcJHiyDCzZg9B83MPjl.Ie9Qd0bbMU4hDD3M2U6zL5SHI35Zfhy6O	\N	\N	dbff5228d1d830ef14787ae8f56bcace4da88266d0b3bbca8bd83b65	2025-11-28 12:42:07.655476+00		\N			\N	\N	{"provider": "email", "providers": ["email"]}	{"sub": "0d259525-97d9-4fdc-9716-4522f9fd733c", "role": "admin", "email": "yogi@admin.com", "full_name": "yogendra", "email_verified": false, "phone_verified": false}	\N	2025-11-28 12:42:07.630748+00	2025-11-28 12:42:10.445837+00	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	e3be8daa-6372-42ec-901f-29c4ef81a6ac	authenticated	authenticated	a@gmail.com	$2a$10$a/d5oTq/rII3iQN6ytFfd.sq2yHMfW9ed.0xjeUVpfaR8EFN4Nn.K	2025-11-26 17:51:51.06758+00	\N		\N		\N			\N	2025-12-02 17:33:35.547217+00	{"provider": "email", "providers": ["email"]}	{"email_verified": true}	\N	2025-11-26 17:51:51.040448+00	2025-12-02 17:33:35.555501+00	\N	2025-11-26 17:51:51.077907+00			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	ffb3098f-db08-4c63-8193-0a31cb9b4e22	authenticated	authenticated	d@gmail.com	$2a$10$aJQt8xRLCbnZnbah//1KFO1e5TZHNr.eRv/hacIvMbRpKqJi2uB9a	2025-11-27 17:29:41.352755+00	\N		\N		\N			\N	2025-11-27 17:29:42.147236+00	{"provider": "email", "providers": ["email"]}	{"email_verified": true}	\N	2025-11-27 17:29:41.331114+00	2025-11-27 17:33:15.902347+00	\N	2025-11-27 17:29:41.358349+00			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	739775bc-0f1f-47a1-90f3-f12beaa0f4ad	authenticated	authenticated	y@gmail.com	$2a$10$IdNkj/qhDtWxaD9pFVfAn.atY/ediZPRhRBHdrd19Gy.FNo8KIbF2	2025-11-27 12:01:05.184861+00	\N		\N		\N			\N	2025-11-27 12:01:06.481654+00	{"provider": "email", "providers": ["email"]}	{"email_verified": true}	\N	2025-11-27 12:01:05.131178+00	2025-11-28 14:06:08.927417+00	\N	2025-11-27 12:01:05.202741+00			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	e391e4ca-6d57-4e97-9267-92187a1c8911	authenticated	authenticated	m@gmail.com	$2a$10$IyIdYjv9UqJWdf7lDmwAmO2qZjGKqqGJ5agRB7fLUZZPLZO./rlRK	2025-11-26 16:59:00.599766+00	\N		\N		\N			\N	2025-12-02 17:19:36.176094+00	{"provider": "email", "providers": ["email"]}	{"email_verified": true}	\N	2025-11-26 16:59:00.581381+00	2025-12-02 17:19:36.17818+00	\N	2025-11-26 16:59:00.603714+00			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	c5686080-3064-407d-8eb8-f68e67ac26ad	authenticated	authenticated	sa@admin.com	$2a$10$Hw/W.UHRXIh.evGYLCF93uL4PsM9EJ1MJkk8fH.Hm3ccxkhqHxqKC	\N	\N	4a8aa53cd2c1c115ac3742f2da06f582ae6d0f7cff8aeba724fc6e31	2025-11-28 12:51:03.070193+00		\N			\N	\N	{"provider": "email", "providers": ["email"]}	{"sub": "c5686080-3064-407d-8eb8-f68e67ac26ad", "role": "admin", "email": "sa@admin.com", "full_name": "satyanarayan", "email_verified": false, "phone_verified": false}	\N	2025-11-28 12:51:02.947637+00	2025-11-28 12:51:05.578757+00	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	0bb17a30-8f3d-4c8f-83f3-f75a1da9766c	authenticated	authenticated	s@admin.com	$2a$10$DvOiGzmQqHoueyNvSuQ1rOIpVQrA1mlvzRI7lLxhpbUxFXEPxll2a	\N	\N	f65b81f5959c4de7f3de216c7af8597e17d6b3926047582cbeda0d00	2025-11-28 12:50:37.314075+00		\N			\N	\N	{"provider": "email", "providers": ["email"]}	{"sub": "0bb17a30-8f3d-4c8f-83f3-f75a1da9766c", "role": "admin", "email": "s@admin.com", "full_name": "satyanarayan", "email_verified": false, "phone_verified": false}	\N	2025-11-28 12:49:34.317785+00	2025-11-28 12:50:39.860204+00	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	3e076c78-e86b-4be1-83c2-8627cbe72a86	authenticated	authenticated	yogi1@gmail.com	$2a$10$S6G4jyLnn26XMwlXaqcRqu2t/GsqnnJus9Q/lmKbBhcMdkAkntry2	2025-12-01 12:16:25.300584+00	\N		\N		\N			\N	2025-12-02 17:43:47.076081+00	{"provider": "email", "providers": ["email"]}	{"email_verified": true}	\N	2025-12-01 12:16:25.289022+00	2025-12-03 15:33:37.069651+00	\N	2025-12-01 12:16:25.307865+00			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	a589e561-114b-4a6f-9e58-9db8c9882a45	authenticated	authenticated	admin2@admin.com	$2a$10$sUYlqIwLj52aWxmwqKRVxe7PJLMkHaZZfi8KjFJ7i9GjNALtSPfie	\N	\N	536e0a9d084c36d25d8572979bd2d652743b6868e8f39df55f12ac89	2025-11-28 12:57:14.901775+00		\N			\N	\N	{"provider": "email", "providers": ["email"]}	{"sub": "a589e561-114b-4a6f-9e58-9db8c9882a45", "role": "admin", "email": "admin2@admin.com", "full_name": "sajid", "email_verified": false, "phone_verified": false}	\N	2025-11-28 12:57:14.888159+00	2025-11-28 12:57:17.586143+00	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	c5476153-e15f-4183-90d2-5216d1014cf8	authenticated	authenticated	e@admin.com	$2a$10$TzvPUVl6J.6wf.FB49uM1uXOjLGnmZ1woImPbCDkYVHfesGjyUq5q	2025-12-01 15:36:59.136246+00	\N		\N		\N			\N	\N	{"provider": "email", "providers": ["email"]}	{"role": "admin", "full_name": "majid", "email_verified": true}	\N	2025-12-01 15:36:59.113291+00	2025-12-01 15:36:59.137927+00	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	4952a4cd-b36a-4234-a7ca-cbdad8a4f8e8	authenticated	authenticated	admin3@admin.com	$2a$10$qVTX2dVPXnaD72h/l6Iv0eQoFrmWBJrLvGq6BTY5ZzyxDRuhzuhwe	\N	\N	f22a390cd5e0baacc52f76eed27bd74bfefbb7ce6ea848cc35fb713e	2025-11-28 13:00:10.99126+00		\N			\N	\N	{"provider": "email", "providers": ["email"]}	{"sub": "4952a4cd-b36a-4234-a7ca-cbdad8a4f8e8", "role": "admin", "email": "admin3@admin.com", "full_name": "satyanarayan sd", "email_verified": false, "phone_verified": false}	\N	2025-11-28 13:00:10.979347+00	2025-11-28 13:00:13.621853+00	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	057e2aa7-9db5-46e6-b6b2-b1cbead41bab	authenticated	authenticated	b@gmail.com	$2a$10$L5ggQewo229Zs0uFYqWmA.u1bCOFl3uXtaC1eApt4JGx9.clfvOwO	2025-12-01 12:05:37.505615+00	\N		\N		\N			\N	2025-12-01 16:06:23.834021+00	{"provider": "email", "providers": ["email"]}	{"email_verified": true}	\N	2025-12-01 12:05:37.489242+00	2025-12-01 16:06:23.837673+00	\N	2025-12-01 12:05:37.510846+00			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	c33046ea-ac53-43a0-bbb5-4bfb55ad757a	authenticated	authenticated	f@gmail.com	$2a$10$xAxD.WPhiHLeX8HejD7.q.8L.Vc7thM8dO.DSncrk0IvPsHBmwvs2	2025-12-01 13:41:29.525+00	\N		\N		\N			\N	2025-12-02 06:21:57.131731+00	{"provider": "email", "providers": ["email"]}	{"email_verified": true}	\N	2025-12-01 13:41:29.506902+00	2025-12-02 10:26:55.010492+00	\N	2025-12-01 13:41:29.529852+00			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	7ee84136-cb9a-477e-8990-c171dce0c612	authenticated	authenticated	admin4@admin.com	$2a$10$3W2KsqC/glNLZRzS9orkP.UL5eJQ/Bndmi2VRVLT.L47IR8DPatK.	2025-11-28 13:16:02.520008+00	\N		\N		\N			\N	\N	{"provider": "email", "providers": ["email"]}	{"role": "admin", "full_name": "satyanarayan adad", "email_verified": true}	\N	2025-11-28 13:16:02.506907+00	2025-11-28 13:16:02.520957+00	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	00c204f6-4584-42c9-94d0-03ea21dfcf94	authenticated	authenticated	majid.khan@uppcl.org	$2a$10$BTJWN5Ti5YNg7xdhilhYQOLGYFK.0mRDdw9JE8V8sejw2FFcTQz4i	2025-11-28 14:07:48.977522+00	\N		\N		\N			\N	2025-12-01 12:00:41.654108+00	{"provider": "email", "providers": ["email"]}	{"email_verified": true}	\N	2025-11-28 14:07:48.960656+00	2025-12-01 12:00:41.658257+00	\N	2025-11-28 14:07:48.981708+00			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	70685fb9-eb02-4884-b8fb-a96401f6e663	authenticated	authenticated	yogiuppcl@gmail.com	$2a$10$2vBEHSUvoz1XBx/xMZ3OUugPdnb6PUmEsZpSl.AS3TXwG2fdxqqe2	2025-12-02 16:52:51.111652+00	\N		\N		\N			\N	2025-12-02 16:52:53.470537+00	{"provider": "email", "providers": ["email"]}	{"email_verified": true}	\N	2025-12-02 16:52:51.087494+00	2025-12-02 16:58:25.100071+00	\N	2025-12-02 16:52:51.117918+00			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	9f7cbe52-d1e4-4310-aa79-6a300f5ccb6c	authenticated	authenticated	u1@gmail.com	$2a$10$s3fpnMFKcpWRriJ8.xS3TeM6mLeGbAQpHYnN/HTaqbNTYm8pAn/fK	2025-12-02 17:58:12.503455+00	\N		\N		\N			\N	2025-12-03 17:45:27.613523+00	{"provider": "email", "providers": ["email"]}	{"email_verified": true}	\N	2025-12-02 17:58:12.48275+00	2025-12-04 04:12:29.010409+00	\N	2025-12-02 17:58:12.508441+00			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	5ca81099-f4c1-4f7d-879d-061f6c393022	authenticated	authenticated	p1@gmail.com	$2a$10$HeuK6vLZH3SSsSpDSYJMFOl6oTI1cQ.zo2x8f1woj6lUu2ySkL.ci	2025-12-02 18:33:06.619434+00	\N		\N		\N			\N	2025-12-03 17:46:03.869478+00	{"provider": "email", "providers": ["email"]}	{"email_verified": true}	\N	2025-12-02 18:33:06.5863+00	2025-12-04 06:33:15.303409+00	\N	2025-12-02 18:33:06.624334+00			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	6633dc36-aa0b-431e-a1d1-0a5993941950	authenticated	authenticated	u2@gmail.com	$2a$10$8V7x/C2.0bPtUOWep68O/ecKbXfwB/AZ5GhGC0PC2jJZDZFpBoaQi	2025-12-02 17:58:52.239338+00	\N		\N		\N			\N	2025-12-02 17:58:52.90496+00	{"provider": "email", "providers": ["email"]}	{"email_verified": true}	\N	2025-12-02 17:58:52.2338+00	2025-12-02 17:58:52.908926+00	\N	2025-12-02 17:58:52.244358+00			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	34533694-0bbb-4853-9693-a2da2c05ee94	authenticated	authenticated	g@gmail.com	$2a$10$78D7hOM/vKmQSB/vF7ghpeX.It.i334bWBcMQwEZAsnKHjSuLKXda	2025-12-02 15:11:30.34602+00	\N		\N		\N			\N	2025-12-02 15:54:53.305314+00	{"provider": "email", "providers": ["email"]}	{"email_verified": true}	\N	2025-12-02 15:11:30.267314+00	2025-12-03 17:04:20.110346+00	\N	2025-12-02 15:11:30.365481+00			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	6f8e22c4-af75-4865-bad3-8494742c5047	authenticated	authenticated	p2@gmail.com	$2a$10$yyCwBraC5s.ejZVaUz66ke3UZybZand.Twhh3/IhIU07y8WowvJN6	2025-12-02 18:03:38.242094+00	\N		\N		\N			\N	2025-12-02 18:03:38.915729+00	{"provider": "email", "providers": ["email"]}	{"email_verified": true}	\N	2025-12-02 18:03:38.200525+00	2025-12-02 18:06:15.552942+00	\N	2025-12-02 18:03:38.250202+00			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	7961dd5b-891f-48f5-89ce-f2fb84842db2	authenticated	authenticated	rbs@gmail.com	$2a$10$J5E4V9RPXe47sKbClI0/7ehN2XhxpF2I3/tFJbeXUxYGg3tIiVGHy	2025-12-01 12:43:10.134169+00	\N		\N		\N			\N	2025-12-02 17:17:37.060008+00	{"provider": "email", "providers": ["email"]}	{"email_verified": true}	\N	2025-12-01 12:43:10.101118+00	2025-12-03 15:33:28.546841+00	\N	2025-12-01 12:43:10.143704+00			\N		0	\N		\N	f	\N	f
\.


--
-- Data for Name: admin_settings; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.admin_settings (id, key, value, description, updated_by, updated_at, service_id) FROM stdin;
b9ea8a20-eeb4-453d-bbc5-1f878a86fae2	min_wallet_balance	{"value": 0}	Minimum wallet balance	\N	2025-11-23 20:20:42.808067+00	\N
a131da78-ccd6-4b08-9917-c8359025fdfa	max_wallet_balance	{"value": 50000}	Maximum wallet balance	\N	2025-11-23 20:20:42.808067+00	\N
1e158493-3f94-4ce9-940a-21569c054a50	provider_commission	{"value": 19}	Platform commission percentage	1e90bb2c-2aae-490c-997d-2dc0cff18925	2025-11-28 12:37:48.332+00	\N
37cbd17a-3abb-446a-9231-d9157650e11e	suspension_days	{"value": 8}	Days of suspension for low ratings	1e90bb2c-2aae-490c-997d-2dc0cff18925	2025-11-28 12:37:55.199+00	\N
4bd77e51-9bba-4c29-9e02-a9cd48509550	referral_reward	{"user": 50, "provider": 20, "_isInherited": false}	\N	1e90bb2c-2aae-490c-997d-2dc0cff18925	2025-11-28 12:38:19.565+00	5103e5ba-3013-47b1-8297-5a01eb5c27b9
0d002f76-c0c8-4795-9a07-0d349df10f67	provider_commission	{"value": 10}	\N	1e90bb2c-2aae-490c-997d-2dc0cff18925	2025-11-28 12:38:25.758532+00	5103e5ba-3013-47b1-8297-5a01eb5c27b9
eacef2eb-81a8-49d0-a5de-5d6996473c80	cashback_percentage	{"value": 6, "_isInherited": false}	\N	1e90bb2c-2aae-490c-997d-2dc0cff18925	2025-11-28 12:38:36.051+00	5103e5ba-3013-47b1-8297-5a01eb5c27b9
ccb267ff-4262-4e17-aef6-c8c669944a10	cashback_percentage	{"value": 8, "_isInherited": true}	Default cashback percentage on bookings	1e90bb2c-2aae-490c-997d-2dc0cff18925	2025-12-01 12:29:41.039+00	\N
d5e6dc34-7529-407e-98ad-25e7e66173ac	reward_points_per_booking	{"value": 12, "_isInherited": true}	Reward points per completed booking	1e90bb2c-2aae-490c-997d-2dc0cff18925	2025-12-01 12:30:07.255+00	\N
85cb1eb2-fe50-4b78-aadd-881a080895bb	referral_reward	{"user": 105, "provider": 201, "_isInherited": true}	Referral reward amounts	1e90bb2c-2aae-490c-997d-2dc0cff18925	2025-12-01 12:30:12.066+00	\N
936bc092-8d87-4e19-a4bc-592db2edbb3e	low_rating_threshold	{"value": 2.5, "_isInherited": true}	Rating threshold for suspension	1e90bb2c-2aae-490c-997d-2dc0cff18925	2025-12-01 12:30:53.841+00	\N
\.


--
-- Data for Name: booking_items; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.booking_items (id, booking_id, sub_service_id, sub_service_name, price, quantity, created_at, sub_subservice_id, item_type) FROM stdin;
\.


--
-- Data for Name: booking_quotes; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.booking_quotes (id, booking_id, quoted_by, quoted_price, message, is_accepted, created_at) FROM stdin;
64151bf3-01a7-4fae-b907-a32def634152	dbe53ace-0bbc-41a2-b067-c9532e5b551f	user	450.00	\N	f	2025-12-02 18:14:14.910062+00
e3673435-4c3d-4da4-aa8e-cc2fc787719c	3cbd1da7-e6bb-429c-81e9-850f367bcd9f	user	470.00	\N	f	2025-12-02 18:16:14.290644+00
ea206703-bf4c-4b9b-9c8a-c8816242467b	6931f2a2-6794-456a-8a9b-1dda7ad4e2ae	user	475.00	\N	f	2025-12-02 18:16:52.226962+00
8a7c4033-322d-4155-8750-8bfea1575833	81b8bdb3-b213-4edd-b0a5-066112728fdf	user	400.00	\N	f	2025-12-03 14:25:10.426878+00
006f3636-f539-43cd-ba8e-ec8e867c352d	e5064417-8956-49f4-911f-8eb83cb0013d	user	300.00	\N	f	2025-12-03 15:13:06.059389+00
2a548914-cf7b-4f37-b087-cd95268f7eba	c9063c06-d01e-4645-85c0-5c69638ebed9	user	300.00	\N	f	2025-12-03 15:38:56.121046+00
5bd715c6-f6d0-450e-ae65-4d4cce27058c	69963e8d-4603-477d-8e69-541bcda1f8e1	user	299.98	\N	f	2025-12-03 15:59:27.15026+00
cf7e5d8d-f239-4ffc-bda2-1f40e0c67cdc	2eb97732-0e43-44c2-b4c7-17de651bd903	user	100.00	\N	f	2025-12-03 17:10:08.799547+00
\.


--
-- Data for Name: booking_status_history; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.booking_status_history (id, booking_id, status, changed_by, created_at) FROM stdin;
d47ad86b-f6b2-4ef0-b32d-e2660383081c	0b19c9de-bf44-4d7c-9928-2a4acb6c3fad	confirmed	6f8e22c4-af75-4865-bad3-8494742c5047	2025-12-02 18:17:42.658152+00
db000a37-9f1d-41dc-b5b8-b472532af35f	dbe53ace-0bbc-41a2-b067-c9532e5b551f	on_way	6f8e22c4-af75-4865-bad3-8494742c5047	2025-12-02 18:22:10.432845+00
c7b28d52-4d01-486a-a3eb-8879ba833816	5b7a0af7-e287-46da-9cb1-03752b608e73	confirmed	5ca81099-f4c1-4f7d-879d-061f6c393022	2025-12-03 06:18:26.927938+00
9eb66da9-3c33-4450-8b59-90610ffcc778	5c0683f5-c02c-42f6-8254-e4c8d0301121	confirmed	5ca81099-f4c1-4f7d-879d-061f6c393022	2025-12-03 06:18:28.971265+00
60525f29-eefe-4ecf-8f37-f03d44c8efe8	d7855c02-1bdb-4fd0-a2c9-1165cda94482	confirmed	5ca81099-f4c1-4f7d-879d-061f6c393022	2025-12-03 06:19:22.625842+00
c04f51d1-f5e5-4634-b9e6-6bd7c251c961	60d4bfe8-b867-4502-a5ca-925ea6dc8734	confirmed	5ca81099-f4c1-4f7d-879d-061f6c393022	2025-12-03 06:19:55.964693+00
9ea1c45e-d837-4d2d-a61f-d8b1ed7762ac	5c0683f5-c02c-42f6-8254-e4c8d0301121	on_way	5ca81099-f4c1-4f7d-879d-061f6c393022	2025-12-03 06:21:00.854155+00
85850b3d-82a6-4f1b-a834-de234d9c3a52	5c0683f5-c02c-42f6-8254-e4c8d0301121	in_progress	5ca81099-f4c1-4f7d-879d-061f6c393022	2025-12-03 06:21:09.745982+00
687ab69a-70c0-4374-8d4e-45e48e3d6ce7	5c0683f5-c02c-42f6-8254-e4c8d0301121	completed	5ca81099-f4c1-4f7d-879d-061f6c393022	2025-12-03 06:21:14.57745+00
cf80964a-4d9c-4818-8d44-f1b65871f0cb	5b7a0af7-e287-46da-9cb1-03752b608e73	on_way	5ca81099-f4c1-4f7d-879d-061f6c393022	2025-12-03 06:21:18.410522+00
1fcff45f-2f0c-4af1-bcbf-cc92e1d57fb7	5b7a0af7-e287-46da-9cb1-03752b608e73	in_progress	5ca81099-f4c1-4f7d-879d-061f6c393022	2025-12-03 06:21:21.213918+00
55589fae-cab4-4452-b962-a5451e725fd6	ee9da2c7-09b8-4812-a32f-26c8533643ce	confirmed	5ca81099-f4c1-4f7d-879d-061f6c393022	2025-12-03 08:26:56.403491+00
a0be287e-c9d9-4653-a4be-bff3a1c38337	ee9da2c7-09b8-4812-a32f-26c8533643ce	on_way	5ca81099-f4c1-4f7d-879d-061f6c393022	2025-12-03 08:27:09.045082+00
600f8f5c-e1f3-4417-b965-88084faa58f4	60d4bfe8-b867-4502-a5ca-925ea6dc8734	on_way	5ca81099-f4c1-4f7d-879d-061f6c393022	2025-12-03 08:27:10.269657+00
9e3b079e-2518-450d-850a-d5f38949ade6	d7855c02-1bdb-4fd0-a2c9-1165cda94482	on_way	5ca81099-f4c1-4f7d-879d-061f6c393022	2025-12-03 08:27:10.883163+00
00b84aae-a050-44f2-b8d9-38c1d28328f1	d7855c02-1bdb-4fd0-a2c9-1165cda94482	in_progress	5ca81099-f4c1-4f7d-879d-061f6c393022	2025-12-03 08:27:21.214072+00
c9caba0f-a733-4245-89cc-adddfde282a2	d7855c02-1bdb-4fd0-a2c9-1165cda94482	completed	5ca81099-f4c1-4f7d-879d-061f6c393022	2025-12-03 08:27:24.734245+00
bc1b6361-0306-4d0e-9f68-1b6e6ace0474	30f26ecc-5eea-47b6-a8f5-3405d2d339b0	confirmed	5ca81099-f4c1-4f7d-879d-061f6c393022	2025-12-03 10:57:01.216028+00
ea9163e6-9634-434b-9fef-d0a82c574da0	30f26ecc-5eea-47b6-a8f5-3405d2d339b0	on_way	5ca81099-f4c1-4f7d-879d-061f6c393022	2025-12-03 10:57:05.339196+00
ebc99a6c-8583-42c2-b435-2cb6c689d914	60d4bfe8-b867-4502-a5ca-925ea6dc8734	in_progress	5ca81099-f4c1-4f7d-879d-061f6c393022	2025-12-03 10:57:08.600939+00
287284a8-0dd3-4366-8b88-b4a4c0c09f2b	60d4bfe8-b867-4502-a5ca-925ea6dc8734	completed	5ca81099-f4c1-4f7d-879d-061f6c393022	2025-12-03 10:58:19.776759+00
e4215297-3cf3-49d9-b300-1ea057e8ce8a	ee9da2c7-09b8-4812-a32f-26c8533643ce	in_progress	5ca81099-f4c1-4f7d-879d-061f6c393022	2025-12-03 10:58:58.828043+00
2d9e9ee7-e1d1-428e-865e-91add95a2a47	30f26ecc-5eea-47b6-a8f5-3405d2d339b0	in_progress	5ca81099-f4c1-4f7d-879d-061f6c393022	2025-12-03 11:05:28.693536+00
d58e619f-3848-4fd9-8984-d7dcccb67133	ee9da2c7-09b8-4812-a32f-26c8533643ce	completed	5ca81099-f4c1-4f7d-879d-061f6c393022	2025-12-03 11:05:36.526713+00
e703d9cb-04e0-4b04-ba42-b0608f36c3be	30f26ecc-5eea-47b6-a8f5-3405d2d339b0	completed	5ca81099-f4c1-4f7d-879d-061f6c393022	2025-12-03 11:09:29.229728+00
771d17aa-66de-458f-83f1-02ff55720c95	1c919af1-559d-4a20-aa88-8b94181bcc0c	confirmed	5ca81099-f4c1-4f7d-879d-061f6c393022	2025-12-03 13:01:49.334511+00
39fdf573-5bd4-4be7-a5c8-d2ff5232f227	32f6976e-e179-4423-ac63-3b6000874240	confirmed	5ca81099-f4c1-4f7d-879d-061f6c393022	2025-12-03 13:01:51.219386+00
16041d01-f04d-430c-bd6b-05bf3e75a9b8	1c919af1-559d-4a20-aa88-8b94181bcc0c	on_way	5ca81099-f4c1-4f7d-879d-061f6c393022	2025-12-03 13:01:52.585436+00
87113ba0-98d6-4ee0-849f-3c924580cfe1	5b7a0af7-e287-46da-9cb1-03752b608e73	confirmed	5ca81099-f4c1-4f7d-879d-061f6c393022	2025-12-03 13:02:07.014091+00
426b7600-aefd-480a-8963-d983ac4d8b5d	32f6976e-e179-4423-ac63-3b6000874240	on_way	5ca81099-f4c1-4f7d-879d-061f6c393022	2025-12-03 13:02:23.297047+00
d1e5d6be-bfdc-4aa4-ba2d-7c26483a18ed	1c919af1-559d-4a20-aa88-8b94181bcc0c	in_progress	5ca81099-f4c1-4f7d-879d-061f6c393022	2025-12-03 13:02:25.913472+00
900d259b-95f5-4723-b947-3949441e6430	1c919af1-559d-4a20-aa88-8b94181bcc0c	completed	5ca81099-f4c1-4f7d-879d-061f6c393022	2025-12-03 13:02:32.239959+00
09dc4999-77a6-4750-afd4-48bab1ab467a	22825a73-3918-4b6c-8505-bad4fc5fe2c5	confirmed	5ca81099-f4c1-4f7d-879d-061f6c393022	2025-12-03 13:47:00.99835+00
1a3bdb1a-a6f3-41e9-9565-65df98692041	22825a73-3918-4b6c-8505-bad4fc5fe2c5	on_way	5ca81099-f4c1-4f7d-879d-061f6c393022	2025-12-03 13:47:17.943958+00
56a90e73-d6ec-41a6-9da9-bddd50cf1584	5b7a0af7-e287-46da-9cb1-03752b608e73	on_way	5ca81099-f4c1-4f7d-879d-061f6c393022	2025-12-03 13:47:25.213813+00
dfe70e1c-2ff2-4588-ae5e-1e409174f44e	22825a73-3918-4b6c-8505-bad4fc5fe2c5	in_progress	5ca81099-f4c1-4f7d-879d-061f6c393022	2025-12-03 13:47:37.338842+00
f77b653e-416e-4f09-9fec-9880591a2a07	22825a73-3918-4b6c-8505-bad4fc5fe2c5	completed	5ca81099-f4c1-4f7d-879d-061f6c393022	2025-12-03 13:47:53.093841+00
f50d4aed-be50-4757-a859-2a0e14987fad	cf1a691a-746b-4132-9d33-83a6e27c2eae	confirmed	5ca81099-f4c1-4f7d-879d-061f6c393022	2025-12-03 13:52:52.087217+00
8f137c0b-525d-4862-b6ea-041e18573b2e	0b19c9de-bf44-4d7c-9928-2a4acb6c3fad	confirmed	5ca81099-f4c1-4f7d-879d-061f6c393022	2025-12-03 13:53:36.151512+00
f6172afd-a9b6-43c8-b1c9-163915251972	0b19c9de-bf44-4d7c-9928-2a4acb6c3fad	confirmed	5ca81099-f4c1-4f7d-879d-061f6c393022	2025-12-03 13:53:36.181926+00
1af5f817-55a3-4839-8a89-93a80ca4947c	0b19c9de-bf44-4d7c-9928-2a4acb6c3fad	confirmed	5ca81099-f4c1-4f7d-879d-061f6c393022	2025-12-03 13:53:36.382669+00
89378983-18ea-4b70-a5de-946ba6217dbb	cf1a691a-746b-4132-9d33-83a6e27c2eae	on_way	5ca81099-f4c1-4f7d-879d-061f6c393022	2025-12-03 13:54:00.723801+00
46fcb43b-181d-42bb-b8d7-1e1e1c2e050f	32f6976e-e179-4423-ac63-3b6000874240	in_progress	5ca81099-f4c1-4f7d-879d-061f6c393022	2025-12-03 13:54:14.445253+00
22e6a082-7655-415d-85e7-f5520517668b	5b7a0af7-e287-46da-9cb1-03752b608e73	in_progress	5ca81099-f4c1-4f7d-879d-061f6c393022	2025-12-03 13:58:09.44539+00
963e75e2-9883-499e-9c12-6e83d2359ffd	32f6976e-e179-4423-ac63-3b6000874240	confirmed	5ca81099-f4c1-4f7d-879d-061f6c393022	2025-12-03 14:01:07.829088+00
a8ef1494-3e7f-4b44-b370-5a08b1af9499	32f6976e-e179-4423-ac63-3b6000874240	on_way	5ca81099-f4c1-4f7d-879d-061f6c393022	2025-12-03 14:02:15.752381+00
2c7caf34-31f8-483c-9ee4-6c87508b6713	32f6976e-e179-4423-ac63-3b6000874240	in_progress	5ca81099-f4c1-4f7d-879d-061f6c393022	2025-12-03 14:02:45.53388+00
d4b487e1-ce4b-490e-9b24-d2269d16dbd6	32f6976e-e179-4423-ac63-3b6000874240	completed	5ca81099-f4c1-4f7d-879d-061f6c393022	2025-12-03 14:03:01.895911+00
6a1b1da4-e1ee-499a-a427-5b29c8eb2dab	6931f2a2-6794-456a-8a9b-1dda7ad4e2ae	confirmed	5ca81099-f4c1-4f7d-879d-061f6c393022	2025-12-03 14:18:05.342613+00
23ee4fba-f334-4445-9d85-c2b3bef36e79	dbe53ace-0bbc-41a2-b067-c9532e5b551f	confirmed	5ca81099-f4c1-4f7d-879d-061f6c393022	2025-12-03 14:18:49.427827+00
0be67c3b-a76c-4c55-8280-a842053d66c0	6931f2a2-6794-456a-8a9b-1dda7ad4e2ae	on_way	5ca81099-f4c1-4f7d-879d-061f6c393022	2025-12-03 14:21:14.278974+00
b110c26f-6e39-491e-9dd0-76d94b732201	6931f2a2-6794-456a-8a9b-1dda7ad4e2ae	in_progress	5ca81099-f4c1-4f7d-879d-061f6c393022	2025-12-03 14:23:11.2423+00
38d3f483-7930-4d29-b87a-37fba974ceee	93796c0e-a04e-44d2-94e3-7517fe48a794	confirmed	6f8e22c4-af75-4865-bad3-8494742c5047	2025-12-02 18:11:22.964686+00
285d3cbe-d73d-49a4-a489-b5a027f72d24	93796c0e-a04e-44d2-94e3-7517fe48a794	on_way	6f8e22c4-af75-4865-bad3-8494742c5047	2025-12-02 18:11:34.032231+00
68b9c6f9-d319-40ec-bc1b-e85ce5e5faa3	93796c0e-a04e-44d2-94e3-7517fe48a794	in_progress	6f8e22c4-af75-4865-bad3-8494742c5047	2025-12-02 18:11:49.279075+00
f86bbcac-3143-4a8c-91d8-1f220d4b2628	93796c0e-a04e-44d2-94e3-7517fe48a794	completed	6f8e22c4-af75-4865-bad3-8494742c5047	2025-12-02 18:11:59.853096+00
ef478457-9bfa-4f7d-a7a5-41f765adca67	0b19c9de-bf44-4d7c-9928-2a4acb6c3fad	on_way	5ca81099-f4c1-4f7d-879d-061f6c393022	2025-12-03 14:59:52.675496+00
418c112f-5a66-4528-bd65-464ff22b5f8e	cf1a691a-746b-4132-9d33-83a6e27c2eae	in_progress	5ca81099-f4c1-4f7d-879d-061f6c393022	2025-12-03 15:00:34.01676+00
2c007981-8f5d-45d5-af7b-e9d14a5a4d32	b7d577db-e68f-46d5-ad23-c3d0738addc2	confirmed	5ca81099-f4c1-4f7d-879d-061f6c393022	2025-12-03 15:41:35.228897+00
1a03fea1-7c85-49f6-af04-2977882ac23f	b7d577db-e68f-46d5-ad23-c3d0738addc2	confirmed	5ca81099-f4c1-4f7d-879d-061f6c393022	2025-12-03 15:41:36.99401+00
956cf802-a998-4c1e-a6ba-1f4cc8e2fbf5	b7d577db-e68f-46d5-ad23-c3d0738addc2	on_way	5ca81099-f4c1-4f7d-879d-061f6c393022	2025-12-03 15:41:40.019372+00
2b4aa721-90b6-4024-9c61-96b12191539f	5b7a0af7-e287-46da-9cb1-03752b608e73	confirmed	5ca81099-f4c1-4f7d-879d-061f6c393022	2025-12-03 16:00:40.210284+00
7693cb40-a198-4e19-a08c-f8a81597ca9f	6931f2a2-6794-456a-8a9b-1dda7ad4e2ae	confirmed	5ca81099-f4c1-4f7d-879d-061f6c393022	2025-12-03 16:00:41.156494+00
f30f2fde-af3b-44cc-8c71-9f31811ba227	cf1a691a-746b-4132-9d33-83a6e27c2eae	confirmed	5ca81099-f4c1-4f7d-879d-061f6c393022	2025-12-03 16:00:42.587794+00
2993ce1a-3871-421d-96c5-51e1beff42db	69963e8d-4603-477d-8e69-541bcda1f8e1	on_way	5ca81099-f4c1-4f7d-879d-061f6c393022	2025-12-03 16:45:20.498495+00
14e8b186-ca5c-4354-8abb-8a0b82c38ffd	540a64c5-78c5-444b-90e6-cca2bf16572e	on_way	5ca81099-f4c1-4f7d-879d-061f6c393022	2025-12-03 16:46:52.566584+00
7181de7d-5301-440f-8c72-912f798aa2df	540a64c5-78c5-444b-90e6-cca2bf16572e	on_way	5ca81099-f4c1-4f7d-879d-061f6c393022	2025-12-03 16:46:52.920863+00
a9db4134-7756-4864-a850-13bd941707c0	540a64c5-78c5-444b-90e6-cca2bf16572e	on_way	5ca81099-f4c1-4f7d-879d-061f6c393022	2025-12-03 16:46:54.099515+00
385d2d83-8e73-46b9-8517-38275b58245c	540a64c5-78c5-444b-90e6-cca2bf16572e	in_progress	5ca81099-f4c1-4f7d-879d-061f6c393022	2025-12-03 16:47:02.205017+00
dfce3a09-6644-4e84-a8b3-c36200b17b0d	540a64c5-78c5-444b-90e6-cca2bf16572e	completed	5ca81099-f4c1-4f7d-879d-061f6c393022	2025-12-03 16:47:13.218981+00
97ae0252-d6a9-4d81-9409-55530bd3f7c7	4f338d9a-43a3-458d-bac6-e185a062dbe3	on_way	5ca81099-f4c1-4f7d-879d-061f6c393022	2025-12-03 16:57:52.556605+00
c78fb286-770a-414a-96bb-40dabebe6ba5	4f338d9a-43a3-458d-bac6-e185a062dbe3	on_way	5ca81099-f4c1-4f7d-879d-061f6c393022	2025-12-03 16:57:53.042758+00
5668ac86-410b-400b-b2af-f4418c35cddf	4f338d9a-43a3-458d-bac6-e185a062dbe3	in_progress	5ca81099-f4c1-4f7d-879d-061f6c393022	2025-12-03 16:57:58.210803+00
cee3935d-c0c8-46b9-aa51-a187cfe9bb53	4f338d9a-43a3-458d-bac6-e185a062dbe3	completed	5ca81099-f4c1-4f7d-879d-061f6c393022	2025-12-03 16:58:05.518551+00
09d63b0c-49e8-47e0-a4d5-218e6d91650b	8a5446b1-a98d-4437-9f64-223c15aaff64	confirmed	5ca81099-f4c1-4f7d-879d-061f6c393022	2025-12-03 17:16:31.611521+00
ee0ee0b1-c9ae-40e2-9b60-0ae50c79171e	8a5446b1-a98d-4437-9f64-223c15aaff64	on_way	5ca81099-f4c1-4f7d-879d-061f6c393022	2025-12-03 17:16:38.014937+00
2d2a9eb8-82e5-4a62-a300-be5a7d79162d	8a5446b1-a98d-4437-9f64-223c15aaff64	in_progress	5ca81099-f4c1-4f7d-879d-061f6c393022	2025-12-03 17:16:41.035796+00
8a71896f-da02-4ae9-bd03-9da52308de4d	5b7a0af7-e287-46da-9cb1-03752b608e73	on_way	5ca81099-f4c1-4f7d-879d-061f6c393022	2025-12-03 17:39:57.016191+00
a9a9338f-655a-44df-b16a-0664c26571cc	2eb97732-0e43-44c2-b4c7-17de651bd903	in_progress	5ca81099-f4c1-4f7d-879d-061f6c393022	2025-12-03 17:40:05.824631+00
62d4cc31-52df-4810-a2a1-f0099f857075	cf1a691a-746b-4132-9d33-83a6e27c2eae	on_way	5ca81099-f4c1-4f7d-879d-061f6c393022	2025-12-03 17:47:13.960669+00
fd33d26d-c82a-4f00-a481-fe50d7f5d894	e5064417-8956-49f4-911f-8eb83cb0013d	on_way	5ca81099-f4c1-4f7d-879d-061f6c393022	2025-12-03 17:47:20.634733+00
ab34b8cf-b4fd-413e-af5f-817884e3b4bd	c9063c06-d01e-4645-85c0-5c69638ebed9	in_progress	5ca81099-f4c1-4f7d-879d-061f6c393022	2025-12-03 17:47:28.285226+00
d67cc18d-9886-40f3-8677-7660a3e7f7f5	8a5446b1-a98d-4437-9f64-223c15aaff64	confirmed	5ca81099-f4c1-4f7d-879d-061f6c393022	2025-12-03 17:47:31.2274+00
849ccbbb-d4b4-4ccd-85b1-8e95acb1457e	b7d577db-e68f-46d5-ad23-c3d0738addc2	in_progress	5ca81099-f4c1-4f7d-879d-061f6c393022	2025-12-03 17:47:32.592916+00
758dd0ed-14da-4582-9315-78a140486167	e995f198-c0cb-4a2a-8d0a-c3108e2f25c1	pending	9f7cbe52-d1e4-4310-aa79-6a300f5ccb6c	2025-12-03 18:03:29.549598+00
da829c3e-2125-4e09-a52d-bbd02f1248f9	e995f198-c0cb-4a2a-8d0a-c3108e2f25c1	confirmed	5ca81099-f4c1-4f7d-879d-061f6c393022	2025-12-03 18:04:35.001512+00
6bdb0c7b-68d2-4988-8de8-e422a75b74d3	e995f198-c0cb-4a2a-8d0a-c3108e2f25c1	on_way	5ca81099-f4c1-4f7d-879d-061f6c393022	2025-12-03 18:04:47.39265+00
9ec3a366-29b5-40bd-a4c7-c14257063366	e995f198-c0cb-4a2a-8d0a-c3108e2f25c1	in_progress	5ca81099-f4c1-4f7d-879d-061f6c393022	2025-12-03 18:05:04.500469+00
a2a19c3a-5ca6-4559-94ab-c4a5f190235d	e995f198-c0cb-4a2a-8d0a-c3108e2f25c1	completed	5ca81099-f4c1-4f7d-879d-061f6c393022	2025-12-03 18:05:35.763538+00
0cda3c16-9f14-4619-98aa-396b57cd8fbd	8a5446b1-a98d-4437-9f64-223c15aaff64	on_way	5ca81099-f4c1-4f7d-879d-061f6c393022	2025-12-04 06:33:39.448864+00
1cb5da27-de67-4d71-b70f-56673d7f5214	8a5446b1-a98d-4437-9f64-223c15aaff64	in_progress	5ca81099-f4c1-4f7d-879d-061f6c393022	2025-12-04 06:33:44.410163+00
553ddf70-1752-4852-9e00-84435db4a1c4	8a5446b1-a98d-4437-9f64-223c15aaff64	completed	5ca81099-f4c1-4f7d-879d-061f6c393022	2025-12-04 06:33:50.511721+00
f6b5fca1-22fe-40a6-8eac-e0327c9280ac	0b19c9de-bf44-4d7c-9928-2a4acb6c3fad	in_progress	5ca81099-f4c1-4f7d-879d-061f6c393022	2025-12-04 06:34:24.297021+00
\.


--
-- Data for Name: bookings; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.bookings (id, booking_number, user_id, provider_id, service_id, city_id, address_id, service_address, service_lat, service_lng, scheduled_date, status, user_quoted_price, provider_quoted_price, final_price, payment_status, payment_method, discount_amount, cashback_earned, rewards_earned, wallet_used, notes, created_at, updated_at, completed_at, sub_service_id, sub_service_name, base_charge, hourly_charge, for_whom, other_contact, rate_quote_id, provider_counter_price, final_agreed_price, quote_status, payment_confirmed_at, quote_expires_at, cancelled_by, cancellation_reason, cancelled_by_provider_id) FROM stdin;
cf1a691a-746b-4132-9d33-83a6e27c2eae	HS20251202000042	6633dc36-aa0b-431e-a1d1-0a5993941950	fa36c76c-5e1b-49c6-93d2-4c0d357a916c	5103e5ba-3013-47b1-8297-5a01eb5c27b9	8a451c94-2e05-47f2-89fb-1f37abb52aff	0951c05b-212e-49bd-9f19-d2a7229bff5e	Mahatma Gandhi Road, Shahganj, Agra, Uttar Pradesh, 282002, India	27.17667010	78.00807450	2025-12-02 18:30:00+00	on_way	\N	\N	500.00	pending	\N	0.00	0.00	0.00	0.00	[Provider Cancelled]: test	2025-12-02 18:00:15.490287+00	2025-12-03 17:47:13.682728+00	\N	\N	AC Repair	500.00	\N	self	\N	\N	\N	\N	none	\N	\N	\N	\N	\N
c9063c06-d01e-4645-85c0-5c69638ebed9	HS20251203000063	9f7cbe52-d1e4-4310-aa79-6a300f5ccb6c	fa36c76c-5e1b-49c6-93d2-4c0d357a916c	5103e5ba-3013-47b1-8297-5a01eb5c27b9	8a451c94-2e05-47f2-89fb-1f37abb52aff	75734178-c271-4d6e-aee7-fdf98804c243	SIKANDRA, RK PURAM, AGRA, 282007	27.24464840	77.89388950	2025-12-03 18:40:00+00	completed	300.00	\N	300.00	paid	cash	0.00	0.00	0.00	0.00	\N	2025-12-03 15:38:55.958987+00	2025-12-03 17:48:00.702834+00	\N	\N	AC Repair	500.00	\N	self	\N	\N	\N	\N	accepted	\N	\N	\N	\N	\N
e5064417-8956-49f4-911f-8eb83cb0013d	HS20251203000061	9f7cbe52-d1e4-4310-aa79-6a300f5ccb6c	fa36c76c-5e1b-49c6-93d2-4c0d357a916c	5103e5ba-3013-47b1-8297-5a01eb5c27b9	8a451c94-2e05-47f2-89fb-1f37abb52aff	75734178-c271-4d6e-aee7-fdf98804c243	Kiraoli, αñåαñùαñ░αñ╛, Uttar Pradesh, India	27.24464840	77.89388950	2025-12-03 18:40:00+00	completed	300.00	\N	300.00	paid	cash	0.00	0.00	0.00	0.00	\N	2025-12-03 15:13:05.782791+00	2025-12-03 17:48:07.91496+00	\N	\N	AC Repair	500.00	\N	self	\N	\N	\N	\N	accepted	\N	\N	\N	\N	\N
b7d577db-e68f-46d5-ad23-c3d0738addc2	HS20251203000062	9f7cbe52-d1e4-4310-aa79-6a300f5ccb6c	fa36c76c-5e1b-49c6-93d2-4c0d357a916c	5103e5ba-3013-47b1-8297-5a01eb5c27b9	8a451c94-2e05-47f2-89fb-1f37abb52aff	75734178-c271-4d6e-aee7-fdf98804c243	SIKANDRA, RK PURAM, AGRA, 282007	27.24464840	77.89388950	2025-12-03 18:45:00+00	completed	\N	\N	500.00	paid	upi	0.00	0.00	0.00	0.00	\N	2025-12-03 15:38:16.845844+00	2025-12-03 17:48:27.363718+00	\N	\N	AC Repair	500.00	\N	self	\N	\N	\N	\N	none	\N	\N	\N	\N	\N
32f6976e-e179-4423-ac63-3b6000874240	HS20251203000057	9f7cbe52-d1e4-4310-aa79-6a300f5ccb6c	fa36c76c-5e1b-49c6-93d2-4c0d357a916c	5103e5ba-3013-47b1-8297-5a01eb5c27b9	8a451c94-2e05-47f2-89fb-1f37abb52aff	\N	Agra, αñåαñùαñ░αñ╛, Uttar Pradesh, 282007, India	27.21032380	77.97643010	2025-12-03 09:50:00+00	completed	\N	\N	500.00	paid	cash	0.00	0.00	0.00	0.00	[Provider Cancelled]: test 57	2025-12-03 08:26:17.785358+00	2025-12-03 14:03:01.732925+00	\N	\N	AC Repair	500.00	\N	self	\N	\N	\N	\N	none	\N	\N	\N	\N	\N
93796c0e-a04e-44d2-94e3-7517fe48a794	HS20251202000043	9f7cbe52-d1e4-4310-aa79-6a300f5ccb6c	13e5f99d-68a2-47eb-94f6-dabf18adf6ce	5103e5ba-3013-47b1-8297-5a01eb5c27b9	8a451c94-2e05-47f2-89fb-1f37abb52aff	\N	Mahatma Gandhi Road, Shahganj, Agra, αñåαñùαñ░αñ╛, Uttar Pradesh, 282002, India	27.17667010	78.00807450	2025-12-02 19:05:00+00	completed	\N	\N	500.00	paid	cash	0.00	0.00	0.00	0.00	\N	2025-12-02 18:10:51.345893+00	2025-12-02 18:12:12.017524+00	\N	\N	AC Repair	500.00	\N	self	\N	\N	\N	\N	none	2025-12-02 18:12:38.025+00	\N	\N	\N	\N
dbe53ace-0bbc-41a2-b067-c9532e5b551f	HS20251202000045	9f7cbe52-d1e4-4310-aa79-6a300f5ccb6c	fa36c76c-5e1b-49c6-93d2-4c0d357a916c	5103e5ba-3013-47b1-8297-5a01eb5c27b9	8a451c94-2e05-47f2-89fb-1f37abb52aff	\N	Mahatma Gandhi Road, Shahganj, Agra, αñåαñùαñ░αñ╛, Uttar Pradesh, 282002, India	27.17667010	78.00807450	2025-12-02 18:50:00+00	confirmed	450.00	\N	450.00	pending	\N	0.00	0.00	0.00	0.00	[Provider Cancelled]: gATE CLOUSED	2025-12-02 18:14:14.748058+00	2025-12-03 14:18:49.231098+00	\N	\N	AC Repair	500.00	\N	self	\N	\N	\N	\N	accepted	\N	\N	\N	\N	\N
e995f198-c0cb-4a2a-8d0a-c3108e2f25c1	HS20251203000071	9f7cbe52-d1e4-4310-aa79-6a300f5ccb6c	fa36c76c-5e1b-49c6-93d2-4c0d357a916c	5103e5ba-3013-47b1-8297-5a01eb5c27b9	8a451c94-2e05-47f2-89fb-1f37abb52aff	75734178-c271-4d6e-aee7-fdf98804c243	SIKANDRA, RK PURAM, AGRA, 282007	27.24464840	77.89388950	\N	completed	\N	\N	500.00	paid	online	0.00	0.00	0.00	0.00	\N	2025-12-03 18:03:29.374747+00	2025-12-03 18:05:35.629379+00	\N	\N	AC Repair	500.00	\N	self	\N	\N	\N	\N	none	\N	\N	\N	\N	\N
0b19c9de-bf44-4d7c-9928-2a4acb6c3fad	HS20251202000044	9f7cbe52-d1e4-4310-aa79-6a300f5ccb6c	fa36c76c-5e1b-49c6-93d2-4c0d357a916c	5103e5ba-3013-47b1-8297-5a01eb5c27b9	8a451c94-2e05-47f2-89fb-1f37abb52aff	\N	Mahatma Gandhi Road, Shahganj, Agra, αñåαñùαñ░αñ╛, Uttar Pradesh, 282002, India	27.17667010	78.00807450	2025-12-02 19:00:00+00	in_progress	\N	\N	500.00	pending	\N	0.00	0.00	0.00	0.00	[Provider Cancelled]: mistakenly accept	2025-12-02 18:13:41.519282+00	2025-12-04 06:34:24.052772+00	\N	\N	AC Repair	500.00	\N	self	\N	\N	\N	\N	none	\N	\N	\N	\N	\N
3cbd1da7-e6bb-429c-81e9-850f367bcd9f	HS20251202000046	9f7cbe52-d1e4-4310-aa79-6a300f5ccb6c	13e5f99d-68a2-47eb-94f6-dabf18adf6ce	5103e5ba-3013-47b1-8297-5a01eb5c27b9	8a451c94-2e05-47f2-89fb-1f37abb52aff	\N	Mahatma Gandhi Road, Shahganj, Agra, αñåαñùαñ░αñ╛, Uttar Pradesh, 282002, India	27.17667010	78.00807450	2025-12-01 18:40:00+00	quote_sent	470.00	\N	\N	pending	\N	0.00	0.00	0.00	0.00	\N	2025-12-02 18:16:14.088051+00	2025-12-02 18:20:02.35052+00	\N	\N	AC Repair	500.00	\N	self	\N	\N	480.00	\N	provider_countered	\N	2025-12-03 18:20:28.353+00	\N	\N	\N
26a5b1e3-5037-42f2-b25c-36fca34e2d73	HS20251202000048	9f7cbe52-d1e4-4310-aa79-6a300f5ccb6c	13e5f99d-68a2-47eb-94f6-dabf18adf6ce	5103e5ba-3013-47b1-8297-5a01eb5c27b9	8a451c94-2e05-47f2-89fb-1f37abb52aff	\N	Mahatma Gandhi Road, Shahganj, Agra, Uttar Pradesh, 282002, India	27.17667010	78.00807450	2025-12-02 19:30:00+00	pending	\N	\N	500.00	pending	\N	0.00	0.00	0.00	0.00	\N	2025-12-02 18:59:50.14617+00	2025-12-02 18:59:50.14617+00	\N	\N	AC Repair	500.00	\N	self	\N	\N	\N	\N	none	\N	\N	\N	\N	\N
342f3ee0-763d-47ba-9aee-c15c9b4226ea	HS20251202000049	9f7cbe52-d1e4-4310-aa79-6a300f5ccb6c	13e5f99d-68a2-47eb-94f6-dabf18adf6ce	5103e5ba-3013-47b1-8297-5a01eb5c27b9	8a451c94-2e05-47f2-89fb-1f37abb52aff	\N	Mahatma Gandhi Road, Shahganj, Agra, Uttar Pradesh, 282002, India	27.17667010	78.00807450	2025-12-02 19:30:00+00	pending	\N	\N	500.00	pending	\N	0.00	0.00	0.00	0.00	\N	2025-12-02 19:00:29.950506+00	2025-12-02 19:00:29.950506+00	\N	\N	AC Repair	500.00	\N	self	\N	\N	\N	\N	none	\N	\N	\N	\N	\N
11078345-afce-4172-b013-372b8c843857	HS20251202000050	9f7cbe52-d1e4-4310-aa79-6a300f5ccb6c	13e5f99d-68a2-47eb-94f6-dabf18adf6ce	5103e5ba-3013-47b1-8297-5a01eb5c27b9	8a451c94-2e05-47f2-89fb-1f37abb52aff	\N	Mahatma Gandhi Road, Shahganj, Agra, Uttar Pradesh, 282002, India	27.17667010	78.00807450	2025-12-02 19:30:00+00	pending	\N	\N	500.00	pending	\N	0.00	0.00	0.00	0.00	\N	2025-12-02 19:01:59.450394+00	2025-12-02 19:01:59.450394+00	\N	\N	AC Repair	500.00	\N	self	\N	\N	\N	\N	none	\N	\N	\N	\N	\N
81b8bdb3-b213-4edd-b0a5-066112728fdf	HS20251203000060	9f7cbe52-d1e4-4310-aa79-6a300f5ccb6c	fa36c76c-5e1b-49c6-93d2-4c0d357a916c	5103e5ba-3013-47b1-8297-5a01eb5c27b9	8a451c94-2e05-47f2-89fb-1f37abb52aff	\N	Agra, αñåαñùαñ░αñ╛, Uttar Pradesh, 282004, India	27.14071740	78.03095420	2025-12-03 18:20:00+00	confirmed	400.00	\N	400.00	pending	\N	0.00	0.00	0.00	0.00	\N	2025-12-03 14:25:09.990863+00	2025-12-03 15:59:53.474796+00	\N	\N	AC Repair	500.00	\N	self	\N	\N	\N	\N	accepted	\N	\N	\N	\N	\N
5c0683f5-c02c-42f6-8254-e4c8d0301121	HS20251203000055	9f7cbe52-d1e4-4310-aa79-6a300f5ccb6c	fa36c76c-5e1b-49c6-93d2-4c0d357a916c	5103e5ba-3013-47b1-8297-5a01eb5c27b9	8a451c94-2e05-47f2-89fb-1f37abb52aff	\N	Taj Ganj, Agra, Uttar Pradesh, 282004, India	27.16467200	78.03043840	2025-12-03 06:40:00+00	completed	\N	\N	500.00	pending	\N	0.00	0.00	0.00	0.00	\N	2025-12-03 05:40:14.874021+00	2025-12-03 06:21:14.514988+00	\N	\N	AC Repair	500.00	\N	self	\N	\N	\N	\N	none	\N	\N	\N	\N	\N
6931f2a2-6794-456a-8a9b-1dda7ad4e2ae	HS20251202000047	9f7cbe52-d1e4-4310-aa79-6a300f5ccb6c	fa36c76c-5e1b-49c6-93d2-4c0d357a916c	5103e5ba-3013-47b1-8297-5a01eb5c27b9	8a451c94-2e05-47f2-89fb-1f37abb52aff	\N	Mahatma Gandhi Road, Shahganj, Agra, αñåαñùαñ░αñ╛, Uttar Pradesh, 282002, India	27.17667010	78.00807450	2025-12-02 18:55:00+00	confirmed	475.00	\N	475.00	pending	\N	0.00	0.00	0.00	0.00	[Provider Cancelled]: mistakenly\n[Provider Cancelled]: test	2025-12-02 18:16:52.07709+00	2025-12-03 16:00:40.903136+00	\N	\N	AC Repair	500.00	\N	self	\N	\N	\N	\N	accepted	\N	\N	\N	\N	\N
d7855c02-1bdb-4fd0-a2c9-1165cda94482	HS20251203000054	9f7cbe52-d1e4-4310-aa79-6a300f5ccb6c	fa36c76c-5e1b-49c6-93d2-4c0d357a916c	5103e5ba-3013-47b1-8297-5a01eb5c27b9	8a451c94-2e05-47f2-89fb-1f37abb52aff	\N	Mahatma Gandhi Road, Shahganj, Agra, Uttar Pradesh, 282002, India	27.17667010	78.00807450	2025-12-03 05:25:00+00	completed	\N	\N	500.00	pending	\N	0.00	0.00	0.00	0.00	\N	2025-12-03 05:16:19.431866+00	2025-12-03 08:27:24.56628+00	\N	\N	AC Repair	500.00	\N	self	\N	\N	\N	\N	none	\N	\N	\N	\N	\N
540a64c5-78c5-444b-90e6-cca2bf16572e	HS20251203000065	9f7cbe52-d1e4-4310-aa79-6a300f5ccb6c	fa36c76c-5e1b-49c6-93d2-4c0d357a916c	5103e5ba-3013-47b1-8297-5a01eb5c27b9	8a451c94-2e05-47f2-89fb-1f37abb52aff	75734178-c271-4d6e-aee7-fdf98804c243	SIKANDRA, RK PURAM, AGRA, 282007	27.24464840	77.89388950	\N	completed	\N	\N	100.00	paid	cash	0.00	0.00	0.00	0.00	\N	2025-12-03 16:46:23.463218+00	2025-12-03 16:47:13.063012+00	\N	\N	AC Repair	500.00	\N	self	\N	8681db2f-67cd-4280-a925-cc57d0dd7d6f	\N	\N	none	\N	\N	\N	\N	\N
60d4bfe8-b867-4502-a5ca-925ea6dc8734	HS20251202000053	9f7cbe52-d1e4-4310-aa79-6a300f5ccb6c	fa36c76c-5e1b-49c6-93d2-4c0d357a916c	5103e5ba-3013-47b1-8297-5a01eb5c27b9	8a451c94-2e05-47f2-89fb-1f37abb52aff	\N	Mahatma Gandhi Road, Shahganj, Agra, Uttar Pradesh, 282002, India	27.17667010	78.00807450	2025-12-02 19:55:00+00	completed	\N	\N	500.00	pending	\N	0.00	0.00	0.00	0.00	\N	2025-12-02 19:27:40.767948+00	2025-12-03 10:58:19.703011+00	\N	\N	AC Repair	500.00	\N	self	\N	\N	\N	\N	none	\N	\N	\N	\N	\N
ee9da2c7-09b8-4812-a32f-26c8533643ce	HS20251202000052	9f7cbe52-d1e4-4310-aa79-6a300f5ccb6c	fa36c76c-5e1b-49c6-93d2-4c0d357a916c	5103e5ba-3013-47b1-8297-5a01eb5c27b9	8a451c94-2e05-47f2-89fb-1f37abb52aff	\N	Mahatma Gandhi Road, Shahganj, Agra, Uttar Pradesh, 282002, India	27.17667010	78.00807450	2025-12-02 19:45:00+00	completed	\N	\N	500.00	pending	cash	0.00	0.00	0.00	0.00	\N	2025-12-02 19:16:59.849577+00	2025-12-03 11:05:36.39348+00	\N	\N	AC Repair	500.00	\N	self	\N	\N	\N	\N	none	\N	\N	\N	\N	\N
30f26ecc-5eea-47b6-a8f5-3405d2d339b0	HS20251202000051	9f7cbe52-d1e4-4310-aa79-6a300f5ccb6c	fa36c76c-5e1b-49c6-93d2-4c0d357a916c	5103e5ba-3013-47b1-8297-5a01eb5c27b9	8a451c94-2e05-47f2-89fb-1f37abb52aff	\N	Mahatma Gandhi Road, Shahganj, Agra, Uttar Pradesh, 282002, India	27.17667010	78.00807450	2025-12-02 19:35:00+00	completed	\N	\N	500.00	paid	cash	0.00	0.00	0.00	0.00	\N	2025-12-02 19:10:49.146953+00	2025-12-03 11:09:29.133369+00	\N	\N	AC Repair	500.00	\N	self	\N	\N	\N	\N	none	\N	\N	\N	\N	\N
69963e8d-4603-477d-8e69-541bcda1f8e1	HS20251203000064	9f7cbe52-d1e4-4310-aa79-6a300f5ccb6c	\N	5103e5ba-3013-47b1-8297-5a01eb5c27b9	8a451c94-2e05-47f2-89fb-1f37abb52aff	75734178-c271-4d6e-aee7-fdf98804c243	SIKANDRA, RK PURAM, AGRA, 282007	27.24464840	77.89388950	2025-12-03 19:00:00+00	pending	299.98	\N	299.98	pending	\N	0.00	0.00	0.00	0.00	[Provider Cancelled]: adad	2025-12-03 15:59:26.956822+00	2025-12-03 17:18:08.743216+00	\N	\N	AC Repair	500.00	\N	self	\N	\N	\N	\N	accepted	\N	\N	\N	\N	\N
1c919af1-559d-4a20-aa88-8b94181bcc0c	HS20251203000058	9f7cbe52-d1e4-4310-aa79-6a300f5ccb6c	fa36c76c-5e1b-49c6-93d2-4c0d357a916c	5103e5ba-3013-47b1-8297-5a01eb5c27b9	8a451c94-2e05-47f2-89fb-1f37abb52aff	\N	Agra, αñåαñùαñ░αñ╛, Uttar Pradesh, 282007, India	27.21032400	77.97641840	2025-12-03 15:10:00+00	completed	\N	\N	500.00	paid	cash	0.00	0.00	0.00	0.00	\N	2025-12-03 11:36:02.766392+00	2025-12-03 13:02:32.181714+00	\N	\N	AC Repair	500.00	\N	self	\N	\N	\N	\N	none	\N	\N	\N	\N	\N
22825a73-3918-4b6c-8505-bad4fc5fe2c5	HS20251203000059	9f7cbe52-d1e4-4310-aa79-6a300f5ccb6c	fa36c76c-5e1b-49c6-93d2-4c0d357a916c	5103e5ba-3013-47b1-8297-5a01eb5c27b9	8a451c94-2e05-47f2-89fb-1f37abb52aff	\N	Kiraoli, αñåαñùαñ░αñ╛, Uttar Pradesh, India	27.24464840	77.89388950	2025-12-03 15:30:00+00	completed	\N	\N	500.00	paid	cash	0.00	0.00	0.00	0.00	\N	2025-12-03 13:46:41.201331+00	2025-12-03 13:47:52.901128+00	\N	\N	AC Repair	500.00	\N	self	\N	\N	\N	\N	none	\N	\N	\N	\N	\N
5b7a0af7-e287-46da-9cb1-03752b608e73	HS20251203000056	9f7cbe52-d1e4-4310-aa79-6a300f5ccb6c	fa36c76c-5e1b-49c6-93d2-4c0d357a916c	5103e5ba-3013-47b1-8297-5a01eb5c27b9	8a451c94-2e05-47f2-89fb-1f37abb52aff	\N	Taj Ganj, Agra, Uttar Pradesh, 282004, India	27.16467200	78.03043840	2025-12-03 05:55:00+00	completed	\N	\N	500.00	paid	cash	0.00	0.00	0.00	0.00	[Provider Cancelled]: asfasf\n[Provider Cancelled]: test	2025-12-03 05:44:35.074685+00	2025-12-03 17:48:33.501416+00	\N	\N	AC Repair	500.00	\N	self	\N	\N	\N	\N	none	\N	\N	\N	\N	\N
4f338d9a-43a3-458d-bac6-e185a062dbe3	HS20251203000066	9f7cbe52-d1e4-4310-aa79-6a300f5ccb6c	fa36c76c-5e1b-49c6-93d2-4c0d357a916c	5103e5ba-3013-47b1-8297-5a01eb5c27b9	8a451c94-2e05-47f2-89fb-1f37abb52aff	75734178-c271-4d6e-aee7-fdf98804c243	SIKANDRA, RK PURAM, AGRA, 282007	27.24464840	77.89388950	\N	completed	\N	\N	110.00	paid	cash	0.00	0.00	0.00	0.00	\N	2025-12-03 16:57:25.499015+00	2025-12-03 16:58:04.927349+00	\N	\N	AC Repair	500.00	\N	self	\N	3d7c10b5-1e79-4d87-8296-3aead65f3fab	\N	\N	none	\N	\N	\N	\N	\N
ed51a89c-b517-489b-927b-08acb9ae4b17	HS20251203000068	9f7cbe52-d1e4-4310-aa79-6a300f5ccb6c	\N	5103e5ba-3013-47b1-8297-5a01eb5c27b9	8a451c94-2e05-47f2-89fb-1f37abb52aff	75734178-c271-4d6e-aee7-fdf98804c243	SIKANDRA, RK PURAM, AGRA, 282007	27.24464840	77.89388950	\N	pending	\N	\N	500.00	pending	\N	0.00	0.00	0.00	0.00	\N	2025-12-03 17:10:26.217869+00	2025-12-03 17:10:26.217869+00	\N	\N	AC Repair	500.00	\N	self	\N	\N	\N	\N	none	\N	\N	\N	\N	\N
8a5446b1-a98d-4437-9f64-223c15aaff64	HS20251203000070	9f7cbe52-d1e4-4310-aa79-6a300f5ccb6c	fa36c76c-5e1b-49c6-93d2-4c0d357a916c	5103e5ba-3013-47b1-8297-5a01eb5c27b9	8a451c94-2e05-47f2-89fb-1f37abb52aff	75734178-c271-4d6e-aee7-fdf98804c243	SIKANDRA, RK PURAM, AGRA, 282007	27.24464840	77.89388950	\N	completed	\N	\N	500.00	paid	cash	0.00	0.00	0.00	0.00	[Provider Cancelled]: close	2025-12-03 17:16:16.502518+00	2025-12-04 06:33:50.269843+00	\N	\N	AC Repair	500.00	\N	self	\N	\N	\N	\N	none	\N	\N	\N	\N	\N
9861eb02-033a-4162-85f2-befbcb135500	HS20251203000069	9f7cbe52-d1e4-4310-aa79-6a300f5ccb6c	fa36c76c-5e1b-49c6-93d2-4c0d357a916c	5103e5ba-3013-47b1-8297-5a01eb5c27b9	8a451c94-2e05-47f2-89fb-1f37abb52aff	75734178-c271-4d6e-aee7-fdf98804c243	SIKANDRA, RK PURAM, AGRA, 282007	27.24464840	77.89388950	\N	completed	\N	\N	111.00	paid	cash	0.00	0.00	0.00	0.00	\N	2025-12-03 17:11:37.48541+00	2025-12-03 17:13:44.956728+00	\N	\N	AC Repair	500.00	\N	self	\N	b3ff3b95-0777-4fe5-b9c9-a9d2225488e9	\N	\N	none	\N	\N	\N	\N	\N
2eb97732-0e43-44c2-b4c7-17de651bd903	HS20251203000067	9f7cbe52-d1e4-4310-aa79-6a300f5ccb6c	\N	5103e5ba-3013-47b1-8297-5a01eb5c27b9	8a451c94-2e05-47f2-89fb-1f37abb52aff	75734178-c271-4d6e-aee7-fdf98804c243	SIKANDRA, RK PURAM, AGRA, 282007	27.24464840	77.89388950	\N	pending	100.00	\N	100.00	pending	\N	0.00	0.00	0.00	0.00	[Provider Cancelled]: gatre close	2025-12-03 17:10:08.513652+00	2025-12-03 17:40:21.261671+00	\N	\N	AC Repair	500.00	\N	self	\N	\N	\N	\N	accepted	\N	\N	\N	\N	\N
\.


--
-- Data for Name: cashback_transactions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.cashback_transactions (id, user_id, booking_id, amount, percentage, expiry_date, is_used, used_at, created_at) FROM stdin;
\.


--
-- Data for Name: chat_messages; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.chat_messages (id, booking_id, sender_id, receiver_id, message, is_read, created_at) FROM stdin;
822e0a3b-1ea5-4c3f-8da7-d0d4c63ac7d9	5c0683f5-c02c-42f6-8254-e4c8d0301121	5ca81099-f4c1-4f7d-879d-061f6c393022	9f7cbe52-d1e4-4310-aa79-6a300f5ccb6c	hi	f	2025-12-03 11:07:58.336106+00
77866017-cfd6-425e-9484-a8ee7d32832b	5c0683f5-c02c-42f6-8254-e4c8d0301121	9f7cbe52-d1e4-4310-aa79-6a300f5ccb6c	5ca81099-f4c1-4f7d-879d-061f6c393022	dear	f	2025-12-03 11:08:13.891836+00
9733db25-e88a-4d44-809a-a3d34d5ddb4e	30f26ecc-5eea-47b6-a8f5-3405d2d339b0	9f7cbe52-d1e4-4310-aa79-6a300f5ccb6c	5ca81099-f4c1-4f7d-879d-061f6c393022	hi sir	f	2025-12-03 11:09:51.802194+00
126fa23c-5cf0-40c0-a1e6-595521f8a368	32f6976e-e179-4423-ac63-3b6000874240	9f7cbe52-d1e4-4310-aa79-6a300f5ccb6c	5ca81099-f4c1-4f7d-879d-061f6c393022	test	f	2025-12-03 14:03:13.401525+00
\.


--
-- Data for Name: cities; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.cities (id, name, state, country, is_active, created_at, updated_at) FROM stdin;
8a451c94-2e05-47f2-89fb-1f37abb52aff	AGRA	UTTAR PRADESH	India	t	2025-11-24 14:31:47.259985+00	2025-11-24 14:31:47.259985+00
eb0aae32-b0a6-455a-9057-3db0305f9d53	MATHURA	Uttar Pradesh	India	t	2025-12-01 12:07:36.686952+00	2025-12-01 12:07:36.686952+00
2418f572-98d5-48df-b9ab-f79a716ff067	BAREILLY	Uttar Pradesh	India	t	2025-12-01 12:55:03.611582+00	2025-12-01 12:55:03.611582+00
5ff81ea1-0528-4f98-acf9-8f324adcc63b	Barabanki	Uttar Pradesh	India	t	2025-12-02 15:00:21.559459+00	2025-12-02 15:00:21.559459+00
\.


--
-- Data for Name: city_services; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.city_services (id, city_id, service_id, is_enabled, created_at) FROM stdin;
1c14adc1-49b7-4ad9-b529-99c95d6af781	8a451c94-2e05-47f2-89fb-1f37abb52aff	5103e5ba-3013-47b1-8297-5a01eb5c27b9	t	2025-11-24 14:39:29.552766+00
52c6b5a1-137e-4d3d-8859-a4d95cdeec3c	8a451c94-2e05-47f2-89fb-1f37abb52aff	e28bbfd8-af59-417a-bf5a-b36d0f6f2a82	t	2025-12-03 18:22:46.488169+00
4d880ee3-02ba-4774-8ee3-29b6672788be	8a451c94-2e05-47f2-89fb-1f37abb52aff	7a797cfd-6407-419b-8b17-13001bb8df49	t	2025-12-03 18:22:45.525198+00
1a4abadf-1a90-4715-84e0-e0ad65a7f971	8a451c94-2e05-47f2-89fb-1f37abb52aff	c8b90092-8771-4240-b6dc-e95e67bcba0e	t	2025-11-24 14:39:42.337844+00
7b455789-35b8-4ca4-aba0-db750e48caf8	8a451c94-2e05-47f2-89fb-1f37abb52aff	f2e72aff-a32b-4ff8-b117-9020c156b5e0	t	2025-11-25 08:12:39.290794+00
880cf71f-766f-4e74-bf60-191b14b93101	8a451c94-2e05-47f2-89fb-1f37abb52aff	a39146d2-898a-4e72-af09-098989324b76	t	2025-11-25 08:12:49.560276+00
d911ef7b-be86-4ccf-b0aa-8697d84fbb5d	8a451c94-2e05-47f2-89fb-1f37abb52aff	10a23187-039d-41a9-ad90-a9629b2da08e	t	2025-11-25 08:12:58.426059+00
496290b2-9bd0-453a-993a-547813b8fb65	8a451c94-2e05-47f2-89fb-1f37abb52aff	65222400-c57b-4221-a314-9a504cf752be	t	2025-11-25 08:12:59.449156+00
f8f6c72f-df15-4c4f-84ee-239b3d55760e	8a451c94-2e05-47f2-89fb-1f37abb52aff	e7c75f3f-ced1-4c1e-96ba-670ad57364af	t	2025-11-26 17:11:31.819506+00
106dac56-ac4c-46a1-b397-f2e30a65d07d	8a451c94-2e05-47f2-89fb-1f37abb52aff	4e6d1f73-a7a9-4aae-926e-8752d7fc2b20	t	2025-11-26 17:11:34.569465+00
0387334c-ea72-4b1e-ad4c-6a5ae7f00e6a	8a451c94-2e05-47f2-89fb-1f37abb52aff	e289e6bf-3bb4-4353-8ad5-796c4e957856	t	2025-11-26 17:11:43.868455+00
3cce350e-c253-4dd6-a41b-3dc246c12070	8a451c94-2e05-47f2-89fb-1f37abb52aff	0be12157-2fd7-4c63-b744-2b47f5c7a163	t	2025-11-26 17:11:56.895843+00
5c8715e3-8d23-44dd-b19f-4a1e5b22a683	8a451c94-2e05-47f2-89fb-1f37abb52aff	675d0370-8ced-49fd-91dc-8bd706cca34c	t	2025-11-26 17:11:58.364512+00
33c70097-ee28-42c6-8e57-5d753dc832c5	5ff81ea1-0528-4f98-acf9-8f324adcc63b	a39146d2-898a-4e72-af09-098989324b76	t	2025-12-02 15:00:55.228217+00
91e2ffd2-9f48-4448-802c-5e08c3bfa877	5ff81ea1-0528-4f98-acf9-8f324adcc63b	65222400-c57b-4221-a314-9a504cf752be	t	2025-12-02 15:01:02.723383+00
abd1f58e-df0f-4fcc-b96c-0d2a8f289701	5ff81ea1-0528-4f98-acf9-8f324adcc63b	10a23187-039d-41a9-ad90-a9629b2da08e	t	2025-12-02 15:01:04.533028+00
5f97d98b-b6c4-44a8-ab9e-6cd5ae350fde	5ff81ea1-0528-4f98-acf9-8f324adcc63b	0be12157-2fd7-4c63-b744-2b47f5c7a163	t	2025-12-02 15:02:06.285506+00
756a3c0f-ce68-4a6f-a42c-d9f36422e4d4	5ff81ea1-0528-4f98-acf9-8f324adcc63b	675d0370-8ced-49fd-91dc-8bd706cca34c	t	2025-12-02 15:02:13.617773+00
5f9d5ed1-4ea2-4baa-921d-91dd5a8c8033	5ff81ea1-0528-4f98-acf9-8f324adcc63b	e289e6bf-3bb4-4353-8ad5-796c4e957856	t	2025-12-02 15:02:19.275121+00
dcd78303-8875-4ce0-8148-e4317ad981d7	5ff81ea1-0528-4f98-acf9-8f324adcc63b	4e6d1f73-a7a9-4aae-926e-8752d7fc2b20	t	2025-12-02 15:02:31.255509+00
05287050-212d-4a84-aeb9-7b68315883f9	5ff81ea1-0528-4f98-acf9-8f324adcc63b	e7c75f3f-ced1-4c1e-96ba-670ad57364af	t	2025-12-02 15:02:33.469719+00
c68b3dc4-b65e-4618-936f-57525bbee509	5ff81ea1-0528-4f98-acf9-8f324adcc63b	5103e5ba-3013-47b1-8297-5a01eb5c27b9	t	2025-12-02 15:02:34.592413+00
41f1e229-05dd-472b-8615-74574d8c73ef	5ff81ea1-0528-4f98-acf9-8f324adcc63b	c8b90092-8771-4240-b6dc-e95e67bcba0e	t	2025-12-02 15:02:39.911322+00
338eeeca-5623-4173-bd7a-54774bc1ec2f	5ff81ea1-0528-4f98-acf9-8f324adcc63b	f2e72aff-a32b-4ff8-b117-9020c156b5e0	t	2025-12-02 15:02:41.811784+00
\.


--
-- Data for Name: discount_codes; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.discount_codes (id, code, discount_type, discount_value, min_order_amount, max_discount, usage_limit, used_count, is_active, valid_from, valid_until, applicable_services, created_at) FROM stdin;
\.


--
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.notifications (id, user_id, title, message, type, reference_id, is_read, created_at) FROM stdin;
95d38e76-4c66-441d-b1df-eb8c0493f1b2	6f8e22c4-af75-4865-bad3-8494742c5047	New Booking Request	You have a new booking request for AC Repair	booking	93796c0e-a04e-44d2-94e3-7517fe48a794	f	2025-12-02 18:10:51.809507+00
ba09e79a-8e7f-477e-b358-4066d9d51970	9f7cbe52-d1e4-4310-aa79-6a300f5ccb6c	Booking Update	Your booking has been confirmed by the provider!	booking	93796c0e-a04e-44d2-94e3-7517fe48a794	f	2025-12-02 18:11:23.284219+00
eb8ce2c5-5e4c-4fbf-81a8-61766c08fafb	9f7cbe52-d1e4-4310-aa79-6a300f5ccb6c	Booking Update	The provider is on the way to your location.	booking	93796c0e-a04e-44d2-94e3-7517fe48a794	f	2025-12-02 18:11:34.370759+00
1f75c7ae-682d-4ac9-ad0e-7a0b7dfdf5f5	9f7cbe52-d1e4-4310-aa79-6a300f5ccb6c	Booking Update	The provider has started the work.	booking	93796c0e-a04e-44d2-94e3-7517fe48a794	f	2025-12-02 18:11:49.550307+00
e8fa2ebd-0631-4d56-abee-234adc53fd44	9f7cbe52-d1e4-4310-aa79-6a300f5ccb6c	Booking Update	Your booking is completed! Please rate your experience.	booking	93796c0e-a04e-44d2-94e3-7517fe48a794	f	2025-12-02 18:12:00.319513+00
17a6f269-b430-4cef-8c32-77149288c824	6f8e22c4-af75-4865-bad3-8494742c5047	New rate quote request	A user requested a rate quote for your service. Respond quickly to win the booking.	rate_quote	15b31c5f-8837-4035-a010-b63c4f8d9a92	f	2025-12-02 18:13:08.385319+00
394c81e4-118a-4742-9e7b-fc9f3eb4b920	6f8e22c4-af75-4865-bad3-8494742c5047	New Booking Request	You have a new booking request for AC Repair	booking	0b19c9de-bf44-4d7c-9928-2a4acb6c3fad	f	2025-12-02 18:13:42.008207+00
93286810-e024-47da-a947-b365b9681fa0	6f8e22c4-af75-4865-bad3-8494742c5047	New Booking Request	You have a new booking request for AC Repair	booking	dbe53ace-0bbc-41a2-b067-c9532e5b551f	f	2025-12-02 18:14:15.362693+00
13899112-707f-43c8-901d-c037d455f44f	6f8e22c4-af75-4865-bad3-8494742c5047	New rate quote request	A user requested a rate quote for your service. Respond quickly to win the booking.	rate_quote	3db1dffd-0c2c-4b17-b0e5-519b5ea23115	f	2025-12-02 18:15:01.576086+00
07d20934-d239-40ca-9a53-acf9b57dbb33	6f8e22c4-af75-4865-bad3-8494742c5047	New Booking Request	You have a new booking request for AC Repair	booking	3cbd1da7-e6bb-429c-81e9-850f367bcd9f	f	2025-12-02 18:16:14.667322+00
10fe7548-c8a9-43ce-b4bf-22b604c9a4ec	6f8e22c4-af75-4865-bad3-8494742c5047	New Booking Request	You have a new booking request for AC Repair	booking	6931f2a2-6794-456a-8a9b-1dda7ad4e2ae	f	2025-12-02 18:16:52.867472+00
010a57a4-758a-4bdb-a4cc-2f18cf604a18	9f7cbe52-d1e4-4310-aa79-6a300f5ccb6c	Booking Update	Your booking has been confirmed by the provider!	booking	0b19c9de-bf44-4d7c-9928-2a4acb6c3fad	f	2025-12-02 18:17:42.960531+00
ac3b9835-9d29-4014-a60d-9ff5205a9979	9f7cbe52-d1e4-4310-aa79-6a300f5ccb6c	Booking Update	The provider has cancelled your booking. It is now available for other providers to accept.	booking	0b19c9de-bf44-4d7c-9928-2a4acb6c3fad	f	2025-12-02 18:18:01.842101+00
e9566835-c569-4de8-92d4-16fe4df3aef9	9f7cbe52-d1e4-4310-aa79-6a300f5ccb6c	Quote Accepted	Provider accepted your quote of Γé╣450	booking	dbe53ace-0bbc-41a2-b067-c9532e5b551f	f	2025-12-02 18:19:10.406111+00
a1ccdcf9-cca1-4753-bed7-b6dffbc3aefe	9f7cbe52-d1e4-4310-aa79-6a300f5ccb6c	Counter-Offer Received	AC Repair counter-offered Γé╣480. You quoted Γé╣470.	booking	3cbd1da7-e6bb-429c-81e9-850f367bcd9f	f	2025-12-02 18:20:03.041922+00
87fad297-5fad-4e95-9c49-56469e25e93e	9f7cbe52-d1e4-4310-aa79-6a300f5ccb6c	Quote Accepted	Provider accepted your quote of Γé╣475	booking	6931f2a2-6794-456a-8a9b-1dda7ad4e2ae	f	2025-12-02 18:20:29.871857+00
3ac5ef5b-c82b-44d8-94b5-0a4229ce9900	9f7cbe52-d1e4-4310-aa79-6a300f5ccb6c	Booking Update	The provider is on the way to your location.	booking	dbe53ace-0bbc-41a2-b067-c9532e5b551f	f	2025-12-02 18:22:10.742349+00
ccbd1b0d-ee4d-49fa-91c3-6494acfe2f1e	9f7cbe52-d1e4-4310-aa79-6a300f5ccb6c	Booking Update	The provider has cancelled your booking. It is now available for other providers to accept.	booking	6931f2a2-6794-456a-8a9b-1dda7ad4e2ae	f	2025-12-02 18:22:21.472165+00
463f3c7d-c116-4968-96a6-8e3bcd667133	9f7cbe52-d1e4-4310-aa79-6a300f5ccb6c	Booking Update	The provider has cancelled your booking. It is now available for other providers to accept.	booking	dbe53ace-0bbc-41a2-b067-c9532e5b551f	f	2025-12-02 18:22:34.880739+00
c2293f8b-73cf-4822-bc73-3bcd3cc8a492	6f8e22c4-af75-4865-bad3-8494742c5047	New Booking Request	You have a new booking request for AC Repair	booking	26a5b1e3-5037-42f2-b25c-36fca34e2d73	f	2025-12-02 18:59:50.57492+00
7005b160-dc9f-4fb4-ae70-f669cc8b03dd	6f8e22c4-af75-4865-bad3-8494742c5047	New Booking Request	You have a new booking request for AC Repair	booking	342f3ee0-763d-47ba-9aee-c15c9b4226ea	f	2025-12-02 19:00:30.448117+00
4d355320-0504-4c7f-ad95-5bf747dccfef	6f8e22c4-af75-4865-bad3-8494742c5047	New Booking Request	You have a new booking request for AC Repair	booking	11078345-afce-4172-b013-372b8c843857	f	2025-12-02 19:01:59.928593+00
288374c3-645d-4fff-9361-5b8d3a596d8d	5ca81099-f4c1-4f7d-879d-061f6c393022	New Booking Request	You have a new booking request for AC Repair	booking	30f26ecc-5eea-47b6-a8f5-3405d2d339b0	f	2025-12-02 19:10:49.538417+00
5311d131-8b55-4ee4-9875-2c81a4319ac9	5ca81099-f4c1-4f7d-879d-061f6c393022	New Booking Request	You have a new booking request for AC Repair	booking	ee9da2c7-09b8-4812-a32f-26c8533643ce	f	2025-12-02 19:17:00.450842+00
776b0420-67c5-419e-9aa1-fdddaa4ea3b4	5ca81099-f4c1-4f7d-879d-061f6c393022	New Booking Request	You have a new booking request for AC Repair	booking	60d4bfe8-b867-4502-a5ca-925ea6dc8734	f	2025-12-02 19:27:41.193176+00
799a5391-2b46-4b58-8530-fd0cfd3f5579	5ca81099-f4c1-4f7d-879d-061f6c393022	New Booking Request	You have a new booking request for AC Repair	booking	d7855c02-1bdb-4fd0-a2c9-1165cda94482	f	2025-12-03 05:16:20.002577+00
514699bf-d67e-4c52-bdb0-d14f2ef75c2a	5ca81099-f4c1-4f7d-879d-061f6c393022	New Booking Request	You have a new booking request for AC Repair	booking	5c0683f5-c02c-42f6-8254-e4c8d0301121	f	2025-12-03 05:40:15.094324+00
1092f3ff-6e44-4f98-ad83-c8fd233d2b0c	5ca81099-f4c1-4f7d-879d-061f6c393022	New Booking Request	You have a new booking request for AC Repair	booking	5b7a0af7-e287-46da-9cb1-03752b608e73	f	2025-12-03 05:44:35.256362+00
c93ac709-66c3-4882-8762-2acc7fe1b1fb	9f7cbe52-d1e4-4310-aa79-6a300f5ccb6c	Booking Update	Your booking status has been updated to confirmed	booking	5b7a0af7-e287-46da-9cb1-03752b608e73	f	2025-12-03 06:18:27.06974+00
7d6d65ce-d505-4ea0-bcdb-06e8ba9e1efc	9f7cbe52-d1e4-4310-aa79-6a300f5ccb6c	Booking Update	Your booking status has been updated to confirmed	booking	5c0683f5-c02c-42f6-8254-e4c8d0301121	f	2025-12-03 06:18:29.028568+00
36c07ecd-c422-48d0-acbe-693b4b1d3997	9f7cbe52-d1e4-4310-aa79-6a300f5ccb6c	Booking Update	Your booking status has been updated to confirmed	booking	d7855c02-1bdb-4fd0-a2c9-1165cda94482	f	2025-12-03 06:19:22.710408+00
5a09d14d-6c32-40b3-90b8-c3520a465d8b	9f7cbe52-d1e4-4310-aa79-6a300f5ccb6c	Booking Update	Your booking has been accepted by the provider!	booking	60d4bfe8-b867-4502-a5ca-925ea6dc8734	f	2025-12-03 06:19:56.323356+00
95e0f575-1021-408e-a33f-8e3f8a74050a	9f7cbe52-d1e4-4310-aa79-6a300f5ccb6c	Booking Update	The provider is on the way to your location.	booking	5c0683f5-c02c-42f6-8254-e4c8d0301121	f	2025-12-03 06:21:00.943348+00
1eeb75f8-9287-4199-a1db-da857c39d2f1	9f7cbe52-d1e4-4310-aa79-6a300f5ccb6c	Booking Update	The provider has started the work.	booking	5c0683f5-c02c-42f6-8254-e4c8d0301121	f	2025-12-03 06:21:09.862449+00
bf9582fd-73c2-44fe-9b23-7ea4177e7186	9f7cbe52-d1e4-4310-aa79-6a300f5ccb6c	Booking Update	Your booking is completed! Please rate your experience.	booking	5c0683f5-c02c-42f6-8254-e4c8d0301121	f	2025-12-03 06:21:14.669452+00
e6e4878a-ed46-411e-9f6c-4c83d3c24cd3	9f7cbe52-d1e4-4310-aa79-6a300f5ccb6c	Booking Update	The provider is on the way to your location.	booking	5b7a0af7-e287-46da-9cb1-03752b608e73	f	2025-12-03 06:21:18.473359+00
4217d6b5-ab44-411d-a15c-12400e6b2cca	9f7cbe52-d1e4-4310-aa79-6a300f5ccb6c	Booking Update	The provider has started the work.	booking	5b7a0af7-e287-46da-9cb1-03752b608e73	f	2025-12-03 06:21:21.266677+00
0ddce917-8c3b-49eb-83f4-a195f81a7852	9f7cbe52-d1e4-4310-aa79-6a300f5ccb6c	Booking Update	The provider has cancelled your booking. It is now available for other providers to accept.	booking	5b7a0af7-e287-46da-9cb1-03752b608e73	f	2025-12-03 06:21:26.215611+00
0265dc5d-062e-4b73-a95e-e92d5cda2f64	9f7cbe52-d1e4-4310-aa79-6a300f5ccb6c	Booking Update	Your booking has been accepted by the provider!	booking	ee9da2c7-09b8-4812-a32f-26c8533643ce	f	2025-12-03 08:26:56.524594+00
1f57e9af-8b22-4199-82a7-8ca17eb16416	9f7cbe52-d1e4-4310-aa79-6a300f5ccb6c	Booking Update	The provider is on the way to your location.	booking	ee9da2c7-09b8-4812-a32f-26c8533643ce	f	2025-12-03 08:27:09.173449+00
e591f847-117e-4898-b1f3-fbc9335050c4	9f7cbe52-d1e4-4310-aa79-6a300f5ccb6c	Booking Update	The provider is on the way to your location.	booking	60d4bfe8-b867-4502-a5ca-925ea6dc8734	f	2025-12-03 08:27:10.374212+00
7aa3be92-9053-46dc-9676-855a014f5799	9f7cbe52-d1e4-4310-aa79-6a300f5ccb6c	Booking Update	The provider is on the way to your location.	booking	d7855c02-1bdb-4fd0-a2c9-1165cda94482	f	2025-12-03 08:27:10.986613+00
9beb3566-601b-4b52-983e-081b968db8e7	9f7cbe52-d1e4-4310-aa79-6a300f5ccb6c	Booking Update	The provider has started the work.	booking	d7855c02-1bdb-4fd0-a2c9-1165cda94482	f	2025-12-03 08:27:21.357347+00
0cd9ee97-568b-45f4-98f7-902d39dcd422	9f7cbe52-d1e4-4310-aa79-6a300f5ccb6c	Booking Update	Your booking is completed! Please rate your experience.	booking	d7855c02-1bdb-4fd0-a2c9-1165cda94482	f	2025-12-03 08:27:24.845012+00
c72b339f-37ab-48a4-8cfe-807145a656e9	9f7cbe52-d1e4-4310-aa79-6a300f5ccb6c	Booking Update	Your booking has been accepted by the provider!	booking	30f26ecc-5eea-47b6-a8f5-3405d2d339b0	f	2025-12-03 10:57:01.4238+00
6274b5f0-b415-4d80-a00e-e6893d47272e	9f7cbe52-d1e4-4310-aa79-6a300f5ccb6c	Booking Update	The provider is on the way to your location.	booking	30f26ecc-5eea-47b6-a8f5-3405d2d339b0	f	2025-12-03 10:57:05.402715+00
7a98c2ea-7432-4646-b245-4a0807ce321a	9f7cbe52-d1e4-4310-aa79-6a300f5ccb6c	Booking Update	The provider has started the work.	booking	60d4bfe8-b867-4502-a5ca-925ea6dc8734	f	2025-12-03 10:57:08.681695+00
fbecdc68-5e02-4a83-9dbe-7098e856375e	9f7cbe52-d1e4-4310-aa79-6a300f5ccb6c	Booking Update	Your booking is completed! Please rate your experience.	booking	60d4bfe8-b867-4502-a5ca-925ea6dc8734	f	2025-12-03 10:58:19.995935+00
5132ed47-6315-4107-9340-cf929354f64a	9f7cbe52-d1e4-4310-aa79-6a300f5ccb6c	Booking Update	The provider has started the work.	booking	ee9da2c7-09b8-4812-a32f-26c8533643ce	f	2025-12-03 10:58:58.982023+00
59d2ae07-4a1f-426a-b8e3-4be6955791a6	9f7cbe52-d1e4-4310-aa79-6a300f5ccb6c	Booking Update	The provider has started the work.	booking	30f26ecc-5eea-47b6-a8f5-3405d2d339b0	f	2025-12-03 11:05:28.850684+00
a246b147-46e6-4352-9fd9-06460452e8d6	9f7cbe52-d1e4-4310-aa79-6a300f5ccb6c	Booking Update	Your booking is completed! Please rate your experience.	booking	ee9da2c7-09b8-4812-a32f-26c8533643ce	f	2025-12-03 11:05:36.638358+00
b57a3835-11fa-42d5-8837-6ca6904f39ba	9f7cbe52-d1e4-4310-aa79-6a300f5ccb6c	New Message	You have a new message regarding booking #5c0683f5-c02c-42f6-8254-e4c8d0301121	chat	5c0683f5-c02c-42f6-8254-e4c8d0301121	f	2025-12-03 11:07:58.40618+00
bacc84d1-0a95-4674-98ec-67ecec3241b6	5ca81099-f4c1-4f7d-879d-061f6c393022	New Message	You have a new message regarding booking #5c0683f5-c02c-42f6-8254-e4c8d0301121	chat	5c0683f5-c02c-42f6-8254-e4c8d0301121	f	2025-12-03 11:08:13.96251+00
a7519af1-26ee-4f97-b43f-cb81254e4729	9f7cbe52-d1e4-4310-aa79-6a300f5ccb6c	Booking Update	Your booking is completed! Please rate your experience.	booking	30f26ecc-5eea-47b6-a8f5-3405d2d339b0	f	2025-12-03 11:09:29.370678+00
9b589268-4bc8-452e-a464-562007aea74c	5ca81099-f4c1-4f7d-879d-061f6c393022	New Message	You have a new message regarding booking #30f26ecc-5eea-47b6-a8f5-3405d2d339b0	chat	30f26ecc-5eea-47b6-a8f5-3405d2d339b0	f	2025-12-03 11:09:51.860597+00
85cca549-55da-476b-a349-2c0f04d3b2b8	9f7cbe52-d1e4-4310-aa79-6a300f5ccb6c	Booking Update	Your booking has been accepted by the provider!	booking	1c919af1-559d-4a20-aa88-8b94181bcc0c	f	2025-12-03 13:01:49.442033+00
d829cefb-a630-410b-ae68-b5e43b10dd53	9f7cbe52-d1e4-4310-aa79-6a300f5ccb6c	Booking Update	Your booking has been accepted by the provider!	booking	32f6976e-e179-4423-ac63-3b6000874240	f	2025-12-03 13:01:51.283334+00
03d170e7-5632-44a8-a0ea-18c3c0f1fcb1	9f7cbe52-d1e4-4310-aa79-6a300f5ccb6c	Booking Update	The provider is on the way to your location.	booking	1c919af1-559d-4a20-aa88-8b94181bcc0c	f	2025-12-03 13:01:52.647427+00
fb86e64c-7982-4bad-85a5-13358e1ac5e0	9f7cbe52-d1e4-4310-aa79-6a300f5ccb6c	Booking Update	Your booking has been accepted by the provider!	booking	5b7a0af7-e287-46da-9cb1-03752b608e73	f	2025-12-03 13:02:07.079498+00
cf37fee8-ea79-4856-90b1-f7c2dc37c5a9	9f7cbe52-d1e4-4310-aa79-6a300f5ccb6c	Booking Update	The provider is on the way to your location.	booking	32f6976e-e179-4423-ac63-3b6000874240	f	2025-12-03 13:02:23.355157+00
1300afe1-0e0d-4506-b6a1-be245005de41	9f7cbe52-d1e4-4310-aa79-6a300f5ccb6c	Booking Update	The provider has started the work.	booking	1c919af1-559d-4a20-aa88-8b94181bcc0c	f	2025-12-03 13:02:25.989631+00
4f3bc144-89fd-4ecc-ace4-5c31b05cfe36	9f7cbe52-d1e4-4310-aa79-6a300f5ccb6c	Booking Update	Your booking is completed! Please rate your experience.	booking	1c919af1-559d-4a20-aa88-8b94181bcc0c	f	2025-12-03 13:02:32.315163+00
b83453ca-b6bc-4f7d-bacf-885d9ca49e30	9f7cbe52-d1e4-4310-aa79-6a300f5ccb6c	Booking Update	Your booking has been accepted by the provider!	booking	22825a73-3918-4b6c-8505-bad4fc5fe2c5	f	2025-12-03 13:47:01.212834+00
8c55b5c7-1f92-4e23-b3b0-8ed8ddb63784	9f7cbe52-d1e4-4310-aa79-6a300f5ccb6c	Booking Update	The provider is on the way to your location.	booking	22825a73-3918-4b6c-8505-bad4fc5fe2c5	f	2025-12-03 13:47:18.245124+00
c5064373-be8b-4017-a707-1cf97e0c9911	9f7cbe52-d1e4-4310-aa79-6a300f5ccb6c	Booking Update	The provider is on the way to your location.	booking	5b7a0af7-e287-46da-9cb1-03752b608e73	f	2025-12-03 13:47:25.396702+00
d0ab2340-9c4f-4499-afe4-3c8f05cb99bf	9f7cbe52-d1e4-4310-aa79-6a300f5ccb6c	Booking Update	The provider has started the work.	booking	22825a73-3918-4b6c-8505-bad4fc5fe2c5	f	2025-12-03 13:47:37.560075+00
de1b57b3-3016-4c99-bea6-dcd0c4be33a9	9f7cbe52-d1e4-4310-aa79-6a300f5ccb6c	Booking Update	Your booking is completed! Please rate your experience.	booking	22825a73-3918-4b6c-8505-bad4fc5fe2c5	f	2025-12-03 13:47:53.259941+00
18719b90-1510-46a5-a4c5-b42aff19b8c3	6633dc36-aa0b-431e-a1d1-0a5993941950	Booking Update	Your booking has been accepted by the provider!	booking	cf1a691a-746b-4132-9d33-83a6e27c2eae	f	2025-12-03 13:52:52.435867+00
a231069e-c62a-4007-9e2f-201e85a7d000	9f7cbe52-d1e4-4310-aa79-6a300f5ccb6c	Booking Update	Your booking has been accepted by the provider!	booking	0b19c9de-bf44-4d7c-9928-2a4acb6c3fad	f	2025-12-03 13:53:36.492247+00
7ac69c22-739a-4fdd-8fc1-7746b724d55f	9f7cbe52-d1e4-4310-aa79-6a300f5ccb6c	Booking Update	Your booking has been accepted by the provider!	booking	0b19c9de-bf44-4d7c-9928-2a4acb6c3fad	f	2025-12-03 13:53:36.578751+00
8fd36bb4-c411-4ff6-bdfb-98bf8df66261	9f7cbe52-d1e4-4310-aa79-6a300f5ccb6c	Booking Update	Your booking has been accepted by the provider!	booking	0b19c9de-bf44-4d7c-9928-2a4acb6c3fad	f	2025-12-03 13:53:36.634671+00
fb7ce9f7-ff77-446b-b90d-03597f6e3156	6633dc36-aa0b-431e-a1d1-0a5993941950	Booking Update	The provider is on the way to your location.	booking	cf1a691a-746b-4132-9d33-83a6e27c2eae	f	2025-12-03 13:54:00.880933+00
7a307655-b010-4edd-a6fc-b789ce938dc0	9f7cbe52-d1e4-4310-aa79-6a300f5ccb6c	Booking Update	The provider has started the work.	booking	32f6976e-e179-4423-ac63-3b6000874240	f	2025-12-03 13:54:14.608666+00
f2228b32-e313-4a84-aaff-a8b55228b489	9f7cbe52-d1e4-4310-aa79-6a300f5ccb6c	Booking Update	The provider has started the work.	booking	5b7a0af7-e287-46da-9cb1-03752b608e73	f	2025-12-03 13:58:12.428946+00
1632f5ac-9bc5-4397-90f0-84a74d7bb7e0	9f7cbe52-d1e4-4310-aa79-6a300f5ccb6c	Booking Update	The provider has cancelled your booking. It is now available for other providers to accept.	booking	32f6976e-e179-4423-ac63-3b6000874240	f	2025-12-03 14:00:09.790214+00
1e340480-77e8-49dc-9904-1fdff31e5f7b	9f7cbe52-d1e4-4310-aa79-6a300f5ccb6c	Booking Update	Your booking has been accepted by the provider!	booking	32f6976e-e179-4423-ac63-3b6000874240	f	2025-12-03 14:01:08.441019+00
22b76546-336a-4329-96ee-4cfd535622be	9f7cbe52-d1e4-4310-aa79-6a300f5ccb6c	Booking Update	The provider is on the way to your location.	booking	32f6976e-e179-4423-ac63-3b6000874240	f	2025-12-03 14:02:15.912071+00
9376a15a-3131-4a22-9de3-99a0cf87b9af	9f7cbe52-d1e4-4310-aa79-6a300f5ccb6c	Booking Update	The provider has started the work.	booking	32f6976e-e179-4423-ac63-3b6000874240	f	2025-12-03 14:02:45.68804+00
b73c89e3-f929-4455-aa96-146dd22ca76e	9f7cbe52-d1e4-4310-aa79-6a300f5ccb6c	Booking Update	Your booking is completed! Please rate your experience.	booking	32f6976e-e179-4423-ac63-3b6000874240	f	2025-12-03 14:03:02.131965+00
ea0b669f-c15d-4dfa-a138-1ead8da482b2	5ca81099-f4c1-4f7d-879d-061f6c393022	New Message	You have a new message regarding booking #32f6976e-e179-4423-ac63-3b6000874240	chat	32f6976e-e179-4423-ac63-3b6000874240	f	2025-12-03 14:03:13.578012+00
bc085bb0-2d05-4e81-afa8-c7dd6fbc8b96	9f7cbe52-d1e4-4310-aa79-6a300f5ccb6c	Booking Update	Your booking has been accepted by the provider!	booking	6931f2a2-6794-456a-8a9b-1dda7ad4e2ae	f	2025-12-03 14:18:05.609854+00
23c4c1db-f9d4-42a8-85d2-790dfeba11a0	9f7cbe52-d1e4-4310-aa79-6a300f5ccb6c	Booking Update	Your booking has been accepted by the provider!	booking	dbe53ace-0bbc-41a2-b067-c9532e5b551f	f	2025-12-03 14:18:49.60458+00
4f2365c5-9001-481b-a6f1-5a22706daa75	9f7cbe52-d1e4-4310-aa79-6a300f5ccb6c	Booking Update	The provider is on the way to your location.	booking	6931f2a2-6794-456a-8a9b-1dda7ad4e2ae	f	2025-12-03 14:21:14.539124+00
17ce32f1-0764-49c5-aec9-6563afcb89d0	9f7cbe52-d1e4-4310-aa79-6a300f5ccb6c	Booking Update	The provider has cancelled your booking. It is now available for other providers to accept.	booking	5b7a0af7-e287-46da-9cb1-03752b608e73	f	2025-12-03 14:22:31.638215+00
37dadbe6-cf86-4916-9317-7c2f23274987	9f7cbe52-d1e4-4310-aa79-6a300f5ccb6c	Booking Update	The provider has started the work.	booking	6931f2a2-6794-456a-8a9b-1dda7ad4e2ae	f	2025-12-03 14:23:11.398608+00
4e15ec39-394c-4660-912b-4d5de6ce1e62	9f7cbe52-d1e4-4310-aa79-6a300f5ccb6c	Booking Update	The provider has cancelled your booking. It is now available for other providers to accept.	booking	6931f2a2-6794-456a-8a9b-1dda7ad4e2ae	f	2025-12-03 14:23:20.070767+00
d2cb2c88-bc2a-4a4e-adfe-3fa392460e16	9f7cbe52-d1e4-4310-aa79-6a300f5ccb6c	Booking Update	The provider is on the way to your location.	booking	0b19c9de-bf44-4d7c-9928-2a4acb6c3fad	f	2025-12-03 14:59:52.963849+00
cf006e21-74a9-4945-8248-36045e6e48cd	6633dc36-aa0b-431e-a1d1-0a5993941950	Booking Update	The provider has started the work.	booking	cf1a691a-746b-4132-9d33-83a6e27c2eae	f	2025-12-03 15:00:34.23815+00
e004f1a2-6910-45eb-b894-8576c0afebf0	6633dc36-aa0b-431e-a1d1-0a5993941950	Booking Update	The provider has cancelled your booking. It is now available for other providers to accept.	booking	cf1a691a-746b-4132-9d33-83a6e27c2eae	f	2025-12-03 15:01:01.168613+00
652c4d4e-bcc8-4ca7-b19d-ab30140dc27a	5ca81099-f4c1-4f7d-879d-061f6c393022	New rate quote request	A user requested a rate quote for your service. Respond quickly to win the booking.	rate_quote	4ac0c86d-4753-4b7e-8035-3ceb091f0bc4	f	2025-12-03 15:08:23.024323+00
2eb95f54-b0ad-4277-9bb8-c3a917f081f1	6f8e22c4-af75-4865-bad3-8494742c5047	New rate quote request	A user requested a rate quote for your service. Respond quickly to win the booking.	rate_quote	4ac0c86d-4753-4b7e-8035-3ceb091f0bc4	f	2025-12-03 15:08:23.024323+00
c9f97c33-828b-4356-ad36-104194893855	5ca81099-f4c1-4f7d-879d-061f6c393022	New rate quote request	A user requested a rate quote for your service. Respond quickly to win the booking.	rate_quote	8d2915f1-9ca6-4504-babb-7aebab442617	f	2025-12-03 15:12:29.923408+00
e360f5ba-c6fb-4e58-a378-5a1bc0b91fa5	6f8e22c4-af75-4865-bad3-8494742c5047	New rate quote request	A user requested a rate quote for your service. Respond quickly to win the booking.	rate_quote	8d2915f1-9ca6-4504-babb-7aebab442617	f	2025-12-03 15:12:29.923408+00
049883c9-23e7-4039-88e8-d5ab36fdb76b	5ca81099-f4c1-4f7d-879d-061f6c393022	New rate quote request	A user requested a rate quote for your service. Respond quickly to win the booking.	rate_quote	76389f4d-685e-457c-aceb-0ad7eaa43b57	f	2025-12-03 15:36:49.695334+00
138b1c20-d41d-4558-a432-662bb4621ae4	6f8e22c4-af75-4865-bad3-8494742c5047	New rate quote request	A user requested a rate quote for your service. Respond quickly to win the booking.	rate_quote	76389f4d-685e-457c-aceb-0ad7eaa43b57	f	2025-12-03 15:36:49.695334+00
de2350b6-46f8-4643-ae81-f658ff319f89	5ca81099-f4c1-4f7d-879d-061f6c393022	New rate quote request	A user requested a rate quote for your service. Respond quickly to win the booking.	rate_quote	1a9c13cb-7744-4c7e-99d3-23e1cfa23239	f	2025-12-03 15:39:20.140341+00
2b77e8d4-1aa1-48be-bc53-7f44eeaed6eb	6f8e22c4-af75-4865-bad3-8494742c5047	New rate quote request	A user requested a rate quote for your service. Respond quickly to win the booking.	rate_quote	1a9c13cb-7744-4c7e-99d3-23e1cfa23239	f	2025-12-03 15:39:20.140341+00
60661a43-a5a8-4201-8cec-035c68660cdf	9f7cbe52-d1e4-4310-aa79-6a300f5ccb6c	Booking Update	Your booking has been accepted by the provider!	booking	b7d577db-e68f-46d5-ad23-c3d0738addc2	f	2025-12-03 15:41:35.443328+00
0731368e-7f7e-46f8-ae01-aa18887d530b	9f7cbe52-d1e4-4310-aa79-6a300f5ccb6c	Booking Update	Your booking has been accepted by the provider!	booking	b7d577db-e68f-46d5-ad23-c3d0738addc2	f	2025-12-03 15:41:37.149244+00
2dac47f6-0959-40d7-8583-d17d01765758	9f7cbe52-d1e4-4310-aa79-6a300f5ccb6c	Booking Update	The provider is on the way to your location.	booking	b7d577db-e68f-46d5-ad23-c3d0738addc2	f	2025-12-03 15:41:40.212615+00
3a693c41-e737-4a23-8992-550ecaae332a	5ca81099-f4c1-4f7d-879d-061f6c393022	New rate quote request	A user requested a rate quote for your service. Respond quickly to win the booking.	rate_quote	75330085-c31f-40c7-bf02-e8bf532218c9	f	2025-12-03 15:58:55.366044+00
dc3c0abf-9b10-4e66-bb88-7ce35d09262b	6f8e22c4-af75-4865-bad3-8494742c5047	New rate quote request	A user requested a rate quote for your service. Respond quickly to win the booking.	rate_quote	75330085-c31f-40c7-bf02-e8bf532218c9	f	2025-12-03 15:58:55.366044+00
604cc3fc-7f2f-4733-99d9-745641d33369	9f7cbe52-d1e4-4310-aa79-6a300f5ccb6c	Quote Accepted	Provider accepted your quote of Γé╣400	booking	81b8bdb3-b213-4edd-b0a5-066112728fdf	f	2025-12-03 15:59:54.331725+00
8eee9c22-9608-493b-bc43-79f828c3649b	9f7cbe52-d1e4-4310-aa79-6a300f5ccb6c	Quote Accepted	Provider accepted your quote of Γé╣300	booking	e5064417-8956-49f4-911f-8eb83cb0013d	f	2025-12-03 15:59:59.21202+00
64c0a579-e080-4c93-9619-a90e920b5704	9f7cbe52-d1e4-4310-aa79-6a300f5ccb6c	Quote Accepted	Provider accepted your quote of Γé╣299.98	booking	69963e8d-4603-477d-8e69-541bcda1f8e1	f	2025-12-03 16:00:21.528894+00
072342df-a438-4374-95fc-511c63509efc	9f7cbe52-d1e4-4310-aa79-6a300f5ccb6c	Quote Accepted	Provider accepted your quote of Γé╣300	booking	c9063c06-d01e-4645-85c0-5c69638ebed9	f	2025-12-03 16:00:25.288693+00
79e200a5-42b1-4b69-bbac-97b0c22bd031	9f7cbe52-d1e4-4310-aa79-6a300f5ccb6c	Booking Update	Your booking has been accepted by the provider!	booking	5b7a0af7-e287-46da-9cb1-03752b608e73	f	2025-12-03 16:00:40.516951+00
137866d0-a606-4e6c-805e-bcea5c847158	9f7cbe52-d1e4-4310-aa79-6a300f5ccb6c	Booking Update	Your booking has been accepted by the provider!	booking	6931f2a2-6794-456a-8a9b-1dda7ad4e2ae	f	2025-12-03 16:00:41.320092+00
b476727b-4006-4008-be23-115f1cf0db64	6633dc36-aa0b-431e-a1d1-0a5993941950	Booking Update	Your booking has been accepted by the provider!	booking	cf1a691a-746b-4132-9d33-83a6e27c2eae	f	2025-12-03 16:00:42.778235+00
6d69288a-1d26-4f3e-89ca-fdc6c160eb67	5ca81099-f4c1-4f7d-879d-061f6c393022	New rate quote request	A user requested a rate quote for your service. Respond quickly to win the booking.	rate_quote	e68c7335-3298-41e4-9975-cf58fe0de9ee	f	2025-12-03 16:01:33.712892+00
0ef0f868-f31e-4b05-b2ce-bf642cce3e11	6f8e22c4-af75-4865-bad3-8494742c5047	New rate quote request	A user requested a rate quote for your service. Respond quickly to win the booking.	rate_quote	e68c7335-3298-41e4-9975-cf58fe0de9ee	f	2025-12-03 16:01:33.712892+00
23e9e818-4744-4d0d-9e7a-fd3da22e9210	5ca81099-f4c1-4f7d-879d-061f6c393022	New rate quote request	A user requested a rate quote for your service. Respond quickly to win the booking.	rate_quote	a332253d-2dbb-423b-976b-022c12d92a7b	f	2025-12-03 16:02:35.096277+00
ed89a752-8ef9-4360-acb2-aa8b16ff9376	6f8e22c4-af75-4865-bad3-8494742c5047	New rate quote request	A user requested a rate quote for your service. Respond quickly to win the booking.	rate_quote	a332253d-2dbb-423b-976b-022c12d92a7b	f	2025-12-03 16:02:35.096277+00
289a2ddc-005a-4caa-a528-8455e09e7cf2	5ca81099-f4c1-4f7d-879d-061f6c393022	New rate quote request	A user requested a rate quote for your service. Respond quickly to win the booking.	rate_quote	f36f9176-0592-4bf2-9ffa-6515fc9fd280	f	2025-12-03 16:03:50.746974+00
f5284cb5-7d94-402c-b566-3b1af4536e2d	6f8e22c4-af75-4865-bad3-8494742c5047	New rate quote request	A user requested a rate quote for your service. Respond quickly to win the booking.	rate_quote	f36f9176-0592-4bf2-9ffa-6515fc9fd280	f	2025-12-03 16:03:50.746974+00
72d1aac4-c953-43df-b040-ecbb2d3d1d10	5ca81099-f4c1-4f7d-879d-061f6c393022	New rate quote request	A user requested a rate quote for your service. Respond quickly to win the booking.	rate_quote	867e29ac-8e08-437c-96c7-c420b1350444	f	2025-12-03 16:19:56.976172+00
4d615904-cdca-4683-ac9f-a8c0d7cdcc2d	6f8e22c4-af75-4865-bad3-8494742c5047	New rate quote request	A user requested a rate quote for your service. Respond quickly to win the booking.	rate_quote	867e29ac-8e08-437c-96c7-c420b1350444	f	2025-12-03 16:19:56.976172+00
dee335fe-f168-4af7-b020-be6a9158f117	5ca81099-f4c1-4f7d-879d-061f6c393022	New rate quote request	A user requested a rate quote for your service. Respond quickly to win the booking.	rate_quote	6ebb3e2e-1d85-49bb-a99f-46d9370796f8	f	2025-12-03 16:41:50.889667+00
1f672eb9-18a1-4eae-83b5-7f5f508084ca	6f8e22c4-af75-4865-bad3-8494742c5047	New rate quote request	A user requested a rate quote for your service. Respond quickly to win the booking.	rate_quote	6ebb3e2e-1d85-49bb-a99f-46d9370796f8	f	2025-12-03 16:41:50.889667+00
cf049902-d1aa-4e41-ba78-cc9165c1a8a7	9f7cbe52-d1e4-4310-aa79-6a300f5ccb6c	New quote received	A provider responded to your rate request. Review it before the timer ends.	rate_quote	6ebb3e2e-1d85-49bb-a99f-46d9370796f8	f	2025-12-03 16:42:29.498425+00
82431633-5785-4eef-b74b-f585db998c29	9f7cbe52-d1e4-4310-aa79-6a300f5ccb6c	Booking Update	The provider is on the way to your location.	booking	69963e8d-4603-477d-8e69-541bcda1f8e1	f	2025-12-03 16:45:20.813374+00
c5f02ab2-cdef-4587-965b-26ef7eac6836	5ca81099-f4c1-4f7d-879d-061f6c393022	New rate quote request	A user requested a rate quote for your service. Respond quickly to win the booking.	rate_quote	8681db2f-67cd-4280-a925-cc57d0dd7d6f	f	2025-12-03 16:45:47.178345+00
f470f7f8-4e8b-416a-b37c-ceddad9b3dda	6f8e22c4-af75-4865-bad3-8494742c5047	New rate quote request	A user requested a rate quote for your service. Respond quickly to win the booking.	rate_quote	8681db2f-67cd-4280-a925-cc57d0dd7d6f	f	2025-12-03 16:45:47.178345+00
075168ce-7d4f-432b-8356-d96eaa9206fb	9f7cbe52-d1e4-4310-aa79-6a300f5ccb6c	New quote received	A provider responded to your rate request. Review it before the timer ends.	rate_quote	8681db2f-67cd-4280-a925-cc57d0dd7d6f	f	2025-12-03 16:46:13.375674+00
3951ad6f-831e-48b6-80e2-80680d94fd03	5ca81099-f4c1-4f7d-879d-061f6c393022	Quote accepted	User accepted your rate quote. The booking has been created.	booking	540a64c5-78c5-444b-90e6-cca2bf16572e	f	2025-12-03 16:46:24.843475+00
d7562a65-1699-4669-8095-2ce15df9cf30	9f7cbe52-d1e4-4310-aa79-6a300f5ccb6c	Booking Update	The provider is on the way to your location.	booking	540a64c5-78c5-444b-90e6-cca2bf16572e	f	2025-12-03 16:46:52.750431+00
e2279454-7e60-45ea-a9ce-d3f2f358a0e2	9f7cbe52-d1e4-4310-aa79-6a300f5ccb6c	Booking Update	The provider is on the way to your location.	booking	540a64c5-78c5-444b-90e6-cca2bf16572e	f	2025-12-03 16:46:53.204328+00
0006d5a8-e7f6-4d9a-8727-d0f1f46112ff	9f7cbe52-d1e4-4310-aa79-6a300f5ccb6c	Booking Update	The provider is on the way to your location.	booking	540a64c5-78c5-444b-90e6-cca2bf16572e	f	2025-12-03 16:46:54.409596+00
ad0a3311-4df9-415e-b24f-bdd5a8ceed83	9f7cbe52-d1e4-4310-aa79-6a300f5ccb6c	Booking Update	The provider has started the work.	booking	540a64c5-78c5-444b-90e6-cca2bf16572e	f	2025-12-03 16:47:02.385936+00
c46e64e8-31e9-4691-a4bb-23c1f96c7355	9f7cbe52-d1e4-4310-aa79-6a300f5ccb6c	Booking Update	Your booking is completed! Please rate your experience.	booking	540a64c5-78c5-444b-90e6-cca2bf16572e	f	2025-12-03 16:47:13.568194+00
64ff05c8-ec8b-44cd-85c9-d03b0c8df9d2	5ca81099-f4c1-4f7d-879d-061f6c393022	New rate quote request	A user requested a rate quote for your service. Respond quickly to win the booking.	rate_quote	3d7c10b5-1e79-4d87-8296-3aead65f3fab	f	2025-12-03 16:52:39.295322+00
8e3d0ce1-5582-4f34-b8e4-fde1a5b3b979	6f8e22c4-af75-4865-bad3-8494742c5047	New rate quote request	A user requested a rate quote for your service. Respond quickly to win the booking.	rate_quote	3d7c10b5-1e79-4d87-8296-3aead65f3fab	f	2025-12-03 16:52:39.295322+00
1feb76ba-99a8-41ec-a7ab-80f6a03d9323	9f7cbe52-d1e4-4310-aa79-6a300f5ccb6c	New quote received	A provider responded to your rate request. Review it before the timer ends.	rate_quote	3d7c10b5-1e79-4d87-8296-3aead65f3fab	f	2025-12-03 16:57:16.186176+00
0efc23f8-32be-408f-ae99-085874f6452e	5ca81099-f4c1-4f7d-879d-061f6c393022	Quote accepted	User accepted your rate quote. The booking has been created.	booking	4f338d9a-43a3-458d-bac6-e185a062dbe3	f	2025-12-03 16:57:26.442172+00
26e1b6fa-381a-49e2-8930-f7d4b5544462	9f7cbe52-d1e4-4310-aa79-6a300f5ccb6c	Booking Update	The provider is on the way to your location.	booking	4f338d9a-43a3-458d-bac6-e185a062dbe3	f	2025-12-03 16:57:52.698427+00
f139fed8-11a9-4ed3-b4aa-3baf8016a4cd	9f7cbe52-d1e4-4310-aa79-6a300f5ccb6c	Booking Update	The provider is on the way to your location.	booking	4f338d9a-43a3-458d-bac6-e185a062dbe3	f	2025-12-03 16:57:53.204531+00
cbfaf115-3fc4-48ec-8a10-a7c5d540b875	9f7cbe52-d1e4-4310-aa79-6a300f5ccb6c	Booking Update	The provider has started the work.	booking	4f338d9a-43a3-458d-bac6-e185a062dbe3	f	2025-12-03 16:57:58.458636+00
9cc70196-8adc-40ee-9034-1f5c80f8bc13	9f7cbe52-d1e4-4310-aa79-6a300f5ccb6c	Booking Update	Your booking is completed! Please rate your experience.	booking	4f338d9a-43a3-458d-bac6-e185a062dbe3	f	2025-12-03 16:58:06.313063+00
04639408-356e-4c8f-a8f1-d14bb4c1fb02	5ca81099-f4c1-4f7d-879d-061f6c393022	New rate quote request	A user requested a rate quote for your service. Respond quickly to win the booking.	rate_quote	b3ff3b95-0777-4fe5-b9c9-a9d2225488e9	f	2025-12-03 17:10:42.456514+00
cdebb2c0-786c-4e90-b3bf-543b9e89d035	6f8e22c4-af75-4865-bad3-8494742c5047	New rate quote request	A user requested a rate quote for your service. Respond quickly to win the booking.	rate_quote	b3ff3b95-0777-4fe5-b9c9-a9d2225488e9	f	2025-12-03 17:10:42.456514+00
94582f1c-1848-475f-869f-9bd3330cb82e	9f7cbe52-d1e4-4310-aa79-6a300f5ccb6c	New quote received	A provider responded to your rate request. Review it before the timer ends.	rate_quote	b3ff3b95-0777-4fe5-b9c9-a9d2225488e9	f	2025-12-03 17:11:25.943186+00
bc2b8f0b-9c23-4766-995c-d4dadbea34a9	5ca81099-f4c1-4f7d-879d-061f6c393022	Quote accepted	User accepted your rate quote. The booking has been created.	booking	9861eb02-033a-4162-85f2-befbcb135500	f	2025-12-03 17:11:38.767938+00
5453ca5e-99c6-4766-9924-0635fcb6fe36	9f7cbe52-d1e4-4310-aa79-6a300f5ccb6c	Quote Accepted	Provider accepted your quote of Γé╣100	booking	2eb97732-0e43-44c2-b4c7-17de651bd903	f	2025-12-03 17:12:23.407758+00
0756609b-8e82-4102-8320-ebcdf83c4304	9f7cbe52-d1e4-4310-aa79-6a300f5ccb6c	Booking Update	Your booking has been accepted by the provider!	booking	8a5446b1-a98d-4437-9f64-223c15aaff64	f	2025-12-03 17:16:31.807886+00
339baf32-eb26-4d31-afdb-94165ca46c83	9f7cbe52-d1e4-4310-aa79-6a300f5ccb6c	Booking Update	The provider is on the way to your location.	booking	8a5446b1-a98d-4437-9f64-223c15aaff64	f	2025-12-03 17:16:38.198546+00
1f087aa7-1dd0-4e86-834a-34f680b76064	9f7cbe52-d1e4-4310-aa79-6a300f5ccb6c	Booking Update	The provider has started the work.	booking	8a5446b1-a98d-4437-9f64-223c15aaff64	f	2025-12-03 17:16:41.188718+00
e1232970-cb5b-4353-9f7c-4ad10dced366	9f7cbe52-d1e4-4310-aa79-6a300f5ccb6c	Booking Update	The provider has cancelled your booking. It is now available for other providers to accept.	booking	8a5446b1-a98d-4437-9f64-223c15aaff64	f	2025-12-03 17:16:49.580951+00
ca556636-7869-4b56-bc9f-d5d8a274a9de	9f7cbe52-d1e4-4310-aa79-6a300f5ccb6c	Booking Update	The provider has cancelled your booking. It is now available for other providers to accept.	booking	69963e8d-4603-477d-8e69-541bcda1f8e1	f	2025-12-03 17:18:09.197801+00
bbc926f4-c336-4991-9f62-4aa01e447223	9f7cbe52-d1e4-4310-aa79-6a300f5ccb6c	Booking Update	The provider is on the way to your location.	booking	5b7a0af7-e287-46da-9cb1-03752b608e73	f	2025-12-03 17:39:57.324667+00
94ae06db-d2fc-443e-8609-1b1c2d802fb4	9f7cbe52-d1e4-4310-aa79-6a300f5ccb6c	Booking Update	The provider has started the work.	booking	2eb97732-0e43-44c2-b4c7-17de651bd903	f	2025-12-03 17:40:06.086133+00
704757d7-8423-4cf1-81c4-0a0508a1cf10	9f7cbe52-d1e4-4310-aa79-6a300f5ccb6c	Booking Update	The provider has cancelled your booking. It is now available for other providers to accept.	booking	2eb97732-0e43-44c2-b4c7-17de651bd903	f	2025-12-03 17:40:21.804367+00
f1edfa03-9394-4f55-bf63-823c746d2147	6633dc36-aa0b-431e-a1d1-0a5993941950	Booking Update	The provider is on the way to your location.	booking	cf1a691a-746b-4132-9d33-83a6e27c2eae	f	2025-12-03 17:47:14.248009+00
181918fe-595e-42ab-a100-9775d3ae5bc8	9f7cbe52-d1e4-4310-aa79-6a300f5ccb6c	Booking Update	The provider is on the way to your location.	booking	e5064417-8956-49f4-911f-8eb83cb0013d	f	2025-12-03 17:47:20.891148+00
371d39d7-4a42-45e8-a141-c248087e2051	9f7cbe52-d1e4-4310-aa79-6a300f5ccb6c	Booking Update	The provider has started the work.	booking	c9063c06-d01e-4645-85c0-5c69638ebed9	f	2025-12-03 17:47:28.532938+00
d0f4de8a-5ab8-4ee6-a90f-05f9aa03f1de	9f7cbe52-d1e4-4310-aa79-6a300f5ccb6c	Booking Update	Your booking has been accepted by the provider!	booking	8a5446b1-a98d-4437-9f64-223c15aaff64	f	2025-12-03 17:47:31.953527+00
5c002383-3399-446b-97aa-c26b9985c8f9	9f7cbe52-d1e4-4310-aa79-6a300f5ccb6c	Booking Update	The provider has started the work.	booking	b7d577db-e68f-46d5-ad23-c3d0738addc2	f	2025-12-03 17:47:32.842332+00
e5af6c7a-593e-492b-84b5-a23d6527332e	9f7cbe52-d1e4-4310-aa79-6a300f5ccb6c	Booking Update	Your booking has been accepted by the provider!	booking	e995f198-c0cb-4a2a-8d0a-c3108e2f25c1	f	2025-12-03 18:04:35.449849+00
b5a81f46-688b-41e9-a727-5c6ae7d2d119	9f7cbe52-d1e4-4310-aa79-6a300f5ccb6c	Booking Update	The provider is on the way to your location.	booking	e995f198-c0cb-4a2a-8d0a-c3108e2f25c1	f	2025-12-03 18:04:47.718364+00
14379e43-21b5-400e-a57d-c58a24b5256e	9f7cbe52-d1e4-4310-aa79-6a300f5ccb6c	Booking Update	The provider has started the work.	booking	e995f198-c0cb-4a2a-8d0a-c3108e2f25c1	f	2025-12-03 18:05:04.95616+00
f2b847e2-4429-4700-a4cd-2416b44bf16a	9f7cbe52-d1e4-4310-aa79-6a300f5ccb6c	Booking Update	Your booking is completed! Please rate your experience.	booking	e995f198-c0cb-4a2a-8d0a-c3108e2f25c1	f	2025-12-03 18:05:35.875735+00
7830fdf9-8ed8-457a-8dfc-fcf1567a76a7	9f7cbe52-d1e4-4310-aa79-6a300f5ccb6c	Booking Update	The provider is on the way to your location.	booking	8a5446b1-a98d-4437-9f64-223c15aaff64	f	2025-12-04 06:33:40.19498+00
2f77b0a3-92f6-4802-a178-e4441279a5cb	9f7cbe52-d1e4-4310-aa79-6a300f5ccb6c	Booking Update	The provider has started the work.	booking	8a5446b1-a98d-4437-9f64-223c15aaff64	f	2025-12-04 06:33:44.66896+00
8b7f8ba2-74c0-4683-b595-b07cbb259e5e	9f7cbe52-d1e4-4310-aa79-6a300f5ccb6c	Booking Update	Your booking is completed! Please rate your experience.	booking	8a5446b1-a98d-4437-9f64-223c15aaff64	f	2025-12-04 06:33:50.761354+00
b0c81c6c-cd58-4082-b07a-daf86597cf96	9f7cbe52-d1e4-4310-aa79-6a300f5ccb6c	Booking Update	The provider has started the work.	booking	0b19c9de-bf44-4d7c-9928-2a4acb6c3fad	f	2025-12-04 06:34:24.552953+00
\.


--
-- Data for Name: payments; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.payments (id, booking_id, user_id, amount, payment_method, payment_status, razorpay_order_id, razorpay_payment_id, razorpay_signature, transaction_id, created_at, updated_at) FROM stdin;
cf939088-37d4-4735-8efb-5ab46d58bf90	93796c0e-a04e-44d2-94e3-7517fe48a794	9f7cbe52-d1e4-4310-aa79-6a300f5ccb6c	500.00	cash	paid	\N	\N	\N	\N	2025-12-02 18:12:12.524103+00	2025-12-02 18:12:12.524103+00
\.


--
-- Data for Name: provider_document_change_requests; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.provider_document_change_requests (id, provider_id, old_document_id, document_type, new_document_url, new_document_number, change_reason, status, reviewed_by, reviewed_at, rejection_reason, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: provider_documents; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.provider_documents (id, provider_id, document_type, document_number, document_url, metadata, status, rejection_reason, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: provider_payment_settings; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.provider_payment_settings (id, provider_id, account_holder_name, bank_name, account_number, ifsc_code, upi_id, qr_code_url, primary_method, verification_status, admin_notes, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: provider_portfolio; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.provider_portfolio (id, provider_id, image_url, description, work_experience_years, created_at) FROM stdin;
\.


--
-- Data for Name: provider_quotes; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.provider_quotes (id, rate_quote_id, provider_id, quoted_price, message, status, created_at) FROM stdin;
18d10403-f4b4-48d1-8114-bae7ef8fb402	6ebb3e2e-1d85-49bb-a99f-46d9370796f8	fa36c76c-5e1b-49c6-93d2-4c0d357a916c	400.00	SIR I WILL WORK ON THIS RATE	pending	2025-12-03 16:42:28.966003+00
041b7f00-f809-408d-aa81-b455e1ac34eb	8681db2f-67cd-4280-a925-cc57d0dd7d6f	fa36c76c-5e1b-49c6-93d2-4c0d357a916c	100.00	I WILL ATTEND	accepted	2025-12-03 16:46:12.219009+00
36b0ce22-20a3-42e2-9af5-a7cf943e8588	3d7c10b5-1e79-4d87-8296-3aead65f3fab	fa36c76c-5e1b-49c6-93d2-4c0d357a916c	110.00	OK	accepted	2025-12-03 16:57:15.791519+00
808421f9-e609-4ac2-a616-1e12c4dd6c57	b3ff3b95-0777-4fe5-b9c9-a9d2225488e9	fa36c76c-5e1b-49c6-93d2-4c0d357a916c	111.00	111 loonga	accepted	2025-12-03 17:11:25.384172+00
\.


--
-- Data for Name: provider_service_rates; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.provider_service_rates (id, provider_id, sub_service_id, rate, is_active, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: provider_services; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.provider_services (id, provider_id, service_id, base_price, is_active, created_at, inspection_fee, emergency_fee, sub_service_id, sub_sub_service_id) FROM stdin;
8fe67466-62b2-4944-8fe5-42fdaa49a45e	fa36c76c-5e1b-49c6-93d2-4c0d357a916c	5103e5ba-3013-47b1-8297-5a01eb5c27b9	0.00	t	2025-12-02 18:58:27.005528+00	0.00	0.00	\N	\N
11b75491-562d-4fa2-b3c0-d6cb0015e3c0	fa36c76c-5e1b-49c6-93d2-4c0d357a916c	e28bbfd8-af59-417a-bf5a-b36d0f6f2a82	600.00	t	2025-12-03 18:26:55.133084+00	0.00	0.00	\N	\N
8c09476c-82d3-4263-ae35-580b89c3f909	fa36c76c-5e1b-49c6-93d2-4c0d357a916c	7a797cfd-6407-419b-8b17-13001bb8df49	600.00	t	2025-12-03 18:26:56.189328+00	0.00	0.00	\N	\N
3ed27439-f3f5-4959-826a-c0289848588c	13e5f99d-68a2-47eb-94f6-dabf18adf6ce	5103e5ba-3013-47b1-8297-5a01eb5c27b9	500.00	t	2025-12-02 18:06:15.05075+00	0.00	0.00	\N	\N
7c7a9a3e-ad6b-44dc-93aa-9d9a9397b251	13e5f99d-68a2-47eb-94f6-dabf18adf6ce	0be12157-2fd7-4c63-b744-2b47f5c7a163	300.00	t	2025-12-02 18:07:17.520653+00	0.00	0.00	\N	\N
68809d1b-b9ad-4042-9932-3c8fbc16c1ae	13e5f99d-68a2-47eb-94f6-dabf18adf6ce	f2e72aff-a32b-4ff8-b117-9020c156b5e0	500.00	t	2025-12-02 18:07:18.816546+00	0.00	0.00	\N	\N
fbfbdf22-fc25-4925-ad77-2d82f74929e9	13e5f99d-68a2-47eb-94f6-dabf18adf6ce	10a23187-039d-41a9-ad90-a9629b2da08e	400.00	t	2025-12-02 18:07:20.332322+00	0.00	0.00	\N	\N
37ba16bd-a961-4f99-abe6-cd493d3e5b4c	13e5f99d-68a2-47eb-94f6-dabf18adf6ce	675d0370-8ced-49fd-91dc-8bd706cca34c	200.00	t	2025-12-02 18:07:21.477092+00	0.00	0.00	\N	\N
ecd60a69-d849-4259-a6fd-4de87eb30df9	13e5f99d-68a2-47eb-94f6-dabf18adf6ce	c8b90092-8771-4240-b6dc-e95e67bcba0e	1500.00	t	2025-12-02 18:07:22.963246+00	0.00	0.00	\N	\N
e7723315-58f0-4db5-9b71-c6e47d140a44	13e5f99d-68a2-47eb-94f6-dabf18adf6ce	65222400-c57b-4221-a314-9a504cf752be	300.00	t	2025-12-02 18:07:24.676935+00	0.00	0.00	\N	\N
8532ff49-b256-47ec-acb1-c7f26e2e3285	13e5f99d-68a2-47eb-94f6-dabf18adf6ce	4e6d1f73-a7a9-4aae-926e-8752d7fc2b20	400.00	t	2025-12-02 18:07:26.313085+00	0.00	0.00	\N	\N
feca10b0-88dd-49fa-86b9-8a8af8e336d2	13e5f99d-68a2-47eb-94f6-dabf18adf6ce	e7c75f3f-ced1-4c1e-96ba-670ad57364af	600.00	t	2025-12-02 18:07:28.080065+00	0.00	0.00	\N	\N
\.


--
-- Data for Name: provider_staff; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.provider_staff (id, provider_id, full_name, phone, role, id_proof_url, is_active, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: provider_staff_services; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.provider_staff_services (id, staff_id, service_id, created_at) FROM stdin;
\.


--
-- Data for Name: providers; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.providers (id, user_id, business_name, aadhar_number, pan_number, bank_account_number, ifsc_code, service_radius_km, is_fixed_location, fixed_location_lat, fixed_location_lng, fixed_location_address, current_lat, current_lng, last_location_update, is_online, is_available, total_jobs_completed, average_rating, total_ratings, is_verified, is_suspended, suspension_until, training_completed, exam_passed, exam_score, created_at, updated_at, business_address, business_lat, business_lng, business_category_id, business_subcategory_id, gst_number, travel_charge_type, travel_charge_amount, free_travel_radius_km, enable_travel_charges, enable_rental_charges, gst_enabled, gst_percentage, short_bio, experience_years, past_companies, city_id, verification_status) FROM stdin;
fa36c76c-5e1b-49c6-93d2-4c0d357a916c	5ca81099-f4c1-4f7d-879d-061f6c393022	ac repairing work	\N	\N	\N	\N	10.00	f	27.17670000	78.00810000	\N	27.17667010	78.00807450	2025-12-02 19:03:47.597+00	t	t	0	5.00	6	t	f	\N	f	f	\N	2025-12-02 18:58:26.759074+00	2025-12-03 18:07:08.747361+00	Mahatma Gandhi Road, Shahganj, Agra, αñåαñùαñ░αñ╛, Uttar Pradesh, 282002, India	27.17667010	78.00807450	3b1862d8-384e-4715-8899-795722f8a7e4	\N	\N	per_km	0.00	0.00	f	f	f	18.00	\N	0	\N	8a451c94-2e05-47f2-89fb-1f37abb52aff	pending
13e5f99d-68a2-47eb-94f6-dabf18adf6ce	6f8e22c4-af75-4865-bad3-8494742c5047	AC Repair	\N	\N	\N	\N	100.00	t	27.17667010	78.00807450	\N	27.17667010	78.00807450	2025-12-02 18:08:45.11+00	t	t	0	5.00	1	t	f	\N	f	f	\N	2025-12-02 18:06:14.80586+00	2025-12-02 18:12:27.263281+00	Mahatma Gandhi Road, Shahganj, Agra, Uttar Pradesh, 282002, India	27.17667010	78.00807450	3b1862d8-384e-4715-8899-795722f8a7e4	\N	\N	per_km	0.00	0.00	f	f	f	18.00	\N	0	\N	8a451c94-2e05-47f2-89fb-1f37abb52aff	pending
\.


--
-- Data for Name: quote_negotiations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.quote_negotiations (id, booking_id, quoted_by, quoted_price, message, status, created_at) FROM stdin;
54b69efc-81b0-4916-8377-095d8aa7526d	dbe53ace-0bbc-41a2-b067-c9532e5b551f	provider	450.00	Provider accepted user quote	accepted	2025-12-02 18:19:10.206086+00
ac005051-26bc-47b0-bcc1-a78e6209f0ca	3cbd1da7-e6bb-429c-81e9-850f367bcd9f	provider	480.00	 is me kar paoonga	pending	2025-12-02 18:20:02.789763+00
bc20bc6c-e7c0-4090-8fb3-ca253e6228de	6931f2a2-6794-456a-8a9b-1dda7ad4e2ae	provider	475.00	Provider accepted user quote	accepted	2025-12-02 18:20:29.682221+00
\.


--
-- Data for Name: rate_quotes; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.rate_quotes (id, user_id, service_id, sub_service_id, city_id, address_id, requested_price, status, expires_at, details, created_at) FROM stdin;
eb7dcf68-9daa-4567-be20-e1c9c6b0a501	6633dc36-aa0b-431e-a1d1-0a5993941950	5103e5ba-3013-47b1-8297-5a01eb5c27b9	\N	8a451c94-2e05-47f2-89fb-1f37abb52aff	0951c05b-212e-49bd-9f19-d2a7229bff5e	450.00	open	2025-12-02 18:11:12.87+00	{"for_whom": "self", "base_charge": 500, "service_lat": 27.1766701, "service_lng": 78.0080745, "hourly_charge": null, "other_contact": null, "scheduled_date": "2025-12-03T00:00:00", "service_address": "Mahatma Gandhi Road, Shahganj, Agra, 282002", "sub_service_ids": [], "sub_service_names": "AC Repair", "sub_subservice_ids": []}	2025-12-02 18:00:46.862118+00
15b31c5f-8837-4035-a010-b63c4f8d9a92	9f7cbe52-d1e4-4310-aa79-6a300f5ccb6c	5103e5ba-3013-47b1-8297-5a01eb5c27b9	\N	8a451c94-2e05-47f2-89fb-1f37abb52aff	\N	400.00	open	2025-12-02 18:23:33.937+00	{"for_whom": "self", "base_charge": 500, "service_lat": 27.1766701, "service_lng": 78.0080745, "hourly_charge": null, "other_contact": null, "scheduled_date": "2025-12-03T00:25:00", "service_address": "Mahatma Gandhi Road, Shahganj, Agra, αñåαñùαñ░αñ╛, Uttar Pradesh, 282002, India", "sub_service_ids": [], "sub_service_names": "AC Repair", "sub_subservice_ids": []}	2025-12-02 18:13:07.933307+00
3db1dffd-0c2c-4b17-b0e5-519b5ea23115	9f7cbe52-d1e4-4310-aa79-6a300f5ccb6c	5103e5ba-3013-47b1-8297-5a01eb5c27b9	\N	8a451c94-2e05-47f2-89fb-1f37abb52aff	\N	460.00	open	2025-12-02 18:25:27.191+00	{"for_whom": "self", "base_charge": 500, "service_lat": 27.1766701, "service_lng": 78.0080745, "hourly_charge": null, "other_contact": null, "scheduled_date": "2025-12-03T00:35:00", "service_address": "Mahatma Gandhi Road, Shahganj, Agra, αñåαñùαñ░αñ╛, Uttar Pradesh, 282002, India", "sub_service_ids": [], "sub_service_names": "AC Repair", "sub_subservice_ids": []}	2025-12-02 18:15:01.187709+00
4ac0c86d-4753-4b7e-8035-3ceb091f0bc4	9f7cbe52-d1e4-4310-aa79-6a300f5ccb6c	5103e5ba-3013-47b1-8297-5a01eb5c27b9	\N	8a451c94-2e05-47f2-89fb-1f37abb52aff	\N	400.00	open	2025-12-03 15:18:50.428+00	{"for_whom": "self", "base_charge": 500, "service_lat": 27.2446484, "service_lng": 77.8938895, "hourly_charge": null, "other_contact": null, "scheduled_date": "2025-12-03T23:40:00", "service_address": "Kiraoli, αñåαñùαñ░αñ╛, Uttar Pradesh, India", "sub_service_ids": [], "sub_service_names": "AC Repair", "sub_subservice_ids": []}	2025-12-03 15:08:22.615252+00
8d2915f1-9ca6-4504-babb-7aebab442617	9f7cbe52-d1e4-4310-aa79-6a300f5ccb6c	5103e5ba-3013-47b1-8297-5a01eb5c27b9	\N	8a451c94-2e05-47f2-89fb-1f37abb52aff	75734178-c271-4d6e-aee7-fdf98804c243	300.00	open	2025-12-03 15:22:57.143+00	{"for_whom": "self", "base_charge": 500, "service_lat": 27.2446484, "service_lng": 77.8938895, "hourly_charge": null, "other_contact": null, "scheduled_date": "2025-12-04T00:15:00", "service_address": "SIKANDRA, RK PURAM, AGRA, 282007", "sub_service_ids": [], "sub_service_names": "AC Repair", "sub_subservice_ids": []}	2025-12-03 15:12:29.332925+00
76389f4d-685e-457c-aceb-0ad7eaa43b57	9f7cbe52-d1e4-4310-aa79-6a300f5ccb6c	5103e5ba-3013-47b1-8297-5a01eb5c27b9	\N	8a451c94-2e05-47f2-89fb-1f37abb52aff	75734178-c271-4d6e-aee7-fdf98804c243	\N	open	2025-12-03 15:47:17.029+00	{"for_whom": "self", "base_charge": 500, "service_lat": 27.2446484, "service_lng": 77.8938895, "hourly_charge": null, "other_contact": null, "scheduled_date": "2025-12-04T00:25:00", "service_address": "SIKANDRA, RK PURAM, AGRA, 282007", "sub_service_ids": [], "sub_service_names": "AC Repair", "sub_subservice_ids": []}	2025-12-03 15:36:49.316098+00
1a9c13cb-7744-4c7e-99d3-23e1cfa23239	9f7cbe52-d1e4-4310-aa79-6a300f5ccb6c	5103e5ba-3013-47b1-8297-5a01eb5c27b9	\N	8a451c94-2e05-47f2-89fb-1f37abb52aff	75734178-c271-4d6e-aee7-fdf98804c243	\N	open	2025-12-03 15:49:47.586+00	{"for_whom": "self", "base_charge": 500, "service_lat": 27.2446484, "service_lng": 77.8938895, "hourly_charge": null, "other_contact": null, "scheduled_date": "2025-12-04T00:30:00", "service_address": "SIKANDRA, RK PURAM, AGRA, 282007", "sub_service_ids": [], "sub_service_names": "AC Repair", "sub_subservice_ids": []}	2025-12-03 15:39:19.760427+00
75330085-c31f-40c7-bf02-e8bf532218c9	9f7cbe52-d1e4-4310-aa79-6a300f5ccb6c	5103e5ba-3013-47b1-8297-5a01eb5c27b9	\N	8a451c94-2e05-47f2-89fb-1f37abb52aff	75734178-c271-4d6e-aee7-fdf98804c243	\N	open	2025-12-03 16:09:22.781+00	{"for_whom": "self", "base_charge": 500, "service_lat": 27.2446484, "service_lng": 77.8938895, "hourly_charge": null, "other_contact": null, "scheduled_date": "2025-12-04T00:35:00", "service_address": "SIKANDRA, RK PURAM, AGRA, 282007", "sub_service_ids": [], "sub_service_names": "AC Repair", "sub_subservice_ids": []}	2025-12-03 15:58:54.981707+00
e68c7335-3298-41e4-9975-cf58fe0de9ee	9f7cbe52-d1e4-4310-aa79-6a300f5ccb6c	5103e5ba-3013-47b1-8297-5a01eb5c27b9	\N	8a451c94-2e05-47f2-89fb-1f37abb52aff	75734178-c271-4d6e-aee7-fdf98804c243	\N	open	2025-12-03 16:12:01.173+00	{"for_whom": "self", "base_charge": 500, "service_lat": 27.2446484, "service_lng": 77.8938895, "hourly_charge": null, "other_contact": null, "scheduled_date": "2025-12-04T00:40:00", "service_address": "SIKANDRA, RK PURAM, AGRA, 282007", "sub_service_ids": [], "sub_service_names": "AC Repair", "sub_subservice_ids": []}	2025-12-03 16:01:33.357577+00
a332253d-2dbb-423b-976b-022c12d92a7b	9f7cbe52-d1e4-4310-aa79-6a300f5ccb6c	5103e5ba-3013-47b1-8297-5a01eb5c27b9	\N	8a451c94-2e05-47f2-89fb-1f37abb52aff	75734178-c271-4d6e-aee7-fdf98804c243	\N	open	2025-12-03 16:13:02.542+00	{"for_whom": "self", "base_charge": 500, "service_lat": 27.2446484, "service_lng": 77.8938895, "hourly_charge": null, "other_contact": null, "scheduled_date": null, "service_address": "SIKANDRA, RK PURAM, AGRA, 282007", "sub_service_ids": [], "sub_service_names": "AC Repair", "sub_subservice_ids": []}	2025-12-03 16:02:34.723042+00
f36f9176-0592-4bf2-9ffa-6515fc9fd280	9f7cbe52-d1e4-4310-aa79-6a300f5ccb6c	5103e5ba-3013-47b1-8297-5a01eb5c27b9	\N	8a451c94-2e05-47f2-89fb-1f37abb52aff	75734178-c271-4d6e-aee7-fdf98804c243	\N	open	2025-12-03 16:14:18.118+00	{"for_whom": "self", "base_charge": 500, "service_lat": 27.2446484, "service_lng": 77.8938895, "hourly_charge": null, "other_contact": null, "scheduled_date": null, "service_address": "SIKANDRA, RK PURAM, AGRA, 282007", "sub_service_ids": [], "sub_service_names": "AC Repair", "sub_subservice_ids": []}	2025-12-03 16:03:50.336898+00
867e29ac-8e08-437c-96c7-c420b1350444	9f7cbe52-d1e4-4310-aa79-6a300f5ccb6c	5103e5ba-3013-47b1-8297-5a01eb5c27b9	\N	8a451c94-2e05-47f2-89fb-1f37abb52aff	75734178-c271-4d6e-aee7-fdf98804c243	\N	open	2025-12-03 16:30:24.18+00	{"for_whom": "self", "base_charge": 500, "service_lat": 27.2446484, "service_lng": 77.8938895, "hourly_charge": null, "other_contact": null, "scheduled_date": null, "service_address": "SIKANDRA, RK PURAM, AGRA, 282007", "sub_service_ids": [], "sub_service_names": "AC Repair", "sub_subservice_ids": []}	2025-12-03 16:19:56.369157+00
6ebb3e2e-1d85-49bb-a99f-46d9370796f8	9f7cbe52-d1e4-4310-aa79-6a300f5ccb6c	5103e5ba-3013-47b1-8297-5a01eb5c27b9	\N	8a451c94-2e05-47f2-89fb-1f37abb52aff	75734178-c271-4d6e-aee7-fdf98804c243	\N	matched	2025-12-03 16:52:18.07+00	{"for_whom": "self", "base_charge": 500, "service_lat": 27.2446484, "service_lng": 77.8938895, "hourly_charge": null, "other_contact": null, "scheduled_date": null, "service_address": "SIKANDRA, RK PURAM, AGRA, 282007", "sub_service_ids": [], "sub_service_names": "AC Repair", "sub_subservice_ids": []}	2025-12-03 16:41:50.419637+00
8681db2f-67cd-4280-a925-cc57d0dd7d6f	9f7cbe52-d1e4-4310-aa79-6a300f5ccb6c	5103e5ba-3013-47b1-8297-5a01eb5c27b9	\N	8a451c94-2e05-47f2-89fb-1f37abb52aff	75734178-c271-4d6e-aee7-fdf98804c243	\N	converted	2025-12-03 16:56:14.586+00	{"for_whom": "self", "base_charge": 500, "service_lat": 27.2446484, "service_lng": 77.8938895, "hourly_charge": null, "other_contact": null, "scheduled_date": null, "service_address": "SIKANDRA, RK PURAM, AGRA, 282007", "sub_service_ids": [], "sub_service_names": "AC Repair", "sub_subservice_ids": []}	2025-12-03 16:45:46.804706+00
3d7c10b5-1e79-4d87-8296-3aead65f3fab	9f7cbe52-d1e4-4310-aa79-6a300f5ccb6c	5103e5ba-3013-47b1-8297-5a01eb5c27b9	\N	8a451c94-2e05-47f2-89fb-1f37abb52aff	75734178-c271-4d6e-aee7-fdf98804c243	\N	converted	2025-12-03 17:03:06.579+00	{"for_whom": "self", "base_charge": 500, "service_lat": 27.2446484, "service_lng": 77.8938895, "hourly_charge": null, "other_contact": null, "scheduled_date": null, "service_address": "SIKANDRA, RK PURAM, AGRA, 282007", "sub_service_ids": [], "sub_service_names": "AC Repair", "sub_subservice_ids": []}	2025-12-03 16:52:38.926754+00
b3ff3b95-0777-4fe5-b9c9-a9d2225488e9	9f7cbe52-d1e4-4310-aa79-6a300f5ccb6c	5103e5ba-3013-47b1-8297-5a01eb5c27b9	\N	8a451c94-2e05-47f2-89fb-1f37abb52aff	75734178-c271-4d6e-aee7-fdf98804c243	\N	converted	2025-12-03 17:20:41.84+00	{"for_whom": "self", "base_charge": 500, "service_lat": 27.2446484, "service_lng": 77.8938895, "hourly_charge": null, "other_contact": null, "scheduled_date": null, "service_address": "SIKANDRA, RK PURAM, AGRA, 282007", "sub_service_ids": [], "sub_service_names": "AC Repair", "sub_subservice_ids": []}	2025-12-03 17:10:41.963606+00
\.


--
-- Data for Name: ratings; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.ratings (id, booking_id, user_id, provider_id, rating, review_text, review_photos, created_at, behavior_rating, nature_rating, work_knowledge_rating, work_quality_rating, punctuality_rating, image_urls, rated_by) FROM stdin;
b89f4f9b-ba14-43ff-a2c8-f88ea6dedd42	93796c0e-a04e-44d2-94e3-7517fe48a794	9f7cbe52-d1e4-4310-aa79-6a300f5ccb6c	13e5f99d-68a2-47eb-94f6-dabf18adf6ce	5.0	test	{}	2025-12-02 18:12:27.263281+00	5	5	\N	\N	5	{}	provider
5e2b4088-2831-4f81-bf6d-65968945a2ec	5c0683f5-c02c-42f6-8254-e4c8d0301121	5ca81099-f4c1-4f7d-879d-061f6c393022	fa36c76c-5e1b-49c6-93d2-4c0d357a916c	5.0	sads	{}	2025-12-03 11:07:46.423028+00	5	5	5	\N	\N	{}	provider
19f2b41f-8377-41e8-8479-cf78019abb7e	30f26ecc-5eea-47b6-a8f5-3405d2d339b0	9f7cbe52-d1e4-4310-aa79-6a300f5ccb6c	fa36c76c-5e1b-49c6-93d2-4c0d357a916c	5.0	ASA	{https://xowsvzjvevzpqloniwtf.supabase.co/storage/v1/object/public/reviews/0.470327253715079.jpeg}	2025-12-03 11:09:46.088057+00	5	5	5	\N	\N	{}	user
6d450c51-d1c0-4d34-bb69-9eeb0f057710	30f26ecc-5eea-47b6-a8f5-3405d2d339b0	5ca81099-f4c1-4f7d-879d-061f6c393022	fa36c76c-5e1b-49c6-93d2-4c0d357a916c	5.0		{}	2025-12-03 11:10:13.592585+00	5	5	5	\N	\N	{}	provider
ff7ee5cc-78fe-4c12-add3-1423602e75af	1c919af1-559d-4a20-aa88-8b94181bcc0c	5ca81099-f4c1-4f7d-879d-061f6c393022	fa36c76c-5e1b-49c6-93d2-4c0d357a916c	5.0	ad	{}	2025-12-03 13:02:54.236494+00	5	5	5	\N	\N	{}	provider
a2773aca-4628-4a6d-8480-219b65c2a6ee	22825a73-3918-4b6c-8505-bad4fc5fe2c5	9f7cbe52-d1e4-4310-aa79-6a300f5ccb6c	fa36c76c-5e1b-49c6-93d2-4c0d357a916c	5.0	test	{https://xowsvzjvevzpqloniwtf.supabase.co/storage/v1/object/public/reviews/0.8618189257105724.png}	2025-12-03 13:48:20.829741+00	5	5	5	\N	\N	{}	user
ad891a75-0f90-4f5d-a88c-7872c5e36856	e995f198-c0cb-4a2a-8d0a-c3108e2f25c1	5ca81099-f4c1-4f7d-879d-061f6c393022	fa36c76c-5e1b-49c6-93d2-4c0d357a916c	5.0	lkjhgfds	{}	2025-12-03 18:07:08.747361+00	5	5	4	3	3	{}	provider
\.


--
-- Data for Name: referrals; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.referrals (id, referrer_id, referred_id, referral_code, reward_amount, is_rewarded, created_at) FROM stdin;
\.


--
-- Data for Name: reward_transactions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.reward_transactions (id, user_id, booking_id, points, expiry_date, is_converted, converted_at, created_at) FROM stdin;
\.


--
-- Data for Name: service_categories; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.service_categories (id, name, icon, description, is_active, created_at, image_url) FROM stdin;
3b1862d8-384e-4715-8899-795722f8a7e4	Repair & Installation	≡ƒöº	AC, washing machine, microwave, chimney, RO, mixer repair. CCTV, refrigerator, fan, light, geyser installation	t	2025-11-23 20:20:42.808067+00	\N
2e5175db-5904-4bf9-98ee-66c0a8adad97	Tution	\N	\N	t	2025-12-03 18:12:43.149897+00	\N
8e5c473a-e558-42ac-8fbc-7d58e5f80375	Tution	\N	\N	t	2025-12-03 18:13:04.919338+00	\N
\.


--
-- Data for Name: service_requests; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.service_requests (id, provider_id, service_name, category_id, description, status, admin_notes, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: service_sub_subservices; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.service_sub_subservices (id, sub_service_id, name, description, base_charge, image_url, is_active, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: service_subservices; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.service_subservices (id, service_id, name, description, pricing_type, base_charge, per_hour_charge, is_active, created_by_provider_id, created_by_user_id, created_at, image_url) FROM stdin;
\.


--
-- Data for Name: services; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.services (id, category_id, name, description, base_price, min_price, max_price, is_fixed_location, min_radius_km, max_radius_km, is_active, created_at, image_url) FROM stdin;
5103e5ba-3013-47b1-8297-5a01eb5c27b9	3b1862d8-384e-4715-8899-795722f8a7e4	AC Repair	Air conditioner repair and service	500.00	300.00	2000.00	f	5.00	50.00	t	2025-11-23 20:20:42.808067+00	\N
a39146d2-898a-4e72-af09-098989324b76	3b1862d8-384e-4715-8899-795722f8a7e4	Washing Machine Repair	Washing machine repair	400.00	250.00	1500.00	f	5.00	50.00	t	2025-11-23 20:20:42.808067+00	\N
0be12157-2fd7-4c63-b744-2b47f5c7a163	3b1862d8-384e-4715-8899-795722f8a7e4	Microwave Repair	Microwave oven repair	300.00	200.00	1000.00	f	5.00	50.00	t	2025-11-23 20:20:42.808067+00	\N
f2e72aff-a32b-4ff8-b117-9020c156b5e0	3b1862d8-384e-4715-8899-795722f8a7e4	Chimney Repair	Kitchen chimney repair and cleaning	500.00	300.00	1500.00	f	5.00	50.00	t	2025-11-23 20:20:42.808067+00	\N
10a23187-039d-41a9-ad90-a9629b2da08e	3b1862d8-384e-4715-8899-795722f8a7e4	RO Repair	RO water purifier repair	400.00	250.00	1200.00	f	5.00	50.00	t	2025-11-23 20:20:42.808067+00	\N
675d0370-8ced-49fd-91dc-8bd706cca34c	3b1862d8-384e-4715-8899-795722f8a7e4	Mixer Repair	Mixer grinder repair	200.00	150.00	600.00	f	5.00	50.00	t	2025-11-23 20:20:42.808067+00	\N
c8b90092-8771-4240-b6dc-e95e67bcba0e	3b1862d8-384e-4715-8899-795722f8a7e4	CCTV Installation	CCTV camera installation	1500.00	1000.00	5000.00	f	5.00	50.00	t	2025-11-23 20:20:42.808067+00	\N
65222400-c57b-4221-a314-9a504cf752be	3b1862d8-384e-4715-8899-795722f8a7e4	Refrigerator Installation	Refrigerator installation	300.00	200.00	800.00	f	5.00	50.00	t	2025-11-23 20:20:42.808067+00	\N
4e6d1f73-a7a9-4aae-926e-8752d7fc2b20	3b1862d8-384e-4715-8899-795722f8a7e4	Fan Installation	Ceiling fan installation	400.00	250.00	1000.00	f	5.00	50.00	t	2025-11-23 20:20:42.808067+00	\N
e289e6bf-3bb4-4353-8ad5-796c4e957856	3b1862d8-384e-4715-8899-795722f8a7e4	Light Installation	Light fixture installation	300.00	200.00	800.00	f	5.00	50.00	t	2025-11-23 20:20:42.808067+00	\N
e7c75f3f-ced1-4c1e-96ba-670ad57364af	3b1862d8-384e-4715-8899-795722f8a7e4	Geyser Installation	Water geyser installation	600.00	400.00	1500.00	f	5.00	50.00	t	2025-11-23 20:20:42.808067+00	\N
e28bbfd8-af59-417a-bf5a-b36d0f6f2a82	8e5c473a-e558-42ac-8fbc-7d58e5f80375	Online Class		600.00	500.00	800.00	t	5.00	50.00	t	2025-12-03 18:13:05.043737+00	\N
7a797cfd-6407-419b-8b17-13001bb8df49	8e5c473a-e558-42ac-8fbc-7d58e5f80375	Offline Tution		600.00	400.00	800.00	f	1.00	50.00	t	2025-12-03 18:14:22.687993+00	\N
\.


--
-- Data for Name: spatial_ref_sys; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.spatial_ref_sys (srid, auth_name, auth_srid, srtext, proj4text) FROM stdin;
\.


--
-- Data for Name: subscriptions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.subscriptions (id, provider_id, service_id, title, description, price, "interval", active, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: user_addresses; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.user_addresses (id, user_id, address_type, address_line1, address_line2, city, state, pincode, latitude, longitude, is_default, created_at) FROM stdin;
e3b6de7b-eb8c-426b-a21c-f20f8974fab8	e391e4ca-6d57-4e97-9267-92187a1c8911	home	Mahatma Gandhi Road	Shahganj	Agra	Uttar Pradesh	282002	27.17667010	78.00807450	t	2025-11-26 17:07:30.381141+00
0951c05b-212e-49bd-9f19-d2a7229bff5e	6633dc36-aa0b-431e-a1d1-0a5993941950	home	Mahatma Gandhi Road	Shahganj	Agra	Uttar Pradesh	282002	27.17667010	78.00807450	t	2025-12-02 17:59:34.390973+00
75734178-c271-4d6e-aee7-fdf98804c243	9f7cbe52-d1e4-4310-aa79-6a300f5ccb6c	home	SIKANDRA	RK PURAM	AGRA	Uttar Pradesh	282007	27.24464840	77.89388950	t	2025-12-03 15:11:40.466859+00
\.


--
-- Data for Name: user_subscriptions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.user_subscriptions (id, user_id, subscription_id, status, started_at, ends_at, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.users (id, email, phone, full_name, role, is_verified, is_active, referral_code, referred_by, wallet_balance, total_cashback, total_rewards, created_at, updated_at, default_city_id, current_city_id, current_lat, current_lng, profile_picture_url, city_id, avatar_url) FROM stdin;
6633dc36-aa0b-431e-a1d1-0a5993941950	U2@gmail.com	9876543210	USER2	user	f	t	HSMIOVU7Z46633DC	\N	0.00	0.00	0.00	2025-12-02 17:58:52.500239+00	2025-12-02 18:00:02.432214+00	\N	8a451c94-2e05-47f2-89fb-1f37abb52aff	27.17667010	78.00807450	\N	\N	\N
6f8e22c4-af75-4865-bad3-8494742c5047	P2@gmail.com	9897796616	Provider 1	provider	f	t	HSMIOW0CNK6F8E22	\N	0.00	0.00	0.00	2025-12-02 18:03:38.520449+00	2025-12-02 18:06:33.695744+00	\N	\N	\N	\N	\N	\N	\N
1e90bb2c-2aae-490c-997d-2dc0cff18925	admin@admin.com	\N	admin	superadmin	f	t	HSMIG9FE5E1E90BB	\N	0.00	0.00	0.00	2025-11-26 17:09:28.581749+00	2025-12-01 12:50:23.043054+00	\N	\N	\N	\N	\N	8a451c94-2e05-47f2-89fb-1f37abb52aff	\N
5ca81099-f4c1-4f7d-879d-061f6c393022	P1@gmail.com	9897796617	PROVIDER1	provider	f	t	HSMIOX292L5CA810	\N	0.00	0.00	0.00	2025-12-02 18:33:08.310017+00	2025-12-03 12:50:44.457828+00	\N	\N	\N	\N	\N	\N	\N
9f7cbe52-d1e4-4310-aa79-6a300f5ccb6c	U1@gmail.com	\N	USER1	user	f	t	HSMIOVTDBJ9F7CBE	\N	0.00	0.00	0.00	2025-12-02 17:58:12.758993+00	2025-12-03 17:07:58.732477+00	\N	8a451c94-2e05-47f2-89fb-1f37abb52aff	27.14071740	78.03095420	\N	\N	\N
e391e4ca-6d57-4e97-9267-92187a1c8911	m@gmail.com	\N	majid	admin	f	t	HSMIG91Y4IE391E4	\N	0.00	0.00	0.00	2025-11-26 16:59:01.300838+00	2025-12-01 16:05:00.041231+00	\N	\N	\N	\N	\N	\N	\N
\.


--
-- Data for Name: wallet_topups; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.wallet_topups (id, user_id, amount, status, reference_id, metadata, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: wallet_transactions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.wallet_transactions (id, user_id, amount, transaction_type, booking_id, description, balance_after, created_at, wallet_id) FROM stdin;
\.


--
-- Data for Name: wallets; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.wallets (id, user_id, balance, locked_balance, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: messages_2025_12_01; Type: TABLE DATA; Schema: realtime; Owner: -
--

COPY realtime.messages_2025_12_01 (topic, extension, payload, event, private, updated_at, inserted_at, id) FROM stdin;
\.


--
-- Data for Name: messages_2025_12_02; Type: TABLE DATA; Schema: realtime; Owner: -
--

COPY realtime.messages_2025_12_02 (topic, extension, payload, event, private, updated_at, inserted_at, id) FROM stdin;
\.


--
-- Data for Name: messages_2025_12_03; Type: TABLE DATA; Schema: realtime; Owner: -
--

COPY realtime.messages_2025_12_03 (topic, extension, payload, event, private, updated_at, inserted_at, id) FROM stdin;
\.


--
-- Data for Name: messages_2025_12_04; Type: TABLE DATA; Schema: realtime; Owner: -
--

COPY realtime.messages_2025_12_04 (topic, extension, payload, event, private, updated_at, inserted_at, id) FROM stdin;
\.


--
-- Data for Name: messages_2025_12_05; Type: TABLE DATA; Schema: realtime; Owner: -
--

COPY realtime.messages_2025_12_05 (topic, extension, payload, event, private, updated_at, inserted_at, id) FROM stdin;
\.


--
-- Data for Name: messages_2025_12_06; Type: TABLE DATA; Schema: realtime; Owner: -
--

COPY realtime.messages_2025_12_06 (topic, extension, payload, event, private, updated_at, inserted_at, id) FROM stdin;
\.


--
-- Data for Name: messages_2025_12_07; Type: TABLE DATA; Schema: realtime; Owner: -
--

COPY realtime.messages_2025_12_07 (topic, extension, payload, event, private, updated_at, inserted_at, id) FROM stdin;
\.


--
-- Data for Name: schema_migrations; Type: TABLE DATA; Schema: realtime; Owner: -
--

COPY realtime.schema_migrations (version, inserted_at) FROM stdin;
20211116024918	2025-11-23 13:42:32
20211116045059	2025-11-23 13:42:32
20211116050929	2025-11-23 13:42:33
20211116051442	2025-11-23 13:42:34
20211116212300	2025-11-23 13:42:34
20211116213355	2025-11-23 13:42:35
20211116213934	2025-11-23 13:42:36
20211116214523	2025-11-23 13:42:37
20211122062447	2025-11-23 13:42:37
20211124070109	2025-11-23 13:42:38
20211202204204	2025-11-23 13:42:38
20211202204605	2025-11-23 13:42:39
20211210212804	2025-11-23 13:42:41
20211228014915	2025-11-23 13:42:42
20220107221237	2025-11-23 13:42:42
20220228202821	2025-11-23 13:42:43
20220312004840	2025-11-23 13:42:44
20220603231003	2025-11-23 13:42:45
20220603232444	2025-11-23 13:42:45
20220615214548	2025-11-23 13:42:46
20220712093339	2025-11-23 13:42:47
20220908172859	2025-11-23 13:42:47
20220916233421	2025-11-23 13:42:48
20230119133233	2025-11-23 13:42:49
20230128025114	2025-11-23 13:42:49
20230128025212	2025-11-23 13:42:50
20230227211149	2025-11-23 13:42:51
20230228184745	2025-11-23 13:42:51
20230308225145	2025-11-23 13:42:52
20230328144023	2025-11-23 13:42:53
20231018144023	2025-11-23 13:42:53
20231204144023	2025-11-23 13:42:54
20231204144024	2025-11-23 13:42:55
20231204144025	2025-11-23 13:42:56
20240108234812	2025-11-23 13:42:56
20240109165339	2025-11-23 13:42:57
20240227174441	2025-11-23 13:42:58
20240311171622	2025-11-23 13:42:59
20240321100241	2025-11-23 13:43:00
20240401105812	2025-11-23 13:43:02
20240418121054	2025-11-23 13:43:03
20240523004032	2025-11-23 13:43:05
20240618124746	2025-11-23 13:43:06
20240801235015	2025-11-23 13:43:06
20240805133720	2025-11-23 13:43:07
20240827160934	2025-11-23 13:43:08
20240919163303	2025-11-23 13:43:08
20240919163305	2025-11-23 13:43:09
20241019105805	2025-11-23 13:43:10
20241030150047	2025-11-23 13:43:12
20241108114728	2025-11-23 13:43:13
20241121104152	2025-11-23 13:43:13
20241130184212	2025-11-23 13:43:14
20241220035512	2025-11-23 13:43:15
20241220123912	2025-11-23 13:43:15
20241224161212	2025-11-23 13:43:16
20250107150512	2025-11-23 13:43:17
20250110162412	2025-11-23 13:43:17
20250123174212	2025-11-23 13:43:18
20250128220012	2025-11-23 13:43:19
20250506224012	2025-11-23 13:43:19
20250523164012	2025-11-23 13:43:20
20250714121412	2025-11-23 13:43:20
20250905041441	2025-11-23 13:43:21
20251103001201	2025-11-23 13:43:22
\.


--
-- Data for Name: subscription; Type: TABLE DATA; Schema: realtime; Owner: -
--

COPY realtime.subscription (id, subscription_id, entity, filters, claims, created_at) FROM stdin;
\.


--
-- Data for Name: buckets; Type: TABLE DATA; Schema: storage; Owner: -
--

COPY storage.buckets (id, name, owner, created_at, updated_at, public, avif_autodetection, file_size_limit, allowed_mime_types, owner_id, type) FROM stdin;
reviews	reviews	\N	2025-12-02 05:54:28.419674+00	2025-12-02 05:54:28.419674+00	t	f	\N	\N	\N	STANDARD
avatars	avatars	\N	2025-12-02 05:54:28.419674+00	2025-12-02 05:54:28.419674+00	t	f	\N	\N	\N	STANDARD
\.


--
-- Data for Name: buckets_analytics; Type: TABLE DATA; Schema: storage; Owner: -
--

COPY storage.buckets_analytics (name, type, format, created_at, updated_at, id, deleted_at) FROM stdin;
\.


--
-- Data for Name: buckets_vectors; Type: TABLE DATA; Schema: storage; Owner: -
--

COPY storage.buckets_vectors (id, type, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: migrations; Type: TABLE DATA; Schema: storage; Owner: -
--

COPY storage.migrations (id, name, hash, executed_at) FROM stdin;
0	create-migrations-table	e18db593bcde2aca2a408c4d1100f6abba2195df	2025-11-23 13:42:29.717362
1	initialmigration	6ab16121fbaa08bbd11b712d05f358f9b555d777	2025-11-23 13:42:29.730442
2	storage-schema	5c7968fd083fcea04050c1b7f6253c9771b99011	2025-11-23 13:42:29.735397
3	pathtoken-column	2cb1b0004b817b29d5b0a971af16bafeede4b70d	2025-11-23 13:42:29.816083
4	add-migrations-rls	427c5b63fe1c5937495d9c635c263ee7a5905058	2025-11-23 13:42:29.912845
5	add-size-functions	79e081a1455b63666c1294a440f8ad4b1e6a7f84	2025-11-23 13:42:29.919217
6	change-column-name-in-get-size	f93f62afdf6613ee5e7e815b30d02dc990201044	2025-11-23 13:42:29.925793
7	add-rls-to-buckets	e7e7f86adbc51049f341dfe8d30256c1abca17aa	2025-11-23 13:42:29.930137
8	add-public-to-buckets	fd670db39ed65f9d08b01db09d6202503ca2bab3	2025-11-23 13:42:29.93476
9	fix-search-function	3a0af29f42e35a4d101c259ed955b67e1bee6825	2025-11-23 13:42:29.939698
10	search-files-search-function	68dc14822daad0ffac3746a502234f486182ef6e	2025-11-23 13:42:29.944893
11	add-trigger-to-auto-update-updated_at-column	7425bdb14366d1739fa8a18c83100636d74dcaa2	2025-11-23 13:42:29.951492
12	add-automatic-avif-detection-flag	8e92e1266eb29518b6a4c5313ab8f29dd0d08df9	2025-11-23 13:42:29.959904
13	add-bucket-custom-limits	cce962054138135cd9a8c4bcd531598684b25e7d	2025-11-23 13:42:29.965937
14	use-bytes-for-max-size	941c41b346f9802b411f06f30e972ad4744dad27	2025-11-23 13:42:29.970649
15	add-can-insert-object-function	934146bc38ead475f4ef4b555c524ee5d66799e5	2025-11-23 13:42:29.998027
16	add-version	76debf38d3fd07dcfc747ca49096457d95b1221b	2025-11-23 13:42:30.002784
17	drop-owner-foreign-key	f1cbb288f1b7a4c1eb8c38504b80ae2a0153d101	2025-11-23 13:42:30.007757
18	add_owner_id_column_deprecate_owner	e7a511b379110b08e2f214be852c35414749fe66	2025-11-23 13:42:30.014851
19	alter-default-value-objects-id	02e5e22a78626187e00d173dc45f58fa66a4f043	2025-11-23 13:42:30.021869
20	list-objects-with-delimiter	cd694ae708e51ba82bf012bba00caf4f3b6393b7	2025-11-23 13:42:30.025838
21	s3-multipart-uploads	8c804d4a566c40cd1e4cc5b3725a664a9303657f	2025-11-23 13:42:30.03337
22	s3-multipart-uploads-big-ints	9737dc258d2397953c9953d9b86920b8be0cdb73	2025-11-23 13:42:30.054434
23	optimize-search-function	9d7e604cddc4b56a5422dc68c9313f4a1b6f132c	2025-11-23 13:42:30.067803
24	operation-function	8312e37c2bf9e76bbe841aa5fda889206d2bf8aa	2025-11-23 13:42:30.072083
25	custom-metadata	d974c6057c3db1c1f847afa0e291e6165693b990	2025-11-23 13:42:30.07658
26	objects-prefixes	ef3f7871121cdc47a65308e6702519e853422ae2	2025-11-23 13:42:30.080812
27	search-v2	33b8f2a7ae53105f028e13e9fcda9dc4f356b4a2	2025-11-23 13:42:30.094932
28	object-bucket-name-sorting	ba85ec41b62c6a30a3f136788227ee47f311c436	2025-11-23 13:42:31.509064
29	create-prefixes	a7b1a22c0dc3ab630e3055bfec7ce7d2045c5b7b	2025-11-23 13:42:31.514172
30	update-object-levels	6c6f6cc9430d570f26284a24cf7b210599032db7	2025-11-23 13:42:31.522977
31	objects-level-index	33f1fef7ec7fea08bb892222f4f0f5d79bab5eb8	2025-11-23 13:42:31.530702
32	backward-compatible-index-on-objects	2d51eeb437a96868b36fcdfb1ddefdf13bef1647	2025-11-23 13:42:31.537876
33	backward-compatible-index-on-prefixes	fe473390e1b8c407434c0e470655945b110507bf	2025-11-23 13:42:31.549706
34	optimize-search-function-v1	82b0e469a00e8ebce495e29bfa70a0797f7ebd2c	2025-11-23 13:42:31.551584
35	add-insert-trigger-prefixes	63bb9fd05deb3dc5e9fa66c83e82b152f0caf589	2025-11-23 13:42:31.556696
36	optimise-existing-functions	81cf92eb0c36612865a18016a38496c530443899	2025-11-23 13:42:31.560439
37	add-bucket-name-length-trigger	3944135b4e3e8b22d6d4cbb568fe3b0b51df15c1	2025-11-23 13:42:31.566763
38	iceberg-catalog-flag-on-buckets	19a8bd89d5dfa69af7f222a46c726b7c41e462c5	2025-11-23 13:42:31.573128
39	add-search-v2-sort-support	39cf7d1e6bf515f4b02e41237aba845a7b492853	2025-11-23 13:42:31.582417
40	fix-prefix-race-conditions-optimized	fd02297e1c67df25a9fc110bf8c8a9af7fb06d1f	2025-11-23 13:42:31.586919
41	add-object-level-update-trigger	44c22478bf01744b2129efc480cd2edc9a7d60e9	2025-11-23 13:42:31.595367
42	rollback-prefix-triggers	f2ab4f526ab7f979541082992593938c05ee4b47	2025-11-23 13:42:31.601036
43	fix-object-level	ab837ad8f1c7d00cc0b7310e989a23388ff29fc6	2025-11-23 13:42:31.60649
44	vector-bucket-type	99c20c0ffd52bb1ff1f32fb992f3b351e3ef8fb3	2025-11-23 13:42:31.610464
45	vector-buckets	049e27196d77a7cb76497a85afae669d8b230953	2025-11-23 13:42:31.616559
46	buckets-objects-grants	fedeb96d60fefd8e02ab3ded9fbde05632f84aed	2025-11-23 13:42:31.634771
47	iceberg-table-metadata	649df56855c24d8b36dd4cc1aeb8251aa9ad42c2	2025-11-23 13:42:31.64469
48	iceberg-catalog-ids	2666dff93346e5d04e0a878416be1d5fec345d6f	2025-11-23 13:42:31.650772
\.


--
-- Data for Name: objects; Type: TABLE DATA; Schema: storage; Owner: -
--

COPY storage.objects (id, bucket_id, name, owner, created_at, updated_at, last_accessed_at, metadata, version, owner_id, user_metadata, level) FROM stdin;
82d88917-61d9-4237-a915-d7f5ac782a2a	avatars	0.08490921890992342.jpeg	e3be8daa-6372-42ec-901f-29c4ef81a6ac	2025-12-02 06:09:19.319398+00	2025-12-02 06:09:19.319398+00	2025-12-02 06:09:19.319398+00	{"eTag": "\\"c376c5834adfa7f255d72167bd4c2e96\\"", "size": 69942, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2025-12-02T06:09:20.000Z", "contentLength": 69942, "httpStatusCode": 200}	bc962408-cbeb-4bf0-812c-2e48aa6b7746	e3be8daa-6372-42ec-901f-29c4ef81a6ac	{}	1
1c01ad61-1bc2-4a29-ae6a-9e504945f6ca	avatars	0.10420768401676217.jpeg	e3be8daa-6372-42ec-901f-29c4ef81a6ac	2025-12-02 06:11:51.169747+00	2025-12-02 06:11:51.169747+00	2025-12-02 06:11:51.169747+00	{"eTag": "\\"2af6481bb4e5d2e3880603b1671c9d14\\"", "size": 22663, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2025-12-02T06:11:52.000Z", "contentLength": 22663, "httpStatusCode": 200}	6300d48c-b468-48c8-972c-211695713c3e	e3be8daa-6372-42ec-901f-29c4ef81a6ac	{}	1
1ce9158c-49f7-4ff4-9aba-c2c2300e6db5	reviews	0.8275606008966219.jpeg	c33046ea-ac53-43a0-bbb5-4bfb55ad757a	2025-12-02 08:50:39.015142+00	2025-12-02 08:50:39.015142+00	2025-12-02 08:50:39.015142+00	{"eTag": "\\"781701fb37ee5f0841e81bc4d3da6bdf\\"", "size": 58734, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2025-12-02T08:50:39.000Z", "contentLength": 58734, "httpStatusCode": 200}	89fdd896-ac45-4802-99f7-f6d324f44d6f	c33046ea-ac53-43a0-bbb5-4bfb55ad757a	{}	1
03b2eb6c-589e-49d2-9efe-c747230461c7	reviews	0.10265012598586021.jpeg	c33046ea-ac53-43a0-bbb5-4bfb55ad757a	2025-12-02 08:51:09.820422+00	2025-12-02 08:51:09.820422+00	2025-12-02 08:51:09.820422+00	{"eTag": "\\"781701fb37ee5f0841e81bc4d3da6bdf\\"", "size": 58734, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2025-12-02T08:51:10.000Z", "contentLength": 58734, "httpStatusCode": 200}	fd8b6ebe-e17c-4307-8e1b-8acd30d2ba14	c33046ea-ac53-43a0-bbb5-4bfb55ad757a	{}	1
bdf5b52a-cc3d-467b-8aeb-b6fcf9aba423	reviews	0.6024408170011663.jpeg	c33046ea-ac53-43a0-bbb5-4bfb55ad757a	2025-12-02 08:54:42.76944+00	2025-12-02 08:54:42.76944+00	2025-12-02 08:54:42.76944+00	{"eTag": "\\"61fc63c79cf70bf43e4ff7434bc3164f\\"", "size": 52419, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2025-12-02T08:54:43.000Z", "contentLength": 52419, "httpStatusCode": 200}	3cbf3e9f-29c8-4dcc-adfe-43b484f6ff8f	c33046ea-ac53-43a0-bbb5-4bfb55ad757a	{}	1
fb634e7e-22f0-4358-a904-9abcce46f2c1	reviews	0.4662855159373601.jpeg	e3be8daa-6372-42ec-901f-29c4ef81a6ac	2025-12-02 11:37:49.90559+00	2025-12-02 11:37:49.90559+00	2025-12-02 11:37:49.90559+00	{"eTag": "\\"f378ccfe0121ba6339b059ea565477f6\\"", "size": 57313, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2025-12-02T11:37:50.000Z", "contentLength": 57313, "httpStatusCode": 200}	f8448efa-338d-42df-a153-d11b74e43f48	e3be8daa-6372-42ec-901f-29c4ef81a6ac	{}	1
ed13d34c-0675-4fd4-a5c8-2cfcd2be021d	reviews	0.609722125909235.jpeg	7961dd5b-891f-48f5-89ce-f2fb84842db2	2025-12-02 11:38:57.762872+00	2025-12-02 11:38:57.762872+00	2025-12-02 11:38:57.762872+00	{"eTag": "\\"5a3fad036ccb52e801c906f122a81826\\"", "size": 58435, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2025-12-02T11:38:58.000Z", "contentLength": 58435, "httpStatusCode": 200}	59364372-4aee-4db2-afb4-28e002795e98	7961dd5b-891f-48f5-89ce-f2fb84842db2	{}	1
b7fb2b2a-c56b-4731-88d7-5f43f6335a4e	reviews	0.6554711216193371.jpeg	7961dd5b-891f-48f5-89ce-f2fb84842db2	2025-12-02 11:43:38.142939+00	2025-12-02 11:43:38.142939+00	2025-12-02 11:43:38.142939+00	{"eTag": "\\"2af6481bb4e5d2e3880603b1671c9d14\\"", "size": 22663, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2025-12-02T11:43:39.000Z", "contentLength": 22663, "httpStatusCode": 200}	01fe20fc-e255-49d3-a932-953114d39e59	7961dd5b-891f-48f5-89ce-f2fb84842db2	{}	1
0dcbb742-d0fc-49c3-838d-22d2e42eb2a8	reviews	0.7443171236009503.jpeg	7961dd5b-891f-48f5-89ce-f2fb84842db2	2025-12-02 12:10:35.016872+00	2025-12-02 12:10:35.016872+00	2025-12-02 12:10:35.016872+00	{"eTag": "\\"5a3fad036ccb52e801c906f122a81826\\"", "size": 58435, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2025-12-02T12:10:35.000Z", "contentLength": 58435, "httpStatusCode": 200}	ea15baa1-788a-4b19-b780-0202bed6c23b	7961dd5b-891f-48f5-89ce-f2fb84842db2	{}	1
99ebcf09-e414-4c40-8f39-e8b55a8a0437	reviews	0.2607434570678384.jpeg	e3be8daa-6372-42ec-901f-29c4ef81a6ac	2025-12-02 12:23:33.753754+00	2025-12-02 12:23:33.753754+00	2025-12-02 12:23:33.753754+00	{"eTag": "\\"61fc63c79cf70bf43e4ff7434bc3164f\\"", "size": 52419, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2025-12-02T12:23:34.000Z", "contentLength": 52419, "httpStatusCode": 200}	3bdf0a0a-3cae-4d07-a9a6-52a6dccaa493	e3be8daa-6372-42ec-901f-29c4ef81a6ac	{}	1
173ca24a-fdb7-483f-8ee9-c8361722e053	reviews	0.6558924519505777.png	9f7cbe52-d1e4-4310-aa79-6a300f5ccb6c	2025-12-02 18:31:24.586302+00	2025-12-02 18:31:24.586302+00	2025-12-02 18:31:24.586302+00	{"eTag": "\\"36170d8704147bc828596fd7c92c04b2\\"", "size": 27102, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2025-12-02T18:31:25.000Z", "contentLength": 27102, "httpStatusCode": 200}	7d970af7-c7b5-4fe6-8ab5-851b879ae595	9f7cbe52-d1e4-4310-aa79-6a300f5ccb6c	{}	1
10359722-306a-41c8-bf4d-4da9db74e683	reviews	0.16533857912206407.jpeg	9f7cbe52-d1e4-4310-aa79-6a300f5ccb6c	2025-12-03 10:59:47.980948+00	2025-12-03 10:59:47.980948+00	2025-12-03 10:59:47.980948+00	{"eTag": "\\"c05a56183cc9bd8426ab367fb5b87bf6\\"", "size": 66638, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2025-12-03T10:59:48.000Z", "contentLength": 66638, "httpStatusCode": 200}	7b397021-fbc9-409b-8905-27e89a21780e	9f7cbe52-d1e4-4310-aa79-6a300f5ccb6c	{}	1
50f07a4d-ac9f-424e-addf-6dce4446e651	reviews	0.470327253715079.jpeg	9f7cbe52-d1e4-4310-aa79-6a300f5ccb6c	2025-12-03 11:09:43.971868+00	2025-12-03 11:09:43.971868+00	2025-12-03 11:09:43.971868+00	{"eTag": "\\"61fc63c79cf70bf43e4ff7434bc3164f\\"", "size": 52419, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2025-12-03T11:09:44.000Z", "contentLength": 52419, "httpStatusCode": 200}	5caaee18-fcbe-4b29-804c-ca87565a61ba	9f7cbe52-d1e4-4310-aa79-6a300f5ccb6c	{}	1
05434788-5755-4e93-8568-05d750ca987e	reviews	0.933976932144874.jpeg	5ca81099-f4c1-4f7d-879d-061f6c393022	2025-12-03 13:02:53.783363+00	2025-12-03 13:02:53.783363+00	2025-12-03 13:02:53.783363+00	{"eTag": "\\"a469a9159803c220e4b32e2194ea6019\\"", "size": 482365, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2025-12-03T13:02:54.000Z", "contentLength": 482365, "httpStatusCode": 200}	17d3e7f9-728a-4b43-bcdf-e3fc70bc9b97	5ca81099-f4c1-4f7d-879d-061f6c393022	{}	1
5da878f1-e077-4bee-b3e0-16a053a631f9	reviews	0.8618189257105724.png	9f7cbe52-d1e4-4310-aa79-6a300f5ccb6c	2025-12-03 13:48:17.381754+00	2025-12-03 13:48:17.381754+00	2025-12-03 13:48:17.381754+00	{"eTag": "\\"36170d8704147bc828596fd7c92c04b2\\"", "size": 27102, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2025-12-03T13:48:18.000Z", "contentLength": 27102, "httpStatusCode": 200}	7aab44f7-4800-43a6-b627-06be82a7c3d8	9f7cbe52-d1e4-4310-aa79-6a300f5ccb6c	{}	1
2900c225-7f19-4521-a8f6-d5c2e6a5307f	reviews	0.08483783065594686.png	5ca81099-f4c1-4f7d-879d-061f6c393022	2025-12-03 13:49:06.798646+00	2025-12-03 13:49:06.798646+00	2025-12-03 13:49:06.798646+00	{"eTag": "\\"3d5f06681b30f3ae360ec292fba0c70e\\"", "size": 119845, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2025-12-03T13:49:07.000Z", "contentLength": 119845, "httpStatusCode": 200}	29c3f338-7b89-4589-93a5-5c236fe9b700	5ca81099-f4c1-4f7d-879d-061f6c393022	{}	1
\.


--
-- Data for Name: prefixes; Type: TABLE DATA; Schema: storage; Owner: -
--

COPY storage.prefixes (bucket_id, name, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: s3_multipart_uploads; Type: TABLE DATA; Schema: storage; Owner: -
--

COPY storage.s3_multipart_uploads (id, in_progress_size, upload_signature, bucket_id, key, version, owner_id, created_at, user_metadata) FROM stdin;
\.


--
-- Data for Name: s3_multipart_uploads_parts; Type: TABLE DATA; Schema: storage; Owner: -
--

COPY storage.s3_multipart_uploads_parts (id, upload_id, size, part_number, bucket_id, key, etag, owner_id, version, created_at) FROM stdin;
\.


--
-- Data for Name: vector_indexes; Type: TABLE DATA; Schema: storage; Owner: -
--

COPY storage.vector_indexes (id, name, bucket_id, data_type, dimension, distance_metric, metadata_configuration, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: secrets; Type: TABLE DATA; Schema: vault; Owner: -
--

COPY vault.secrets (id, name, description, secret, key_id, nonce, created_at, updated_at) FROM stdin;
\.


--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE SET; Schema: auth; Owner: -
--

SELECT pg_catalog.setval('auth.refresh_tokens_id_seq', 449, true);


--
-- Name: booking_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.booking_seq', 71, true);


--
-- Name: subscription_id_seq; Type: SEQUENCE SET; Schema: realtime; Owner: -
--

SELECT pg_catalog.setval('realtime.subscription_id_seq', 904, true);


--
-- Name: mfa_amr_claims amr_id_pk; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_amr_claims
    ADD CONSTRAINT amr_id_pk PRIMARY KEY (id);


--
-- Name: audit_log_entries audit_log_entries_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.audit_log_entries
    ADD CONSTRAINT audit_log_entries_pkey PRIMARY KEY (id);


--
-- Name: flow_state flow_state_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.flow_state
    ADD CONSTRAINT flow_state_pkey PRIMARY KEY (id);


--
-- Name: identities identities_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.identities
    ADD CONSTRAINT identities_pkey PRIMARY KEY (id);


--
-- Name: identities identities_provider_id_provider_unique; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.identities
    ADD CONSTRAINT identities_provider_id_provider_unique UNIQUE (provider_id, provider);


--
-- Name: instances instances_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.instances
    ADD CONSTRAINT instances_pkey PRIMARY KEY (id);


--
-- Name: mfa_amr_claims mfa_amr_claims_session_id_authentication_method_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_amr_claims
    ADD CONSTRAINT mfa_amr_claims_session_id_authentication_method_pkey UNIQUE (session_id, authentication_method);


--
-- Name: mfa_challenges mfa_challenges_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_challenges
    ADD CONSTRAINT mfa_challenges_pkey PRIMARY KEY (id);


--
-- Name: mfa_factors mfa_factors_last_challenged_at_key; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_factors
    ADD CONSTRAINT mfa_factors_last_challenged_at_key UNIQUE (last_challenged_at);


--
-- Name: mfa_factors mfa_factors_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_factors
    ADD CONSTRAINT mfa_factors_pkey PRIMARY KEY (id);


--
-- Name: oauth_authorizations oauth_authorizations_authorization_code_key; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_authorizations
    ADD CONSTRAINT oauth_authorizations_authorization_code_key UNIQUE (authorization_code);


--
-- Name: oauth_authorizations oauth_authorizations_authorization_id_key; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_authorizations
    ADD CONSTRAINT oauth_authorizations_authorization_id_key UNIQUE (authorization_id);


--
-- Name: oauth_authorizations oauth_authorizations_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_authorizations
    ADD CONSTRAINT oauth_authorizations_pkey PRIMARY KEY (id);


--
-- Name: oauth_clients oauth_clients_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_clients
    ADD CONSTRAINT oauth_clients_pkey PRIMARY KEY (id);


--
-- Name: oauth_consents oauth_consents_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_consents
    ADD CONSTRAINT oauth_consents_pkey PRIMARY KEY (id);


--
-- Name: oauth_consents oauth_consents_user_client_unique; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_consents
    ADD CONSTRAINT oauth_consents_user_client_unique UNIQUE (user_id, client_id);


--
-- Name: one_time_tokens one_time_tokens_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.one_time_tokens
    ADD CONSTRAINT one_time_tokens_pkey PRIMARY KEY (id);


--
-- Name: refresh_tokens refresh_tokens_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.refresh_tokens
    ADD CONSTRAINT refresh_tokens_pkey PRIMARY KEY (id);


--
-- Name: refresh_tokens refresh_tokens_token_unique; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.refresh_tokens
    ADD CONSTRAINT refresh_tokens_token_unique UNIQUE (token);


--
-- Name: saml_providers saml_providers_entity_id_key; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.saml_providers
    ADD CONSTRAINT saml_providers_entity_id_key UNIQUE (entity_id);


--
-- Name: saml_providers saml_providers_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.saml_providers
    ADD CONSTRAINT saml_providers_pkey PRIMARY KEY (id);


--
-- Name: saml_relay_states saml_relay_states_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.saml_relay_states
    ADD CONSTRAINT saml_relay_states_pkey PRIMARY KEY (id);


--
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (id);


--
-- Name: sso_domains sso_domains_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.sso_domains
    ADD CONSTRAINT sso_domains_pkey PRIMARY KEY (id);


--
-- Name: sso_providers sso_providers_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.sso_providers
    ADD CONSTRAINT sso_providers_pkey PRIMARY KEY (id);


--
-- Name: users users_phone_key; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.users
    ADD CONSTRAINT users_phone_key UNIQUE (phone);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: booking_items booking_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.booking_items
    ADD CONSTRAINT booking_items_pkey PRIMARY KEY (id);


--
-- Name: booking_quotes booking_quotes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.booking_quotes
    ADD CONSTRAINT booking_quotes_pkey PRIMARY KEY (id);


--
-- Name: booking_status_history booking_status_history_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.booking_status_history
    ADD CONSTRAINT booking_status_history_pkey PRIMARY KEY (id);


--
-- Name: bookings bookings_booking_number_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_booking_number_key UNIQUE (booking_number);


--
-- Name: bookings bookings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_pkey PRIMARY KEY (id);


--
-- Name: cashback_transactions cashback_transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cashback_transactions
    ADD CONSTRAINT cashback_transactions_pkey PRIMARY KEY (id);


--
-- Name: chat_messages chat_messages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chat_messages
    ADD CONSTRAINT chat_messages_pkey PRIMARY KEY (id);


--
-- Name: cities cities_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cities
    ADD CONSTRAINT cities_name_key UNIQUE (name);


--
-- Name: cities cities_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cities
    ADD CONSTRAINT cities_pkey PRIMARY KEY (id);


--
-- Name: city_services city_services_city_id_service_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.city_services
    ADD CONSTRAINT city_services_city_id_service_id_key UNIQUE (city_id, service_id);


--
-- Name: city_services city_services_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.city_services
    ADD CONSTRAINT city_services_pkey PRIMARY KEY (id);


--
-- Name: discount_codes discount_codes_code_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.discount_codes
    ADD CONSTRAINT discount_codes_code_key UNIQUE (code);


--
-- Name: discount_codes discount_codes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.discount_codes
    ADD CONSTRAINT discount_codes_pkey PRIMARY KEY (id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: payments payments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_pkey PRIMARY KEY (id);


--
-- Name: payments payments_transaction_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_transaction_id_key UNIQUE (transaction_id);


--
-- Name: provider_document_change_requests provider_document_change_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.provider_document_change_requests
    ADD CONSTRAINT provider_document_change_requests_pkey PRIMARY KEY (id);


--
-- Name: provider_documents provider_documents_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.provider_documents
    ADD CONSTRAINT provider_documents_pkey PRIMARY KEY (id);


--
-- Name: provider_payment_settings provider_payment_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.provider_payment_settings
    ADD CONSTRAINT provider_payment_settings_pkey PRIMARY KEY (id);


--
-- Name: provider_payment_settings provider_payment_settings_provider_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.provider_payment_settings
    ADD CONSTRAINT provider_payment_settings_provider_id_key UNIQUE (provider_id);


--
-- Name: provider_portfolio provider_portfolio_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.provider_portfolio
    ADD CONSTRAINT provider_portfolio_pkey PRIMARY KEY (id);


--
-- Name: provider_quotes provider_quotes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.provider_quotes
    ADD CONSTRAINT provider_quotes_pkey PRIMARY KEY (id);


--
-- Name: provider_service_rates provider_service_rates_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.provider_service_rates
    ADD CONSTRAINT provider_service_rates_pkey PRIMARY KEY (id);


--
-- Name: provider_service_rates provider_service_rates_provider_id_sub_service_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.provider_service_rates
    ADD CONSTRAINT provider_service_rates_provider_id_sub_service_id_key UNIQUE (provider_id, sub_service_id);


--
-- Name: provider_services provider_services_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.provider_services
    ADD CONSTRAINT provider_services_pkey PRIMARY KEY (id);


--
-- Name: provider_staff provider_staff_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.provider_staff
    ADD CONSTRAINT provider_staff_pkey PRIMARY KEY (id);


--
-- Name: provider_staff_services provider_staff_services_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.provider_staff_services
    ADD CONSTRAINT provider_staff_services_pkey PRIMARY KEY (id);


--
-- Name: provider_staff_services provider_staff_services_staff_id_service_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.provider_staff_services
    ADD CONSTRAINT provider_staff_services_staff_id_service_id_key UNIQUE (staff_id, service_id);


--
-- Name: providers providers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.providers
    ADD CONSTRAINT providers_pkey PRIMARY KEY (id);


--
-- Name: providers providers_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.providers
    ADD CONSTRAINT providers_user_id_key UNIQUE (user_id);


--
-- Name: quote_negotiations quote_negotiations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.quote_negotiations
    ADD CONSTRAINT quote_negotiations_pkey PRIMARY KEY (id);


--
-- Name: rate_quotes rate_quotes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rate_quotes
    ADD CONSTRAINT rate_quotes_pkey PRIMARY KEY (id);


--
-- Name: ratings ratings_booking_id_rated_by_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ratings
    ADD CONSTRAINT ratings_booking_id_rated_by_key UNIQUE (booking_id, rated_by);


--
-- Name: ratings ratings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ratings
    ADD CONSTRAINT ratings_pkey PRIMARY KEY (id);


--
-- Name: referrals referrals_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.referrals
    ADD CONSTRAINT referrals_pkey PRIMARY KEY (id);


--
-- Name: referrals referrals_referred_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.referrals
    ADD CONSTRAINT referrals_referred_id_key UNIQUE (referred_id);


--
-- Name: reward_transactions reward_transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reward_transactions
    ADD CONSTRAINT reward_transactions_pkey PRIMARY KEY (id);


--
-- Name: service_categories service_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.service_categories
    ADD CONSTRAINT service_categories_pkey PRIMARY KEY (id);


--
-- Name: service_requests service_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.service_requests
    ADD CONSTRAINT service_requests_pkey PRIMARY KEY (id);


--
-- Name: service_sub_subservices service_sub_subservices_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.service_sub_subservices
    ADD CONSTRAINT service_sub_subservices_pkey PRIMARY KEY (id);


--
-- Name: service_subservices service_subservices_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.service_subservices
    ADD CONSTRAINT service_subservices_pkey PRIMARY KEY (id);


--
-- Name: services services_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.services
    ADD CONSTRAINT services_pkey PRIMARY KEY (id);


--
-- Name: subscriptions subscriptions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.subscriptions
    ADD CONSTRAINT subscriptions_pkey PRIMARY KEY (id);


--
-- Name: user_addresses user_addresses_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_addresses
    ADD CONSTRAINT user_addresses_pkey PRIMARY KEY (id);


--
-- Name: user_subscriptions user_subscriptions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_subscriptions
    ADD CONSTRAINT user_subscriptions_pkey PRIMARY KEY (id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_phone_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_phone_key UNIQUE (phone);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users users_referral_code_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_referral_code_key UNIQUE (referral_code);


--
-- Name: wallet_topups wallet_topups_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.wallet_topups
    ADD CONSTRAINT wallet_topups_pkey PRIMARY KEY (id);


--
-- Name: wallet_transactions wallet_transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.wallet_transactions
    ADD CONSTRAINT wallet_transactions_pkey PRIMARY KEY (id);


--
-- Name: wallets wallets_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.wallets
    ADD CONSTRAINT wallets_pkey PRIMARY KEY (id);


--
-- Name: wallets wallets_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.wallets
    ADD CONSTRAINT wallets_user_id_key UNIQUE (user_id);


--
-- Name: messages messages_pkey; Type: CONSTRAINT; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (id, inserted_at);


--
-- Name: messages_2025_12_01 messages_2025_12_01_pkey; Type: CONSTRAINT; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.messages_2025_12_01
    ADD CONSTRAINT messages_2025_12_01_pkey PRIMARY KEY (id, inserted_at);


--
-- Name: messages_2025_12_02 messages_2025_12_02_pkey; Type: CONSTRAINT; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.messages_2025_12_02
    ADD CONSTRAINT messages_2025_12_02_pkey PRIMARY KEY (id, inserted_at);


--
-- Name: messages_2025_12_03 messages_2025_12_03_pkey; Type: CONSTRAINT; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.messages_2025_12_03
    ADD CONSTRAINT messages_2025_12_03_pkey PRIMARY KEY (id, inserted_at);


--
-- Name: messages_2025_12_04 messages_2025_12_04_pkey; Type: CONSTRAINT; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.messages_2025_12_04
    ADD CONSTRAINT messages_2025_12_04_pkey PRIMARY KEY (id, inserted_at);


--
-- Name: messages_2025_12_05 messages_2025_12_05_pkey; Type: CONSTRAINT; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.messages_2025_12_05
    ADD CONSTRAINT messages_2025_12_05_pkey PRIMARY KEY (id, inserted_at);


--
-- Name: messages_2025_12_06 messages_2025_12_06_pkey; Type: CONSTRAINT; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.messages_2025_12_06
    ADD CONSTRAINT messages_2025_12_06_pkey PRIMARY KEY (id, inserted_at);


--
-- Name: messages_2025_12_07 messages_2025_12_07_pkey; Type: CONSTRAINT; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.messages_2025_12_07
    ADD CONSTRAINT messages_2025_12_07_pkey PRIMARY KEY (id, inserted_at);


--
-- Name: subscription pk_subscription; Type: CONSTRAINT; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.subscription
    ADD CONSTRAINT pk_subscription PRIMARY KEY (id);


--
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- Name: buckets_analytics buckets_analytics_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.buckets_analytics
    ADD CONSTRAINT buckets_analytics_pkey PRIMARY KEY (id);


--
-- Name: buckets buckets_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.buckets
    ADD CONSTRAINT buckets_pkey PRIMARY KEY (id);


--
-- Name: buckets_vectors buckets_vectors_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.buckets_vectors
    ADD CONSTRAINT buckets_vectors_pkey PRIMARY KEY (id);


--
-- Name: migrations migrations_name_key; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.migrations
    ADD CONSTRAINT migrations_name_key UNIQUE (name);


--
-- Name: migrations migrations_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.migrations
    ADD CONSTRAINT migrations_pkey PRIMARY KEY (id);


--
-- Name: objects objects_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.objects
    ADD CONSTRAINT objects_pkey PRIMARY KEY (id);


--
-- Name: prefixes prefixes_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.prefixes
    ADD CONSTRAINT prefixes_pkey PRIMARY KEY (bucket_id, level, name);


--
-- Name: s3_multipart_uploads_parts s3_multipart_uploads_parts_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.s3_multipart_uploads_parts
    ADD CONSTRAINT s3_multipart_uploads_parts_pkey PRIMARY KEY (id);


--
-- Name: s3_multipart_uploads s3_multipart_uploads_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.s3_multipart_uploads
    ADD CONSTRAINT s3_multipart_uploads_pkey PRIMARY KEY (id);


--
-- Name: vector_indexes vector_indexes_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.vector_indexes
    ADD CONSTRAINT vector_indexes_pkey PRIMARY KEY (id);


--
-- Name: audit_logs_instance_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX audit_logs_instance_id_idx ON auth.audit_log_entries USING btree (instance_id);


--
-- Name: confirmation_token_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX confirmation_token_idx ON auth.users USING btree (confirmation_token) WHERE ((confirmation_token)::text !~ '^[0-9 ]*$'::text);


--
-- Name: email_change_token_current_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX email_change_token_current_idx ON auth.users USING btree (email_change_token_current) WHERE ((email_change_token_current)::text !~ '^[0-9 ]*$'::text);


--
-- Name: email_change_token_new_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX email_change_token_new_idx ON auth.users USING btree (email_change_token_new) WHERE ((email_change_token_new)::text !~ '^[0-9 ]*$'::text);


--
-- Name: factor_id_created_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX factor_id_created_at_idx ON auth.mfa_factors USING btree (user_id, created_at);


--
-- Name: flow_state_created_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX flow_state_created_at_idx ON auth.flow_state USING btree (created_at DESC);


--
-- Name: identities_email_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX identities_email_idx ON auth.identities USING btree (email text_pattern_ops);


--
-- Name: INDEX identities_email_idx; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON INDEX auth.identities_email_idx IS 'Auth: Ensures indexed queries on the email column';


--
-- Name: identities_user_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX identities_user_id_idx ON auth.identities USING btree (user_id);


--
-- Name: idx_auth_code; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX idx_auth_code ON auth.flow_state USING btree (auth_code);


--
-- Name: idx_user_id_auth_method; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX idx_user_id_auth_method ON auth.flow_state USING btree (user_id, authentication_method);


--
-- Name: mfa_challenge_created_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX mfa_challenge_created_at_idx ON auth.mfa_challenges USING btree (created_at DESC);


--
-- Name: mfa_factors_user_friendly_name_unique; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX mfa_factors_user_friendly_name_unique ON auth.mfa_factors USING btree (friendly_name, user_id) WHERE (TRIM(BOTH FROM friendly_name) <> ''::text);


--
-- Name: mfa_factors_user_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX mfa_factors_user_id_idx ON auth.mfa_factors USING btree (user_id);


--
-- Name: oauth_auth_pending_exp_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX oauth_auth_pending_exp_idx ON auth.oauth_authorizations USING btree (expires_at) WHERE (status = 'pending'::auth.oauth_authorization_status);


--
-- Name: oauth_clients_deleted_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX oauth_clients_deleted_at_idx ON auth.oauth_clients USING btree (deleted_at);


--
-- Name: oauth_consents_active_client_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX oauth_consents_active_client_idx ON auth.oauth_consents USING btree (client_id) WHERE (revoked_at IS NULL);


--
-- Name: oauth_consents_active_user_client_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX oauth_consents_active_user_client_idx ON auth.oauth_consents USING btree (user_id, client_id) WHERE (revoked_at IS NULL);


--
-- Name: oauth_consents_user_order_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX oauth_consents_user_order_idx ON auth.oauth_consents USING btree (user_id, granted_at DESC);


--
-- Name: one_time_tokens_relates_to_hash_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX one_time_tokens_relates_to_hash_idx ON auth.one_time_tokens USING hash (relates_to);


--
-- Name: one_time_tokens_token_hash_hash_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX one_time_tokens_token_hash_hash_idx ON auth.one_time_tokens USING hash (token_hash);


--
-- Name: one_time_tokens_user_id_token_type_key; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX one_time_tokens_user_id_token_type_key ON auth.one_time_tokens USING btree (user_id, token_type);


--
-- Name: reauthentication_token_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX reauthentication_token_idx ON auth.users USING btree (reauthentication_token) WHERE ((reauthentication_token)::text !~ '^[0-9 ]*$'::text);


--
-- Name: recovery_token_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX recovery_token_idx ON auth.users USING btree (recovery_token) WHERE ((recovery_token)::text !~ '^[0-9 ]*$'::text);


--
-- Name: refresh_tokens_instance_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX refresh_tokens_instance_id_idx ON auth.refresh_tokens USING btree (instance_id);


--
-- Name: refresh_tokens_instance_id_user_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX refresh_tokens_instance_id_user_id_idx ON auth.refresh_tokens USING btree (instance_id, user_id);


--
-- Name: refresh_tokens_parent_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX refresh_tokens_parent_idx ON auth.refresh_tokens USING btree (parent);


--
-- Name: refresh_tokens_session_id_revoked_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX refresh_tokens_session_id_revoked_idx ON auth.refresh_tokens USING btree (session_id, revoked);


--
-- Name: refresh_tokens_updated_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX refresh_tokens_updated_at_idx ON auth.refresh_tokens USING btree (updated_at DESC);


--
-- Name: saml_providers_sso_provider_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX saml_providers_sso_provider_id_idx ON auth.saml_providers USING btree (sso_provider_id);


--
-- Name: saml_relay_states_created_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX saml_relay_states_created_at_idx ON auth.saml_relay_states USING btree (created_at DESC);


--
-- Name: saml_relay_states_for_email_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX saml_relay_states_for_email_idx ON auth.saml_relay_states USING btree (for_email);


--
-- Name: saml_relay_states_sso_provider_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX saml_relay_states_sso_provider_id_idx ON auth.saml_relay_states USING btree (sso_provider_id);


--
-- Name: sessions_not_after_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX sessions_not_after_idx ON auth.sessions USING btree (not_after DESC);


--
-- Name: sessions_oauth_client_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX sessions_oauth_client_id_idx ON auth.sessions USING btree (oauth_client_id);


--
-- Name: sessions_user_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX sessions_user_id_idx ON auth.sessions USING btree (user_id);


--
-- Name: sso_domains_domain_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX sso_domains_domain_idx ON auth.sso_domains USING btree (lower(domain));


--
-- Name: sso_domains_sso_provider_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX sso_domains_sso_provider_id_idx ON auth.sso_domains USING btree (sso_provider_id);


--
-- Name: sso_providers_resource_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX sso_providers_resource_id_idx ON auth.sso_providers USING btree (lower(resource_id));


--
-- Name: sso_providers_resource_id_pattern_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX sso_providers_resource_id_pattern_idx ON auth.sso_providers USING btree (resource_id text_pattern_ops);


--
-- Name: unique_phone_factor_per_user; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX unique_phone_factor_per_user ON auth.mfa_factors USING btree (user_id, phone);


--
-- Name: user_id_created_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX user_id_created_at_idx ON auth.sessions USING btree (user_id, created_at);


--
-- Name: users_email_partial_key; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX users_email_partial_key ON auth.users USING btree (email) WHERE (is_sso_user = false);


--
-- Name: INDEX users_email_partial_key; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON INDEX auth.users_email_partial_key IS 'Auth: A partial unique index that applies only when is_sso_user is false';


--
-- Name: users_instance_id_email_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX users_instance_id_email_idx ON auth.users USING btree (instance_id, lower((email)::text));


--
-- Name: users_instance_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX users_instance_id_idx ON auth.users USING btree (instance_id);


--
-- Name: users_is_anonymous_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX users_is_anonymous_idx ON auth.users USING btree (is_anonymous);


--
-- Name: admin_settings_key_global_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX admin_settings_key_global_idx ON public.admin_settings USING btree (key) WHERE (service_id IS NULL);


--
-- Name: admin_settings_key_service_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX admin_settings_key_service_idx ON public.admin_settings USING btree (key, service_id) WHERE (service_id IS NOT NULL);


--
-- Name: idx_booking_items_booking; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_booking_items_booking ON public.booking_items USING btree (booking_id);


--
-- Name: idx_booking_items_sub_subservice; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_booking_items_sub_subservice ON public.booking_items USING btree (sub_subservice_id);


--
-- Name: idx_booking_status_history_booking_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_booking_status_history_booking_id ON public.booking_status_history USING btree (booking_id);


--
-- Name: idx_bookings_cancelled_by; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_bookings_cancelled_by ON public.bookings USING btree (cancelled_by) WHERE (cancelled_by IS NOT NULL);


--
-- Name: idx_bookings_provider_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_bookings_provider_id ON public.bookings USING btree (provider_id);


--
-- Name: idx_bookings_quote_expires; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_bookings_quote_expires ON public.bookings USING btree (quote_expires_at);


--
-- Name: idx_bookings_quote_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_bookings_quote_status ON public.bookings USING btree (quote_status);


--
-- Name: idx_bookings_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_bookings_status ON public.bookings USING btree (status);


--
-- Name: idx_bookings_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_bookings_user_id ON public.bookings USING btree (user_id);


--
-- Name: idx_chat_booking; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_chat_booking ON public.chat_messages USING btree (booking_id);


--
-- Name: idx_city_services_city; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_city_services_city ON public.city_services USING btree (city_id, is_enabled);


--
-- Name: idx_doc_change_requests_old_doc; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_doc_change_requests_old_doc ON public.provider_document_change_requests USING btree (old_document_id);


--
-- Name: idx_doc_change_requests_provider; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_doc_change_requests_provider ON public.provider_document_change_requests USING btree (provider_id);


--
-- Name: idx_doc_change_requests_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_doc_change_requests_status ON public.provider_document_change_requests USING btree (status);


--
-- Name: idx_provider_documents_provider_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_provider_documents_provider_id ON public.provider_documents USING btree (provider_id);


--
-- Name: idx_provider_documents_unique_type; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX idx_provider_documents_unique_type ON public.provider_documents USING btree (provider_id, document_type) WHERE ((document_type)::text <> 'other'::text);


--
-- Name: idx_provider_payment_settings_provider_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_provider_payment_settings_provider_id ON public.provider_payment_settings USING btree (provider_id);


--
-- Name: idx_provider_quotes_rate; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_provider_quotes_rate ON public.provider_quotes USING btree (rate_quote_id);


--
-- Name: idx_provider_service_rates_provider; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_provider_service_rates_provider ON public.provider_service_rates USING btree (provider_id);


--
-- Name: idx_provider_services_sub; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_provider_services_sub ON public.provider_services USING btree (sub_service_id);


--
-- Name: idx_provider_services_sub_sub; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_provider_services_sub_sub ON public.provider_services USING btree (sub_sub_service_id);


--
-- Name: idx_provider_staff_provider; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_provider_staff_provider ON public.provider_staff USING btree (provider_id);


--
-- Name: idx_providers_category_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_providers_category_id ON public.providers USING btree (business_category_id);


--
-- Name: idx_providers_city_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_providers_city_id ON public.providers USING btree (city_id);


--
-- Name: idx_providers_location; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_providers_location ON public.providers USING btree (current_lat, current_lng);


--
-- Name: idx_providers_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_providers_user_id ON public.providers USING btree (user_id);


--
-- Name: idx_providers_verification_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_providers_verification_status ON public.providers USING btree (verification_status);


--
-- Name: idx_quote_negotiations_booking; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_quote_negotiations_booking ON public.quote_negotiations USING btree (booking_id);


--
-- Name: idx_rate_quotes_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_rate_quotes_user ON public.rate_quotes USING btree (user_id);


--
-- Name: idx_ratings_provider; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ratings_provider ON public.ratings USING btree (provider_id);


--
-- Name: idx_service_subservices_service; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_service_subservices_service ON public.service_subservices USING btree (service_id);


--
-- Name: idx_sub_subservices_sub_service; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_sub_subservices_sub_service ON public.service_sub_subservices USING btree (sub_service_id);


--
-- Name: idx_users_avatar_url; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_users_avatar_url ON public.users USING btree (avatar_url);


--
-- Name: idx_users_email; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_users_email ON public.users USING btree (email);


--
-- Name: idx_users_phone; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_users_phone ON public.users USING btree (phone);


--
-- Name: idx_users_role; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_users_role ON public.users USING btree (role);


--
-- Name: users_city_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX users_city_id_idx ON public.users USING btree (city_id);


--
-- Name: ix_realtime_subscription_entity; Type: INDEX; Schema: realtime; Owner: -
--

CREATE INDEX ix_realtime_subscription_entity ON realtime.subscription USING btree (entity);


--
-- Name: messages_inserted_at_topic_index; Type: INDEX; Schema: realtime; Owner: -
--

CREATE INDEX messages_inserted_at_topic_index ON ONLY realtime.messages USING btree (inserted_at DESC, topic) WHERE ((extension = 'broadcast'::text) AND (private IS TRUE));


--
-- Name: messages_2025_12_01_inserted_at_topic_idx; Type: INDEX; Schema: realtime; Owner: -
--

CREATE INDEX messages_2025_12_01_inserted_at_topic_idx ON realtime.messages_2025_12_01 USING btree (inserted_at DESC, topic) WHERE ((extension = 'broadcast'::text) AND (private IS TRUE));


--
-- Name: messages_2025_12_02_inserted_at_topic_idx; Type: INDEX; Schema: realtime; Owner: -
--

CREATE INDEX messages_2025_12_02_inserted_at_topic_idx ON realtime.messages_2025_12_02 USING btree (inserted_at DESC, topic) WHERE ((extension = 'broadcast'::text) AND (private IS TRUE));


--
-- Name: messages_2025_12_03_inserted_at_topic_idx; Type: INDEX; Schema: realtime; Owner: -
--

CREATE INDEX messages_2025_12_03_inserted_at_topic_idx ON realtime.messages_2025_12_03 USING btree (inserted_at DESC, topic) WHERE ((extension = 'broadcast'::text) AND (private IS TRUE));


--
-- Name: messages_2025_12_04_inserted_at_topic_idx; Type: INDEX; Schema: realtime; Owner: -
--

CREATE INDEX messages_2025_12_04_inserted_at_topic_idx ON realtime.messages_2025_12_04 USING btree (inserted_at DESC, topic) WHERE ((extension = 'broadcast'::text) AND (private IS TRUE));


--
-- Name: messages_2025_12_05_inserted_at_topic_idx; Type: INDEX; Schema: realtime; Owner: -
--

CREATE INDEX messages_2025_12_05_inserted_at_topic_idx ON realtime.messages_2025_12_05 USING btree (inserted_at DESC, topic) WHERE ((extension = 'broadcast'::text) AND (private IS TRUE));


--
-- Name: messages_2025_12_06_inserted_at_topic_idx; Type: INDEX; Schema: realtime; Owner: -
--

CREATE INDEX messages_2025_12_06_inserted_at_topic_idx ON realtime.messages_2025_12_06 USING btree (inserted_at DESC, topic) WHERE ((extension = 'broadcast'::text) AND (private IS TRUE));


--
-- Name: messages_2025_12_07_inserted_at_topic_idx; Type: INDEX; Schema: realtime; Owner: -
--

CREATE INDEX messages_2025_12_07_inserted_at_topic_idx ON realtime.messages_2025_12_07 USING btree (inserted_at DESC, topic) WHERE ((extension = 'broadcast'::text) AND (private IS TRUE));


--
-- Name: subscription_subscription_id_entity_filters_key; Type: INDEX; Schema: realtime; Owner: -
--

CREATE UNIQUE INDEX subscription_subscription_id_entity_filters_key ON realtime.subscription USING btree (subscription_id, entity, filters);


--
-- Name: bname; Type: INDEX; Schema: storage; Owner: -
--

CREATE UNIQUE INDEX bname ON storage.buckets USING btree (name);


--
-- Name: bucketid_objname; Type: INDEX; Schema: storage; Owner: -
--

CREATE UNIQUE INDEX bucketid_objname ON storage.objects USING btree (bucket_id, name);


--
-- Name: buckets_analytics_unique_name_idx; Type: INDEX; Schema: storage; Owner: -
--

CREATE UNIQUE INDEX buckets_analytics_unique_name_idx ON storage.buckets_analytics USING btree (name) WHERE (deleted_at IS NULL);


--
-- Name: idx_multipart_uploads_list; Type: INDEX; Schema: storage; Owner: -
--

CREATE INDEX idx_multipart_uploads_list ON storage.s3_multipart_uploads USING btree (bucket_id, key, created_at);


--
-- Name: idx_name_bucket_level_unique; Type: INDEX; Schema: storage; Owner: -
--

CREATE UNIQUE INDEX idx_name_bucket_level_unique ON storage.objects USING btree (name COLLATE "C", bucket_id, level);


--
-- Name: idx_objects_bucket_id_name; Type: INDEX; Schema: storage; Owner: -
--

CREATE INDEX idx_objects_bucket_id_name ON storage.objects USING btree (bucket_id, name COLLATE "C");


--
-- Name: idx_objects_lower_name; Type: INDEX; Schema: storage; Owner: -
--

CREATE INDEX idx_objects_lower_name ON storage.objects USING btree ((path_tokens[level]), lower(name) text_pattern_ops, bucket_id, level);


--
-- Name: idx_prefixes_lower_name; Type: INDEX; Schema: storage; Owner: -
--

CREATE INDEX idx_prefixes_lower_name ON storage.prefixes USING btree (bucket_id, level, ((string_to_array(name, '/'::text))[level]), lower(name) text_pattern_ops);


--
-- Name: name_prefix_search; Type: INDEX; Schema: storage; Owner: -
--

CREATE INDEX name_prefix_search ON storage.objects USING btree (name text_pattern_ops);


--
-- Name: objects_bucket_id_level_idx; Type: INDEX; Schema: storage; Owner: -
--

CREATE UNIQUE INDEX objects_bucket_id_level_idx ON storage.objects USING btree (bucket_id, level, name COLLATE "C");


--
-- Name: vector_indexes_name_bucket_id_idx; Type: INDEX; Schema: storage; Owner: -
--

CREATE UNIQUE INDEX vector_indexes_name_bucket_id_idx ON storage.vector_indexes USING btree (name, bucket_id);


--
-- Name: messages_2025_12_01_inserted_at_topic_idx; Type: INDEX ATTACH; Schema: realtime; Owner: -
--

ALTER INDEX realtime.messages_inserted_at_topic_index ATTACH PARTITION realtime.messages_2025_12_01_inserted_at_topic_idx;


--
-- Name: messages_2025_12_01_pkey; Type: INDEX ATTACH; Schema: realtime; Owner: -
--

ALTER INDEX realtime.messages_pkey ATTACH PARTITION realtime.messages_2025_12_01_pkey;


--
-- Name: messages_2025_12_02_inserted_at_topic_idx; Type: INDEX ATTACH; Schema: realtime; Owner: -
--

ALTER INDEX realtime.messages_inserted_at_topic_index ATTACH PARTITION realtime.messages_2025_12_02_inserted_at_topic_idx;


--
-- Name: messages_2025_12_02_pkey; Type: INDEX ATTACH; Schema: realtime; Owner: -
--

ALTER INDEX realtime.messages_pkey ATTACH PARTITION realtime.messages_2025_12_02_pkey;


--
-- Name: messages_2025_12_03_inserted_at_topic_idx; Type: INDEX ATTACH; Schema: realtime; Owner: -
--

ALTER INDEX realtime.messages_inserted_at_topic_index ATTACH PARTITION realtime.messages_2025_12_03_inserted_at_topic_idx;


--
-- Name: messages_2025_12_03_pkey; Type: INDEX ATTACH; Schema: realtime; Owner: -
--

ALTER INDEX realtime.messages_pkey ATTACH PARTITION realtime.messages_2025_12_03_pkey;


--
-- Name: messages_2025_12_04_inserted_at_topic_idx; Type: INDEX ATTACH; Schema: realtime; Owner: -
--

ALTER INDEX realtime.messages_inserted_at_topic_index ATTACH PARTITION realtime.messages_2025_12_04_inserted_at_topic_idx;


--
-- Name: messages_2025_12_04_pkey; Type: INDEX ATTACH; Schema: realtime; Owner: -
--

ALTER INDEX realtime.messages_pkey ATTACH PARTITION realtime.messages_2025_12_04_pkey;


--
-- Name: messages_2025_12_05_inserted_at_topic_idx; Type: INDEX ATTACH; Schema: realtime; Owner: -
--

ALTER INDEX realtime.messages_inserted_at_topic_index ATTACH PARTITION realtime.messages_2025_12_05_inserted_at_topic_idx;


--
-- Name: messages_2025_12_05_pkey; Type: INDEX ATTACH; Schema: realtime; Owner: -
--

ALTER INDEX realtime.messages_pkey ATTACH PARTITION realtime.messages_2025_12_05_pkey;


--
-- Name: messages_2025_12_06_inserted_at_topic_idx; Type: INDEX ATTACH; Schema: realtime; Owner: -
--

ALTER INDEX realtime.messages_inserted_at_topic_index ATTACH PARTITION realtime.messages_2025_12_06_inserted_at_topic_idx;


--
-- Name: messages_2025_12_06_pkey; Type: INDEX ATTACH; Schema: realtime; Owner: -
--

ALTER INDEX realtime.messages_pkey ATTACH PARTITION realtime.messages_2025_12_06_pkey;


--
-- Name: messages_2025_12_07_inserted_at_topic_idx; Type: INDEX ATTACH; Schema: realtime; Owner: -
--

ALTER INDEX realtime.messages_inserted_at_topic_index ATTACH PARTITION realtime.messages_2025_12_07_inserted_at_topic_idx;


--
-- Name: messages_2025_12_07_pkey; Type: INDEX ATTACH; Schema: realtime; Owner: -
--

ALTER INDEX realtime.messages_pkey ATTACH PARTITION realtime.messages_2025_12_07_pkey;


--
-- Name: bookings set_booking_number; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER set_booking_number BEFORE INSERT ON public.bookings FOR EACH ROW EXECUTE FUNCTION public.generate_booking_number();


--
-- Name: subscriptions trg_update_subscriptions_timestamp; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_update_subscriptions_timestamp BEFORE UPDATE ON public.subscriptions FOR EACH ROW EXECUTE FUNCTION public.update_subscriptions_timestamp();


--
-- Name: user_subscriptions trg_update_user_subscriptions_timestamp; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_update_user_subscriptions_timestamp BEFORE UPDATE ON public.user_subscriptions FOR EACH ROW EXECUTE FUNCTION public.update_user_subscriptions_timestamp();


--
-- Name: wallet_topups trg_wallet_topups_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_wallet_topups_updated_at BEFORE UPDATE ON public.wallet_topups FOR EACH ROW EXECUTE FUNCTION public.update_wallet_topup_timestamp();


--
-- Name: wallets trg_wallets_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_wallets_updated_at BEFORE UPDATE ON public.wallets FOR EACH ROW EXECUTE FUNCTION public.update_wallet_timestamp();


--
-- Name: provider_document_change_requests trigger_update_doc_change_request_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trigger_update_doc_change_request_updated_at BEFORE UPDATE ON public.provider_document_change_requests FOR EACH ROW EXECUTE FUNCTION public.update_doc_change_request_updated_at();


--
-- Name: provider_payment_settings trigger_update_provider_payment_settings_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trigger_update_provider_payment_settings_updated_at BEFORE UPDATE ON public.provider_payment_settings FOR EACH ROW EXECUTE FUNCTION public.update_provider_payment_settings_updated_at();


--
-- Name: provider_service_rates trigger_update_provider_service_rates_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trigger_update_provider_service_rates_updated_at BEFORE UPDATE ON public.provider_service_rates FOR EACH ROW EXECUTE FUNCTION public.update_provider_service_rates_updated_at();


--
-- Name: service_sub_subservices trigger_update_sub_subservices_timestamp; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trigger_update_sub_subservices_timestamp BEFORE UPDATE ON public.service_sub_subservices FOR EACH ROW EXECUTE FUNCTION public.update_sub_subservices_updated_at();


--
-- Name: bookings update_bookings_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON public.bookings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: provider_staff update_provider_staff_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_provider_staff_updated_at BEFORE UPDATE ON public.provider_staff FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: providers update_providers_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_providers_updated_at BEFORE UPDATE ON public.providers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: ratings update_rating_after_insert; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_rating_after_insert AFTER INSERT ON public.ratings FOR EACH ROW EXECUTE FUNCTION public.update_provider_rating();


--
-- Name: users update_users_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: subscription tr_check_filters; Type: TRIGGER; Schema: realtime; Owner: -
--

CREATE TRIGGER tr_check_filters BEFORE INSERT OR UPDATE ON realtime.subscription FOR EACH ROW EXECUTE FUNCTION realtime.subscription_check_filters();


--
-- Name: buckets enforce_bucket_name_length_trigger; Type: TRIGGER; Schema: storage; Owner: -
--

CREATE TRIGGER enforce_bucket_name_length_trigger BEFORE INSERT OR UPDATE OF name ON storage.buckets FOR EACH ROW EXECUTE FUNCTION storage.enforce_bucket_name_length();


--
-- Name: objects objects_delete_delete_prefix; Type: TRIGGER; Schema: storage; Owner: -
--

CREATE TRIGGER objects_delete_delete_prefix AFTER DELETE ON storage.objects FOR EACH ROW EXECUTE FUNCTION storage.delete_prefix_hierarchy_trigger();


--
-- Name: objects objects_insert_create_prefix; Type: TRIGGER; Schema: storage; Owner: -
--

CREATE TRIGGER objects_insert_create_prefix BEFORE INSERT ON storage.objects FOR EACH ROW EXECUTE FUNCTION storage.objects_insert_prefix_trigger();


--
-- Name: objects objects_update_create_prefix; Type: TRIGGER; Schema: storage; Owner: -
--

CREATE TRIGGER objects_update_create_prefix BEFORE UPDATE ON storage.objects FOR EACH ROW WHEN (((new.name <> old.name) OR (new.bucket_id <> old.bucket_id))) EXECUTE FUNCTION storage.objects_update_prefix_trigger();


--
-- Name: prefixes prefixes_create_hierarchy; Type: TRIGGER; Schema: storage; Owner: -
--

CREATE TRIGGER prefixes_create_hierarchy BEFORE INSERT ON storage.prefixes FOR EACH ROW WHEN ((pg_trigger_depth() < 1)) EXECUTE FUNCTION storage.prefixes_insert_trigger();


--
-- Name: prefixes prefixes_delete_hierarchy; Type: TRIGGER; Schema: storage; Owner: -
--

CREATE TRIGGER prefixes_delete_hierarchy AFTER DELETE ON storage.prefixes FOR EACH ROW EXECUTE FUNCTION storage.delete_prefix_hierarchy_trigger();


--
-- Name: objects update_objects_updated_at; Type: TRIGGER; Schema: storage; Owner: -
--

CREATE TRIGGER update_objects_updated_at BEFORE UPDATE ON storage.objects FOR EACH ROW EXECUTE FUNCTION storage.update_updated_at_column();


--
-- Name: identities identities_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.identities
    ADD CONSTRAINT identities_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: mfa_amr_claims mfa_amr_claims_session_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_amr_claims
    ADD CONSTRAINT mfa_amr_claims_session_id_fkey FOREIGN KEY (session_id) REFERENCES auth.sessions(id) ON DELETE CASCADE;


--
-- Name: mfa_challenges mfa_challenges_auth_factor_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_challenges
    ADD CONSTRAINT mfa_challenges_auth_factor_id_fkey FOREIGN KEY (factor_id) REFERENCES auth.mfa_factors(id) ON DELETE CASCADE;


--
-- Name: mfa_factors mfa_factors_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_factors
    ADD CONSTRAINT mfa_factors_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: oauth_authorizations oauth_authorizations_client_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_authorizations
    ADD CONSTRAINT oauth_authorizations_client_id_fkey FOREIGN KEY (client_id) REFERENCES auth.oauth_clients(id) ON DELETE CASCADE;


--
-- Name: oauth_authorizations oauth_authorizations_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_authorizations
    ADD CONSTRAINT oauth_authorizations_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: oauth_consents oauth_consents_client_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_consents
    ADD CONSTRAINT oauth_consents_client_id_fkey FOREIGN KEY (client_id) REFERENCES auth.oauth_clients(id) ON DELETE CASCADE;


--
-- Name: oauth_consents oauth_consents_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_consents
    ADD CONSTRAINT oauth_consents_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: one_time_tokens one_time_tokens_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.one_time_tokens
    ADD CONSTRAINT one_time_tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: refresh_tokens refresh_tokens_session_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.refresh_tokens
    ADD CONSTRAINT refresh_tokens_session_id_fkey FOREIGN KEY (session_id) REFERENCES auth.sessions(id) ON DELETE CASCADE;


--
-- Name: saml_providers saml_providers_sso_provider_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.saml_providers
    ADD CONSTRAINT saml_providers_sso_provider_id_fkey FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id) ON DELETE CASCADE;


--
-- Name: saml_relay_states saml_relay_states_flow_state_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.saml_relay_states
    ADD CONSTRAINT saml_relay_states_flow_state_id_fkey FOREIGN KEY (flow_state_id) REFERENCES auth.flow_state(id) ON DELETE CASCADE;


--
-- Name: saml_relay_states saml_relay_states_sso_provider_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.saml_relay_states
    ADD CONSTRAINT saml_relay_states_sso_provider_id_fkey FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id) ON DELETE CASCADE;


--
-- Name: sessions sessions_oauth_client_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.sessions
    ADD CONSTRAINT sessions_oauth_client_id_fkey FOREIGN KEY (oauth_client_id) REFERENCES auth.oauth_clients(id) ON DELETE CASCADE;


--
-- Name: sessions sessions_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.sessions
    ADD CONSTRAINT sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: sso_domains sso_domains_sso_provider_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.sso_domains
    ADD CONSTRAINT sso_domains_sso_provider_id_fkey FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id) ON DELETE CASCADE;


--
-- Name: admin_settings admin_settings_service_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admin_settings
    ADD CONSTRAINT admin_settings_service_id_fkey FOREIGN KEY (service_id) REFERENCES public.services(id) ON DELETE CASCADE;


--
-- Name: admin_settings admin_settings_updated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admin_settings
    ADD CONSTRAINT admin_settings_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.users(id);


--
-- Name: booking_items booking_items_booking_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.booking_items
    ADD CONSTRAINT booking_items_booking_id_fkey FOREIGN KEY (booking_id) REFERENCES public.bookings(id) ON DELETE CASCADE;


--
-- Name: booking_items booking_items_sub_subservice_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.booking_items
    ADD CONSTRAINT booking_items_sub_subservice_id_fkey FOREIGN KEY (sub_subservice_id) REFERENCES public.service_sub_subservices(id);


--
-- Name: booking_quotes booking_quotes_booking_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.booking_quotes
    ADD CONSTRAINT booking_quotes_booking_id_fkey FOREIGN KEY (booking_id) REFERENCES public.bookings(id) ON DELETE CASCADE;


--
-- Name: booking_status_history booking_status_history_booking_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.booking_status_history
    ADD CONSTRAINT booking_status_history_booking_id_fkey FOREIGN KEY (booking_id) REFERENCES public.bookings(id) ON DELETE CASCADE;


--
-- Name: booking_status_history booking_status_history_changed_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.booking_status_history
    ADD CONSTRAINT booking_status_history_changed_by_fkey FOREIGN KEY (changed_by) REFERENCES auth.users(id);


--
-- Name: bookings bookings_address_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_address_id_fkey FOREIGN KEY (address_id) REFERENCES public.user_addresses(id);


--
-- Name: bookings bookings_cancelled_by_provider_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_cancelled_by_provider_id_fkey FOREIGN KEY (cancelled_by_provider_id) REFERENCES public.providers(id);


--
-- Name: bookings bookings_city_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_city_id_fkey FOREIGN KEY (city_id) REFERENCES public.cities(id);


--
-- Name: bookings bookings_provider_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_provider_id_fkey FOREIGN KEY (provider_id) REFERENCES public.providers(id);


--
-- Name: bookings bookings_rate_quote_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_rate_quote_id_fkey FOREIGN KEY (rate_quote_id) REFERENCES public.rate_quotes(id);


--
-- Name: bookings bookings_service_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_service_id_fkey FOREIGN KEY (service_id) REFERENCES public.services(id) ON DELETE CASCADE;


--
-- Name: bookings bookings_sub_service_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_sub_service_id_fkey FOREIGN KEY (sub_service_id) REFERENCES public.service_subservices(id);


--
-- Name: bookings bookings_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: cashback_transactions cashback_transactions_booking_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cashback_transactions
    ADD CONSTRAINT cashback_transactions_booking_id_fkey FOREIGN KEY (booking_id) REFERENCES public.bookings(id);


--
-- Name: cashback_transactions cashback_transactions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cashback_transactions
    ADD CONSTRAINT cashback_transactions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: chat_messages chat_messages_booking_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chat_messages
    ADD CONSTRAINT chat_messages_booking_id_fkey FOREIGN KEY (booking_id) REFERENCES public.bookings(id) ON DELETE CASCADE;


--
-- Name: chat_messages chat_messages_receiver_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chat_messages
    ADD CONSTRAINT chat_messages_receiver_id_fkey FOREIGN KEY (receiver_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: chat_messages chat_messages_sender_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chat_messages
    ADD CONSTRAINT chat_messages_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: city_services city_services_city_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.city_services
    ADD CONSTRAINT city_services_city_id_fkey FOREIGN KEY (city_id) REFERENCES public.cities(id) ON DELETE CASCADE;


--
-- Name: city_services city_services_service_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.city_services
    ADD CONSTRAINT city_services_service_id_fkey FOREIGN KEY (service_id) REFERENCES public.services(id) ON DELETE CASCADE;


--
-- Name: notifications notifications_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: payments payments_booking_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_booking_id_fkey FOREIGN KEY (booking_id) REFERENCES public.bookings(id) ON DELETE CASCADE;


--
-- Name: payments payments_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: provider_document_change_requests provider_document_change_requests_old_document_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.provider_document_change_requests
    ADD CONSTRAINT provider_document_change_requests_old_document_id_fkey FOREIGN KEY (old_document_id) REFERENCES public.provider_documents(id);


--
-- Name: provider_document_change_requests provider_document_change_requests_provider_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.provider_document_change_requests
    ADD CONSTRAINT provider_document_change_requests_provider_id_fkey FOREIGN KEY (provider_id) REFERENCES public.providers(id) ON DELETE CASCADE;


--
-- Name: provider_document_change_requests provider_document_change_requests_reviewed_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.provider_document_change_requests
    ADD CONSTRAINT provider_document_change_requests_reviewed_by_fkey FOREIGN KEY (reviewed_by) REFERENCES public.users(id);


--
-- Name: provider_documents provider_documents_provider_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.provider_documents
    ADD CONSTRAINT provider_documents_provider_id_fkey FOREIGN KEY (provider_id) REFERENCES public.providers(id) ON DELETE CASCADE;


--
-- Name: provider_payment_settings provider_payment_settings_provider_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.provider_payment_settings
    ADD CONSTRAINT provider_payment_settings_provider_id_fkey FOREIGN KEY (provider_id) REFERENCES public.providers(id) ON DELETE CASCADE;


--
-- Name: provider_portfolio provider_portfolio_provider_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.provider_portfolio
    ADD CONSTRAINT provider_portfolio_provider_id_fkey FOREIGN KEY (provider_id) REFERENCES public.providers(id) ON DELETE CASCADE;


--
-- Name: provider_quotes provider_quotes_provider_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.provider_quotes
    ADD CONSTRAINT provider_quotes_provider_id_fkey FOREIGN KEY (provider_id) REFERENCES public.providers(id) ON DELETE CASCADE;


--
-- Name: provider_quotes provider_quotes_rate_quote_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.provider_quotes
    ADD CONSTRAINT provider_quotes_rate_quote_id_fkey FOREIGN KEY (rate_quote_id) REFERENCES public.rate_quotes(id) ON DELETE CASCADE;


--
-- Name: provider_service_rates provider_service_rates_provider_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.provider_service_rates
    ADD CONSTRAINT provider_service_rates_provider_id_fkey FOREIGN KEY (provider_id) REFERENCES public.providers(id) ON DELETE CASCADE;


--
-- Name: provider_service_rates provider_service_rates_sub_service_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.provider_service_rates
    ADD CONSTRAINT provider_service_rates_sub_service_id_fkey FOREIGN KEY (sub_service_id) REFERENCES public.service_subservices(id) ON DELETE CASCADE;


--
-- Name: provider_services provider_services_provider_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.provider_services
    ADD CONSTRAINT provider_services_provider_id_fkey FOREIGN KEY (provider_id) REFERENCES public.providers(id) ON DELETE CASCADE;


--
-- Name: provider_services provider_services_service_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.provider_services
    ADD CONSTRAINT provider_services_service_id_fkey FOREIGN KEY (service_id) REFERENCES public.services(id) ON DELETE CASCADE;


--
-- Name: provider_services provider_services_sub_service_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.provider_services
    ADD CONSTRAINT provider_services_sub_service_id_fkey FOREIGN KEY (sub_service_id) REFERENCES public.service_subservices(id) ON DELETE CASCADE;


--
-- Name: provider_services provider_services_sub_sub_service_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.provider_services
    ADD CONSTRAINT provider_services_sub_sub_service_id_fkey FOREIGN KEY (sub_sub_service_id) REFERENCES public.service_sub_subservices(id) ON DELETE CASCADE;


--
-- Name: provider_staff provider_staff_provider_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.provider_staff
    ADD CONSTRAINT provider_staff_provider_id_fkey FOREIGN KEY (provider_id) REFERENCES public.providers(id) ON DELETE CASCADE;


--
-- Name: provider_staff_services provider_staff_services_service_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.provider_staff_services
    ADD CONSTRAINT provider_staff_services_service_id_fkey FOREIGN KEY (service_id) REFERENCES public.services(id) ON DELETE CASCADE;


--
-- Name: provider_staff_services provider_staff_services_staff_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.provider_staff_services
    ADD CONSTRAINT provider_staff_services_staff_id_fkey FOREIGN KEY (staff_id) REFERENCES public.provider_staff(id) ON DELETE CASCADE;


--
-- Name: providers providers_business_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.providers
    ADD CONSTRAINT providers_business_category_id_fkey FOREIGN KEY (business_category_id) REFERENCES public.service_categories(id);


--
-- Name: providers providers_business_subcategory_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.providers
    ADD CONSTRAINT providers_business_subcategory_id_fkey FOREIGN KEY (business_subcategory_id) REFERENCES public.services(id);


--
-- Name: providers providers_city_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.providers
    ADD CONSTRAINT providers_city_id_fkey FOREIGN KEY (city_id) REFERENCES public.cities(id);


--
-- Name: providers providers_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.providers
    ADD CONSTRAINT providers_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: quote_negotiations quote_negotiations_booking_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.quote_negotiations
    ADD CONSTRAINT quote_negotiations_booking_id_fkey FOREIGN KEY (booking_id) REFERENCES public.bookings(id) ON DELETE CASCADE;


--
-- Name: rate_quotes rate_quotes_address_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rate_quotes
    ADD CONSTRAINT rate_quotes_address_id_fkey FOREIGN KEY (address_id) REFERENCES public.user_addresses(id);


--
-- Name: rate_quotes rate_quotes_city_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rate_quotes
    ADD CONSTRAINT rate_quotes_city_id_fkey FOREIGN KEY (city_id) REFERENCES public.cities(id);


--
-- Name: rate_quotes rate_quotes_service_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rate_quotes
    ADD CONSTRAINT rate_quotes_service_id_fkey FOREIGN KEY (service_id) REFERENCES public.services(id) ON DELETE CASCADE;


--
-- Name: rate_quotes rate_quotes_sub_service_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rate_quotes
    ADD CONSTRAINT rate_quotes_sub_service_id_fkey FOREIGN KEY (sub_service_id) REFERENCES public.service_subservices(id);


--
-- Name: rate_quotes rate_quotes_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rate_quotes
    ADD CONSTRAINT rate_quotes_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: ratings ratings_booking_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ratings
    ADD CONSTRAINT ratings_booking_id_fkey FOREIGN KEY (booking_id) REFERENCES public.bookings(id) ON DELETE CASCADE;


--
-- Name: ratings ratings_provider_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ratings
    ADD CONSTRAINT ratings_provider_id_fkey FOREIGN KEY (provider_id) REFERENCES public.providers(id) ON DELETE CASCADE;


--
-- Name: ratings ratings_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ratings
    ADD CONSTRAINT ratings_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: referrals referrals_referred_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.referrals
    ADD CONSTRAINT referrals_referred_id_fkey FOREIGN KEY (referred_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: referrals referrals_referrer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.referrals
    ADD CONSTRAINT referrals_referrer_id_fkey FOREIGN KEY (referrer_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: reward_transactions reward_transactions_booking_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reward_transactions
    ADD CONSTRAINT reward_transactions_booking_id_fkey FOREIGN KEY (booking_id) REFERENCES public.bookings(id);


--
-- Name: reward_transactions reward_transactions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reward_transactions
    ADD CONSTRAINT reward_transactions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: service_requests service_requests_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.service_requests
    ADD CONSTRAINT service_requests_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.service_categories(id);


--
-- Name: service_requests service_requests_provider_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.service_requests
    ADD CONSTRAINT service_requests_provider_id_fkey FOREIGN KEY (provider_id) REFERENCES public.providers(id) ON DELETE CASCADE;


--
-- Name: service_sub_subservices service_sub_subservices_sub_service_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.service_sub_subservices
    ADD CONSTRAINT service_sub_subservices_sub_service_id_fkey FOREIGN KEY (sub_service_id) REFERENCES public.service_subservices(id) ON DELETE CASCADE;


--
-- Name: service_subservices service_subservices_created_by_provider_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.service_subservices
    ADD CONSTRAINT service_subservices_created_by_provider_id_fkey FOREIGN KEY (created_by_provider_id) REFERENCES public.providers(id);


--
-- Name: service_subservices service_subservices_created_by_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.service_subservices
    ADD CONSTRAINT service_subservices_created_by_user_id_fkey FOREIGN KEY (created_by_user_id) REFERENCES public.users(id);


--
-- Name: service_subservices service_subservices_service_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.service_subservices
    ADD CONSTRAINT service_subservices_service_id_fkey FOREIGN KEY (service_id) REFERENCES public.services(id) ON DELETE CASCADE;


--
-- Name: services services_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.services
    ADD CONSTRAINT services_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.service_categories(id) ON DELETE CASCADE;


--
-- Name: subscriptions subscriptions_provider_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.subscriptions
    ADD CONSTRAINT subscriptions_provider_id_fkey FOREIGN KEY (provider_id) REFERENCES public.providers(id) ON DELETE CASCADE;


--
-- Name: subscriptions subscriptions_service_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.subscriptions
    ADD CONSTRAINT subscriptions_service_id_fkey FOREIGN KEY (service_id) REFERENCES public.services(id) ON DELETE CASCADE;


--
-- Name: user_addresses user_addresses_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_addresses
    ADD CONSTRAINT user_addresses_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: user_subscriptions user_subscriptions_subscription_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_subscriptions
    ADD CONSTRAINT user_subscriptions_subscription_id_fkey FOREIGN KEY (subscription_id) REFERENCES public.subscriptions(id) ON DELETE CASCADE;


--
-- Name: user_subscriptions user_subscriptions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_subscriptions
    ADD CONSTRAINT user_subscriptions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: users users_city_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_city_id_fkey FOREIGN KEY (city_id) REFERENCES public.cities(id) ON DELETE SET NULL;


--
-- Name: users users_current_city_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_current_city_id_fkey FOREIGN KEY (current_city_id) REFERENCES public.cities(id);


--
-- Name: users users_default_city_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_default_city_id_fkey FOREIGN KEY (default_city_id) REFERENCES public.cities(id);


--
-- Name: users users_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: users users_referred_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_referred_by_fkey FOREIGN KEY (referred_by) REFERENCES public.users(id);


--
-- Name: wallet_topups wallet_topups_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.wallet_topups
    ADD CONSTRAINT wallet_topups_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: wallet_transactions wallet_transactions_booking_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.wallet_transactions
    ADD CONSTRAINT wallet_transactions_booking_id_fkey FOREIGN KEY (booking_id) REFERENCES public.bookings(id);


--
-- Name: wallet_transactions wallet_transactions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.wallet_transactions
    ADD CONSTRAINT wallet_transactions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: wallet_transactions wallet_transactions_wallet_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.wallet_transactions
    ADD CONSTRAINT wallet_transactions_wallet_id_fkey FOREIGN KEY (wallet_id) REFERENCES public.wallets(id);


--
-- Name: wallets wallets_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.wallets
    ADD CONSTRAINT wallets_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: objects objects_bucketId_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.objects
    ADD CONSTRAINT "objects_bucketId_fkey" FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);


--
-- Name: prefixes prefixes_bucketId_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.prefixes
    ADD CONSTRAINT "prefixes_bucketId_fkey" FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);


--
-- Name: s3_multipart_uploads s3_multipart_uploads_bucket_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.s3_multipart_uploads
    ADD CONSTRAINT s3_multipart_uploads_bucket_id_fkey FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);


--
-- Name: s3_multipart_uploads_parts s3_multipart_uploads_parts_bucket_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.s3_multipart_uploads_parts
    ADD CONSTRAINT s3_multipart_uploads_parts_bucket_id_fkey FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);


--
-- Name: s3_multipart_uploads_parts s3_multipart_uploads_parts_upload_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.s3_multipart_uploads_parts
    ADD CONSTRAINT s3_multipart_uploads_parts_upload_id_fkey FOREIGN KEY (upload_id) REFERENCES storage.s3_multipart_uploads(id) ON DELETE CASCADE;


--
-- Name: vector_indexes vector_indexes_bucket_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.vector_indexes
    ADD CONSTRAINT vector_indexes_bucket_id_fkey FOREIGN KEY (bucket_id) REFERENCES storage.buckets_vectors(id);


--
-- Name: audit_log_entries; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.audit_log_entries ENABLE ROW LEVEL SECURITY;

--
-- Name: flow_state; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.flow_state ENABLE ROW LEVEL SECURITY;

--
-- Name: identities; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.identities ENABLE ROW LEVEL SECURITY;

--
-- Name: instances; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.instances ENABLE ROW LEVEL SECURITY;

--
-- Name: mfa_amr_claims; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.mfa_amr_claims ENABLE ROW LEVEL SECURITY;

--
-- Name: mfa_challenges; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.mfa_challenges ENABLE ROW LEVEL SECURITY;

--
-- Name: mfa_factors; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.mfa_factors ENABLE ROW LEVEL SECURITY;

--
-- Name: one_time_tokens; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.one_time_tokens ENABLE ROW LEVEL SECURITY;

--
-- Name: refresh_tokens; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.refresh_tokens ENABLE ROW LEVEL SECURITY;

--
-- Name: saml_providers; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.saml_providers ENABLE ROW LEVEL SECURITY;

--
-- Name: saml_relay_states; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.saml_relay_states ENABLE ROW LEVEL SECURITY;

--
-- Name: schema_migrations; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.schema_migrations ENABLE ROW LEVEL SECURITY;

--
-- Name: sessions; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.sessions ENABLE ROW LEVEL SECURITY;

--
-- Name: sso_domains; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.sso_domains ENABLE ROW LEVEL SECURITY;

--
-- Name: sso_providers; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.sso_providers ENABLE ROW LEVEL SECURITY;

--
-- Name: users; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

--
-- Name: service_subservices Active sub-services are public; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Active sub-services are public" ON public.service_subservices FOR SELECT USING ((is_active = true));


--
-- Name: service_sub_subservices Active sub-sub-services are viewable by everyone; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Active sub-sub-services are viewable by everyone" ON public.service_sub_subservices FOR SELECT USING ((is_active = true));


--
-- Name: admin_settings Admin users can insert settings; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admin users can insert settings" ON public.admin_settings FOR INSERT WITH CHECK ((auth.uid() IN ( SELECT users.id
   FROM public.users
  WHERE (users.role = ANY (ARRAY['admin'::public.user_role, 'superadmin'::public.user_role])))));


--
-- Name: admin_settings Admin users can update settings; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admin users can update settings" ON public.admin_settings FOR UPDATE USING ((auth.uid() IN ( SELECT users.id
   FROM public.users
  WHERE (users.role = ANY (ARRAY['admin'::public.user_role, 'superadmin'::public.user_role]))))) WITH CHECK ((auth.uid() IN ( SELECT users.id
   FROM public.users
  WHERE (users.role = ANY (ARRAY['admin'::public.user_role, 'superadmin'::public.user_role])))));


--
-- Name: admin_settings Admin users can view settings; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admin users can view settings" ON public.admin_settings FOR SELECT USING ((auth.uid() IN ( SELECT users.id
   FROM public.users
  WHERE (users.role = ANY (ARRAY['admin'::public.user_role, 'superadmin'::public.user_role])))));


--
-- Name: bookings Admins can do everything on bookings; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can do everything on bookings" ON public.bookings USING (public.is_admin());


--
-- Name: booking_status_history Admins can view all history; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view all history" ON public.booking_status_history FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.users
  WHERE ((users.id = auth.uid()) AND (users.role = 'admin'::public.user_role)))));


--
-- Name: users Admins update all profiles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins update all profiles" ON public.users FOR UPDATE USING (public.is_admin());


--
-- Name: users Admins view all profiles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins view all profiles" ON public.users FOR SELECT USING (public.is_admin());


--
-- Name: service_categories Categories are viewable by everyone; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Categories are viewable by everyone" ON public.service_categories FOR SELECT USING (true);


--
-- Name: chat_messages Chat participants can view messages; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Chat participants can view messages" ON public.chat_messages FOR SELECT USING (((sender_id = auth.uid()) OR (receiver_id = auth.uid())));


--
-- Name: cities Cities are viewable by everyone; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Cities are viewable by everyone" ON public.cities FOR SELECT USING ((is_active = true));


--
-- Name: service_categories Only admins can manage categories; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Only admins can manage categories" ON public.service_categories USING ((EXISTS ( SELECT 1
   FROM public.users
  WHERE ((users.id = auth.uid()) AND ((users.role = 'admin'::public.user_role) OR (users.role = 'superadmin'::public.user_role))))));


--
-- Name: cities Only admins can manage cities; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Only admins can manage cities" ON public.cities USING (false);


--
-- Name: admin_settings Only admins can manage settings; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Only admins can manage settings" ON public.admin_settings USING (false);


--
-- Name: service_sub_subservices Only admins can manage sub-sub-services; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Only admins can manage sub-sub-services" ON public.service_sub_subservices USING ((EXISTS ( SELECT 1
   FROM public.users
  WHERE ((users.id = auth.uid()) AND ((users.role = 'admin'::public.user_role) OR (users.role = 'superadmin'::public.user_role))))));


--
-- Name: service_subservices Only admins manage sub-services; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Only admins manage sub-services" ON public.service_subservices USING (false);


--
-- Name: service_requests Providers can create requests; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Providers can create requests" ON public.service_requests FOR INSERT WITH CHECK ((auth.uid() IN ( SELECT providers.user_id
   FROM public.providers
  WHERE (providers.id = service_requests.provider_id))));


--
-- Name: provider_services Providers can delete own services; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Providers can delete own services" ON public.provider_services FOR DELETE USING ((provider_id IN ( SELECT providers.id
   FROM public.providers
  WHERE (providers.user_id = auth.uid()))));


--
-- Name: provider_services Providers can insert own services; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Providers can insert own services" ON public.provider_services FOR INSERT WITH CHECK ((provider_id IN ( SELECT providers.id
   FROM public.providers
  WHERE (providers.user_id = auth.uid()))));


--
-- Name: provider_service_rates Providers can insert their own rates; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Providers can insert their own rates" ON public.provider_service_rates FOR INSERT WITH CHECK ((auth.uid() IN ( SELECT providers.user_id
   FROM public.providers
  WHERE (providers.id = provider_service_rates.provider_id))));


--
-- Name: bookings Providers can update assigned bookings; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Providers can update assigned bookings" ON public.bookings FOR UPDATE USING ((provider_id IN ( SELECT providers.id
   FROM public.providers
  WHERE (providers.user_id = auth.uid()))));


--
-- Name: provider_services Providers can update own services; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Providers can update own services" ON public.provider_services FOR UPDATE USING ((provider_id IN ( SELECT providers.id
   FROM public.providers
  WHERE (providers.user_id = auth.uid()))));


--
-- Name: provider_service_rates Providers can update their own rates; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Providers can update their own rates" ON public.provider_service_rates FOR UPDATE USING ((auth.uid() IN ( SELECT providers.user_id
   FROM public.providers
  WHERE (providers.id = provider_service_rates.provider_id))));


--
-- Name: bookings Providers can view assigned bookings; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Providers can view assigned bookings" ON public.bookings FOR SELECT USING ((provider_id IN ( SELECT providers.id
   FROM public.providers
  WHERE (providers.user_id = auth.uid()))));


--
-- Name: booking_status_history Providers can view history of their assigned bookings; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Providers can view history of their assigned bookings" ON public.booking_status_history FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.bookings
  WHERE ((bookings.id = booking_status_history.booking_id) AND (bookings.provider_id IN ( SELECT providers.id
           FROM public.providers
          WHERE (providers.user_id = auth.uid())))))));


--
-- Name: provider_services Providers can view own services; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Providers can view own services" ON public.provider_services FOR SELECT USING ((provider_id IN ( SELECT providers.id
   FROM public.providers
  WHERE (providers.user_id = auth.uid()))));


--
-- Name: provider_service_rates Providers can view their own rates; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Providers can view their own rates" ON public.provider_service_rates FOR SELECT USING ((auth.uid() IN ( SELECT providers.user_id
   FROM public.providers
  WHERE (providers.id = provider_service_rates.provider_id))));


--
-- Name: service_requests Providers can view their own requests; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Providers can view their own requests" ON public.service_requests FOR SELECT USING ((auth.uid() IN ( SELECT providers.user_id
   FROM public.providers
  WHERE (providers.id = service_requests.provider_id))));


--
-- Name: provider_quotes Providers submit quotes; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Providers submit quotes" ON public.provider_quotes FOR INSERT WITH CHECK ((provider_id IN ( SELECT providers.id
   FROM public.providers
  WHERE (providers.user_id = auth.uid()))));


--
-- Name: providers Providers update own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Providers update own profile" ON public.providers FOR UPDATE USING ((user_id = auth.uid()));


--
-- Name: booking_status_history Providers view assigned booking history; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Providers view assigned booking history" ON public.booking_status_history FOR SELECT USING ((booking_id IN ( SELECT bookings.id
   FROM public.bookings
  WHERE (bookings.provider_id IN ( SELECT providers.id
           FROM public.providers
          WHERE (providers.user_id = auth.uid()))))));


--
-- Name: booking_items Providers view assigned booking items; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Providers view assigned booking items" ON public.booking_items FOR SELECT USING ((booking_id IN ( SELECT bookings.id
   FROM public.bookings
  WHERE (bookings.provider_id IN ( SELECT providers.id
           FROM public.providers
          WHERE (providers.user_id = auth.uid()))))));


--
-- Name: booking_quotes Providers view own quotes; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Providers view own quotes" ON public.booking_quotes FOR SELECT USING ((booking_id IN ( SELECT bookings.id
   FROM public.bookings
  WHERE (bookings.provider_id IN ( SELECT providers.id
           FROM public.providers
          WHERE (providers.user_id = auth.uid()))))));


--
-- Name: provider_quotes Providers view their quotes; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Providers view their quotes" ON public.provider_quotes FOR SELECT USING ((provider_id IN ( SELECT providers.id
   FROM public.providers
  WHERE (providers.user_id = auth.uid()))));


--
-- Name: provider_services Public can view active provider services; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Public can view active provider services" ON public.provider_services FOR SELECT USING ((is_active = true));


--
-- Name: providers Public can view available providers; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Public can view available providers" ON public.providers FOR SELECT USING (true);


--
-- Name: providers Public view providers; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Public view providers" ON public.providers FOR SELECT USING (true);


--
-- Name: services Public view services; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Public view services" ON public.services FOR SELECT USING (true);


--
-- Name: ratings Ratings are viewable by everyone; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Ratings are viewable by everyone" ON public.ratings FOR SELECT USING (true);


--
-- Name: booking_status_history Service role can insert history; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Service role can insert history" ON public.booking_status_history FOR INSERT WITH CHECK (true);


--
-- Name: bookings Users can create own bookings; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create own bookings" ON public.bookings FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: ratings Users can create ratings for own bookings; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create ratings for own bookings" ON public.ratings FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM public.bookings
  WHERE ((bookings.id = ratings.booking_id) AND (bookings.user_id = auth.uid())))));


--
-- Name: providers Users can create their own provider profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create their own provider profile" ON public.providers FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: user_addresses Users can manage own addresses; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can manage own addresses" ON public.user_addresses USING ((user_id = auth.uid()));


--
-- Name: chat_messages Users can send chat messages; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can send chat messages" ON public.chat_messages FOR INSERT WITH CHECK ((sender_id = auth.uid()));


--
-- Name: bookings Users can update own bookings; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update own bookings" ON public.bookings FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: notifications Users can update own notifications; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE USING ((user_id = auth.uid()));


--
-- Name: users Users can update own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING ((auth.uid() = id));


--
-- Name: providers Users can update their own provider profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own provider profile" ON public.providers FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: booking_status_history Users can view history of their bookings; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view history of their bookings" ON public.booking_status_history FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.bookings
  WHERE ((bookings.id = booking_status_history.booking_id) AND (bookings.user_id = auth.uid())))));


--
-- Name: booking_quotes Users can view own booking quotes; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own booking quotes" ON public.booking_quotes FOR SELECT USING ((booking_id IN ( SELECT bookings.id
   FROM public.bookings
  WHERE (bookings.user_id = auth.uid()))));


--
-- Name: bookings Users can view own bookings; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own bookings" ON public.bookings FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: notifications Users can view own notifications; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own notifications" ON public.notifications FOR SELECT USING ((user_id = auth.uid()));


--
-- Name: wallet_transactions Users can view own wallet transactions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own wallet transactions" ON public.wallet_transactions FOR SELECT USING ((user_id = auth.uid()));


--
-- Name: providers Users can view their own provider profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own provider profile" ON public.providers FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: wallets Users cannot mutate wallet directly; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users cannot mutate wallet directly" ON public.wallets USING (false);


--
-- Name: wallet_topups Users cannot update topups; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users cannot update topups" ON public.wallet_topups FOR UPDATE USING (false);


--
-- Name: wallet_topups Users create own topups; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users create own topups" ON public.wallet_topups FOR INSERT WITH CHECK ((user_id = auth.uid()));


--
-- Name: rate_quotes Users create rate quotes; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users create rate quotes" ON public.rate_quotes FOR INSERT WITH CHECK ((user_id = auth.uid()));


--
-- Name: rate_quotes Users manage own rate quotes; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users manage own rate quotes" ON public.rate_quotes FOR SELECT USING ((user_id = auth.uid()));


--
-- Name: booking_status_history Users view own booking history; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users view own booking history" ON public.booking_status_history FOR SELECT USING ((booking_id IN ( SELECT bookings.id
   FROM public.bookings
  WHERE (bookings.user_id = auth.uid()))));


--
-- Name: booking_items Users view own booking items; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users view own booking items" ON public.booking_items FOR SELECT USING ((booking_id IN ( SELECT bookings.id
   FROM public.bookings
  WHERE (bookings.user_id = auth.uid()))));


--
-- Name: booking_quotes Users view own booking quotes; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users view own booking quotes" ON public.booking_quotes FOR SELECT USING ((booking_id IN ( SELECT bookings.id
   FROM public.bookings
  WHERE (bookings.user_id = auth.uid()))));


--
-- Name: users Users view own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users view own profile" ON public.users FOR SELECT USING ((id = auth.uid()));


--
-- Name: wallet_topups Users view own topups; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users view own topups" ON public.wallet_topups FOR SELECT USING ((user_id = auth.uid()));


--
-- Name: wallets Users view own wallet; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users view own wallet" ON public.wallets FOR SELECT USING ((user_id = auth.uid()));


--
-- Name: users View provider users; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "View provider users" ON public.users FOR SELECT USING ((id IN ( SELECT providers.user_id
   FROM public.providers)));


--
-- Name: admin_settings; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;

--
-- Name: booking_items; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.booking_items ENABLE ROW LEVEL SECURITY;

--
-- Name: booking_quotes; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.booking_quotes ENABLE ROW LEVEL SECURITY;

--
-- Name: booking_status_history; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.booking_status_history ENABLE ROW LEVEL SECURITY;

--
-- Name: bookings; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

--
-- Name: cashback_transactions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.cashback_transactions ENABLE ROW LEVEL SECURITY;

--
-- Name: chat_messages; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

--
-- Name: cities; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.cities ENABLE ROW LEVEL SECURITY;

--
-- Name: city_services; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.city_services ENABLE ROW LEVEL SECURITY;

--
-- Name: discount_codes; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.discount_codes ENABLE ROW LEVEL SECURITY;

--
-- Name: notifications; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

--
-- Name: payments; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

--
-- Name: provider_portfolio; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.provider_portfolio ENABLE ROW LEVEL SECURITY;

--
-- Name: provider_quotes; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.provider_quotes ENABLE ROW LEVEL SECURITY;

--
-- Name: provider_service_rates; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.provider_service_rates ENABLE ROW LEVEL SECURITY;

--
-- Name: provider_services; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.provider_services ENABLE ROW LEVEL SECURITY;

--
-- Name: providers; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.providers ENABLE ROW LEVEL SECURITY;

--
-- Name: rate_quotes; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.rate_quotes ENABLE ROW LEVEL SECURITY;

--
-- Name: ratings; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.ratings ENABLE ROW LEVEL SECURITY;

--
-- Name: referrals; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

--
-- Name: reward_transactions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.reward_transactions ENABLE ROW LEVEL SECURITY;

--
-- Name: service_categories; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.service_categories ENABLE ROW LEVEL SECURITY;

--
-- Name: service_requests; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.service_requests ENABLE ROW LEVEL SECURITY;

--
-- Name: service_sub_subservices; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.service_sub_subservices ENABLE ROW LEVEL SECURITY;

--
-- Name: service_subservices; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.service_subservices ENABLE ROW LEVEL SECURITY;

--
-- Name: services; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

--
-- Name: user_addresses; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_addresses ENABLE ROW LEVEL SECURITY;

--
-- Name: users; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

--
-- Name: wallet_topups; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.wallet_topups ENABLE ROW LEVEL SECURITY;

--
-- Name: wallet_transactions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;

--
-- Name: wallets; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;

--
-- Name: messages; Type: ROW SECURITY; Schema: realtime; Owner: -
--

ALTER TABLE realtime.messages ENABLE ROW LEVEL SECURITY;

--
-- Name: objects Authenticated users can upload avatars; Type: POLICY; Schema: storage; Owner: -
--

CREATE POLICY "Authenticated users can upload avatars" ON storage.objects FOR INSERT WITH CHECK (((bucket_id = 'avatars'::text) AND (auth.role() = 'authenticated'::text)));


--
-- Name: objects Authenticated users can upload reviews; Type: POLICY; Schema: storage; Owner: -
--

CREATE POLICY "Authenticated users can upload reviews" ON storage.objects FOR INSERT WITH CHECK (((bucket_id = 'reviews'::text) AND (auth.role() = 'authenticated'::text)));


--
-- Name: objects Public Access; Type: POLICY; Schema: storage; Owner: -
--

CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING ((bucket_id = 'reviews'::text));


--
-- Name: objects Public Access Avatars; Type: POLICY; Schema: storage; Owner: -
--

CREATE POLICY "Public Access Avatars" ON storage.objects FOR SELECT USING ((bucket_id = 'avatars'::text));


--
-- Name: objects Users can update their own avatar; Type: POLICY; Schema: storage; Owner: -
--

CREATE POLICY "Users can update their own avatar" ON storage.objects FOR UPDATE USING (((bucket_id = 'avatars'::text) AND (auth.uid() = owner))) WITH CHECK (((bucket_id = 'avatars'::text) AND (auth.uid() = owner)));


--
-- Name: buckets; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.buckets ENABLE ROW LEVEL SECURITY;

--
-- Name: buckets_analytics; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.buckets_analytics ENABLE ROW LEVEL SECURITY;

--
-- Name: buckets_vectors; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.buckets_vectors ENABLE ROW LEVEL SECURITY;

--
-- Name: migrations; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.migrations ENABLE ROW LEVEL SECURITY;

--
-- Name: objects; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

--
-- Name: prefixes; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.prefixes ENABLE ROW LEVEL SECURITY;

--
-- Name: s3_multipart_uploads; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.s3_multipart_uploads ENABLE ROW LEVEL SECURITY;

--
-- Name: s3_multipart_uploads_parts; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.s3_multipart_uploads_parts ENABLE ROW LEVEL SECURITY;

--
-- Name: vector_indexes; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.vector_indexes ENABLE ROW LEVEL SECURITY;

--
-- Name: supabase_realtime; Type: PUBLICATION; Schema: -; Owner: -
--

CREATE PUBLICATION supabase_realtime WITH (publish = 'insert, update, delete, truncate');


--
-- Name: supabase_realtime_messages_publication; Type: PUBLICATION; Schema: -; Owner: -
--

CREATE PUBLICATION supabase_realtime_messages_publication WITH (publish = 'insert, update, delete, truncate');


--
-- Name: supabase_realtime bookings; Type: PUBLICATION TABLE; Schema: public; Owner: -
--

ALTER PUBLICATION supabase_realtime ADD TABLE ONLY public.bookings;


--
-- Name: supabase_realtime_messages_publication messages; Type: PUBLICATION TABLE; Schema: realtime; Owner: -
--

ALTER PUBLICATION supabase_realtime_messages_publication ADD TABLE ONLY realtime.messages;


--
-- Name: issue_graphql_placeholder; Type: EVENT TRIGGER; Schema: -; Owner: -
--

CREATE EVENT TRIGGER issue_graphql_placeholder ON sql_drop
         WHEN TAG IN ('DROP EXTENSION')
   EXECUTE FUNCTION extensions.set_graphql_placeholder();


--
-- Name: issue_pg_cron_access; Type: EVENT TRIGGER; Schema: -; Owner: -
--

CREATE EVENT TRIGGER issue_pg_cron_access ON ddl_command_end
         WHEN TAG IN ('CREATE EXTENSION')
   EXECUTE FUNCTION extensions.grant_pg_cron_access();


--
-- Name: issue_pg_graphql_access; Type: EVENT TRIGGER; Schema: -; Owner: -
--

CREATE EVENT TRIGGER issue_pg_graphql_access ON ddl_command_end
         WHEN TAG IN ('CREATE FUNCTION')
   EXECUTE FUNCTION extensions.grant_pg_graphql_access();


--
-- Name: issue_pg_net_access; Type: EVENT TRIGGER; Schema: -; Owner: -
--

CREATE EVENT TRIGGER issue_pg_net_access ON ddl_command_end
         WHEN TAG IN ('CREATE EXTENSION')
   EXECUTE FUNCTION extensions.grant_pg_net_access();


--
-- Name: pgrst_ddl_watch; Type: EVENT TRIGGER; Schema: -; Owner: -
--

CREATE EVENT TRIGGER pgrst_ddl_watch ON ddl_command_end
   EXECUTE FUNCTION extensions.pgrst_ddl_watch();


--
-- Name: pgrst_drop_watch; Type: EVENT TRIGGER; Schema: -; Owner: -
--

CREATE EVENT TRIGGER pgrst_drop_watch ON sql_drop
   EXECUTE FUNCTION extensions.pgrst_drop_watch();


--
-- PostgreSQL database dump complete
--

