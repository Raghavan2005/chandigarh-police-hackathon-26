/*
  Warnings:

  - You are about to drop the column `entitiesJson` on the `CaseMindMap` table. All the data in the column will be lost.
  - You are about to drop the column `relationshipsJson` on the `CaseMindMap` table. All the data in the column will be lost.
  - Added the required column `edgesJson` to the `CaseMindMap` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nodesJson` to the `CaseMindMap` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_CaseMindMap" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "caseId" TEXT NOT NULL,
    "nodesJson" TEXT NOT NULL,
    "edgesJson" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "exhibitCount" INTEGER NOT NULL,
    "ranAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CaseMindMap_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_CaseMindMap" ("caseId", "exhibitCount", "id", "ranAt", "summary") SELECT "caseId", "exhibitCount", "id", "ranAt", "summary" FROM "CaseMindMap";
DROP TABLE "CaseMindMap";
ALTER TABLE "new_CaseMindMap" RENAME TO "CaseMindMap";
CREATE UNIQUE INDEX "CaseMindMap_caseId_key" ON "CaseMindMap"("caseId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
