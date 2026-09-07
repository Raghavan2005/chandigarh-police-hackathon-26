-- CreateTable
CREATE TABLE "CctvFrameSample" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "evidenceId" TEXT NOT NULL,
    "frameIndex" INTEGER NOT NULL,
    "timestampSeconds" REAL NOT NULL,
    "imagePath" TEXT NOT NULL,
    "ranAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CctvFrameSample_evidenceId_fkey" FOREIGN KEY ("evidenceId") REFERENCES "Evidence" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "VideoObjectDetection" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "frameSampleId" TEXT NOT NULL,
    "evidenceId" TEXT NOT NULL,
    "objectClass" TEXT NOT NULL,
    "confidence" REAL NOT NULL,
    "boundingBoxJson" TEXT NOT NULL,
    "plateText" TEXT,
    "plateConfidence" REAL,
    CONSTRAINT "VideoObjectDetection_frameSampleId_fkey" FOREIGN KEY ("frameSampleId") REFERENCES "CctvFrameSample" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "VideoObjectDetection_evidenceId_fkey" FOREIGN KEY ("evidenceId") REFERENCES "Evidence" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CctvFrameFace" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "frameSampleId" TEXT NOT NULL,
    "evidenceId" TEXT NOT NULL,
    "boundingBoxJson" TEXT NOT NULL,
    "embeddingJson" TEXT NOT NULL,
    "detectionProbability" REAL,
    CONSTRAINT "CctvFrameFace_frameSampleId_fkey" FOREIGN KEY ("frameSampleId") REFERENCES "CctvFrameSample" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "CctvFrameFace_evidenceId_fkey" FOREIGN KEY ("evidenceId") REFERENCES "Evidence" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ReferenceMatchResult" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "evidenceId" TEXT NOT NULL,
    "matchType" TEXT NOT NULL,
    "referenceLabel" TEXT NOT NULL,
    "referenceImagePath" TEXT,
    "frameIndex" INTEGER NOT NULL,
    "timestampSeconds" REAL NOT NULL,
    "similarity" REAL NOT NULL,
    "boundingBoxJson" TEXT,
    "ranAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ReferenceMatchResult_evidenceId_fkey" FOREIGN KEY ("evidenceId") REFERENCES "Evidence" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "CctvFrameSample_evidenceId_idx" ON "CctvFrameSample"("evidenceId");

-- CreateIndex
CREATE UNIQUE INDEX "CctvFrameSample_evidenceId_frameIndex_key" ON "CctvFrameSample"("evidenceId", "frameIndex");

-- CreateIndex
CREATE INDEX "VideoObjectDetection_frameSampleId_idx" ON "VideoObjectDetection"("frameSampleId");

-- CreateIndex
CREATE INDEX "VideoObjectDetection_evidenceId_idx" ON "VideoObjectDetection"("evidenceId");

-- CreateIndex
CREATE INDEX "VideoObjectDetection_evidenceId_objectClass_idx" ON "VideoObjectDetection"("evidenceId", "objectClass");

-- CreateIndex
CREATE INDEX "CctvFrameFace_frameSampleId_idx" ON "CctvFrameFace"("frameSampleId");

-- CreateIndex
CREATE INDEX "CctvFrameFace_evidenceId_idx" ON "CctvFrameFace"("evidenceId");

-- CreateIndex
CREATE INDEX "ReferenceMatchResult_evidenceId_idx" ON "ReferenceMatchResult"("evidenceId");
