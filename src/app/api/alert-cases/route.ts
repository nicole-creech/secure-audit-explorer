import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createNotificationRecord } from "@/lib/notifications";
import type { AlertRequestBody } from "@/lib/types";

type AlertCaseData = {
  alertKey: string;
  title: string;
  actor: string;
  detectionType: string;
  status: string;
  owner?: string | null;
  disposition?: string | null;
};

export async function GET() {
  try {
    const alertCases = await prisma.alertCase.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(alertCases);
  } catch (error) {
    console.error("Error fetching alert cases:", error);
    return NextResponse.json(
      { error: "Failed to fetch alert cases" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body: AlertRequestBody = await req.json();

    const alertKey =
      typeof body.alertKey === "string" ? body.alertKey.trim().toLowerCase() : "";
    const title = typeof body.title === "string" ? body.title.trim() : "";
    const actor = typeof body.actor === "string" ? body.actor.trim() : "";
    const detectionType =
      typeof body.detectionType === "string" ? body.detectionType.trim() : "";
    const status = typeof body.status === "string" ? body.status.trim() : "open";
    const owner =
      typeof body.owner === "string" && body.owner.trim()
        ? body.owner.trim()
        : null;
    const disposition =
      typeof body.disposition === "string" && body.disposition.trim()
        ? body.disposition.trim()
        : null;

    if (!alertKey || !title || !actor || !detectionType) {
      return NextResponse.json(
        { error: "Missing required alert fields." },
        { status: 400 }
      );
    }

    const alertCase = await prisma.alertCase.upsert({
      where: { alertKey },
      update: {
        title,
        actor,
        detectionType,
        status,
        owner,
        disposition,
        updatedAt: new Date(),
      },
      create: {
        alertKey,
        title,
        actor,
        detectionType,
        status,
        owner,
        disposition,
      },
    });

    // Trigger notifications for new or high-priority alerts
    if (alertCase.status === "open" || (body.priority && ["high", "critical"].includes(body.priority))) {
      await triggerNotifications(alertCase, body);
    }

    return NextResponse.json(alertCase, { status: 200 });
  } catch (error) {
    console.error("Alert case error:", error);
    return NextResponse.json(
      { error: "Failed to persist alert case." },
      { status: 500 }
    );
  }
}

async function triggerNotifications(alertCase: AlertCaseData, alertData: AlertRequestBody) {
  try {
    // In production, this would integrate with:
    // - Email services (SendGrid, Resend, AWS SES)
    // - Webhook endpoints for external systems
    // - Slack/Teams bots
    // - SMS services (Twilio)
    // - Notification preferences from database

    console.log("🚨 ALERT NOTIFICATION:", {
      alertKey: alertCase.alertKey,
      title: alertCase.title,
      severity: alertData.priority || "medium",
      actor: alertCase.actor,
      detectionType: alertCase.detectionType,
      status: alertCase.status,
      timestamp: new Date().toISOString(),
    });

    // Simulate notification delivery with structured logging
    await createNotificationRecord({
      alertKey: alertCase.alertKey,
      type: "alert_created",
      title: `🚨 New Alert: ${alertCase.title}`,
      message: `Alert triggered for ${alertCase.actor} - ${alertCase.detectionType}`,
      severity: alertData.priority || "medium",
      recipients: ["security-team@company.com"],
      channels: ["email", "slack", "webhook"],
      metadata: {
        eventCount: alertData.eventCount || 1,
        sourceEvents: alertData.sourceEventIds || [],
      },
    });

  } catch (error) {
    console.error("Notification error:", error);
    // Don't fail the alert creation if notifications fail
  }
}