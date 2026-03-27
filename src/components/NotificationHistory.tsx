"use client";

import { useEffect, useState } from "react";

type Notification = {
  id: string;
  alertKey: string;
  type: string;
  title: string;
  message: string;
  severity: string;
  recipients: string;
  channels: string;
  metadata?: string;
  sentAt: string;
  status: string;
};

export default function NotificationHistory() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/notifications");
      if (!response.ok) {
        throw new Error("Failed to fetch notifications");
      }
      const data = await response.json();
      setNotifications(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load notifications");
    } finally {
      setIsLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical": return "text-red-400 bg-red-500/10";
      case "high": return "text-orange-400 bg-orange-500/10";
      case "medium": return "text-yellow-400 bg-yellow-500/10";
      case "low": return "text-green-400 bg-green-500/10";
      default: return "text-gray-400 bg-gray-500/10";
    }
  };

  const formatChannels = (channelsJson: string) => {
    try {
      const channels = JSON.parse(channelsJson);
      return channels.join(", ");
    } catch {
      return channelsJson;
    }
  };

  if (isLoading) {
    return (
      <div className="rounded-lg border border-slate-800 bg-slate-950 p-6">
        <p className="text-slate-400">Loading notification history...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-6">
        <p className="text-red-400">{error}</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-slate-800 bg-slate-950 p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-200">Notification History</h3>
        <div className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-1 text-sm text-slate-400">
          {notifications.length} notifications sent
        </div>
      </div>

      {notifications.length === 0 ? (
        <p className="text-slate-500">No notifications sent yet.</p>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className="rounded border border-slate-800 bg-slate-900 p-4"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h4 className="font-medium text-slate-200 mb-1">
                    {notification.title}
                  </h4>
                  <p className="text-sm text-slate-400 mb-2">
                    {notification.message}
                  </p>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${getSeverityColor(notification.severity)}`}>
                    {notification.severity}
                  </span>
                  <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                    notification.status === "sent"
                      ? "text-green-400 bg-green-500/10"
                      : "text-red-400 bg-red-500/10"
                  }`}>
                    {notification.status}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500">
                <div className="flex items-center gap-4">
                  <span>Channels: {formatChannels(notification.channels)}</span>
                  <span>Alert: {notification.alertKey}</span>
                </div>
                <span>{new Date(notification.sentAt).toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 rounded bg-slate-900/50 p-3 text-xs text-slate-500">
        <p className="font-medium mb-1">Production Integration Points:</p>
        <ul className="space-y-1">
          <li>• Email service (SendGrid, Resend, AWS SES)</li>
          <li>• Slack/Teams webhooks</li>
          <li>• SMS services (Twilio)</li>
          <li>• Custom webhook endpoints</li>
          <li>• Notification preferences per user/role</li>
        </ul>
      </div>
    </div>
  );
}