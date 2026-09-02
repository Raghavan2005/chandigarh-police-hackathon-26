-- CreateTable
CREATE TABLE "PendingCapture" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sha256" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "consumedAt" DATETIME
);

-- CreateIndex
CREATE UNIQUE INDEX "PendingCapture_sha256_key" ON "PendingCapture"("sha256");

-- CreateIndex
CREATE INDEX "PendingCapture_consumedAt_idx" ON "PendingCapture"("consumedAt");
