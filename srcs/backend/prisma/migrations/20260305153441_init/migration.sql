/*
  Warnings:

  - You are about to drop the column `description` on the `Exercise` table. All the data in the column will be lost.
  - You are about to drop the column `subjectId` on the `Exercise` table. All the data in the column will be lost.
  - You are about to drop the column `unitTest` on the `Exercise` table. All the data in the column will be lost.
  - You are about to drop the column `score` on the `GameParticipant` table. All the data in the column will be lost.
  - You are about to drop the `Subject` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `subject` to the `Exercise` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Exercise" DROP CONSTRAINT "Exercise_subjectId_fkey";

-- AlterTable
ALTER TABLE "Exercise" DROP COLUMN "description",
DROP COLUMN "subjectId",
DROP COLUMN "unitTest",
ADD COLUMN     "subject" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "GameParticipant" DROP COLUMN "score";

-- DropTable
DROP TABLE "Subject";
