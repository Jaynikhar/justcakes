export function Loader({ label = 'Loading…' }) {
  return (
    <div className="state" role="status" aria-live="polite">
      <div className="spinner" />
      <span className="text-small">{label}</span>
    </div>
  );
}

export function SkeletonRow({ count = 4, height = 240 }) {
  return (
    <div className="product-grid" aria-hidden="true">
      {Array.from({ length: count }).map((_, index) => (
        // eslint-disable-next-line react/no-array-index-key
        <div key={index} className="skeleton" style={{ height }} />
      ))}
    </div>
  );
}

export default Loader;
