-- AlterTable
ALTER TABLE "DetectionResult" ADD COLUMN "frameHeatmapPathsJson" TEXT;

-- CreateTable
CREATE TABLE "ThreatAssessment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "transcriptResultId" TEXT NOT NULL,
    "containsThreat" BOOLEAN NOT NULL,
    "severity" TEXT,
    "reasoning" TEXT,
    "quote" TEXT,
    "ranAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ThreatAssessment_transcriptResultId_fkey" FOREIGN KEY ("transcriptResultId") REFERENCES "TranscriptResult" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "VideoDiffResult" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "evidenceId" TEXT NOT NULL,
    "matchedEvidenceId" TEXT NOT NULL,
    "diffImagePath" TEXT NOT NULL,
    "diffPercentage" REAL NOT NULL,
    "timestampSeconds" REAL NOT NULL,
    "ranAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "VideoDiffResult_evidenceId_fkey" FOREIGN KEY ("evidenceId") REFERENCES "Evidence" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "ThreatAssessment_transcriptResultId_key" ON "ThreatAssessment"("transcriptResultId");

-- CreateIndex
CREATE UNIQUE INDEX "VideoDiffResult_evidenceId_key" ON "VideoDiffResult"("evidenceId");
