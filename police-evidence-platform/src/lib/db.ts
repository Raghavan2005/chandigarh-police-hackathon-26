import { PrismaClient } from "@prisma/client";

// Standard Next.js dev-mode singleton — avoids exhausting SQLite connections
// across hot-reloads, which each create a fresh module scope otherwise.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.PRISMA_DEBUG_QUERIES ? [{ emit: "event", level: "query" }] : undefined,
  });

if (process.env.PRISMA_DEBUG_QUERIES) {
  // @ts-expect-error - event typing depends on the log config above, which is conditional
  db.$on("query", (e: { query: string; params: string }) => {
    console.log(`[PRISMA-SQL] ${e.query} -- params: ${e.params}`);
  });
}

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}
