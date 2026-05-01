'use client';

import { useState, useEffect } from 'react';
import { spanishPhonetic } from '@/lib/spanish-phonetic';

/**
 * Split a prompt into annotated React spans.
 * Known words get a grey "(translation)" suffix when showTranslations is true.
 */
function AnnotatedPrompt({ prompt, translations, show }) {
  if (!show || !translations) return <>{prompt}</>;

  const tokens = prompt.split(' ');
  return (
    <>
      {tokens.map((token, i) => {
        const trailing = token.match(/[.,!?¡¿]*$/)?.[0] ?? '';
        const core = token.slice(0, token.length - trailing.length);
        const meaning = translations[core] ?? translations[core.toLowerCase()];
        return (
          <span key={i}>
            {i > 0 ? ' ' : ''}
            {meaning ? (
              <>
                {core}
                <span className="lp-practice__word-hint"> ({meaning})</span>
                {trailing}
              </>
            ) : token}
          </span>
        );
      })}
    </>
  );
}

/**
 * Renders one labelled row inside the explanation card.
 */
function ExplainRow({ label, value, accent }) {
  if (!value) return null;
  return (
    <div className={`lp-explain__row lp-explain__row--${accent}`}>
      <span className="lp-explain__row-label">{label}</span>
      <span className="lp-explain__row-value">{value}</span>
    </div>
  );
}

/**
 * Fetches a structured AI explanation and renders it section by section.
 * autoOpen=true means the panel opens immediately (used after a wrong answer).
 */
function AIExplainButton({ sentence, answer, context, level = 'beginner', autoOpen = false }) {
  const [state, setState] = useState(autoOpen ? 'loading' : 'idle');
  const [data, setData] = useState(null);
  const [isFallback, setIsFallback] = useState(false);

  // Auto-fetch when autoOpen flips to true
  useEffect(() => {
    if (autoOpen && state === 'loading') {
      fetchExplanation();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoOpen]);

  const fetchExplanation = async () => {
    setState('loading');
    try {
      const res = await fetch('/api/lesson/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sentence, answer, context, level }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Request failed');
      setData(json);
      setIsFallback(json.source === 'fallback');
      setState('done');
    } catch {
      setState('error');
    }
  };

  const handleToggle = () => {
    if (state === 'done') {
      setState('idle');
      setData(null);
    } else if (state === 'idle' || state === 'error') {
      fetchExplanation();
    }
  };

  return (
    <div className="lp-explain" data-testid="ai-explain-btn">
      <button
        className={`lp-explain__btn ${state === 'done' ? 'lp-explain__btn--active' : ''}`}
        onClick={handleToggle}
        disabled={state === 'loading'}
      >
        {state === 'loading' && <span className="lp-explain__spinner" />}
        {state === 'loading' && 'Thinking…'}
        {state === 'done' && '✕ Close explanation'}
        {(state === 'idle' || state === 'error') && '🤖 Explain this'}
      </button>

      {state === 'error' && (
        <p className="lp-explain__error">Couldn’t load explanation — <button className="lp-explain__retry" onClick={fetchExplanation}>retry</button></p>
      )}

      {state === 'done' && data && (
        <div className={`lp-explain__box ${isFallback ? 'lp-explain__box--fallback' : ''}`}>
          {isFallback && (
            <p className="lp-explain__fallback-label">⚠️ AI unavailable — showing built-in explanation</p>
          )}

          <ExplainRow label="Meaning" value={data.meaning} accent="meaning" />
          <ExplainRow label="Correct Answer" value={data.correctAnswer} accent="answer" />
          <ExplainRow label="Why It’s Correct" value={data.whyCorrect} accent="why" />
          <ExplainRow label="Grammar Rule" value={data.grammarRule} accent="rule" />

          {data.verbForms?.length > 0 && (
            <div className="lp-explain__row lp-explain__row--forms">
              <span className="lp-explain__row-label">Verb Forms</span>
              <ul className="lp-explain__verb-list">
                {data.verbForms.map((f, i) => (
                  <li key={i} className="lp-explain__verb-item">{f}</li>
                ))}
              </ul>
            </div>
          )}

          {data.tip && (
            <div className="lp-explain__tip">
              <span className="lp-explain__tip-icon">💡</span>
              <span>{data.tip}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function FillBlankExercise({ exercise, onAnswer, showTranslations, level }) {
  const [selected, setSelected] = useState(null);

  const handleSelect = (option) => {
    setSelected(option);
    onAnswer(exercise.id, option === exercise.answer);
  };

  const isCorrect = selected === exercise.answer;
  const isWrong = selected && !isCorrect;

  return (
    <div className="lp-practice__exercise" data-testid={`exercise-${exercise.id}`}>
      <p className="lp-practice__prompt">
        <AnnotatedPrompt
          prompt={exercise.prompt}
          translations={exercise.promptTranslations}
          show={showTranslations}
        />
      </p>
      <div className="lp-practice__options">
        {exercise.options.map((opt) => {
          let cls = 'lp-practice__option';
          if (selected) {
            if (opt === exercise.answer) cls += ' lp-practice__option--correct';
            else if (opt === selected) cls += ' lp-practice__option--wrong';
          }
          const meaning = exercise.optionTranslations?.[opt];
          return (
            <button
              key={opt}
              className={cls}
              onClick={() => handleSelect(opt)}
              disabled={!!selected}
            >
              <span className="lp-practice__option-word">{opt}</span>
              <span className="lp-practice__phonetic">{spanishPhonetic(opt)}</span>
              {showTranslations && meaning && (
                <span className="lp-practice__option-hint"> ({meaning})</span>
              )}
            </button>
          );
        })}
      </div>
      {selected && (
        <p className={`lp-practice__feedback ${isCorrect ? 'lp-practice__feedback--correct' : 'lp-practice__feedback--wrong'}`}>
          {isCorrect ? '✓ Correct!' : `✗ Incorrect — the correct answer is "${exercise.answer}"`}
        </p>
      )}
      <AIExplainButton
        sentence={exercise.prompt}
        answer={exercise.answer}
        context={`Fill-in-the-blank. Options: ${exercise.options.join(', ')}`}
        level={level}
        autoOpen={!!isWrong}
      />
    </div>
  );
}

function OpenEndedExercise({ exercise, onAnswer, level }) {
  const [input, setInput] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (!input.trim()) return;
    setSubmitted(true);
    onAnswer(exercise.id, true); // open-ended always credited
  };

  return (
    <div className="lp-practice__exercise" data-testid={`exercise-${exercise.id}`}>
      <p className="lp-practice__prompt">{exercise.prompt}</p>
      <textarea
        className="lp-practice__textarea"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        disabled={submitted}
        rows={3}
        placeholder="Type your answer here…"
      />
      {!submitted && (
        <button className="lp-practice__submit" onClick={handleSubmit}>
          Submit
        </button>
      )}
      {submitted && (
        <div className="lp-practice__reveal">
          <p className="lp-practice__feedback lp-practice__feedback--correct">
            Submitted! Compare with the model answer:
          </p>
          <p className="lp-practice__model-answer">{exercise.answer}</p>
        </div>
      )}
      <AIExplainButton
        sentence={exercise.prompt}
        answer={exercise.answer}
        context={exercise.hint || ''}
        level={level}
      />
    </div>
  );
}

export default function PracticeSection({ practice, level }) {
  const [results, setResults] = useState({});
  const [showTranslations, setShowTranslations] = useState(false);

  const handleAnswer = (id, isCorrect) => {
    setResults((prev) => ({ ...prev, [id]: isCorrect }));
  };

  const total = practice.exercises.length;
  const answered = Object.keys(results).length;
  const correct = Object.values(results).filter(Boolean).length;

  const isFillBlank = practice.type === 'fill-blank';

  return (
    <section className="lp-card" data-testid="practice-section">
      <div className="lp-card__header">
        <h2 className="lp-card__title">Practice</h2>
        <div className="lp-practice__header-right">
          {answered > 0 && (
            <span className="lp-practice__score">
              {correct}/{answered} correct
            </span>
          )}
          <button
            className={`lp-practice__translate-toggle ${showTranslations ? 'lp-practice__translate-toggle--on' : ''}`}
            onClick={() => setShowTranslations((v) => !v)}
            data-testid="translations-toggle"
          >
            {showTranslations ? '🙈 Hide Translations' : '👁 Show Translations'}
          </button>
        </div>
      </div>
      <p className="lp-practice__instructions">{practice.instructions}</p>

      <div className="lp-practice__exercises">
        {practice.exercises.map((exercise) =>
          isFillBlank ? (
            <FillBlankExercise
              key={exercise.id}
              exercise={exercise}
              onAnswer={handleAnswer}
              showTranslations={showTranslations}
              level={level}
            />
          ) : (
            <OpenEndedExercise
              key={exercise.id}
              exercise={exercise}
              onAnswer={handleAnswer}
              level={level}
            />
          )
        )}
      </div>

      {answered === total && total > 0 && (
        <p className="lp-practice__done">
          {isFillBlank
            ? `Section complete — ${correct} of ${total} correct.`
            : 'All exercises submitted. Great work!'}
        </p>
      )}
    </section>
  );
}
