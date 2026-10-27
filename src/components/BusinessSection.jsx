
import { useEffect, useState } from "react";
import SearchForm from "./SearchForm";
import BusinessTable from "./BusinessTable";
import WebsiteDeploymentStatus from "./WebsiteDeploymentStatus";

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api"
).replace(/\/+$/, "");

export default function BusinessSection({
  search,
  setSearch,
  loading,
  businesses,
  notice,
  error,
  onSearch,
  onClearSearch,
  page,
  limit,
  total,
  totalPages,
  onPrevious,
  onNext,
}) {
  const [selectedBusinessId, setSelectedBusinessId] = useState("");
  const [websites, setWebsites] = useState([]);
  const [selectedWebsiteId, setSelectedWebsiteId] = useState("");
  const [websitesLoading, setWebsitesLoading] = useState(false);
  const [websiteError, setWebsiteError] = useState("");

  useEffect(() => {
    if (!selectedBusinessId) {
      setWebsites([]);
      setSelectedWebsiteId("");
      setWebsiteError("");
      return;
    }

    const controller = new AbortController();

    async function loadWebsites() {
      try {
        setWebsitesLoading(true);
        setWebsiteError("");
        setWebsites([]);
        setSelectedWebsiteId("");

        const response = await fetch(
          `${API_BASE_URL}/websites/businesses/${encodeURIComponent(
            selectedBusinessId
          )}`,
          { signal: controller.signal }
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(
            data.message || "Failed to load generated websites."
          );
        }

        const items = data.websites || [];
        setWebsites(items);

        if (items.length > 0) {
          setSelectedWebsiteId(items[0].id);
        }
      } catch (err) {
        if (err.name !== "AbortError") {
          setWebsiteError(
            err.message || "Could not load generated websites."
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setWebsitesLoading(false);
        }
      }
    }

    loadWebsites();

    return () => controller.abort();
  }, [selectedBusinessId]);

  return (
    <section className="business-section">
      <h2>Stored businesses</h2>

      <SearchForm
        search={search}
        setSearch={setSearch}
        loading={loading}
        onSearch={onSearch}
        onClear={onClearSearch}
      />

      {notice && <p className="success-message">{notice}</p>}
      {error && <p className="error-message">{error}</p>}

      <BusinessTable
        businesses={businesses}
        loading={loading}
        page={page}
        limit={limit}
        total={total}
        totalPages={totalPages}
        onPrevious={onPrevious}
        onNext={onNext}
      />

      <p className="footer-note">
        Showing up to {limit} businesses, with the latest research and report
        record for each business.
      </p>

      <section className="website-tracking-section">
        <h2>Generated Website Deployment</h2>
        <p>
          Select a stored business to view its generated websites and deployment
          status.
        </p>

        <label htmlFor="deployment-business">
          Select business
        </label>

        <select
          id="deployment-business"
          value={selectedBusinessId}
          onChange={(event) =>
            setSelectedBusinessId(event.target.value)
          }
          disabled={businesses.length === 0 || websitesLoading}
        >
          <option value="">Choose a business</option>

          {businesses.map((business) => (
            <option key={business.id} value={business.id}>
              {business.name}
              {business.city ? ` — ${business.city}` : ""}
            </option>
          ))}
        </select>

        {websitesLoading && <p>Loading generated websites...</p>}

        {websiteError && (
          <p className="error-message">{websiteError}</p>
        )}

        {!websitesLoading &&
          selectedBusinessId &&
          !websiteError &&
          websites.length === 0 && (
            <p>
              No generated websites found for this business yet.
            </p>
          )}

        {websites.length > 0 && (
          <>
            <label htmlFor="generated-website">
              Select generated website
            </label>

            <select
              id="generated-website"
              value={selectedWebsiteId}
              onChange={(event) =>
                setSelectedWebsiteId(event.target.value)
              }
            >
              {websites.map((website) => (
                <option key={website.id} value={website.id}>
                  {website.id} — {website.status}
                </option>
              ))}
            </select>

            {selectedWebsiteId && (
              <WebsiteDeploymentStatus
                key={selectedWebsiteId}
                websiteId={selectedWebsiteId}
              />
            )}
          </>
        )}
      </section>
    </section>
  );
}
