-- Create support_queries table
CREATE TABLE IF NOT EXISTS support_queries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  contact_method TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open', -- 'open' or 'resolved'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE support_queries ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts (so anyone can submit a query)
CREATE POLICY "Allow anonymous inserts to support_queries" ON support_queries
  FOR INSERT
  WITH CHECK (true);

-- Allow public read access (for admin dashboard, assuming admin reads anonymously currently)
CREATE POLICY "Allow public read access to support_queries" ON support_queries
  FOR SELECT
  USING (true);

-- Allow public update access (for admin to mark as resolved)
CREATE POLICY "Allow public update access to support_queries" ON support_queries
  FOR UPDATE
  USING (true)
  WITH CHECK (true);
