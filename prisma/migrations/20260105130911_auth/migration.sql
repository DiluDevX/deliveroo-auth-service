/*
  Warnings:

  - The values [USER,ADMIN] on the enum `Role` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `name` on the `User` table. All the data in the column will be lost.
  - Added the required column `firstName` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lastName` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Role_new" AS ENUM ('user', 'platform_admin', 'restaurant_admin');
ALTER TABLE "public"."User" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "User" ALTER COLUMN "role" TYPE "Role_new" USING (lower("role"::text)::"Role_new");
ALTER TYPE "Role" RENAME TO "Role_old";
ALTER TYPE "Role_new" RENAME TO "Role";
DROP TYPE "public"."Role_old";
ALTER TABLE "User" ALTER COLUMN "role" SET DEFAULT 'user';
COMMIT;

-- AlterTable: Add nullable columns first
ALTER TABLE "User"
    ADD COLUMN "firstName" TEXT,
ADD COLUMN "lastName" TEXT,
ADD COLUMN "phone" TEXT;

-- Backfill firstName and lastName from name column
UPDATE "User"
SET "firstName" = COALESCE(NULLIF(split_part("name", ' ', 1), ''), 'Unknown'),
    "lastName"  = COALESCE(NULLIF(regexp_replace("name", '^[^\s]+\s*', ''), ''), 'User')
WHERE "firstName" IS NULL
   OR "lastName" IS NULL;

-- Make firstName and lastName NOT NULL
ALTER TABLE "User"
    ALTER COLUMN "firstName" SET NOT NULL,
ALTER
COLUMN "lastName" SET NOT NULL;

-- Drop the old name column
ALTER TABLE "User" DROP COLUMN "name";
