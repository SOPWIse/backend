/*
  Warnings:

  - You are about to drop the `fileSettings` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "fileSettings";

-- CreateTable
CREATE TABLE "FileSettings" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "file" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "visibility" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'SOP',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FileSettings_pkey" PRIMARY KEY ("id")
);
