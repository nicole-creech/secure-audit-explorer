import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await request.json();
    const { status, owner, disposition } = body;

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