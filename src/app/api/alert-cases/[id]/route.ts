import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authorize } from "@/lib/authz";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await authorize("investigate");
  if (auth.error) return auth.error;

  const { id } = await params;
  try {
    const body = await request.json();
    const { status, owner, disposition } = body;

    const isOptionalText = (v: unknown, max: number) =>
      v === undefined || v === null || (typeof v === "string" && v.length <= max);

    if (!isOptionalText(status, 50) || !isOptionalText(owner, 200) || !isOptionalText(disposition, 500)) {
      return NextResponse.json({ error: "Invalid alert case fields." }, { status: 400 });
    }

    const alertCase = await prisma.alertCase.update({
      where: { id },
      data: {
        status,
        owner,
        disposition,
      },
    });

    return NextResponse.json(alertCase);
  } catch (error) {
    console.error("Error updating alert case:", error);
    return NextResponse.json(
      { error: "Failed to update alert case" },
      { status: 500 }
    );
  }
}