'use client';

const TYPE_STYLES = {
  pronoun: 'lp-vocab__tag lp-vocab__tag--pronoun',
  verb: 'lp-vocab__tag lp-vocab__tag--verb',
  noun: 'lp-vocab__tag lp-vocab__tag--noun',
  adjective: 'lp-vocab__tag lp-vocab__tag--adjective',
  connector: 'lp-vocab__tag lp-vocab__tag--connector',
  expression: 'lp-vocab__tag lp-vocab__tag--expression',
  time: 'lp-vocab__tag lp-vocab__tag--time',
};

export default function VocabularySection({ vocabulary }) {
  return (
    <section className="lp-card" data-testid="vocabulary-section">
      <div className="lp-card__header">
        <h2 className="lp-card__title">Vocabulary</h2>
      </div>
      <div className="lp-vocab__grid">
        {vocabulary.map((item) => (
          <div key={item.spanish} className="lp-vocab__item">
            <span className="lp-vocab__spanish">{item.spanish}</span>
            <span className="lp-vocab__english">{item.english}</span>
            <span className={TYPE_STYLES[item.type] || 'lp-vocab__tag'}>{item.type}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
