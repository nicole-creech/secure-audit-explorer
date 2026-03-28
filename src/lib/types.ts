export type AuditEventView = {
  id: string;
  timestamp: string;
  actor: string;
  actorType: string;
  action: string;
  resource: string;
  resourceType: string;
  ipAddress: string;
  location: string | null;
  userAgent: string | null;
  severity: string;
  status: string;
  outcome: string;
  riskScore: number;
  flagged: boolean;
  reason: string | null;
  metadata: string | null;
  tags: string | null;
  createdAt: string;
};

export type AlertRequestBody = {
  alertKey: string;
  title: string;
  actor: string;
  detectionType: string;
  priority?: "low" | "medium" | "high" | "critical";
  eventCount?: number;
  sourceEventIds?: string[];
  owner?: string;
  disposition?: string;
  status?: string;
};