-- CreateTable
CREATE TABLE "DocumentSummaryResult" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "evidenceId" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "ranAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "DocumentSummaryResult_evidenceId_fkey" FOREIGN KEY ("evidenceId") REFERENCES "Evidence" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DocumentThreatAssessment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "evidenceId" TEXT NOT NULL,
    "containsThreat" BOOLEAN NOT NULL,
    "severity" TEXT,
    "reasoning" TEXT,
    "quote" TEXT,
    "ranAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "DocumentThreatAssessment_evidenceId_fkey" FOREIGN KEY ("evidenceId") REFERENCES "Evidence" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "DocumentSummaryResult_evidenceId_key" ON "DocumentSummaryResult"("evidenceId");

-- CreateIndex
CREATE UNIQUE INDEX "DocumentThreatAssessment_evidenceId_key" ON "DocumentThreatAssessment"("evidenceId");
