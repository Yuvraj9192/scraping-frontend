export default function SummaryCard({ total, visibleCount }) {
  return (
    <section className="summary-card">
      <div>
        <p>Total matching businesses</p>
        <h2>{total}</h2>
      </div>
      <div>
        <p>Showing on this page</p>
        <h2>{visibleCount}</h2>
      </div>
    </section>
  );
}
