"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewRulePage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    field: "",
    operator: "",
    value: "",
    threshold: "",
    timeWindow: "",
    severity: "medium",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/rules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          threshold: formData.threshold
            ? parseInt(formData.threshold, 10)
            : null,
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
      console.error("Error creating rule:", error);
      alert("Failed to create rule");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="mx-auto max-w-2xl p-6">
      <div className="mb-6">
        <Link
          href="/rules"
          className="mb-2 inline-block text-blue-600 hover:text-blue-800"
        >
          ← Back to Rules
        </Link>
        <h1 className="text-2xl font-bold">Create Detection Rule</h1>
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
            placeholder="e.g., Failed Login Threshold"
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
            placeholder="Optional description of what this rule detects"
          />
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
              <option value="">Select field</option>
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
              <option value="">Select operator</option>
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
              placeholder="e.g., login_failure"
            />
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Threshold (optional)
          </label>
          <input
            type="number"
            name="threshold"
            value={formData.threshold}
            onChange={handleChange}
            min="1"
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., 5"
          />
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
            placeholder="e.g., 15"
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
            {loading ? "Creating..." : "Create Rule"}
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