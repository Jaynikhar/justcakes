export function EmptyState({ emoji = '🧁', title, message, action = null }) {
  return (
    <div className="state">
      <span className="state__emoji" aria-hidden="true">{emoji}</span>
      <p className="state__title">{title}</p>
      {message ? <p className="text-small">{message}</p> : null}
      {action}
    </div>
  );
}

export default EmptyState;
