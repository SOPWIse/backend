-- CreateTable
CREATE TABLE "Sop" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "is_listed" BOOLEAN NOT NULL,
    "is_deleted" BOOLEAN NOT NULL,
    "published_at" TIMESTAMP(3),
    "meta_data" JSONB NOT NULL,
    "author_id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "content_url" TEXT NOT NULL,

    CONSTRAINT "Sop_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Sop" ADD CONSTRAINT "Sop_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "SopWiseUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;
