-- Update existing order statuses
UPDATE purchases SET status = 'pending' WHERE status IS NULL OR status NOT IN ('pending', 'completed');

-- Modify the status column to ensure pending is the default
ALTER TABLE purchases MODIFY COLUMN status VARCHAR(20) NOT NULL DEFAULT 'pending';
