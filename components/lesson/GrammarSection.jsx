'use client';

export default function GrammarSection({ grammar, level }) {
  const accentMap = {
    beginner: 'lp-badge lp-badge--green',
    intermediate: 'lp-badge lp-badge--yellow',
    advanced: 'lp-badge lp-badge--red',
  };

  return (
    <section className="lp-card" data-testid="grammar-section">
      <div className="lp-card__header">
        <h2 className="lp-card__title">Grammar</h2>
        <span className={accentMap[level]}>{grammar.tense}</span>
      </div>
      <h3 className="lp-grammar__subtitle">{grammar.title}</h3>
      <ul className="lp-grammar__rules">
        {grammar.rules.map((rule, i) => (
          <li key={i} className="lp-grammar__rule">
            {rule}
          </li>
        ))}
      </ul>
    </section>
  );
}
