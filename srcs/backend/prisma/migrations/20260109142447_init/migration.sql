/*
  Warnings:

  - Added the required column `sender` to the `Friendship` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Friendship" ADD COLUMN     "sender" INTEGER NOT NULL;
