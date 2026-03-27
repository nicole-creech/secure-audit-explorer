"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

type AlertCase = {
  id: string;
  alertKey: string;
  title: string;
  actor: string;
  detectionType: string;
  status: string;
  owner: string | null;
  disposition: string | null;
  createdAt: string;
  updatedAt: string;
};

export default function AlertCasesPage() {
  const [alertCases, setAlertCases] = useState<AlertCase[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAlertCases();
  }, []);

  const fetchAlertCases = async () => {
    try {
      const response = await fetch("/api/alert-cases");
      if (response.ok) {
        const data = await response.json();
        setAlertCases(data);
      }
    } catch (error) {
      console.error("Error fetching alert cases:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (alertId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/alert-cases/${alertId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        setAlertCases(alertCases.map(alert =>
          alert.id === alertId ? { ...alert, status: newStatus } : alert
        ));
      }
    } catch (error) {
      console.error("Error updating alert status:", error);
    }
  };

  if (loading) {
    return <div className="p-6">Loading alert cases...</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <Link
            href="/"
            className="text-blue-600 hover:text-blue-800 mb-2 inline-block"
          >
            ← Back to Dashboard
          </Link>
          <h1 className="text-2xl font-bold">Alert Cases</h1>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Alert Key
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Title
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actor
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Detection Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {alertCases.map((alert) => (
              <tr key={alert.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                  {alert.alertKey}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {alert.title}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {alert.actor}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {alert.detectionType}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <select
                    value={alert.status}
                    onChange={(e) => updateStatus(alert.id, e.target.value)}
                    className="text-sm border border-gray-300 rounded px-2 py-1 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="open">Open</option>
                    <option value="triaged">Triaged</option>
                    <option value="resolved">Resolved</option>
                  </select>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(alert.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {alertCases.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No alert cases found.</p>
          </div>
        )}
      </div>
    </div>
  );
}