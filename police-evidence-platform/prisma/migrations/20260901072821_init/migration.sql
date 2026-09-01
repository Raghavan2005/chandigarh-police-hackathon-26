-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Case" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "firNumber" TEXT NOT NULL,
    "policeStation" TEXT NOT NULL,
    "district" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT,
    "evidenceKind" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'new',
    "sensitivityLevel" TEXT NOT NULL DEFAULT 'standard',
    "openedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "investigatorId" TEXT NOT NULL,
    "investigatorRank" TEXT,
    "investigatorBadgeNo" TEXT,
    CONSTRAINT "Case_investigatorId_fkey" FOREIGN KEY ("investigatorId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Evidence" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "caseId" TEXT NOT NULL,
    "sha256" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "uploadedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "uploadedById" TEXT NOT NULL,
    "deviceIdentifier" TEXT,
    CONSTRAINT "Evidence_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Evidence_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MetadataResult" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "evidenceId" TEXT NOT NULL,
    "container" TEXT,
    "resolution" TEXT,
    "duration" TEXT,
    "codec" TEXT,
    "encoderSignature" TEXT,
    "exifJson" TEXT,
    CONSTRAINT "MetadataResult_evidenceId_fkey" FOREIGN KEY ("evidenceId") REFERENCES "Evidence" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DetectionResult" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "evidenceId" TEXT NOT NULL,
    "manipulationProbability" REAL NOT NULL,
    "heatmapPath" TEXT,
    "modelName" TEXT NOT NULL,
    "modelVersion" TEXT NOT NULL,
    "ranAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "DetectionResult_evidenceId_fkey" FOREIGN KEY ("evidenceId") REFERENCES "Evidence" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ProvenanceResult" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "evidenceId" TEXT NOT NULL,
    "c2paPresent" BOOLEAN NOT NULL DEFAULT false,
    "c2paValid" BOOLEAN NOT NULL DEFAULT false,
    "manifestJson" TEXT,
    CONSTRAINT "ProvenanceResult_evidenceId_fkey" FOREIGN KEY ("evidenceId") REFERENCES "Evidence" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ForensicExpert" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "evidenceId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "designation" TEXT NOT NULL,
    "labRef" TEXT NOT NULL,
    CONSTRAINT "ForensicExpert_evidenceId_fkey" FOREIGN KEY ("evidenceId") REFERENCES "Evidence" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CorpusItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sourcePlatform" TEXT NOT NULL,
    "sourceUrl" TEXT NOT NULL,
    "firstSeenAt" DATETIME NOT NULL,
    "sha256" TEXT NOT NULL,
    "phash" TEXT NOT NULL,
    "thumbnailPath" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "CorpusMatch" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "evidenceId" TEXT NOT NULL,
    "corpusItemId" TEXT NOT NULL,
    "similarity" REAL NOT NULL,
    "hammingDistance" INTEGER NOT NULL,
    CONSTRAINT "CorpusMatch_evidenceId_fkey" FOREIGN KEY ("evidenceId") REFERENCES "Evidence" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "CorpusMatch_corpusItemId_fkey" FOREIGN KEY ("corpusItemId") REFERENCES "CorpusItem" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "EvidenceMatch" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "evidenceId" TEXT NOT NULL,
    "matchedEvidenceId" TEXT NOT NULL,
    "matchedCaseId" TEXT NOT NULL,
    "matchType" TEXT NOT NULL,
    "similarity" REAL NOT NULL,
    "hammingDistance" INTEGER NOT NULL,
    CONSTRAINT "EvidenceMatch_evidenceId_fkey" FOREIGN KEY ("evidenceId") REFERENCES "Evidence" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "EvidenceMatch_matchedEvidenceId_fkey" FOREIGN KEY ("matchedEvidenceId") REFERENCES "Evidence" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PropagationEdge" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "caseId" TEXT NOT NULL,
    "fromCorpusItemId" TEXT NOT NULL,
    "toCorpusItemId" TEXT NOT NULL,
    "timeDeltaLabel" TEXT NOT NULL,
    CONSTRAINT "PropagationEdge_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "PropagationEdge_fromCorpusItemId_fkey" FOREIGN KEY ("fromCorpusItemId") REFERENCES "CorpusItem" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "PropagationEdge_toCorpusItemId_fkey" FOREIGN KEY ("toCorpusItemId") REFERENCES "CorpusItem" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "FusionVerdict" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "evidenceId" TEXT NOT NULL,
    "verdict" TEXT NOT NULL,
    "confidence" INTEGER NOT NULL,
    "coverageCount" INTEGER NOT NULL,
    "confidenceCeiling" INTEGER NOT NULL,
    "explanation" TEXT NOT NULL,
    "signalBreakdownJson" TEXT NOT NULL,
    "computedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "FusionVerdict_evidenceId_fkey" FOREIGN KEY ("evidenceId") REFERENCES "Evidence" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "VerdictOverride" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "evidenceId" TEXT NOT NULL,
    "overriddenById" TEXT NOT NULL,
    "previousVerdict" TEXT NOT NULL,
    "newVerdict" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "VerdictOverride_evidenceId_fkey" FOREIGN KEY ("evidenceId") REFERENCES "Evidence" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "VerdictOverride_overriddenById_fkey" FOREIGN KEY ("overriddenById") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AuditLogEntry" (
    "id" TEXT NOT NULL PRIMARY KEY,
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

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "Case_investigatorId_idx" ON "Case"("investigatorId");

-- CreateIndex
CREATE INDEX "Case_firNumber_idx" ON "Case"("firNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Evidence_sha256_key" ON "Evidence"("sha256");

-- CreateIndex
CREATE INDEX "Evidence_caseId_idx" ON "Evidence"("caseId");

-- CreateIndex
CREATE UNIQUE INDEX "MetadataResult_evidenceId_key" ON "MetadataResult"("evidenceId");

-- CreateIndex
CREATE UNIQUE INDEX "DetectionResult_evidenceId_key" ON "DetectionResult"("evidenceId");

-- CreateIndex
CREATE UNIQUE INDEX "ProvenanceResult_evidenceId_key" ON "ProvenanceResult"("evidenceId");

-- CreateIndex
CREATE UNIQUE INDEX "ForensicExpert_evidenceId_key" ON "ForensicExpert"("evidenceId");

-- CreateIndex
CREATE UNIQUE INDEX "CorpusItem_sha256_key" ON "CorpusItem"("sha256");

-- CreateIndex
CREATE INDEX "CorpusMatch_evidenceId_idx" ON "CorpusMatch"("evidenceId");

-- CreateIndex
CREATE INDEX "CorpusMatch_corpusItemId_idx" ON "CorpusMatch"("corpusItemId");

-- CreateIndex
CREATE INDEX "EvidenceMatch_evidenceId_idx" ON "EvidenceMatch"("evidenceId");

-- CreateIndex
CREATE INDEX "EvidenceMatch_matchedCaseId_idx" ON "EvidenceMatch"("matchedCaseId");

-- CreateIndex
CREATE INDEX "PropagationEdge_caseId_idx" ON "PropagationEdge"("caseId");

-- CreateIndex
CREATE UNIQUE INDEX "FusionVerdict_evidenceId_key" ON "FusionVerdict"("evidenceId");

-- CreateIndex
CREATE INDEX "VerdictOverride_evidenceId_idx" ON "VerdictOverride"("evidenceId");

-- CreateIndex
CREATE UNIQUE INDEX "AuditLogEntry_entryHash_key" ON "AuditLogEntry"("entryHash");

-- CreateIndex
CREATE INDEX "AuditLogEntry_caseId_idx" ON "AuditLogEntry"("caseId");

-- CreateIndex
CREATE INDEX "AuditLogEntry_timestamp_idx" ON "AuditLogEntry"("timestamp");
