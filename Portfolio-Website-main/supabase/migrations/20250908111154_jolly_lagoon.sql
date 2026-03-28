/*
  # Add remaining admin features and analytics

  1. New Tables
    - `site_analytics` - Track site visits and page views
    - `portfolio_clicks` - Track clicks on portfolio items
    - Update existing tables with proper structure

  2. Security
    - Enable RLS on all new tables
    - Add policies for authenticated users

  3. Analytics
    - Site visit tracking
    - Portfolio item click tracking
    - Popular items functionality
*/

-- Create site analytics table
CREATE TABLE IF NOT EXISTS site_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  visit_date date DEFAULT CURRENT_DATE,
  visit_count integer DEFAULT 1,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create portfolio clicks table
CREATE TABLE IF NOT EXISTS portfolio_clicks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  portfolio_item_id uuid REFERENCES portfolio_items(id) ON DELETE CASCADE,
  click_count integer DEFAULT 1,
  last_clicked_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE site_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_clicks ENABLE ROW LEVEL SECURITY;

-- Add RLS policies
CREATE POLICY "Allow authenticated users full access to site_analytics"
  ON site_analytics
  FOR ALL
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users full access to portfolio_clicks"
  ON portfolio_clicks
  FOR ALL
  TO authenticated
  USING (true);

-- Add unique constraint for portfolio clicks
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name = 'portfolio_clicks' AND constraint_name = 'portfolio_clicks_portfolio_item_id_key'
  ) THEN
    ALTER TABLE portfolio_clicks ADD CONSTRAINT portfolio_clicks_portfolio_item_id_key UNIQUE (portfolio_item_id);
  END IF;
END $$;

-- Add unique constraint for site analytics by date
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name = 'site_analytics' AND constraint_name = 'site_analytics_visit_date_key'
  ) THEN
    ALTER TABLE site_analytics ADD CONSTRAINT site_analytics_visit_date_key UNIQUE (visit_date);
  END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_portfolio_clicks_item_id ON portfolio_clicks(portfolio_item_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_clicks_count ON portfolio_clicks(click_count DESC);
CREATE INDEX IF NOT EXISTS idx_site_analytics_date ON site_analytics(visit_date DESC);