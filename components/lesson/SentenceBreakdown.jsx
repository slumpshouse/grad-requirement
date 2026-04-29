'use client';

const ROLE_STYLES = {
  subject: 'lp-token lp-token--subject',
  verb: 'lp-token lp-token--verb',
  object: 'lp-token lp-token--object',
  time: 'lp-token lp-token--time',
  condition: 'lp-token lp-token--condition',
};

export default function SentenceBreakdown({ example }) {
  const { sentence, translation, breakdown } = example;

  return (
    <section className="lp-card" data-testid="sentence-breakdown">
      <div className="lp-card__header">
        <h2 className="lp-card__title">Sentence Breakdown</h2>
      </div>
      <p className="lp-breakdown__sentence">{sentence}</p>
      <p className="lp-breakdown__translation">{translation}</p>

      <div className="lp-breakdown__tokens">
        {breakdown.map((item, i) => (
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
    </section>
  );
}
