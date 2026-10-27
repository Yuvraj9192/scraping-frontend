import Status from "./Status";
import Pagination from "./Pagination";

export default function BusinessTable({
  businesses,
  loading,
  page,
  limit,
  total,
  totalPages,
  onPrevious,
  onNext,
}) {
  if (loading) return <p className="message">Loading businesses...</p>;
  if (businesses.length === 0) {
    return <p className="message">No businesses found for these filters.</p>;
  }

  return (
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
                  <Status value={research?.status} fallback="Not started" />
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

      <Pagination
        page={page}
        limit={limit}
        total={total}
        totalPages={totalPages}
        loading={loading}
        onPrevious={onPrevious}
        onNext={onNext}
      />
    </div>
  );
}
