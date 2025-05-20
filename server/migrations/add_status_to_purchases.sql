-- Add status column to purchases table if it doesn't exist
ALTER TABLE purchases
ADD COLUMN IF NOT EXISTS status VARCHAR(20) NOT NULL DEFAULT 'pending';
