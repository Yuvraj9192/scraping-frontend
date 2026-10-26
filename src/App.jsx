import { useCallback, useEffect, useState } from "react";
import "./App.css";

const API_URL = import.meta.env.VITE_API_BASE_URL;

const DEFAULT_FILTERS = {
  city: "Panchkula",
  category: "all",
  website: "missing",
};

function Status({ value, fallback = "Not started" }) {
  const status = value || fallback;
  const className = status.toLowerCase().replace(/[\s_]+/g, "-");

  return (
    <span className={`status status-${className}`}>
      {status.replace(/_/g, " ")}
    </span>
  );
}

export default function App() {
  const [businesses, setBusinesses] = useState([]);
  const [search, setSearch] = useState("");
  const [city, setCity] = useState(DEFAULT_FILTERS.city);
  const [categories, setCategories] = useState([]);
  const [category, setCategory] = useState(DEFAULT_FILTERS.category);
  const [website, setWebsite] = useState(DEFAULT_FILTERS.website);

  const [loading, setLoading] = useState(true);
  const [discovering, setDiscovering] = useState(false);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [total, setTotal] = useState(0);

  // Pagination
  const [page, setPage] = useState(1);
  const [limit] = useState(50);
  const [totalPages, setTotalPages] = useState(0);



  const currentFilters = () => ({
    city,
    category,
    website,
  });

  // Load the existing category array from the backend.
  useEffect(() => {
    let cancelled = false;

    async function loadCategories() {
      try {
        const response = await fetch(`${API_URL}/businesses/categories`);
        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.message || "Failed to load categories.");
        }

        if (!cancelled) {
          setCategories(data.categories || []);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Failed to load categories.");
        }
      } finally {
        if (!cancelled) {
          setCategoriesLoading(false);
        }
      }
    }

    loadCategories();

    return () => {
      cancelled = true;
    };
  }, []);

  // Load stored businesses. This endpoint does not trigger discovery.

  const fetchBusinesses = useCallback(
    async (
      searchTerm = "",
      filters = DEFAULT_FILTERS,
      pageNumber = 1
    ) => {
      try {
        setLoading(true);
        setError("");

        const params = new URLSearchParams({
          page: String(pageNumber),
          limit: String(limit),
        });

        if (searchTerm.trim()) {
          params.set("search", searchTerm.trim());
        }

        if (filters.city?.trim()) {
          params.set("city", filters.city.trim());
        }

        // "all" means no category filter.
        if (filters.category && filters.category !== "all") {
          params.set("category", filters.category);
        }

        if (filters.website && filters.website !== "all") {
          params.set("website", filters.website);
        }

        const response = await fetch(
          `${API_URL}/businesses/db?${params.toString()}`
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.message || "Failed to load businesses.");
        }

        setBusinesses(data.businesses || []);
        setTotal(data.total || 0);
        setTotalPages(data.totalPages || 0);
      } catch (err) {
        setError(
          err.message ||
          "Failed to load businesses. Check the backend connection."
        );
      } finally {
        setLoading(false);
      }
    },
    [limit]
  );


  useEffect(() => {
    fetchBusinesses(search, currentFilters(), page);
  }, [page, fetchBusinesses]);

  function handleSearch(event) {
    event.preventDefault();
    fetchBusinesses(search, currentFilters());
  }

  function handleApplyFilters(event) {
    event.preventDefault();
    setNotice("");
    fetchBusinesses(search, currentFilters());
  }

  function handleClearFilters() {
    const clearedFilters = {
      city: "",
      category: "all",
      website: "all",
    };

    setCity(clearedFilters.city);
    setCategory(clearedFilters.category);
    setWebsite(clearedFilters.website);
    setSearch("");
    setNotice("");

    fetchBusinesses("", clearedFilters);
  }

  // Existing discovery endpoint returns CSV on success.
  async function handleDiscover() {
    if (!city.trim()) {
      setError("Enter a city before discovering businesses.");
      return;
    }

    try {
      setDiscovering(true);
      setError("");
      setNotice("");

      const params = new URLSearchParams({
        city: city.trim(),
        category: category || "all",
      });

      const response = await fetch(
        `${API_URL}/businesses?${params.toString()}`
      );

      if (!response.ok) {
        const contentType = response.headers.get("content-type") || "";
        let message = "Business discovery failed.";

        if (contentType.includes("application/json")) {
          const data = await response.json();
          message = data.message || message;
        } else {
          const text = await response.text();
          if (text) message = text;
        }

        throw new Error(message);
      }

      // Read the CSV response without trying to parse it as JSON.
      await response.blob();

      await fetchBusinesses(search, currentFilters());

      setNotice(
        "Discovery completed. Stored business results have been refreshed."
      );
    } catch (err) {
      setError(err.message || "Business discovery failed.");
    } finally {
      setDiscovering(false);
    }
  }

  return (
    <main className="dashboard">
      <header className="dashboard-header">
        <div>
          <p className="eyebrow">BUSINESS DISCOVERY</p>
          <h1>Business Dashboard</h1>
          <p className="subtitle">
            Discover businesses, search database records, and monitor
            website research and audit reports.
          </p>
        </div>

        <button
          className="refresh-button"
          onClick={() => fetchBusinesses(search, currentFilters())}
          disabled={loading || discovering}
        >
          {loading ? "Loading..." : "Refresh"}
        </button>
      </header>

      <section className="summary-card">
        <div>
          <p>Total matching businesses</p>
          <h2>{total}</h2>
        </div>

        <div>
          <p>Showing on this page</p>
          <h2>{businesses.length}</h2>
        </div>
      </section>

      <section className="filters-panel">
        <h2>Discover and filter businesses</h2>

        <form onSubmit={handleApplyFilters}>
          <div className="filters-grid">
            <label>
              City
              <input
                value={city}
                onChange={(event) => setCity(event.target.value)}
                placeholder="e.g. Panchkula"
              />
            </label>

            <label>
              Category
              <select
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                disabled={categoriesLoading}
              >
                <option value="all">All Categories</option>

                {categories.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
              {categoriesLoading && <small>Loading categories...</small>}
            </label>

            <label>
              Website status
              <select
                value={website}
                onChange={(event) => setWebsite(event.target.value)}
              >
                <option value="all">All businesses</option>
                <option value="missing">Website missing</option>
                <option value="existing">Website available</option>
              </select>
            </label>
          </div>

          <div className="filter-actions">
            <button type="submit" disabled={loading || discovering}>
              Apply Filters
            </button>

            <button
              type="button"
              className="secondary-button"
              onClick={handleClearFilters}
              disabled={loading || discovering}
            >
              Clear Filters
            </button>

            <button
              type="button"
              className="discover-button"
              onClick={handleDiscover}
              disabled={loading || discovering}
            >
              {discovering
                ? "Discovering..."
                : "Discover More Businesses"}
            </button>
          </div>
        </form>

        <p className="footer-note">
          Apply Filters searches stored database records. Discover More
          Businesses runs your existing discovery service for the selected
          city and category.
        </p>
      </section>

      <section className="business-section">
        <h2>Stored businesses</h2>

        <form className="search-form" onSubmit={handleSearch}>
          <input
            type="search"
            placeholder="Search company, city, category, phone..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />

          <button type="submit" disabled={loading}>
            Search
          </button>

          <button
            type="button"
            className="clear-button"
            onClick={() => {
              setSearch("");
              fetchBusinesses("", currentFilters());
            }}
            disabled={loading}
          >
            Clear Search
          </button>
        </form>

        {notice && <p className="success-message">{notice}</p>}
        {error && <p className="error-message">{error}</p>}

        {loading ? (
          <p className="message">Loading businesses...</p>
        ) : businesses.length === 0 ? (
          <p className="message">No businesses found for these filters.</p>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Business</th>
                  <th>City</th>
                  <th>Category</th>
                  <th>Website</th>
                  <th>Research</th>
                  <th>Report</th>
                </tr>
              </thead>

              <tbody>
                {businesses.map((business) => {
                  const research = business.agentResearches?.[0];
                  const report = business.reports?.[0];

                  return (
                    <tr key={business.id}>
                      <td>
                        <strong>{business.name}</strong>
                        <small>{business.phone || "No phone"}</small>
                      </td>

                      <td>{business.city || "—"}</td>
                      <td>{business.category || "—"}</td>

                      <td>
                        {business.website ? (
                          <a
                            href={business.website}
                            target="_blank"
                            rel="noreferrer"
                          >
                            Visit website
                          </a>
                        ) : (
                          <Status value="Missing" />
                        )}
                      </td>

                      <td>
                        <Status
                          value={research?.status}
                          fallback="Not started"
                        />

                        {research?.websiteExists === true && (
                          <small>Website found by research</small>
                        )}

                        {research?.websiteExists === false && (
                          <small>No website found by research</small>
                        )}
                      </td>

                      <td>
                        {report ? (
                          <>
                            <Status value={report.status} />

                            {report.pdfUrl && (
                              <a
                                className="pdf-link"
                                href={report.pdfUrl}
                                target="_blank"
                                rel="noreferrer"
                              >
                                View PDF
                              </a>
                            )}
                          </>
                        ) : (
                          <Status value="Not generated" />
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {/* Pagination */}
            <div className="pagination">
              <p>
                Showing {total === 0 ? 0 : (page - 1) * limit + 1}–
                {Math.min(page * limit, total)} of {total} companies
              </p>

              <div className="pagination-controls">
                <button
                  onClick={() => setPage((prev) => prev - 1)}
                  disabled={page <= 1 || loading}
                >
                  Previous
                </button>

                <span>
                  Page {page} of {Math.max(totalPages, 1)}
                </span>

                <button
                  onClick={() => setPage((prev) => prev + 1)}
                  disabled={page >= totalPages || loading}
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}

        <p className="footer-note">
          Showing up to 50 businesses, with the latest research and report
          record for each business.
        </p>
      </section>
    </main>
  );
}
