import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const rule = await prisma.detectionRule.findUnique({
      where: { id },
    });

    if (!rule) {
      return NextResponse.json({ error: "Rule not found" }, { status: 404 });
    }

    return NextResponse.json(rule);
  } catch (error) {
    console.error("Error fetching rule:", error);
    return NextResponse.json(
      { error: "Failed to fetch rule" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await request.json();
    const { name, description, enabled, field, operator, value, threshold, timeWindow, severity } = body;

    const rule = await prisma.detectionRule.update({
      where: { id },
      data: {
        name,
        description,
        enabled,
        field,
        operator,
        value,
        threshold: threshold ? parseInt(threshold) : null,
        timeWindow: timeWindow ? parseInt(timeWindow) : null,
        severity,
      },
    });

    return NextResponse.json(rule);
  } catch (error) {
    console.error("Error updating rule:", error);
    return NextResponse.json(
      { error: "Failed to update rule" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    await prisma.detectionRule.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting rule:", error);
    return NextResponse.json(
      { error: "Failed to delete rule" },
      { status: 500 }
    );
  }
}