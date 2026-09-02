-- CreateTable
CREATE TABLE "ImageDescriptionResult" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "evidenceId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "possibleIdentitiesJson" TEXT NOT NULL,
    "ranAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ImageDescriptionResult_evidenceId_fkey" FOREIGN KEY ("evidenceId") REFERENCES "Evidence" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "ImageDescriptionResult_evidenceId_key" ON "ImageDescriptionResult"("evidenceId");
