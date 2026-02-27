-- Drop the existing unconditional unique index on User email
DROP INDEX IF EXISTS "User_email_key";

-- Add partial unique index on User email (allows reuse of deleted user emails)
CREATE UNIQUE INDEX "User_email_key" 
ON "User"("email") 
WHERE "deletedAt" IS NULL;
