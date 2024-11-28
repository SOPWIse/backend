-- CreateEnum
CREATE TYPE "Status" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "Approval" (
    "id" TEXT NOT NULL,
    "requested_id" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" "Status" NOT NULL,
    "approved_by" TEXT,
    "allowedRole" "Role"[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Approval_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Approval" ADD CONSTRAINT "Approval_approved_by_fkey" FOREIGN KEY ("approved_by") REFERENCES "SopWiseUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Approval" ADD CONSTRAINT "Approval_requested_id_fkey" FOREIGN KEY ("requested_id") REFERENCES "SopWiseUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
