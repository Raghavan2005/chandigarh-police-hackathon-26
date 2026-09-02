-- AlterTable
ALTER TABLE "Case" ADD COLUMN "accusedDetails" TEXT;
ALTER TABLE "Case" ADD COLUMN "complainantContact" TEXT;
ALTER TABLE "Case" ADD COLUMN "complainantName" TEXT;
ALTER TABLE "Case" ADD COLUMN "courtJurisdiction" TEXT;
ALTER TABLE "Case" ADD COLUMN "dispatchNumber" TEXT;
ALTER TABLE "Case" ADD COLUMN "firDate" DATETIME;
ALTER TABLE "Case" ADD COLUMN "forwardedAt" DATETIME;
ALTER TABLE "Case" ADD COLUMN "forwardingOfficerBadgeNo" TEXT;
ALTER TABLE "Case" ADD COLUMN "forwardingOfficerName" TEXT;
ALTER TABLE "Case" ADD COLUMN "forwardingOfficerRank" TEXT;
ALTER TABLE "Case" ADD COLUMN "forwardingRemarks" TEXT;
ALTER TABLE "Case" ADD COLUMN "gdEntryNumber" TEXT;
ALTER TABLE "Case" ADD COLUMN "investigatorMobile" TEXT;
ALTER TABLE "Case" ADD COLUMN "offenceSections" TEXT;

-- AlterTable
ALTER TABLE "Evidence" ADD COLUMN "casePropertyNumber" TEXT;
ALTER TABLE "Evidence" ADD COLUMN "courtDirectionRef" TEXT;
ALTER TABLE "Evidence" ADD COLUMN "declarantName" TEXT;
ALTER TABLE "Evidence" ADD COLUMN "declarantOrg" TEXT;
ALTER TABLE "Evidence" ADD COLUMN "declarantRole" TEXT;

-- CreateTable
CREATE TABLE "CustodyTransfer" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "evidenceId" TEXT NOT NULL,
    "fromPerson" TEXT NOT NULL,
    "toPerson" TEXT NOT NULL,
    "purpose" TEXT NOT NULL,
    "location" TEXT,
    "occurredAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "witness1Name" TEXT,
    "witness1Address" TEXT,
    "witness2Name" TEXT,
    "witness2Address" TEXT,
    "recordedById" TEXT NOT NULL,
    "recordedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CustodyTransfer_evidenceId_fkey" FOREIGN KEY ("evidenceId") REFERENCES "Evidence" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "CustodyTransfer_recordedById_fkey" FOREIGN KEY ("recordedById") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "CustodyTransfer_evidenceId_idx" ON "CustodyTransfer"("evidenceId");
