import { useCallback, useEffect, useState } from "react";
import "./WebsiteDeploymentStatus.css";

const API_BASE =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";

const IN_PROGRESS = [
  "SUBMITTING",
  "QUEUED",
  "INITIALIZING",
  "BUILDING",
  "DEPLOYING",
];

export default function WebsiteDeploymentStatus({ websiteId }) {
  const [website, setWebsite] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const refreshStatus = useCallback(async (manual = false) => {
    if (!websiteId) return;

    if (manual) setRefreshing(true);

    try {
      setError("");

      const response = await fetch(
        `${API_BASE}/websites/${encodeURIComponent(
          websiteId
        )}/deployment-status`
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Could not load deployment status"
        );
      }

      setWebsite(result.website);
    } catch (err) {
      setError(err.message || "Failed to refresh deployment");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [websiteId]);

  useEffect(() => {
    refreshStatus();

    const timer = setInterval(() => {
      refreshStatus();
    }, 15000);

    return () => clearInterval(timer);
  }, [refreshStatus]);

  if (loading) {
    return <p>Loading deployment status...</p>;
  }

  const status = website?.deploymentStatus || "UNKNOWN";
  const inProgress = IN_PROGRESS.includes(status);

  return (
    <section className="deployment-card">
      <h3>Website Deployment</h3>

      <p>
        Status: <strong>{status}</strong>
      </p>

      {website?.vercelDeploymentId && (
        <p>
          Deployment ID:{" "}
          <code>{website.vercelDeploymentId}</code>
        </p>
      )}

      {website?.deploymentUrl && (
        <p>
          URL:{" "}
          <a
            href={website.deploymentUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            {website.deploymentUrl}
          </a>
        </p>
      )}

      {status === "DEPLOYED" && website?.deploymentUrl && (
        <a
          className="deployment-button"
          href={website.deploymentUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          Open Website Preview
        </a>
      )}

      {inProgress && (
        <p>Deployment is still processing. Status will refresh automatically.</p>
      )}

      {status === "FAILED" && (
        <p>The deployment failed. Check the deployment logs in Vercel.</p>
      )}

      {error && <p role="alert">{error}</p>}

      <button
        type="button"
        onClick={() => refreshStatus(true)}
        disabled={refreshing}
      >
        {refreshing ? "Refreshing..." : "Refresh Status"}
      </button>
    </section>
  );
}
