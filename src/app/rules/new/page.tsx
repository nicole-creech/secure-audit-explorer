"use client";

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
          threshold: formData.threshold ? parseInt(formData.threshold) : null,
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
      console.error("Error creating rule:", error);
      alert("Failed to create rule");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <Link
          href="/rules"
          className="text-blue-600 hover:text-blue-800 mb-2 inline-block"
        >
          ← Back to Rules
        </Link>
        <h1 className="text-2xl font-bold">Create Detection Rule</h1>
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
            placeholder="e.g., Failed Login Threshold"
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
            placeholder="Optional description of what this rule detects"
          />
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
              placeholder="e.g., login_failure"
            />
          </div>
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
            {loading ? "Creating..." : "Create Rule"}
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