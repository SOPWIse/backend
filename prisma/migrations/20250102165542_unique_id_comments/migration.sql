/*
  Warnings:

  - Added the required column `uniqueId` to the `comments` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "comments" ADD COLUMN     "uniqueId" TEXT NOT NULL;
