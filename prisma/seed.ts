import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.analystNote.deleteMany();
  await prisma.alertCase.deleteMany();
  await prisma.detectionRule.deleteMany();
  await prisma.auditEvent.deleteMany();

  // Detection rules
  await prisma.detectionRule.createMany({
    data: [
      {
        name: "Suspicious Access",
        description: "Alert on suspicious resource access",
        field: "resource",
        operator: "contains",
        value: "admin",
        severity: "high",
      },
      {
        name: "Impossible Travel",
        description: "Alert on impossible travel login attempts",
        field: "location",
        operator: "impossible_travel",
        value: "true",
        severity: "critical",
      },
      {
        name: "Bulk Export",
        description: "Alert on large data exports",
        field: "action",
        operator: "=",
        value: "bulk_export",
        severity: "high",
      },
    ],
  });

  // Alert cases
  await prisma.alertCase.createMany({
    data: [
      {
        alertKey: "case-001",
        title: "Suspicious Admin Access",
        actor: "ncreech",
        detectionType: "Suspicious Access",
        status: "open",
        owner: "analyst1",
        disposition: null,
      },
      {
        alertKey: "case-002",
        title: "Impossible Travel Login",
        actor: "ncreech",
        detectionType: "Impossible Travel",
        status: "open",
        owner: "analyst2",
        disposition: null,
      },
    ],
  });

  await prisma.auditEvent.createMany({
    data: [
      {
        timestamp: new Date("2026-03-25T08:15:00Z"),
        actor: "ncreech",
        actorType: "employee",
        action: "login_success",
        resource: "Okta",
        resourceType: "identity_provider",
        ipAddress: "73.21.144.18",
        location: "Columbus, OH, US",
        userAgent: "Chrome on Windows 11",
        severity: "low",
        status: "closed",
        outcome: "success",
        riskScore: 12,
        flagged: false,
        reason: null,
        metadata: JSON.stringify({ mfa: true }),
      },
      {
        timestamp: new Date("2026-03-25T08:22:00Z"),
        actor: "ncreech",
        actorType: "employee",
        action: "privilege_change",
        resource: "AWS IAM",
        resourceType: "cloud_identity",
        ipAddress: "73.21.144.18",
        location: "Columbus, OH, US",
        userAgent: "Chrome on Windows 11",
        severity: "high",
        status: "open",
        outcome: "success",
        riskScore: 88,
        flagged: true,
        reason: "Privilege escalation detected outside normal change window",
        metadata: JSON.stringify({ role: "AdminTemporaryAccess" }),
      },
      {
        timestamp: new Date("2026-03-25T09:05:00Z"),
        actor: "svc-batch-prod",
        actorType: "service_account",
        action: "bulk_export",
        resource: "CustomerDataWarehouse",
        resourceType: "database",
        ipAddress: "10.24.18.9",
        location: "Internal VPC",
        userAgent: "Python SDK",
        severity: "medium",
        status: "investigating",
        outcome: "success",
        riskScore: 67,
        flagged: true,
        reason: "Large export volume above baseline",
        metadata: JSON.stringify({ rowsExported: 125004 }),
      },
      {
        timestamp: new Date("2026-03-25T10:10:00Z"),
        actor: "vendor_integration",
        actorType: "third_party",
        action: "api_token_failure",
        resource: "Payments API",
        resourceType: "api",
        ipAddress: "44.211.90.13",
        location: "Ashburn, VA, US",
        userAgent: "PostmanRuntime/7.43.0",
        severity: "medium",
        status: "closed",
        outcome: "failure",
        riskScore: 43,
        flagged: false,
        reason: null,
        metadata: JSON.stringify({ attempts: 3 }),
      },
      {
        timestamp: new Date("2026-03-25T23:42:00Z"),
        actor: "ncreech",
        actorType: "employee",
        action: "login_failure",
        resource: "VPN Gateway",
        resourceType: "network_access",
        ipAddress: "185.193.88.24",
        location: "Bucharest, RO",
        userAgent: "Unknown Linux Client",
        severity: "critical",
        status: "open",
        outcome: "failure",
        riskScore: 97,
        flagged: true,
        reason: "Impossible travel and suspicious geo for user",
        metadata: JSON.stringify({ attempts: 7 }),
      },
      {
        timestamp: new Date("2026-03-26T00:03:00Z"),
        actor: "db-admin",
        actorType: "employee",
        action: "schema_change",
        resource: "AccountsDB",
        resourceType: "database",
        ipAddress: "10.10.4.12",
        location: "Internal Network",
        userAgent: "DBeaver",
        severity: "medium",
        status: "open",
        outcome: "success",
        riskScore: 59,
        flagged: false,
        reason: null,
        metadata: JSON.stringify({ changeType: "add_index" }),
      },
      {
        timestamp: new Date("2026-03-26T01:18:00Z"),
        actor: "hr-portal-app",
        actorType: "service_account",
        action: "access_denied",
        resource: "PayrollRecords",
        resourceType: "internal_app",
        ipAddress: "10.18.2.44",
        location: "Internal Kubernetes Cluster",
        userAgent: "Node Fetch",
        severity: "high",
        status: "investigating",
        outcome: "failure",
        riskScore: 76,
        flagged: true,
        reason: "Service attempted unauthorized payroll access",
        metadata: JSON.stringify({ namespace: "hr-prod" }),
      },
      {
        timestamp: new Date("2026-03-26T02:30:00Z"),
        actor: "security-automation",
        actorType: "service_account",
        action: "token_revoked",
        resource: "GitHub Enterprise",
        resourceType: "source_control",
        ipAddress: "10.2.3.15",
        location: "Internal Automation Runner",
        userAgent: "Go-http-client/1.1",
        severity: "low",
        status: "closed",
        outcome: "success",
        riskScore: 18,
        flagged: false,
        reason: null,
        metadata: JSON.stringify({ tokenOwner: "former_contractor" }),
      },
    ],
  });

  const count = await prisma.auditEvent.count();
  console.log(`Seed complete: ${count} audit events inserted`);
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });