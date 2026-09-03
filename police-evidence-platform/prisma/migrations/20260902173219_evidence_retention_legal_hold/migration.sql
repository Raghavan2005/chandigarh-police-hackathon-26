-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Evidence" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "caseId" TEXT NOT NULL,
    "sha256" TEXT NOT NULL,
    "phash" TEXT,
    "filePath" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "uploadedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "uploadedById" TEXT NOT NULL,
    "deviceIdentifier" TEXT,
    "casePropertyNumber" TEXT,
    "retentionUntil" DATETIME,
    "legalHold" BOOLEAN NOT NULL DEFAULT false,
    "declarantName" TEXT,
    "declarantRole" TEXT,
    "declarantOrg" TEXT,
    "courtDirectionRef" TEXT,
    "derivedFromEvidenceId" TEXT,
    "derivedAtTimestampSeconds" REAL,
    CONSTRAINT "Evidence_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Evidence_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Evidence_derivedFromEvidenceId_fkey" FOREIGN KEY ("derivedFromEvidenceId") REFERENCES "Evidence" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Evidence" ("caseId", "casePropertyNumber", "courtDirectionRef", "declarantName", "declarantOrg", "declarantRole", "derivedAtTimestampSeconds", "derivedFromEvidenceId", "deviceIdentifier", "filePath", "id", "mimeType", "phash", "sha256", "uploadedAt", "uploadedById") SELECT "caseId", "casePropertyNumber", "courtDirectionRef", "declarantName", "declarantOrg", "declarantRole", "derivedAtTimestampSeconds", "derivedFromEvidenceId", "deviceIdentifier", "filePath", "id", "mimeType", "phash", "sha256", "uploadedAt", "uploadedById" FROM "Evidence";
DROP TABLE "Evidence";
ALTER TABLE "new_Evidence" RENAME TO "Evidence";
CREATE INDEX "Evidence_caseId_idx" ON "Evidence"("caseId");
CREATE INDEX "Evidence_sha256_idx" ON "Evidence"("sha256");
CREATE INDEX "Evidence_phash_idx" ON "Evidence"("phash");
CREATE INDEX "Evidence_derivedFromEvidenceId_idx" ON "Evidence"("derivedFromEvidenceId");
CREATE UNIQUE INDEX "Evidence_caseId_sha256_key" ON "Evidence"("caseId", "sha256");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
