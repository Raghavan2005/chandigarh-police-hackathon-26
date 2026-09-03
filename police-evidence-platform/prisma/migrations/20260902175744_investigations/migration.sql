-- CreateTable
CREATE TABLE "Investigation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "summary" TEXT,
    "status" TEXT NOT NULL DEFAULT 'open',
    "createdById" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Investigation_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "InvestigationCase" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "investigationId" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "justification" TEXT NOT NULL,
    "linkedById" TEXT NOT NULL,
    "linkedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "unlinkedById" TEXT,
    "unlinkedAt" DATETIME,
    "unlinkReason" TEXT,
    CONSTRAINT "InvestigationCase_investigationId_fkey" FOREIGN KEY ("investigationId") REFERENCES "Investigation" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "InvestigationCase_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "InvestigationCase_linkedById_fkey" FOREIGN KEY ("linkedById") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "InvestigationCase_unlinkedById_fkey" FOREIGN KEY ("unlinkedById") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "InvestigationCase_investigationId_idx" ON "InvestigationCase"("investigationId");

-- CreateIndex
CREATE INDEX "InvestigationCase_caseId_idx" ON "InvestigationCase"("caseId");

-- CreateIndex
CREATE UNIQUE INDEX "InvestigationCase_investigationId_caseId_key" ON "InvestigationCase"("investigationId", "caseId");
