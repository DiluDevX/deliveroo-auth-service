/*
  Warnings:

  - A unique constraint covering the columns `[userId,restaurantId]` on the table `RestaurantUser` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "RestaurantUser_userId_restaurantId_key" ON "RestaurantUser"("userId", "restaurantId");
