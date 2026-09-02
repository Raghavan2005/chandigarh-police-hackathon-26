-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ReverseImageSearchResult" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "evidenceId" TEXT NOT NULL,
    "fullMatchesJson" TEXT NOT NULL,
    "partialMatchesJson" TEXT NOT NULL,
    "pagesWithMatchesJson" TEXT NOT NULL,
    "webEntitiesJson" TEXT NOT NULL,
    "bestGuessLabelsJson" TEXT NOT NULL DEFAULT '[]',
    "labelsJson" TEXT NOT NULL DEFAULT '[]',
    "ranAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ReverseImageSearchResult_evidenceId_fkey" FOREIGN KEY ("evidenceId") REFERENCES "Evidence" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_ReverseImageSearchResult" ("bestGuessLabelsJson", "evidenceId", "fullMatchesJson", "id", "pagesWithMatchesJson", "partialMatchesJson", "ranAt", "webEntitiesJson") SELECT "bestGuessLabelsJson", "evidenceId", "fullMatchesJson", "id", "pagesWithMatchesJson", "partialMatchesJson", "ranAt", "webEntitiesJson" FROM "ReverseImageSearchResult";
DROP TABLE "ReverseImageSearchResult";
ALTER TABLE "new_ReverseImageSearchResult" RENAME TO "ReverseImageSearchResult";
CREATE UNIQUE INDEX "ReverseImageSearchResult_evidenceId_key" ON "ReverseImageSearchResult"("evidenceId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
