import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { statSync, readFileSync } from "fs";
import path from "path";
import { sha256Hex } from "../src/lib/storage";
import { computePerceptualHash } from "../src/lib/perceptual-hash";

/**
 * Demo investigator accounts — dev-only credentials, printed to the console
 * on seed. There is no public sign-up (per the officer review: accounts are
 * provisioned by an administrator, matching how a real cell onboards staff).
 */
const db = new PrismaClient();

const DEMO_USERS = [
  { name: "Raghavan", email: "raghavan@chandigarhpolice.gov.in", password: "investigator123", role: "investigator" },
  { name: "N. Kaur", email: "n.kaur@chandigarhpolice.gov.in", password: "investigator123", role: "investigator" },
  { name: "A. Verma", email: "a.verma@chandigarhpolice.gov.in", password: "investigator123", role: "investigator" },
  { name: "Admin", email: "admin@chandigarhpolice.gov.in", password: "admin123", role: "admin" },
];

/**
 * Seeded corpus (CorpusItem) — PS4_MVP_BUILD_PLAN.md flags sourcing this as
 * a blocking Phase 0 decision, not something to fake: none of the actual
 * disputed media for the documented incidents (CHD-2026-00133/00134, the
 * Modi–Netanyahu case) has confirmed provenance or a computable hash (see
 * the plan's "corpus/propagation blocker" note). Per that note's option
 * (b), this uses real image files already checked into public/evidence/
 * (existing team demo assets) with real sha256/dHash computed from the
 * actual bytes — genuinely matchable, unlike a placeholder row — but
 * `sourcePlatform` says plainly that this is an illustrative demo corpus,
 * not the literal viral incident media, everywhere the UI surfaces it.
 */
const PUBLIC_EVIDENCE_DIR = path.join(process.cwd(), "public", "evidence");
const CORPUS_FILES = [
  "thumb-1011.jpg",
  "thumb-1027.jpg",
  "thumb-342.jpg",
  "case-image-evidence.jpg",
  "modi-source-x-profile.png",
  "dwivedi-03-newsonair.png",
];
const MIME_BY_EXT: Record<string, string> = { jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png" };
const CORPUS_DISCLOSURE = "Internal repository asset — illustrative demo corpus (not the literal disputed media)";

async function seedCorpus() {
  let seeded = 0;
  for (const filename of CORPUS_FILES) {
    const fullPath = path.join(PUBLIC_EVIDENCE_DIR, filename);
    const ext = filename.split(".").pop()?.toLowerCase() ?? "";
    const mimeType = MIME_BY_EXT[ext];
    if (!mimeType) {
      console.warn(`[seed] skipping ${filename} — unrecognized extension for corpus seeding`);
      continue;
    }

    const buffer = readFileSync(fullPath);
    const sha256 = sha256Hex(buffer);
    const phash = await computePerceptualHash(buffer, mimeType);
    if (!phash) {
      console.warn(`[seed] skipping ${filename} — perceptual hash could not be computed`);
      continue;
    }
    // "First seen" for a demo corpus item honestly means when this asset
    // entered the repository, not a fabricated in-the-wild sighting date.
    const firstSeenAt = statSync(fullPath).mtime;

    await db.corpusItem.upsert({
      where: { sha256 },
      update: { sourcePlatform: CORPUS_DISCLOSURE, sourceUrl: `local://evidence/${filename}`, thumbnailPath: `/evidence/${filename}`, phash, firstSeenAt },
      create: { sha256, phash, sourcePlatform: CORPUS_DISCLOSURE, sourceUrl: `local://evidence/${filename}`, thumbnailPath: `/evidence/${filename}`, firstSeenAt },
    });
    seeded++;
  }
  console.log(`Seeded ${seeded} corpus item(s) from public/evidence/ — real hashes from real files, labeled as an illustrative demo corpus per the plan's Phase 0 sourcing decision.`);
}

async function main() {
  for (const user of DEMO_USERS) {
    const passwordHash = await bcrypt.hash(user.password, 12);
    await db.user.upsert({
      where: { email: user.email },
      update: { passwordHash, name: user.name, role: user.role },
      create: { name: user.name, email: user.email, passwordHash, role: user.role },
    });
  }

  console.log(`Seeded ${DEMO_USERS.length} demo users (dev credentials — do not use in a real deployment):`);
  for (const user of DEMO_USERS) {
    console.log(`  ${user.email} / ${user.password}  (${user.role})`);
  }

  await seedCorpus();
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
