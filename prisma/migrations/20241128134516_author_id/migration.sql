/*
  Warnings:

  - You are about to drop the column `requested_id` on the `Approval` table. All the data in the column will be lost.
  - Added the required column `author_id` to the `Approval` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Approval" DROP CONSTRAINT "Approval_requested_id_fkey";

-- AlterTable
ALTER TABLE "Approval" DROP COLUMN "requested_id",
ADD COLUMN     "author_id" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Approval" ADD CONSTRAINT "Approval_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "SopWiseUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
