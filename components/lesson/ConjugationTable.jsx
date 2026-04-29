'use client';

function ConjTable({ title, rows }) {
  return (
    <div className="lp-conj__table-wrap">
      {title && <p className="lp-conj__table-title">{title}</p>}
      <table className="lp-conj__table">
        <thead>
          <tr>
            <th>Pronoun</th>
            <th>Form</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.pronoun}>
              <td className="lp-conj__pronoun">{row.pronoun}</td>
              <td className="lp-conj__form">{row.form}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function ConjugationTable({ conjugation }) {
  return (
    <section className="lp-card" data-testid="conjugation-table">
      <div className="lp-card__header">
        <h2 className="lp-card__title">Conjugation</h2>
        <span className="lp-conj__verb-label">
          {conjugation.verb} – {conjugation.translation}
        </span>
      </div>

      <ConjTable title={null} rows={conjugation.table} />

      {conjugation.subjunctiveTable && (
        <ConjTable title="Imperfect Subjunctive" rows={conjugation.subjunctiveTable} />
      )}

      {conjugation.note && (
        <p className="lp-conj__note">{conjugation.note}</p>
      )}
    </section>
  );
}
