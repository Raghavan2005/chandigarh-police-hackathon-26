-- AlterTable
ALTER TABLE "TranscriptResult" ADD COLUMN "hasSpeech" BOOLEAN;
ALTER TABLE "TranscriptResult" ADD COLUMN "speechRatio" REAL;
ALTER TABLE "TranscriptResult" ADD COLUMN "speechValidatedAt" DATETIME;
