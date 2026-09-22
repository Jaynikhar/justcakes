import { useEffect } from 'react';
import { X } from 'lucide-react';

export function Modal({ open, title, children, onClose, width = 560 }) {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        style={{ width: `min(${width}px, 100%)`, maxHeight: '88vh', overflowY: 'auto' }}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="row row--between">
          <h3 style={{ margin: 0 }}>{title}</h3>
          <button type="button" className="btn btn--ghost btn--sm" onClick={onClose} aria-label="Close">
            <X size={16} />
          </button>
        </div>
        <div className="mt-2">{children}</div>
      </div>
    </div>
  );
}

export default Modal;
