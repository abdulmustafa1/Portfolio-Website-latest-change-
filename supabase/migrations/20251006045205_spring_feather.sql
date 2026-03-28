/*
  # Add Tag Requests Table

  1. New Tables
    - `tag_requests` - Store user requests for new tags

  2. Security
    - Enable RLS on new table
    - Add policies for authenticated users
*/

-- Create tag_requests table
CREATE TABLE IF NOT EXISTS tag_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  requested_tag text NOT NULL,
  requested_at timestamptz DEFAULT now(),
  approved boolean DEFAULT false
);

-- Enable RLS
ALTER TABLE tag_requests ENABLE ROW LEVEL SECURITY;

-- Add RLS policies
CREATE POLICY "Allow authenticated users full access to tag_requests"
  ON tag_requests
  FOR ALL
  TO authenticated
  USING (true);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_tag_requests_approved ON tag_requests(approved, requested_at DESC);