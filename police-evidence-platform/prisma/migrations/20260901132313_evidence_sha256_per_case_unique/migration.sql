-- DropIndex
DROP INDEX "Evidence_sha256_key";

-- CreateIndex
CREATE INDEX "Evidence_sha256_idx" ON "Evidence"("sha256");

-- CreateIndex
CREATE UNIQUE INDEX "Evidence_caseId_sha256_key" ON "Evidence"("caseId", "sha256");

