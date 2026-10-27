export default function Status({ value, fallback = "Not started" }) {
  const status = value || fallback;
  const className = status.toLowerCase().replace(/[\s_]+/g, "-");

  return (
    <span className={`status status-${className}`}>
      {status.replace(/_/g, " ")}
    </span>
  );
}
