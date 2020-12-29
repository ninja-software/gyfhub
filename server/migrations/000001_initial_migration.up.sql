CREATE TABLE cities (
   id uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid (),
   name text NOT NULL,
   deleted_at timestamptz,
   updated_at timestamptz NOT NULL DEFAULT NOW(),
   created_at timestamptz NOT NULL DEFAULT NOW()
);

CREATE TABLE blobs (
   id uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid (),
   file_name text NOT NULL,
   mime_type text NOT NULL,
   file_size_bytes bigint NOT NULL,
   extension TEXT NOT NULL,
   file bytea NOT NULL,
   deleted_at timestamptz,
   updated_at timestamptz NOT NULL DEFAULT NOW(),
   created_at timestamptz NOT NULL DEFAULT NOW()
);

CREATE TABLE users (
   id uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid (),
   email text UNIQUE NOT NULL,
   first_name text NOT NULL,
   last_name text NOT NULL,
   city text,
   type text NOT NULL,
   -- business account fields
   australian_business_number text,
   -- reference table
   avatar_id uuid REFERENCES blobs (id),
   -- auth fields
   verified boolean NOT NULL DEFAULT FALSE,
   verify_token text NOT NULL DEFAULT gen_random_uuid (),
   verify_token_expires timestamptz NOT NULL DEFAULT NOW(),
   require_old_password boolean NOT NULL DEFAULT FALSE,
   reset_token text NOT NULL DEFAULT gen_random_uuid (),
   reset_token_expires timestamptz NOT NULL DEFAULT NOW(),
   password_hash text NOT NULL,
   -- other
   keywords tsvector,
   deleted_at timestamptz,
   updated_at timestamptz NOT NULL DEFAULT NOW(),
   created_at timestamptz NOT NULL DEFAULT NOW()
);

-- for users text search
CREATE INDEX idx_fts_user_vec ON users USING gin (keywords);

CREATE OR REPLACE FUNCTION updateUserKeywords ()
   RETURNS TRIGGER
   AS $updateUserKeywords$
DECLARE
   temp tsvector;
BEGIN
   SELECT
      (setweight(to_tsvector('english', COALESCE(NEW.first_name, '')), 'A') || setweight(to_tsvector('english', COALESCE(NEW.last_name, '')), 'A') || setweight(to_tsvector('english', COALESCE(NEW.email, '')), 'A')) INTO temp;
   IF TG_OP = 'INSERT' OR temp != OLD.keywords THEN
      UPDATE
         users
      SET
         keywords = temp
      WHERE
         id = NEW.id;
   END IF;
   RETURN NULL;
END;
$updateUserKeywords$
LANGUAGE plpgsql;

CREATE TRIGGER updateUserKeywords
   AFTER INSERT OR UPDATE ON users
   FOR EACH ROW
   EXECUTE PROCEDURE updateUserKeywords ();

-- businesses table
CREATE TABLE businesses (
   id uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid (),
   owner_id uuid NOT NULL REFERENCES users (id),
   name text NOT NULL,
   deleted_at timestamptz,
   updated_at timestamptz NOT NULL DEFAULT NOW(),
   created_at timestamptz NOT NULL DEFAULT NOW()
);

-- opportunities table
CREATE TABLE opportunities (
   id uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid (),
   business_id uuid NOT NULL REFERENCES businesses (id),
   video_id uuid NOT NULL REFERENCES blobs (id),
   category text NOT NULL,
   challenge text NOT NULL,
   role_after_challenge text NOT NULL,
   confirm_your_city text NOT NULL,
   open_to_remote_talent boolean NOT NULL DEFAULT FALSE,
   -- other
   keywords tsvector,
   deleted_at timestamptz,
   updated_at timestamptz NOT NULL DEFAULT NOW(),
   created_at timestamptz NOT NULL DEFAULT NOW()
);

-- for opportunities text search
CREATE INDEX idx_fts_opportunity_vec ON opportunities USING gin (keywords);

CREATE OR REPLACE FUNCTION updateOpportunityKeywords ()
   RETURNS TRIGGER
   AS $updateOpportunityKeywords$
DECLARE
   temp tsvector;
BEGIN
   SELECT
      (setweight(to_tsvector('english', COALESCE(NEW.category, '')), 'B') || setweight(to_tsvector('english', COALESCE(NEW.confirm_your_city, '')), 'B') || setweight(to_tsvector('english', COALESCE(NEW.role_after_challenge, '')), 'B')) INTO temp;
   IF TG_OP = 'INSERT' OR temp != OLD.keywords THEN
      UPDATE
         opportunities
      SET
         keywords = temp
      WHERE
         id = NEW.id;
   END IF;
   RETURN NULL;
END;
$updateOpportunityKeywords$
LANGUAGE plpgsql;

CREATE TRIGGER updateOpportunityKeywords
   AFTER INSERT OR UPDATE ON opportunities
   FOR EACH ROW
   EXECUTE PROCEDURE updateOpportunityKeywords ();

-- store user favourite opportunities
CREATE TABLE users_opportunities (
   user_id uuid NOT NULL REFERENCES users (id),
   opportunity_id uuid NOT NULL REFERENCES opportunities (id),
   PRIMARY KEY (user_id, opportunity_id)
);

CREATE TABLE issued_tokens (
   id uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid (),
   user_id uuid NOT NULL REFERENCES users (id),
   device text NOT NULL,
   token_created timestamptz NOT NULL DEFAULT NOW(),
   token_expires timestamptz NOT NULL,
   blacklisted boolean NOT NULL DEFAULT FALSE
);

