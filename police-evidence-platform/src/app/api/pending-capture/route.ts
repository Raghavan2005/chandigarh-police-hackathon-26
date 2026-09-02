import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sha256Hex, writePendingCaptureFile } from "@/lib/storage";

/**
 * Public — no requireSession(), no token. This is the write side of the
 * "tablet photo → New Case form" flow (see PendingCapture schema comment):
 * there's no case yet at this point to scope an auth token to, and the
 * team explicitly asked for this to be a fixed, always-open URL rather
 * than a per-session link. Known, accepted limitation for a
 * controlled-network hackathon demo: anyone reachable on that network can
 * POST a photo here. The read side (latest/consume) stays authenticated.
 */
export async function POST(request: NextRequest) {
  const formData = await request.formData().catch(() => null);
  const file = formData?.get("file");
  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "A file is required (multipart field 'file')." }, { status: 400 });
  }
  if (file.size === 0) {
    return NextResponse.json({ error: "Uploaded file is empty." }, { status: 400 });
  }

  const mimeType = file.type || "application/octet-stream";
  if (!mimeType.startsWith("image/")) {
    return NextResponse.json({ error: "Only photo capture is supported here." }, { status: 422 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const sha256 = sha256Hex(buffer);

  const existing = await db.pendingCapture.findUnique({ where: { sha256 } });
  if (existing) {
    return NextResponse.json({ id: existing.id }, { status: 200 });
  }

  const filePath = writePendingCaptureFile(sha256, mimeType, buffer);
  const created = await db.pendingCapture.create({
    data: { sha256, filePath, mimeType },
  });

  return NextResponse.json({ id: created.id }, { status: 201 });
}
