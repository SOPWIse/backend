-- AlterTable
ALTER TABLE "experiment_logs" ALTER COLUMN "tenant" SET DEFAULT 'sopwise';

-- AlterTable
ALTER TABLE "steps" ALTER COLUMN "tenant" SET DEFAULT 'sopwise';
