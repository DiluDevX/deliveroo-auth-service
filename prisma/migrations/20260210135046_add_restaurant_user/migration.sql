/*
  Warnings:

  - The values [restaurant_admin] on the enum `Role` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `orderCount` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `restaurantId` on the `User` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "RestaurantRole" AS ENUM ('employee', 'super_admin', 'admin', 'finance');

-- AlterEnum
BEGIN;
CREATE TYPE "Role_new" AS ENUM ('user', 'platform_admin', 'restaurant_user');
ALTER TABLE "public"."User" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "User" ALTER COLUMN "role" TYPE "Role_new" USING ("role"::text::"Role_new");
ALTER TYPE "Role" RENAME TO "Role_old";
ALTER TYPE "Role_new" RENAME TO "Role";
DROP TYPE "public"."Role_old";
ALTER TABLE "User" ALTER COLUMN "role" SET DEFAULT 'user';
COMMIT;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "orderCount",
DROP COLUMN "restaurantId";

-- CreateTable
CREATE TABLE "RestaurantUser" (
    "id" TEXT NOT NULL,
    "role" "RestaurantRole" NOT NULL DEFAULT 'employee',
    "restaurantId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RestaurantUser_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "RestaurantUser" ADD CONSTRAINT "RestaurantUser_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
