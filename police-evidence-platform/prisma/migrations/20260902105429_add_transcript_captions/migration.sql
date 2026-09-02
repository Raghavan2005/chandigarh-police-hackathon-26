-- CreateTable
CREATE TABLE "TranscriptResult" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "evidenceId" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "segmentsJson" TEXT NOT NULL,
    "ranAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TranscriptResult_evidenceId_fkey" FOREIGN KEY ("evidenceId") REFERENCES "Evidence" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TranscriptTranslation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "transcriptResultId" TEXT NOT NULL,
    "targetLang" TEXT NOT NULL,
    "segmentsJson" TEXT NOT NULL,
    "ranAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TranscriptTranslation_transcriptResultId_fkey" FOREIGN KEY ("transcriptResultId") REFERENCES "TranscriptResult" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "TranscriptResult_evidenceId_key" ON "TranscriptResult"("evidenceId");

-- CreateIndex
CREATE UNIQUE INDEX "TranscriptTranslation_transcriptResultId_targetLang_key" ON "TranscriptTranslation"("transcriptResultId", "targetLang");
