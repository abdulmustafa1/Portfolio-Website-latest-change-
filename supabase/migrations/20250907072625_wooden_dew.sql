/*
  # Enhanced Portfolio System with Tags and Categories

  1. New Tables
    - `tags` - For managing portfolio tags
    - `portfolio_item_tags` - Junction table for many-to-many relationship between portfolio items and tags

  2. Schema Updates
    - Add `aspect_ratio` and `is_hidden` columns to categories table
    - Add `tags` support to portfolio items via junction table

  3. Security
    - Enable RLS on all new tables
    - Add policies for authenticated users to manage all data
*/

-- Create tags table
CREATE TABLE IF NOT EXISTS tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  color text DEFAULT '#6b7280',
  order_index integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create portfolio_item_tags junction table
CREATE TABLE IF NOT EXISTS portfolio_item_tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  portfolio_item_id uuid NOT NULL REFERENCES portfolio_items(id) ON DELETE CASCADE,
  tag_id uuid NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(portfolio_item_id, tag_id)
);

-- Add new columns to categories table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'categories' AND column_name = 'aspect_ratio'
  ) THEN
    ALTER TABLE categories ADD COLUMN aspect_ratio text DEFAULT '16:9';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'categories' AND column_name = 'is_hidden'
  ) THEN
    ALTER TABLE categories ADD COLUMN is_hidden boolean DEFAULT false;
  END IF;
END $$;

-- Enable RLS on new tables
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_item_tags ENABLE ROW LEVEL SECURITY;

-- Add RLS policies for tags
CREATE POLICY "Allow authenticated users full access to tags"
  ON tags
  FOR ALL
  TO authenticated
  USING (true);

-- Add RLS policies for portfolio_item_tags
CREATE POLICY "Allow authenticated users full access to portfolio_item_tags"
  ON portfolio_item_tags
  FOR ALL
  TO authenticated
  USING (true);

-- Add check constraint for aspect ratios
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name = 'categories' AND constraint_name = 'categories_aspect_ratio_check'
  ) THEN
    ALTER TABLE categories ADD CONSTRAINT categories_aspect_ratio_check 
    CHECK (aspect_ratio IN ('16:9', '1:1', '9:16'));
  END IF;
END $$;

-- Insert default categories if they don't exist
INSERT INTO categories (name, slug, aspect_ratio, order_index) VALUES
  ('Thumbnails', 'thumbnails', '16:9', 0),
  ('Branding', 'branding', '16:9', 1),
  ('Logos', 'logos', '1:1', 2),
  ('Shorts', 'shorts', '9:16', 3)
ON CONFLICT (slug) DO NOTHING;

-- Insert some default tags
INSERT INTO tags (name, slug, color, order_index) VALUES
  ('Gaming', 'gaming', '#ef4444', 0),
  ('Tech', 'tech', '#3b82f6', 1),
  ('Lifestyle', 'lifestyle', '#10b981', 2),
  ('Business', 'business', '#f59e0b', 3),
  ('Education', 'education', '#8b5cf6', 4)
ON CONFLICT (slug) DO NOTHING;