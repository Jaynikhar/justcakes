import { compactCount } from '../../utils/format.js';

export function StatsSection({ stats }) {
  if (!stats) return null;

  const cards = [
    { value: compactCount(stats.categories), label: 'Cake categories' },
    { value: compactCount(stats.happyBuyers), label: 'Happy buyers' },
    { value: compactCount(stats.cakesSold), label: 'Cakes delivered' },
    { value: compactCount(stats.products), label: 'Cakes on the menu' },
  ];

  return (
    <section className="section section--cream">
      <div className="container">
        <div className="stats-grid">
          {cards.map((card) => (
            <div className="stat-card" key={card.label}>
              <div className="stat-card__value">{card.value}</div>
              <div className="stat-card__label">{card.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default StatsSection;
