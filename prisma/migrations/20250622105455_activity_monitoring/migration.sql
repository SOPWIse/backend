-- CreateEnum
CREATE TYPE "ActivityOperation" AS ENUM ('CREATE', 'UPDATE', 'DELETE', 'UPSERT', 'CREATE_MANY', 'UPDATE_MANY', 'DELETE_MANY');

-- CreateTable
CREATE TABLE "activities" (
    "id" TEXT NOT NULL,
    "model_name" TEXT NOT NULL,
    "operation" "ActivityOperation" NOT NULL,
    "record_id" TEXT NOT NULL,
    "user_id" TEXT,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "old_values" JSONB,
    "new_values" JSONB,
    "changed_fields" TEXT[],
    "tenant" TEXT NOT NULL DEFAULT 'sopwise',
    "session_id" TEXT,
    "request_id" TEXT,
    "metadata" JSONB,
    "duration" DOUBLE PRECISION,
    "success" BOOLEAN NOT NULL DEFAULT true,
    "error_message" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "activities_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "activities_model_name_operation_idx" ON "activities"("model_name", "operation");

-- CreateIndex
CREATE INDEX "activities_user_id_idx" ON "activities"("user_id");

-- CreateIndex
CREATE INDEX "activities_record_id_idx" ON "activities"("record_id");

-- CreateIndex
CREATE INDEX "activities_created_at_idx" ON "activities"("created_at");

-- CreateIndex
CREATE INDEX "activities_tenant_idx" ON "activities"("tenant");

-- AddForeignKey
ALTER TABLE "activities" ADD CONSTRAINT "activities_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "SopWiseUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;
