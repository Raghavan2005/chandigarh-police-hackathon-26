-- CreateTable
CREATE TABLE "InvestigationActor" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "investigationId" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "handle" TEXT NOT NULL,
    "note" TEXT,
    "addedById" TEXT NOT NULL,
    "addedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "removedById" TEXT,
    "removedAt" DATETIME,
    "removeReason" TEXT,
    CONSTRAINT "InvestigationActor_investigationId_fkey" FOREIGN KEY ("investigationId") REFERENCES "Investigation" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "InvestigationActor_addedById_fkey" FOREIGN KEY ("addedById") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "InvestigationActor_removedById_fkey" FOREIGN KEY ("removedById") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "InvestigationActor_investigationId_idx" ON "InvestigationActor"("investigationId");
