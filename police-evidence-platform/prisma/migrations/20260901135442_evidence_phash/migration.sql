-- AlterTable
ALTER TABLE "Evidence" ADD COLUMN "phash" TEXT;

-- CreateIndex
CREATE INDEX "Evidence_phash_idx" ON "Evidence"("phash");

