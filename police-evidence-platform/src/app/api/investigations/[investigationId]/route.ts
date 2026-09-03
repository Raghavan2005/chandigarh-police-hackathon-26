import { NextResponse } from "next/server";
import { requireSession } from "@/lib/session";
import { getInvestigation } from "@/lib/investigations-server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ investigationId: string }> },
) {
  const session = await requireSession();
  if (session instanceof NextResponse) return session;

  const { investigationId } = await params;
  const investigation = await getInvestigation(investigationId);
  if (!investigation) {
    return NextResponse.json({ error: "Investigation not found." }, { status: 404 });
  }
  return NextResponse.json(investigation);
}
