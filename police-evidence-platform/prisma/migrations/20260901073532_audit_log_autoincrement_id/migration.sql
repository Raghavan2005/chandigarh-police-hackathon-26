/*
  Warnings:

  - The primary key for the `AuditLogEntry` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `AuditLogEntry` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_AuditLogEntry" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "caseId" TEXT NOT NULL,
    "evidenceHash" TEXT,
    "actorId" TEXT,
    "action" TEXT NOT NULL,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "device" TEXT,
    "entryHash" TEXT NOT NULL,
    "prevEntryHash" TEXT,
    CONSTRAINT "AuditLogEntry_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "AuditLogEntry_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_AuditLogEntry" ("action", "actorId", "caseId", "device", "entryHash", "evidenceHash", "id", "prevEntryHash", "timestamp") SELECT "action", "actorId", "caseId", "device", "entryHash", "evidenceHash", "id", "prevEntryHash", "timestamp" FROM "AuditLogEntry";
DROP TABLE "AuditLogEntry";
ALTER TABLE "new_AuditLogEntry" RENAME TO "AuditLogEntry";
CREATE UNIQUE INDEX "AuditLogEntry_entryHash_key" ON "AuditLogEntry"("entryHash");
CREATE INDEX "AuditLogEntry_caseId_idx" ON "AuditLogEntry"("caseId");
CREATE INDEX "AuditLogEntry_timestamp_idx" ON "AuditLogEntry"("timestamp");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
