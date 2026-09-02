-- RedefineTables
-- Replaces the single-face `faceBoxJson` (nullable, one box) with
-- `faceBoxesJson` (NOT NULL, defaults to '[]', holds every detected face).
-- Existing single-box rows are backfilled by wrapping the old value in an
-- array rather than discarded, since they're real prior detection results.
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_DetectionResult" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "evidenceId" TEXT NOT NULL,
    "manipulationProbability" REAL NOT NULL,
    "heatmapPath" TEXT,
    "modelName" TEXT NOT NULL,
    "modelVersion" TEXT NOT NULL,
    "ranAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "faceBoxesJson" TEXT NOT NULL DEFAULT '[]',
    "faceCropPath" TEXT,
    "frameScoresJson" TEXT,
    CONSTRAINT "DetectionResult_evidenceId_fkey" FOREIGN KEY ("evidenceId") REFERENCES "Evidence" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_DetectionResult" ("id", "evidenceId", "manipulationProbability", "heatmapPath", "modelName", "modelVersion", "ranAt", "faceBoxesJson", "faceCropPath", "frameScoresJson")
SELECT "id", "evidenceId", "manipulationProbability", "heatmapPath", "modelName", "modelVersion", "ranAt",
  CASE WHEN "faceBoxJson" IS NOT NULL THEN '[' || "faceBoxJson" || ']' ELSE '[]' END,
  "faceCropPath", "frameScoresJson"
FROM "DetectionResult";
DROP TABLE "DetectionResult";
ALTER TABLE "new_DetectionResult" RENAME TO "DetectionResult";
CREATE UNIQUE INDEX "DetectionResult_evidenceId_key" ON "DetectionResult"("evidenceId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
