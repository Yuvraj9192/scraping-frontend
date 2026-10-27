import { useCallback, useEffect, useState } from "react";
import "./App.css";
import { DEFAULT_FILTERS, PAGE_SIZE } from "./constants/business";
import { getBusinesses, getCategories, discoverBusinesses } from "./services/businessApi";
import DashboardHeader from "./components/DashboardHeader";
import SummaryCard from "./components/SummaryCard";
import FiltersPanel from "./components/FiltersPanel";
import BusinessSection from "./components/BusinessSection";

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
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  const currentFilters = () => ({ city, category, website });

  const fetchBusinesses = useCallback(async (
    searchTerm = "",
    filters = DEFAULT_FILTERS,
    pageNumber = 1
  ) => {
    try {
      setLoading(true);
      setError("");
      const data = await getBusinesses(searchTerm, filters, pageNumber);
      setBusinesses(data.businesses || []);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 0);
    } catch (err) {
      setError(
        err.message || "Failed to load businesses. Check the backend connection."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadCategories() {
      try {
        const items = await getCategories();
        if (!cancelled) setCategories(items);
      } catch (err) {
        if (!cancelled) setError(err.message || "Failed to load categories.");
      } finally {
        if (!cancelled) setCategoriesLoading(false);
      }
    }

    loadCategories();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    fetchBusinesses(search, currentFilters(), page);
    // currentFilters is intentionally created from the latest filter state.
    // Filter changes are applied by the form; page changes reuse those filters.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, fetchBusinesses]);

  function handleSearch(event) {
    event.preventDefault();
    setPage(1);
    fetchBusinesses(search, currentFilters(), 1);
  }

  function handleApplyFilters(event) {
    event.preventDefault();
    setNotice("");
    setPage(1);
    fetchBusinesses(search, currentFilters(), 1);
  }

  function handleClearFilters() {
    const clearedFilters = { city: "", category: "all", website: "all" };
    setCity(clearedFilters.city);
    setCategory(clearedFilters.category);
    setWebsite(clearedFilters.website);
    setSearch("");
    setPage(1);
    setNotice("");
    fetchBusinesses("", clearedFilters, 1);
  }

  async function handleDiscover() {
    if (!city.trim()) {
      setError("Enter a city before discovering businesses.");
      return;
    }

    try {
      setDiscovering(true);
      setError("");
      setNotice("");
      await discoverBusinesses(city, category);
      await fetchBusinesses(search, currentFilters(), page);
      setNotice("Discovery completed. Stored business results have been refreshed.");
    } catch (err) {
      setError(err.message || "Business discovery failed.");
    } finally {
      setDiscovering(false);
    }
  }

  function handleClearSearch() {
    setSearch("");
    setPage(1);
    fetchBusinesses("", currentFilters(), 1);
  }

  return (
    <main className="dashboard">
      <DashboardHeader
        loading={loading}
        discovering={discovering}
        onRefresh={() => fetchBusinesses(search, currentFilters(), page)}
      />

      <SummaryCard total={total} visibleCount={businesses.length} />

      <FiltersPanel
        city={city}
        setCity={setCity}
        categories={categories}
        categoriesLoading={categoriesLoading}
        category={category}
        setCategory={setCategory}
        website={website}
        setWebsite={setWebsite}
        loading={loading}
        discovering={discovering}
        onApply={handleApplyFilters}
        onClear={handleClearFilters}
        onDiscover={handleDiscover}
      />

      <BusinessSection
        search={search}
        setSearch={setSearch}
        loading={loading}
        businesses={businesses}
        notice={notice}
        error={error}
        onSearch={handleSearch}
        onClearSearch={handleClearSearch}
        page={page}
        limit={PAGE_SIZE}
        total={total}
        totalPages={totalPages}
        onPrevious={() => setPage((previous) => Math.max(1, previous - 1))}
        onNext={() => setPage((previous) => Math.min(totalPages, previous + 1))}
      />
    </main>
  );
}
