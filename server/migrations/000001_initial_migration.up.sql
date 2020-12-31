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

CREATE TABLE issued_tokens (
   id uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid (),
   user_id uuid NOT NULL REFERENCES users (id),
   device text NOT NULL,
   token_created timestamptz NOT NULL DEFAULT NOW(),
   token_expires timestamptz NOT NULL,
   blacklisted boolean NOT NULL DEFAULT FALSE
);

CREATE TABLE hubs (
   id uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid (),
   name text UNIQUE NOT NULL,
   avatar_id uuid REFERENCES blobs (id),
   is_private boolean NOT NULL DEFAULT FALSE,
   deleted_at timestamptz,
   updated_at timestamptz NOT NULL DEFAULT NOW(),
   created_at timestamptz NOT NULL DEFAULT NOW()
);

CREATE TABLE messages (
   id uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid (),
   hub_id uuid NOT NULL REFERENCES hubs (id),
   sender_id uuid NOT NULL REFERENCES users (id),
   content text NOT NULL,
   deleted_at timestamptz,
   updated_at timestamptz NOT NULL DEFAULT NOW(),
   created_at timestamptz NOT NULL DEFAULT NOW()
);

CREATE TABLE message_reactions (
   id uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid (),
   message_id uuid NOT NULL REFERENCES messages (id),
   poster_id uuid NOT NULL REFERENCES users (id),
   reaction text NOT NULL,
   deleted_at timestamptz,
   updated_at timestamptz NOT NULL DEFAULT NOW(),
   created_at timestamptz NOT NULL DEFAULT NOW()
);

