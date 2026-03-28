/*
  # Add Private Form Submissions and Tag Presets

  1. New Tables
    - `private_form_submissions` - Store private contact form submissions
    - `tag_presets` - Store tag preset configurations for bulk tagging

  2. Security
    - Enable RLS on all new tables
    - Add policies for authenticated users to manage all data
*/

-- Create private form submissions table
CREATE TABLE IF NOT EXISTS private_form_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  message text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create tag presets table
CREATE TABLE IF NOT EXISTS tag_presets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  preset_name text NOT NULL,
  tag_ids text[] NOT NULL DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE private_form_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE tag_presets ENABLE ROW LEVEL SECURITY;

-- Add RLS policies
CREATE POLICY "Allow authenticated users full access to private_form_submissions"
  ON private_form_submissions
  FOR ALL
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users full access to tag_presets"
  ON tag_presets
  FOR ALL
  TO authenticated
  USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_private_form_submissions_created_at ON private_form_submissions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tag_presets_name ON tag_presets(preset_name);