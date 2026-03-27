import type { AuditEvent, DetectionRule } from "@prisma/client";
import { prisma } from "./prisma";

export type RuleMatch = {
  rule: DetectionRule;
  event: AuditEvent;
  matched: boolean;
};

function evaluateRuleCondition(event: AuditEvent, rule: DetectionRule): boolean {
  const fieldValue = getFieldValue(event, rule.field);

  switch (rule.operator) {
    case ">":
      return Number(fieldValue) > Number(rule.value);
    case "<":
      return Number(fieldValue) < Number(rule.value);
    case ">=":
      return Number(fieldValue) >= Number(rule.value);
    case "<=":
      return Number(fieldValue) <= Number(rule.value);
    case "=":
    case "==":
      return fieldValue === rule.value;
    case "!=":
      return fieldValue !== rule.value;
    case "contains":
      return String(fieldValue).toLowerCase().includes(rule.value.toLowerCase());
    case "not_contains":
      return !String(fieldValue).toLowerCase().includes(rule.value.toLowerCase());
    case "starts_with":
      return String(fieldValue).toLowerCase().startsWith(rule.value.toLowerCase());
    case "ends_with":
      return String(fieldValue).toLowerCase().endsWith(rule.value.toLowerCase());
    default:
      return false;
  }
}

function getFieldValue(event: AuditEvent, field: string): any {
  switch (field) {
    case "action":
      return event.action;
    case "actor":
      return event.actor;
    case "actorType":
      return event.actorType;
    case "resource":
      return event.resource;
    case "resourceType":
      return event.resourceType;
    case "ipAddress":
      return event.ipAddress;
    case "location":
      return event.location;
    case "severity":
      return event.severity;
    case "status":
      return event.status;
    case "outcome":
      return event.outcome;
    case "riskScore":
      return event.riskScore;
    case "flagged":
      return event.flagged;
    case "reason":
      return event.reason;
    default:
      return null;
  }
}

async function checkTimeWindow(event: AuditEvent, rule: DetectionRule): Promise<boolean> {
  if (!rule.timeWindow || !rule.threshold) return true;

  const timeWindowStart = new Date(event.timestamp.getTime() - rule.timeWindow * 60 * 1000);

  // Build where clause for the rule condition
  const whereCondition: any = {
    actor: event.actor,
    timestamp: {
      gte: timeWindowStart,
      lte: event.timestamp,
    },
  };

  // Apply the rule field condition
  if (rule.field === "action") {
    whereCondition.action = rule.value;
  } else if (rule.field === "resource") {
    whereCondition.resource = rule.value;
  } else if (rule.field === "severity") {
    whereCondition.severity = rule.value;
  } else if (rule.field === "riskScore") {
    whereCondition.riskScore = rule.operator === ">" ? { gt: parseInt(rule.value) } :
                               rule.operator === "<" ? { lt: parseInt(rule.value) } :
                               rule.operator === ">=" ? { gte: parseInt(rule.value) } :
                               rule.operator === "<=" ? { lte: parseInt(rule.value) } :
                               rule.value;
  }
  // Add more fields as needed

  const count = await prisma.auditEvent.count({
    where: whereCondition,
  });

  return count >= rule.threshold;
}

export async function evaluateRulesForEvent(event: AuditEvent): Promise<DetectionRule[]> {
  const rules = await prisma.detectionRule.findMany({
    where: { enabled: true },
  });

  const matchedRules: DetectionRule[] = [];

  for (const rule of rules) {
    let matches = evaluateRuleCondition(event, rule);

    if (matches && rule.timeWindow) {
      matches = await checkTimeWindow(event, rule);
    }

    if (matches) {
      matchedRules.push(rule);
    }
  }

  return matchedRules;
}

export async function processEventWithRules(event: AuditEvent): Promise<void> {
  const matchedRules = await evaluateRulesForEvent(event);

  for (const rule of matchedRules) {
    // Create an alert case for each matched rule
    const alertKey = `rule-${rule.id}-${event.id}`;

    // Check if alert already exists
    const existingAlert = await prisma.alertCase.findUnique({
      where: { alertKey },
    });

    if (!existingAlert) {
      await prisma.alertCase.create({
        data: {
          alertKey,
          title: `${rule.name} - ${event.actor}`,
          actor: event.actor,
          detectionType: rule.name,
          status: "open",
          owner: null,
          disposition: null,
        },
      });

      // Trigger notification
      await triggerNotificationForRule(rule, event);
    }
  }
}

async function triggerNotificationForRule(rule: DetectionRule, event: AuditEvent): Promise<void> {
  // This would integrate with the existing notification system
  // For now, just create a notification record
  await prisma.notification.create({
    data: {
      alertKey: `rule-${rule.id}-${event.id}`,
      type: "alert_created",
      title: `Rule Alert: ${rule.name}`,
      message: `Rule "${rule.name}" triggered for actor ${event.actor} on ${event.resource}`,
      severity: rule.severity,
      recipients: JSON.stringify(["security@company.com"]), // Default recipients
      channels: JSON.stringify(["email"]),
      metadata: JSON.stringify({
        ruleId: rule.id,
        eventId: event.id,
        field: rule.field,
        operator: rule.operator,
        value: rule.value,
      }),
    },
  });
}