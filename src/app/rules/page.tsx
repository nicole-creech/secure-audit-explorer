"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

type DetectionRule = {
  id: string;
  name: string;
  description: string | null;
  enabled: boolean;
  field: string;
  operator: string;
  value: string;
  timeWindow: number | null;
  severity: string;
  createdAt: string;
};

export default function RulesPage() {
  const [rules, setRules] = useState<DetectionRule[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRules();
  }, []);

  const fetchRules = async () => {
    try {
      const response = await fetch("/api/rules");
      if (response.ok) {
        const data = await response.json();
        setRules(data);
      }
    } catch (error) {
      console.error("Error fetching rules:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleRule = async (ruleId: string, enabled: boolean) => {
    try {
      const response = await fetch(`/api/rules/${ruleId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: !enabled }),
      });

      if (response.ok) {
        setRules(rules.map(rule =>
          rule.id === ruleId ? { ...rule, enabled: !enabled } : rule
        ));
      }
    } catch (error) {
      console.error("Error toggling rule:", error);
    }
  };

  const deleteRule = async (ruleId: string) => {
    if (!confirm("Are you sure you want to delete this rule?")) return;

    try {
      const response = await fetch(`/api/rules/${ruleId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setRules(rules.filter(rule => rule.id !== ruleId));
      }
    } catch (error) {
      console.error("Error deleting rule:", error);
    }
  };

  if (loading) {
    return <div className="p-6">Loading rules...</div>;
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
          <h1 className="text-2xl font-bold">Detection Rules</h1>
        </div>
        <Link
          href="/rules/new"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Create Rule
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Condition
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Severity
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {rules.map((rule) => (
              <tr key={rule.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {rule.name}
                    </div>
                    {rule.description && (
                      <div className="text-sm text-gray-500">
                        {rule.description}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {rule.field} {rule.operator} {rule.value}
                  {rule.timeWindow && (
                    <span className="text-gray-500 ml-2">
                      (within {rule.timeWindow} minutes)
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    rule.severity === 'critical' ? 'bg-red-100 text-red-800' :
                    rule.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                    rule.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {rule.severity}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => toggleRule(rule.id, rule.enabled)}
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      rule.enabled
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {rule.enabled ? 'Enabled' : 'Disabled'}
                  </button>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <Link
                    href={`/rules/${rule.id}/edit`}
                    className="text-indigo-600 hover:text-indigo-900 mr-4"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => deleteRule(rule.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {rules.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No rules created yet.</p>
            <Link
              href="/rules/new"
              className="text-blue-600 hover:text-blue-800 mt-2 inline-block"
            >
              Create your first rule
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}