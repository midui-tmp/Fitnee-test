/*
  Warnings:

  - A unique constraint covering the columns `[userId,date]` on the table `activities` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "activities_userId_date_key" ON "activities"("userId", "date");
