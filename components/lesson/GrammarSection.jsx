'use client';

const ROLE_STYLES = {
  subject: 'lp-token lp-token--subject',
  verb: 'lp-token lp-token--verb',
  object: 'lp-token lp-token--object',
  time: 'lp-token lp-token--time',
  condition: 'lp-token lp-token--condition',
};

export default function GrammarSection({ grammar, level, example }) {
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

      {example && (
        <div className="lp-grammar__breakdown">
          <h3 className="lp-grammar__subtitle">Sentence Breakdown</h3>
          <p className="lp-breakdown__sentence">{example.sentence}</p>
          <p className="lp-breakdown__translation">{example.translation}</p>

          <div className="lp-breakdown__tokens">
            {example.breakdown.map((item, i) => (
              <div
                key={i}
                className={ROLE_STYLES[item.role] || 'lp-token'}
                title={item.label}
              >
                <span className="lp-token__word">{item.word}</span>
                <span className="lp-token__label">{item.label}</span>
              </div>
            ))}
          </div>

          <div className="lp-breakdown__legend">
            <span className="lp-legend__item lp-legend__item--subject">Subject</span>
            <span className="lp-legend__item lp-legend__item--verb">Verb</span>
            <span className="lp-legend__item lp-legend__item--object">Object / Modifier</span>
            <span className="lp-legend__item lp-legend__item--time">Time / Condition</span>
          </div>
        </div>
      )}
    </section>
  );
}
