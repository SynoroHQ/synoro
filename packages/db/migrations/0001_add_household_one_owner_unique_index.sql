-- Add partial unique index to ensure only one owner per household
CREATE UNIQUE INDEX IF NOT EXISTS household_one_owner_idx ON household_members (household_id) WHERE role = 'owner';
