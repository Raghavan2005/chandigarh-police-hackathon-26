-- AlterTable
ALTER TABLE "AuditLogEntry" ADD COLUMN "ipAddress" TEXT;

-- AlterTable
ALTER TABLE "MetadataResult" ADD COLUMN "gpsLatitude" REAL;
ALTER TABLE "MetadataResult" ADD COLUMN "gpsLongitude" REAL;
