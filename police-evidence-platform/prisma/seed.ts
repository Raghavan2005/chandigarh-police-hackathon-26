import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

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
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
