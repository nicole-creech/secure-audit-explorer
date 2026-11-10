import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authorize } from "@/lib/authz";

export async function GET() {
  const auth = await authorize("read");
  if (auth.error) return auth.error;

  try {
    const rules = await prisma.detectionRule.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(rules);
  } catch (error) {
    console.error("Error fetching rules:", error);
    return NextResponse.json(
      { error: "Failed to fetch rules" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const auth = await authorize("manageRules");
  if (auth.error) return auth.error;

  try {
    const body = await request.json();
    const { name, description, field, operator, value, timeWindow, severity } = body;

    if (!name || !field || !operator || !value || !severity) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const rule = await prisma.detectionRule.create({
      data: {
        name,
        description,
        field,
        operator,
        value,
        timeWindow: timeWindow ? parseInt(timeWindow) : null,
        severity,
      },
    });

    return NextResponse.json(rule, { status: 201 });
  } catch (error) {
    console.error("Error creating rule:", error);
    return NextResponse.json(
      { error: "Failed to create rule" },
      { status: 500 }
    );
  }
}