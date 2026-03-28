"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";

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
};

export default function EditRulePage() {
  const router = useRouter();
  const params = useParams();
  const ruleId = params.id as string;

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    enabled: true,
    field: "",
    operator: "",
    value: "",
    timeWindow: "",
    severity: "medium",
  });
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);

  useEffect(() => {
    fetchRule();
  }, [ruleId]);

  const fetchRule = async () => {
    try {
      const response = await fetch(`/api/rules/${ruleId}`);
      if (response.ok) {
        const rule: DetectionRule = await response.json();
        setFormData({
          name: rule.name,
          description: rule.description || "",
          enabled: rule.enabled,
          field: rule.field,
          operator: rule.operator,
          value: rule.value,
          timeWindow: rule.timeWindow?.toString() || "",
          severity: rule.severity,
        });
      } else {
        alert("Rule not found");
        router.push("/rules");
      }
    } catch (error) {
      console.error("Error fetching rule:", error);
      alert("Failed to load rule");
    } finally {
      setFetchLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`/api/rules/${ruleId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          timeWindow: formData.timeWindow
            ? parseInt(formData.timeWindow, 10)
            : null,
        }),
      });

      if (response.ok) {
        router.push("/rules");
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error("Error updating rule:", error);
      alert("Failed to update rule");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    });
  };

  if (fetchLoading) {
    return <div className="p-6">Loading rule...</div>;
  }

  return (
    <div className="mx-auto max-w-2xl p-6">
      <div className="mb-6">
        <Link
          href="/rules"
          className="mb-2 inline-block text-blue-600 hover:text-blue-800"
        >
          ← Back to Rules
        </Link>
        <h1 className="text-2xl font-bold">Edit Detection Rule</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Rule Name
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={3}
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            name="enabled"
            checked={formData.enabled}
            onChange={handleChange}
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <label className="ml-2 block text-sm text-gray-900">
            Rule Enabled
          </label>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Field
            </label>
            <select
              name="field"
              value={formData.field}
              onChange={handleChange}
              required
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="action">Action</option>
              <option value="actor">Actor</option>
              <option value="actorType">Actor Type</option>
              <option value="resource">Resource</option>
              <option value="resourceType">Resource Type</option>
              <option value="ipAddress">IP Address</option>
              <option value="severity">Severity</option>
              <option value="riskScore">Risk Score</option>
              <option value="flagged">Flagged</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Operator
            </label>
            <select
              name="operator"
              value={formData.operator}
              onChange={handleChange}
              required
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="=">Equals</option>
              <option value="!=">Not Equals</option>
              <option value=">">Greater Than</option>
              <option value="<">Less Than</option>
              <option value=">=">Greater Than or Equal</option>
              <option value="<=">Less Than or Equal</option>
              <option value="contains">Contains</option>
              <option value="not_contains">Does Not Contain</option>
              <option value="starts_with">Starts With</option>
              <option value="ends_with">Ends With</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Value
            </label>
            <input
              type="text"
              name="value"
              value={formData.value}
              onChange={handleChange}
              required
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Time Window (minutes, optional)
          </label>
          <input
            type="number"
            name="timeWindow"
            value={formData.timeWindow}
            onChange={handleChange}
            min="1"
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Severity
          </label>
          <select
            name="severity"
            value={formData.severity}
            onChange={handleChange}
            required
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="rounded bg-blue-600 px-6 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Updating..." : "Update Rule"}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded bg-gray-300 px-6 py-2 text-gray-700 hover:bg-gray-400"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}