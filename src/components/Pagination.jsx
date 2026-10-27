export default function Pagination({
  page,
  limit,
  total,
  totalPages,
  loading,
  onPrevious,
  onNext,
}) {
  return (
    <div className="pagination">
      <p>
        Showing {total === 0 ? 0 : (page - 1) * limit + 1}–
        {Math.min(page * limit, total)} of {total} companies
      </p>

      <div className="pagination-controls">
        <button onClick={onPrevious} disabled={page <= 1 || loading}>
          Previous
        </button>
        <span>
          Page {page} of {Math.max(totalPages, 1)}
        </span>
        <button
          onClick={onNext}
          disabled={page >= totalPages || loading}
        >
          Next
        </button>
      </div>
    </div>
  );
}
