-- ============================================
-- ADD Missing Columns to Tasks Table
-- ============================================

-- Add related_to column (stores references to leads, deals, etc.)
ALTER TABLE public.tasks
ADD COLUMN IF NOT EXISTS related_to JSONB DEFAULT NULL;

-- Add auto_generated column (marks tasks created automatically)
ALTER TABLE public.tasks
ADD COLUMN IF NOT EXISTS auto_generated BOOLEAN DEFAULT false;

-- Verify columns were added
SELECT
  table_name,
  column_name,
  data_type,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'tasks'
  AND column_name IN ('related_to', 'auto_generated');

-- Should show 2 rows

-- Check your tasks now have these columns
SELECT id, title, related_to, auto_generated
FROM tasks
WHERE user_id = '036e7503-2203-410a-8fe2-bd607e9fa99b'
LIMIT 5;
