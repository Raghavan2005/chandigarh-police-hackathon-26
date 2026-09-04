-- CreateTable
CREATE TABLE "SpliceDetectionResult" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "evidenceId" TEXT NOT NULL,
    "candidatesJson" TEXT NOT NULL,
    "totalSeconds" REAL NOT NULL,
    "ranAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SpliceDetectionResult_evidenceId_fkey" FOREIGN KEY ("evidenceId") REFERENCES "Evidence" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "SpliceDetectionResult_evidenceId_key" ON "SpliceDetectionResult"("evidenceId");
