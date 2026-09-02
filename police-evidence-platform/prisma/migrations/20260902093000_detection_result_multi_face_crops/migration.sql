-- RedefineTables
-- Replaces the single-face `faceCropPath` (nullable, one file) with
-- `faceCropPathsJson` (NOT NULL, defaults to '[]', holds a path per
-- detected face). Existing single-crop rows are backfilled by wrapping the
-- old path in a JSON array rather than discarded, since they're real prior
-- detection results.
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
    "faceCropPathsJson" TEXT NOT NULL DEFAULT '[]',
    "frameScoresJson" TEXT,
    CONSTRAINT "DetectionResult_evidenceId_fkey" FOREIGN KEY ("evidenceId") REFERENCES "Evidence" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_DetectionResult" ("id", "evidenceId", "manipulationProbability", "heatmapPath", "modelName", "modelVersion", "ranAt", "faceBoxesJson", "faceCropPathsJson", "frameScoresJson")
SELECT "id", "evidenceId", "manipulationProbability", "heatmapPath", "modelName", "modelVersion", "ranAt", "faceBoxesJson",
  CASE WHEN "faceCropPath" IS NOT NULL THEN '["' || "faceCropPath" || '"]' ELSE '[]' END,
  "frameScoresJson"
FROM "DetectionResult";
DROP TABLE "DetectionResult";
ALTER TABLE "new_DetectionResult" RENAME TO "DetectionResult";
CREATE UNIQUE INDEX "DetectionResult_evidenceId_key" ON "DetectionResult"("evidenceId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
