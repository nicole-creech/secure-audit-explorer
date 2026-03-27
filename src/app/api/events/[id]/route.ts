import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const body = await request.json();
    const { status, tags, relatedEventIds } = body;

    // Build update data
    const data: any = {};
    if (status) data.status = status;
    if (tags) data.tags = JSON.stringify(tags);
    // For related events, set both sides of the relation
    let updated;
    if (Array.isArray(relatedEventIds)) {
      updated = await prisma.auditEvent.update({
        where: { id },
        data: {
          ...data,
          relatedEvents: {
            set: relatedEventIds.map((rid: string) => ({ id: rid })),
          },
        },
        include: { relatedEvents: true },
      });
    } else {
      updated = await prisma.auditEvent.update({
        where: { id },
        data,
      });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating event:", error);
    return NextResponse.json({ error: "Failed to update event" }, { status: 500 });
  }
}
