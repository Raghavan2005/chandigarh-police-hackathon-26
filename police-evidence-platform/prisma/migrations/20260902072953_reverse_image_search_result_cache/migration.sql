-- CreateTable
CREATE TABLE "ReverseImageSearchResult" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "evidenceId" TEXT NOT NULL,
    "fullMatchesJson" TEXT NOT NULL,
    "partialMatchesJson" TEXT NOT NULL,
    "pagesWithMatchesJson" TEXT NOT NULL,
    "webEntitiesJson" TEXT NOT NULL,
    "ranAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ReverseImageSearchResult_evidenceId_fkey" FOREIGN KEY ("evidenceId") REFERENCES "Evidence" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "ReverseImageSearchResult_evidenceId_key" ON "ReverseImageSearchResult"("evidenceId");
