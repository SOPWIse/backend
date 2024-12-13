-- CreateTable
CREATE TABLE "fileSettings" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "file" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "visibility" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'SOP',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "fileSettings_pkey" PRIMARY KEY ("id")
);
