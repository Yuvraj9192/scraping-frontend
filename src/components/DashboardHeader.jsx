export default function DashboardHeader({
  loading,
  discovering,
  onRefresh,
}) {
  return (
    <header className="dashboard-header">
      <div>
        <p className="eyebrow">BUSINESS DISCOVERY</p>
        <h1>Business Dashboard</h1>
        <p className="subtitle">
          Discover businesses, search database records, and monitor website
          research and audit reports.
        </p>
      </div>

      <button
        className="refresh-button"
        onClick={onRefresh}
        disabled={loading || discovering}
      >
        {loading ? "Loading..." : "Refresh"}
      </button>
    </header>
  );
}
