-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_TranscriptResult" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "evidenceId" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "segmentsJson" TEXT NOT NULL,
    "truncated" BOOLEAN NOT NULL DEFAULT false,
    "ranAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TranscriptResult_evidenceId_fkey" FOREIGN KEY ("evidenceId") REFERENCES "Evidence" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_TranscriptResult" ("evidenceId", "id", "language", "ranAt", "segmentsJson") SELECT "evidenceId", "id", "language", "ranAt", "segmentsJson" FROM "TranscriptResult";
DROP TABLE "TranscriptResult";
ALTER TABLE "new_TranscriptResult" RENAME TO "TranscriptResult";
CREATE UNIQUE INDEX "TranscriptResult_evidenceId_key" ON "TranscriptResult"("evidenceId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
