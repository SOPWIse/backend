-- AddForeignKey
ALTER TABLE "experiment_logs" ADD CONSTRAINT "experiment_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "SopWiseUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "experiment_logs" ADD CONSTRAINT "experiment_logs_sop_id_fkey" FOREIGN KEY ("sop_id") REFERENCES "Sop"("id") ON DELETE CASCADE ON UPDATE CASCADE;
