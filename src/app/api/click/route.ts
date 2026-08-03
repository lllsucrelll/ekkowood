import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const clickSchema = z.object({
  merchantId: z.string().min(1),
  buttonId: z.string().min(1),
  buttonLabel: z.string().min(1),
  buttonType: z.string().min(1),
});

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const parsed = clickSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const { merchantId, buttonId, buttonLabel, buttonType } = parsed.data;

  // Best-effort tracking: an invalid/deleted merchantId shouldn't error out
  // the visitor's click, and we intentionally store no IP/visitor identifier.
  await prisma.buttonClick
    .create({ data: { merchantId, buttonId, buttonLabel, buttonType } })
    .catch(() => undefined);

  return NextResponse.json({ ok: true });
}
