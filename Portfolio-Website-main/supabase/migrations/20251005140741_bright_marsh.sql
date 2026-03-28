/*
  # Add is_starred column to portfolio_items table

  1. Schema Updates
    - Add `is_starred` column to portfolio_items table with default false
    - Add index for better performance on starred items queries
    - Add constraint function to limit 12 starred items per category

  2. Security
    - Maintains existing RLS policies
*/

-- Add is_starred column to portfolio_items
ALTER TABLE portfolio_items ADD COLUMN IF NOT EXISTS is_starred boolean DEFAULT false;

-- Create index for better performance on starred items
CREATE INDEX IF NOT EXISTS idx_portfolio_items_starred ON portfolio_items(category_id, is_starred, created_at DESC);

-- Create function to enforce max 12 starred items per category
CREATE OR REPLACE FUNCTION check_starred_limit()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_starred = true THEN
    -- Check if category already has 12 starred items
    IF (
      SELECT COUNT(*) 
      FROM portfolio_items 
      WHERE category_id = NEW.category_id 
      AND is_starred = true 
      AND id != COALESCE(OLD.id, '00000000-0000-0000-0000-000000000000'::uuid)
    ) >= 12 THEN
      RAISE EXCEPTION 'Category already has maximum of 12 starred items';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to enforce starred limit
DROP TRIGGER IF EXISTS enforce_starred_limit ON portfolio_items;
CREATE TRIGGER enforce_starred_limit
  BEFORE INSERT OR UPDATE ON portfolio_items
  FOR EACH ROW
  EXECUTE FUNCTION check_starred_limit();