import type { AuditEventView } from "@/lib/types";
import {
  getDetectionLabels,
  getInvestigationPriority,
  getPriorityScore,
} from "@/lib/detection";

export type DerivedAlert = {
  id: string;
  title: string;
  actor: string;
  severity: string;
  priority: string;
  status: "open" | "triaged" | "resolved";
  detectionType: string;
  summary: string;
  createdAt: string;
  sourceEventIds: string[];
  eventCount: number;
};

type AlertGroup = {
  actor: string;
  detectionType: string;
  events: AuditEventView[];
};

function buildAlertSummary(
  actor: string,
  detectionType: string,
  events: AuditEventView[]
) {
  const latestEvent = [...events].sort(
    (a, b) =>
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  )[0];

  const resources = Array.from(new Set(events.map((event) => event.resource)))
    .slice(0, 3)
    .join(", ");

  if (detectionType === "Repeated auth failures") {
    return `${actor} generated repeated authentication failures across ${events.length} related event${events.length === 1 ? "" : "s"}. Review login origin, credential risk, and follow-on access attempts.`;
  }

  if (detectionType === "Impossible travel") {
    return `${actor} triggered an impossible travel pattern. Validate session origin changes and recent authentication history. Latest affected resource: ${latestEvent?.resource ?? "unknown"}.`;
  }

  if (detectionType === "Privilege escalation") {
    return `${actor} performed privilege-related activity affecting ${resources || "sensitive resources"}. Confirm approval path and downstream access.`;
  }

  if (detectionType === "Large export") {
    return `${actor} appears associated with large export behavior across ${events.length} related event${events.length === 1 ? "" : "s"}. Review data handling and exfiltration risk.`;
  }

  if (detectionType === "Unauthorized service access") {
    return `${actor} accessed or attempted to access an unauthorized service. Review service authorization and recent account behavior.`;
  }

  return `${actor} triggered suspicious activity patterns requiring investigation. Review the grouped event timeline for context and follow-on actions.`;
}

function deriveAlertStatus(events: AuditEventView[]): "open" | "triaged" | "resolved" {
  const hasOpen = events.some((event) =>
    ["open", "investigating"].includes(event.status)
  );
  const allResolved = events.every((event) =>
    ["resolved", "closed"].includes(event.status)
  );

  if (allResolved) return "resolved";
  if (hasOpen) return "open";
  return "triaged";
}

function deriveAlertSeverity(events: AuditEventView[]) {
  if (events.some((event) => event.severity === "critical")) return "critical";
  if (events.some((event) => event.severity === "high")) return "high";
  if (events.some((event) => event.severity === "medium")) return "medium";
  return "low";
}

export function deriveAlerts(events: AuditEventView[]): DerivedAlert[] {
  const grouped = new Map<string, AlertGroup>();

  for (const event of events) {
    const detections = getDetectionLabels(event);

    for (const detectionType of detections) {
      const key = `${event.actor}::${detectionType}`;

      if (!grouped.has(key)) {
        grouped.set(key, {
          actor: event.actor,
          detectionType,
          events: [],
        });
      }

      grouped.get(key)!.events.push(event);
    }
  }

  const alerts: DerivedAlert[] = Array.from(grouped.values()).map((group) => {
    const sortedEvents = [...group.events].sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    const latestEvent = sortedEvents[0];
    const highestPriorityEvent = [...group.events].sort(
      (a, b) => getPriorityScore(b) - getPriorityScore(a)
    )[0];

    return {
      id: `${group.actor}-${group.detectionType}`
        .toLowerCase()
        .replace(/\s+/g, "-"),
      title: `${group.detectionType} detected`,
      actor: group.actor,
      severity: deriveAlertSeverity(group.events),
      priority: getInvestigationPriority(highestPriorityEvent),
      status: deriveAlertStatus(group.events),
      detectionType: group.detectionType,
      summary: buildAlertSummary(
        group.actor,
        group.detectionType,
        group.events
      ),
      createdAt: latestEvent.timestamp,
      sourceEventIds: group.events.map((event) => event.id),
      eventCount: group.events.length,
    };
  });

  return alerts.sort((a, b) => {
    const priorityOrder: Record<string, number> = {
      critical: 4,
      high: 3,
      medium: 2,
      low: 1,
    };

    const aPriority = priorityOrder[a.priority] ?? 0;
    const bPriority = priorityOrder[b.priority] ?? 0;

    if (bPriority !== aPriority) return bPriority - aPriority;

    return (
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  });
}