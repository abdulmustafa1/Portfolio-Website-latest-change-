/*
  # Create Progress Tracker Table

  1. New Tables
    - `progress_tracker` - Store thumbnail progress count and last update time

  2. Security
    - Enable RLS on new table
    - Add policies for authenticated users to manage data
    - Add policy for anonymous users to read data
*/

-- Create progress_tracker table
CREATE TABLE IF NOT EXISTS progress_tracker (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  thumbnails_in_progress integer NOT NULL DEFAULT 0,
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE progress_tracker ENABLE ROW LEVEL SECURITY;

-- Add RLS policies
CREATE POLICY "Allow authenticated users full access to progress_tracker"
  ON progress_tracker
  FOR ALL
  TO authenticated
  USING (true);

CREATE POLICY "Allow anonymous users to read progress_tracker"
  ON progress_tracker
  FOR SELECT
  TO anon
  USING (true);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_progress_tracker_updated_at ON progress_tracker(updated_at DESC);

-- Insert initial record
INSERT INTO progress_tracker (thumbnails_in_progress) VALUES (0)
ON CONFLICT DO NOTHING;