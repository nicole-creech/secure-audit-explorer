export type DetectionLabel =
  | "Impossible travel"
  | "Privilege escalation"
  | "Repeated auth failures"
  | "Large export"
  | "Unauthorized service access"
  | "Suspicious activity";

export type InvestigationPriority = "low" | "medium" | "high" | "critical";

type DetectionEvent = {
  action: string;
  reason: string | null;
  actorType: string;
  location: string | null;
  flagged: boolean;
  severity: string;
  status: string;
  riskScore: number;
};

export function getDetectionLabels(event: DetectionEvent): DetectionLabel[] {
  const labels: DetectionLabel[] = [];

  const action = event.action.toLowerCase();
  const reason = event.reason?.toLowerCase() ?? "";
  const actorType = event.actorType.toLowerCase();
  const location = event.location?.toLowerCase() ?? "";

  if (reason.includes("impossible travel") || location.includes("bucharest")) {
    labels.push("Impossible travel");
  }

  if (
    action.includes("privilege_change") ||
    reason.includes("privilege escalation")
  ) {
    labels.push("Privilege escalation");
  }

  if (action.includes("login_failure") && reason.includes("attempt")) {
    labels.push("Repeated auth failures");
  }

  if (action.includes("bulk_export") || reason.includes("large export")) {
    labels.push("Large export");
  }

  if (
    actorType === "service_account" &&
    (action.includes("access_denied") || reason.includes("unauthorized"))
  ) {
    labels.push("Unauthorized service access");
  }

  if (labels.length === 0 && event.flagged) {
    labels.push("Suspicious activity");
  }

  return labels;
}

export function getPriorityScore(event: DetectionEvent): number {
  const detections = getDetectionLabels(event);

  let score = event.riskScore;

  if (event.flagged) score += 10;
  if (event.severity === "critical") score += 25;
  if (event.severity === "high") score += 15;
  if (event.status === "open") score += 10;
  if (event.status === "investigating") score += 5;

  for (const detection of detections) {
    switch (detection) {
      case "Impossible travel":
        score += 30;
        break;
      case "Privilege escalation":
        score += 25;
        break;
      case "Unauthorized service access":
        score += 20;
        break;
      case "Repeated auth failures":
        score += 15;
        break;
      case "Large export":
        score += 15;
        break;
      case "Suspicious activity":
        score += 10;
        break;
    }
  }

  return Math.min(score, 100);
}

export function getInvestigationPriority(
  event: DetectionEvent
): InvestigationPriority {
  const score = getPriorityScore(event);

  if (score >= 90) return "critical";
  if (score >= 70) return "high";
  if (score >= 40) return "medium";
  return "low";
}