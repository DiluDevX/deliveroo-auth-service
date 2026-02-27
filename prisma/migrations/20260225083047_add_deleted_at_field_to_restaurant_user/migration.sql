-- AlterTable
ALTER TABLE "RestaurantUser" ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- Drop the unconditional unique index that blocks soft-deleted row recreation
DROP INDEX IF EXISTS "RestaurantUser_userId_restaurantId_key";

-- Create a partial unique index that only enforces uniqueness for active (non-deleted) rows
CREATE UNIQUE INDEX "RestaurantUser_userId_restaurantId_key" 
ON "RestaurantUser"("userId", "restaurantId") 
WHERE "deletedAt" IS NULL;
