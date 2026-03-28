-- Create all required tables for the admin panel
-- Run this entire script in your Supabase SQL Editor

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  order_index integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Portfolio items table
CREATE TABLE IF NOT EXISTS portfolio_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text,
  file_url text NOT NULL,
  file_type text NOT NULL CHECK (file_type IN ('image', 'video')),
  category_id uuid REFERENCES categories(id) ON DELETE CASCADE,
  order_index integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- A/B tests table
CREATE TABLE IF NOT EXISTS ab_tests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  video_title text NOT NULL,
  version_a_url text NOT NULL,
  version_b_url text NOT NULL,
  order_index integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Achievements table
CREATE TABLE IF NOT EXISTS achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  number integer NOT NULL,
  suffix text NOT NULL,
  label text NOT NULL,
  icon text NOT NULL,
  order_index integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reviewer_name text NOT NULL,
  reviewer_text text NOT NULL,
  order_index integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- FAQs table
CREATE TABLE IF NOT EXISTS faqs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question text NOT NULL,
  answer text NOT NULL,
  order_index integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE ab_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE faqs ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users
CREATE POLICY "Allow authenticated users full access to categories"
  ON categories FOR ALL TO authenticated USING (true);

CREATE POLICY "Allow authenticated users full access to portfolio_items"
  ON portfolio_items FOR ALL TO authenticated USING (true);

CREATE POLICY "Allow authenticated users full access to ab_tests"
  ON ab_tests FOR ALL TO authenticated USING (true);

CREATE POLICY "Allow authenticated users full access to achievements"
  ON achievements FOR ALL TO authenticated USING (true);

CREATE POLICY "Allow authenticated users full access to reviews"
  ON reviews FOR ALL TO authenticated USING (true);

CREATE POLICY "Allow authenticated users full access to faqs"
  ON faqs FOR ALL TO authenticated USING (true);

-- Insert default categories
INSERT INTO categories (name, slug, order_index) VALUES
  ('Thumbnails', 'thumbnails', 0),
  ('Branding', 'branding', 1),
  ('Video Editing', 'video-editing', 2)
ON CONFLICT (slug) DO NOTHING;

-- Insert sample achievements
INSERT INTO achievements (number, suffix, label, icon, order_index) VALUES
  (1, 'M+', 'Views', 'Eye', 0),
  (500, '+', 'Projects', 'Briefcase', 1),
  (100, '+', 'Clients', 'Users', 2),
  (5, '+', 'Years Experience', 'Calendar', 3)
ON CONFLICT DO NOTHING;