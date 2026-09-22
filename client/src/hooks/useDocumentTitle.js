import { useEffect } from 'react';

export function useDocumentTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} · Just Cakes` : 'Just Cakes — Homemade, just for you';
  }, [title]);
}
