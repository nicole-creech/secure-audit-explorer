import { prisma } from "./prisma";

export interface NotificationData {
  alertKey: string;
  type: string;
  title: string;
  message: string;
  severity: "low" | "medium" | "high" | "critical";
  recipients: string[];
  channels: string[];
  metadata?: Record<string, unknown>;
}

export async function createNotificationRecord(notification: NotificationData) {
  try {
    console.log("📧 Creating notification record:", notification);
    const record = await prisma.notification.create({
      data: {
        alertKey: notification.alertKey,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        severity: notification.severity,
        recipients: JSON.stringify(notification.recipients),
        channels: JSON.stringify(notification.channels),
        metadata: notification.metadata ? JSON.stringify(notification.metadata) : null,
        sentAt: new Date(),
      },
    });

    console.log("✅ Notification record created:", record.id);
    return record;
  } catch (error) {
    console.error("Failed to create notification record:", error);
    throw error;
  }
}

export async function getNotificationsForAlert(alertKey: string) {
  try {
    return await prisma.notification.findMany({
      where: { alertKey },
      orderBy: { sentAt: "desc" },
    });
  } catch (error) {
    console.error("Failed to fetch notifications:", error);
    return [];
  }
}

export async function getRecentNotifications(limit: number = 50) {
  try {
    return await prisma.notification.findMany({
      orderBy: { sentAt: "desc" },
      take: limit,
    });
  } catch (error) {
    console.error("Failed to fetch recent notifications:", error);
    return [];
  }
}