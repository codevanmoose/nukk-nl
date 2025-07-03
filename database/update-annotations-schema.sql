-- Update annotations table to match new format
-- This migration updates the annotations table to support the new text highlighting feature

-- Add new columns
ALTER TABLE annotations 
ADD COLUMN IF NOT EXISTS type TEXT,
ADD COLUMN IF NOT EXISTS text TEXT,
ADD COLUMN IF NOT EXISTS reasoning TEXT,
ADD COLUMN IF NOT EXISTS start_index INTEGER,
ADD COLUMN IF NOT EXISTS end_index INTEGER;

-- Copy data from old columns to new columns
UPDATE annotations 
SET 
  type = annotation_type,
  text = '',  -- We don't have the original text stored
  reasoning = explanation,
  start_index = text_start,
  end_index = text_end
WHERE type IS NULL;

-- For future compatibility, we'll keep both old and new columns
-- but new code will use the new column names

-- Add check constraint for type column
ALTER TABLE annotations 
ADD CONSTRAINT annotations_type_check 
CHECK (type IN ('fact', 'opinion', 'suggestive', 'incomplete') OR type IS NULL);