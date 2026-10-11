-- Service requests table for the marketplace
CREATE TABLE IF NOT EXISTS service_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  service_type text NOT NULL,
  -- 'telegram_bot' | 'travel_automation' | 'voice_assistant'
  -- 'website_design' | 'crm_automation' | 'social_automation'
  status text NOT NULL DEFAULT 'pending',
  -- 'pending' | 'demo_used' | 'paid' | 'in_progress' | 'delivered'
  is_automated boolean NOT NULL DEFAULT false,
  metadata jsonb,               -- form data submitted by client
  result jsonb,                 -- Claude-generated output (automated services)
  amount integer,               -- price in EUR cents
  stripe_payment_intent_id text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_service_requests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER service_requests_updated_at
  BEFORE UPDATE ON service_requests
  FOR EACH ROW EXECUTE FUNCTION update_service_requests_updated_at();

-- RLS: users can read their own rows and create new ones in the initial state.
-- There is deliberately no UPDATE/DELETE policy: status, amount, result and
-- payment fields are changed by the server (service role) only — otherwise a
-- user could mark their own request as paid through the public REST API.
ALTER TABLE service_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_requests owner read"
  ON service_requests
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "service_requests owner insert"
  ON service_requests
  FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND status = 'pending'
    AND result IS NULL
    AND stripe_payment_intent_id IS NULL
  );

-- One open request per user and service.
CREATE UNIQUE INDEX IF NOT EXISTS service_requests_one_open_per_service
  ON service_requests (user_id, service_type)
  WHERE status <> 'delivered';

-- Index for dashboard queries
CREATE INDEX IF NOT EXISTS service_requests_user_id_idx
  ON service_requests (user_id, created_at DESC);
