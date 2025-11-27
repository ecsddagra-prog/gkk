BEGIN;

ALTER TABLE service_subservices
  ADD COLUMN IF NOT EXISTS created_by_provider_id UUID REFERENCES providers(id),
  ADD COLUMN IF NOT EXISTS created_by_user_id UUID REFERENCES users(id);

CREATE INDEX IF NOT EXISTS idx_service_subservices_provider_owner
  ON service_subservices(created_by_provider_id);

COMMIT;


