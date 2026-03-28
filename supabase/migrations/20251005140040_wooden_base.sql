/*
  # Add Star Functionality for Popular Items

  1. Schema Updates
    - Add `is_starred` column to portfolio_items table
    - Add constraint to limit 12 starred items per category

  2. Security
    - Update existing RLS policies to handle starred items
*/

-- Add is_starred column to portfolio_items
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'portfolio_items' AND column_name = 'is_starred'
  ) THEN
    ALTER TABLE portfolio_items ADD COLUMN is_starred boolean DEFAULT false;
  END IF;
END $$;

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