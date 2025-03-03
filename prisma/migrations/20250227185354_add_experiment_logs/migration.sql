-- CreateTable
CREATE TABLE "experiment_logs" (
    "id" TEXT NOT NULL,
    "sop_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "tenant" TEXT NOT NULL,
    "total_time" DOUBLE PRECISION,
    "meta_data" JSONB,
    "completion_percentage" DOUBLE PRECISION,

    CONSTRAINT "experiment_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "steps" (
    "id" TEXT NOT NULL,
    "log_id" TEXT NOT NULL,
    "time_taken" DOUBLE PRECISION,
    "title" TEXT,
    "subtitle" TEXT,
    "tenant" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "form_data" JSONB,
    "meta_data" JSONB,

    CONSTRAINT "steps_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "steps" ADD CONSTRAINT "steps_log_id_fkey" FOREIGN KEY ("log_id") REFERENCES "experiment_logs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
