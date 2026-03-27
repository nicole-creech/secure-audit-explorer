"use client";

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
          timeWindow: formData.timeWindow ? parseInt(formData.timeWindow) : null,
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    });
  };

  if (fetchLoading) {
    return <div className="p-6">Loading rule...</div>;
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <Link
          href="/rules"
          className="text-blue-600 hover:text-blue-800 mb-2 inline-block"
        >
          ← Back to Rules
        </Link>
        <h1 className="text-2xl font-bold">Edit Detection Rule</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Rule Name
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            name="enabled"
            checked={formData.enabled}
            onChange={handleChange}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label className="ml-2 block text-sm text-gray-900">
            Rule Enabled
          </label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Field
            </label>
            <select
              name="field"
              value={formData.field}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Operator
            </label>
            <select
              name="operator"
              value={formData.operator}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Value
            </label>
            <input
              type="text"
              name="value"
              value={formData.value}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Time Window (minutes, optional)
          </label>
          <input
            type="number"
            name="timeWindow"
            value={formData.timeWindow}
            onChange={handleChange}
            min="1"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Severity
          </label>
          <select
            name="severity"
            value={formData.severity}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Updating..." : "Update Rule"}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="bg-gray-300 text-gray-700 px-6 py-2 rounded hover:bg-gray-400"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}