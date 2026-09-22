export function ErrorState({ message = 'That did not load.', onRetry = null }) {
  return (
    <div className="state" role="alert">
      <span className="state__emoji" aria-hidden="true">⚠️</span>
      <p className="state__title">{message}</p>
      {onRetry ? (
        <button type="button" className="btn btn--ghost btn--sm" onClick={onRetry}>
          Try again
        </button>
      ) : null}
    </div>
  );
}

export default ErrorState;
