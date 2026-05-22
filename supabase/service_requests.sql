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

-- RLS: each user sees only their own rows; admin (service role) bypasses RLS
ALTER TABLE service_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_own_service_requests"
  ON service_requests
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Index for dashboard queries
CREATE INDEX IF NOT EXISTS service_requests_user_id_idx
  ON service_requests (user_id, created_at DESC);
