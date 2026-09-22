import { useCallback, useEffect, useRef, useState } from 'react';
import { RotateCcw, ZoomIn, ZoomOut } from 'lucide-react';
import { imageUrl } from '../../utils/media.js';

const MAX_TILT = 28;

/**
 * Pseudo-3D cake viewer.
 * Drag with a mouse or finger to rotate, use the buttons to zoom.
 * No .glb asset pipeline is needed — it works with the product photos.
 */
export function ProductViewer({ images = [], name = 'Cake' }) {
  const [rotation, setRotation] = useState({ x: -6, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [activeIndex, setActiveIndex] = useState(0);
  const dragState = useRef(null);
  const stageRef = useRef(null);

  const onPointerDown = (event) => {
    dragState.current = {
      startX: event.clientX,
      startY: event.clientY,
      startRotation: { ...rotation },
    };
    event.currentTarget.setPointerCapture?.(event.pointerId);
  };

  const onPointerMove = useCallback((event) => {
    if (!dragState.current) return;
    const deltaX = event.clientX - dragState.current.startX;
    const deltaY = event.clientY - dragState.current.startY;
    setRotation({
      y: Math.max(-MAX_TILT * 2, Math.min(MAX_TILT * 2, dragState.current.startRotation.y + deltaX * 0.35)),
      x: Math.max(-MAX_TILT, Math.min(MAX_TILT, dragState.current.startRotation.x - deltaY * 0.25)),
    });
  }, []);

  const endDrag = useCallback(() => {
    dragState.current = null;
  }, []);

  useEffect(() => {
    window.addEventListener('pointerup', endDrag);
    return () => window.removeEventListener('pointerup', endDrag);
  }, [endDrag]);

  const onKeyDown = (event) => {
    const step = 8;
    if (event.key === 'ArrowLeft') setRotation((r) => ({ ...r, y: r.y - step }));
    if (event.key === 'ArrowRight') setRotation((r) => ({ ...r, y: r.y + step }));
    if (event.key === 'ArrowUp') setRotation((r) => ({ ...r, x: Math.max(-MAX_TILT, r.x - step) }));
    if (event.key === 'ArrowDown') setRotation((r) => ({ ...r, x: Math.min(MAX_TILT, r.x + step) }));
  };

  const reset = () => {
    setRotation({ x: -6, y: 0 });
    setZoom(1);
  };

  const current = images[activeIndex];
  const src = imageUrl(current, '');

  return (
    <div className="viewer">
      <div
        className="viewer__stage"
        ref={stageRef}
        role="img"
        aria-label={`Interactive view of ${name}. Drag or use the arrow keys to rotate.`}
        tabIndex={0}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onKeyDown={onKeyDown}
      >
        {src ? (
          <div
            className="viewer__object"
            style={{
              transform: `perspective(1000px) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) scale(${zoom})`,
            }}
          >
            <img src={src} alt="" draggable="false" />
          </div>
        ) : (
          <div
            className="viewer__placeholder"
            style={{
              transform: `perspective(1000px) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) scale(${zoom})`,
            }}
          >
            🎂
          </div>
        )}
      </div>

      <div className="row" style={{ justifyContent: 'center' }}>
        <button type="button" className="btn btn--ghost btn--sm" onClick={() => setZoom((z) => Math.max(0.7, z - 0.15))} aria-label="Zoom out">
          <ZoomOut size={15} />
        </button>
        <button type="button" className="btn btn--ghost btn--sm" onClick={reset}>
          <RotateCcw size={15} /> Reset
        </button>
        <button type="button" className="btn btn--ghost btn--sm" onClick={() => setZoom((z) => Math.min(1.8, z + 0.15))} aria-label="Zoom in">
          <ZoomIn size={15} />
        </button>
      </div>

      {images.length > 1 ? (
        <div className="viewer__thumbs">
          {images.map((image, index) => (
            <button
              key={image.publicId || index}
              type="button"
              className={`viewer__thumb ${index === activeIndex ? 'is-active' : ''}`}
              onClick={() => setActiveIndex(index)}
              aria-label={`Show photo ${index + 1}`}
            >
              <img src={imageUrl(image)} alt="" />
            </button>
          ))}
        </div>
      ) : null}

      <p className="viewer__hint">Drag the cake to turn it, or use the arrow keys.</p>
    </div>
  );
}

export default ProductViewer;
