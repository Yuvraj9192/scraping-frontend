export default function SearchForm({
  search,
  setSearch,
  loading,
  onSearch,
  onClear,
}) {
  return (
    <form className="search-form" onSubmit={onSearch}>
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
        onClick={onClear}
        disabled={loading}
      >
        Clear Search
      </button>
    </form>
  );
}
