import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { processEventWithRules } from "@/lib/rules";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      timestamp,
      actor,
      actorType,
      action,
      resource,
      resourceType,
      ipAddress,
      location,
      userAgent,
      severity,
      status,
      outcome,
      riskScore,
      flagged,
      reason,
      metadata,
    } = body;

    if (!actor || !action || !resource) {
      return NextResponse.json(
        { error: "Missing required fields: actor, action, resource" },
        { status: 400 }
      );
    }

    const event = await prisma.auditEvent.create({
      data: {
        timestamp: timestamp ? new Date(timestamp) : new Date(),
        actor,
        actorType: actorType || "unknown",
        action,
        resource,
        resourceType: resourceType || "unknown",
        ipAddress: ipAddress || "",
        location,
        userAgent,
        severity: severity || "low",
        status: status || "open",
        outcome: outcome || "unknown",
        riskScore: riskScore || 0,
        flagged: flagged || false,
        reason,
        metadata: metadata ? JSON.stringify(metadata) : null,
      },
    });

    // Process rules for the new event
    await processEventWithRules(event);

    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    console.error("Error creating event:", error);
    return NextResponse.json(
      { error: "Failed to create event" },
      { status: 500 }
    );
  }
}