/*
  Warnings:

  - You are about to drop the column `winner` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "winner",
ADD COLUMN     "win" INTEGER NOT NULL DEFAULT 0;
