import type { AuditEvent } from "@prisma/client";

export type DetectionLabel =
  | "Impossible travel"
  | "Privilege escalation"
  | "Repeated auth failures"
  | "Large export"
  | "Unauthorized service access"
  | "Suspicious activity";

export function getDetectionLabels(event: AuditEvent): DetectionLabel[] {
  const labels: DetectionLabel[] = [];

  const action = event.action.toLowerCase();
  const reason = event.reason?.toLowerCase() ?? "";
  const actorType = event.actorType.toLowerCase();
  const location = event.location?.toLowerCase() ?? "";

  if (
    reason.includes("impossible travel") ||
    location.includes("bucharest")
  ) {
    labels.push("Impossible travel");
  }

  if (
    action.includes("privilege_change") ||
    reason.includes("privilege escalation")
  ) {
    labels.push("Privilege escalation");
  }

  if (
    action.includes("login_failure") &&
    reason.includes("attempt")
  ) {
    labels.push("Repeated auth failures");
  }

  if (
    action.includes("bulk_export") ||
    reason.includes("large export")
  ) {
    labels.push("Large export");
  }

  if (
    actorType === "service_account" &&
    (action.includes("access_denied") ||
      reason.includes("unauthorized"))
  ) {
    labels.push("Unauthorized service access");
  }

  if (labels.length === 0 && event.flagged) {
    labels.push("Suspicious activity");
  }

  return labels;
}