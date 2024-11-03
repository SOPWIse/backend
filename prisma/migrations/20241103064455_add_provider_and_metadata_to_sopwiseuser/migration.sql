-- AlterTable
ALTER TABLE "SopWiseUser" ADD COLUMN     "metaData" JSONB,
ADD COLUMN     "provider" TEXT NOT NULL DEFAULT 'sopwise';
