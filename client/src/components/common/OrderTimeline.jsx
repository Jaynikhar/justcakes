import { Check } from 'lucide-react';
import { ORDER_FLOW, STATUS_LABELS } from '../../utils/constants.js';
import { formatDateTime } from '../../utils/format.js';

export function OrderTimeline({ status, history = [] }) {
  if (status === 'CANCELLED') {
    const event = history.find((item) => item.status === 'CANCELLED');
    return (
      <div className="timeline timeline--cancelled">
        <div className="timeline__step is-current">
          <div className="timeline__marker"><span className="timeline__dot" /></div>
          <div className="timeline__body">
            <div className="timeline__title">Order cancelled</div>
            {event?.changedAt ? <div className="timeline__time">{formatDateTime(event.changedAt)}</div> : null}
            {event?.note ? <div className="text-small text-muted">{event.note}</div> : null}
          </div>
        </div>
      </div>
    );
  }

  const currentIndex = ORDER_FLOW.indexOf(status);

  return (
    <ol className="timeline" style={{ listStyle: 'none', margin: 0, padding: 0 }}>
      {ORDER_FLOW.map((step, index) => {
        const event = history.find((item) => item.status === step);
        const isDone = index < currentIndex;
        const isCurrent = index === currentIndex;
        const stateClass = isDone ? 'is-done' : isCurrent ? 'is-current' : '';
        return (
          <li key={step} className={`timeline__step ${stateClass}`}>
            <div className="timeline__marker">
              <span className="timeline__dot">{isDone ? <Check size={11} /> : null}</span>
              {index < ORDER_FLOW.length - 1 ? <span className="timeline__line" /> : null}
            </div>
            <div className="timeline__body">
              <div className="timeline__title">{STATUS_LABELS[step]}</div>
              {event?.changedAt ? (
                <div className="timeline__time">{formatDateTime(event.changedAt)}</div>
              ) : (
                <div className="timeline__time">{isCurrent ? 'In progress' : 'Pending'}</div>
              )}
              {event?.note ? <div className="text-small text-muted">{event.note}</div> : null}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

export default OrderTimeline;
