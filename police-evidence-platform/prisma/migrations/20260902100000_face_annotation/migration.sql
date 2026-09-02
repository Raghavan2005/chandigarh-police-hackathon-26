-- CreateTable
CREATE TABLE "FaceAnnotation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "evidenceId" TEXT NOT NULL,
    "faceIndex" INTEGER NOT NULL,
    "label" TEXT,
    "reverseSearchJson" TEXT,
    "reverseSearchRanAt" DATETIME,
    "descriptionJson" TEXT,
    "descriptionRanAt" DATETIME,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "FaceAnnotation_evidenceId_fkey" FOREIGN KEY ("evidenceId") REFERENCES "Evidence" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "FaceAnnotation_evidenceId_faceIndex_key" ON "FaceAnnotation"("evidenceId", "faceIndex");
