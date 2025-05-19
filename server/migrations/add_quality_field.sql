-- migrations/add_quality_field.sql
ALTER TABLE harvestinventory
ADD COLUMN Quality ENUM('Low', 'Medium', 'High') DEFAULT 'High';
