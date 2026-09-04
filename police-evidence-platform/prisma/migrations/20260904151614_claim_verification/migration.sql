-- CreateTable
CREATE TABLE "ClaimVerificationResult" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "transcriptResultId" TEXT NOT NULL,
    "verdict" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "citationsJson" TEXT NOT NULL,
    "ranAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ClaimVerificationResult_transcriptResultId_fkey" FOREIGN KEY ("transcriptResultId") REFERENCES "TranscriptResult" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "ClaimVerificationResult_transcriptResultId_key" ON "ClaimVerificationResult"("transcriptResultId");
