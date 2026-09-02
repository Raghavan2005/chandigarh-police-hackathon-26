-- CreateTable
CREATE TABLE "CaptureLink" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "token" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "createdByUserId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" DATETIME NOT NULL,
    "usedAt" DATETIME,
    CONSTRAINT "CaptureLink_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "CaptureLink_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "CaptureLink_token_key" ON "CaptureLink"("token");

-- CreateIndex
CREATE INDEX "CaptureLink_caseId_idx" ON "CaptureLink"("caseId");

-- CreateIndex
CREATE INDEX "CaptureLink_expiresAt_idx" ON "CaptureLink"("expiresAt");
