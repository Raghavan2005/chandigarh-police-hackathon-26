-- CreateTable
CREATE TABLE "CaseMindMap" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "caseId" TEXT NOT NULL,
    "entitiesJson" TEXT NOT NULL,
    "relationshipsJson" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "exhibitCount" INTEGER NOT NULL,
    "ranAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CaseMindMap_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "CaseMindMap_caseId_key" ON "CaseMindMap"("caseId");
