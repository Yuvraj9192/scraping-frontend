export default function FiltersPanel({
  city,
  setCity,
  categories,
  categoriesLoading,
  category,
  setCategory,
  website,
  setWebsite,
  loading,
  discovering,
  onApply,
  onClear,
  onDiscover,
}) {
  return (
    <section className="filters-panel">
      <h2>Discover and filter businesses</h2>

      <form onSubmit={onApply}>
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
            onClick={onClear}
            disabled={loading || discovering}
          >
            Clear Filters
          </button>
          <button
            type="button"
            className="discover-button"
            onClick={onDiscover}
            disabled={loading || discovering}
          >
            {discovering ? "Discovering..." : "Discover More Businesses"}
          </button>
        </div>
      </form>

      <p className="footer-note">
        Apply Filters searches stored database records. Discover More
        Businesses runs your existing discovery service for the selected city
        and category.
      </p>
    </section>
  );
}
