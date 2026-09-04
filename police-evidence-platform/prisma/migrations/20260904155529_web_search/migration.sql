-- CreateTable
CREATE TABLE "WebSearchResult" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "evidenceId" TEXT NOT NULL,
    "query" TEXT NOT NULL,
    "resultsJson" TEXT NOT NULL,
    "providersRun" TEXT NOT NULL,
    "ranAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "WebSearchResult_evidenceId_fkey" FOREIGN KEY ("evidenceId") REFERENCES "Evidence" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "WebSearchResult_evidenceId_key" ON "WebSearchResult"("evidenceId");
