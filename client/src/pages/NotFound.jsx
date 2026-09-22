import { Link } from 'react-router-dom';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';

export default function NotFound() {
  useDocumentTitle('Page not found');
  return (
    <div className="container page">
      <div className="state">
        <span className="state__emoji" aria-hidden="true">🍰</span>
        <h1>That page is not on the menu</h1>
        <p className="text-muted">The link may be old, or the cake may have been removed.</p>
        <Link to="/" className="btn btn--primary">Back to the bakery</Link>
      </div>
    </div>
  );
}
