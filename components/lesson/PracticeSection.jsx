'use client';

import { useState } from 'react';

function FillBlankExercise({ exercise, onAnswer }) {
  const [selected, setSelected] = useState(null);

  const handleSelect = (option) => {
    setSelected(option);
    onAnswer(exercise.id, option === exercise.answer);
  };

  const isCorrect = selected === exercise.answer;
  const isWrong = selected && selected !== exercise.answer;

  return (
    <div className="lp-practice__exercise" data-testid={`exercise-${exercise.id}`}>
      <p className="lp-practice__prompt">{exercise.prompt}</p>
      <div className="lp-practice__options">
        {exercise.options.map((opt) => {
          let cls = 'lp-practice__option';
          if (selected) {
            if (opt === exercise.answer) cls += ' lp-practice__option--correct';
            else if (opt === selected) cls += ' lp-practice__option--wrong';
          }
          return (
            <button
              key={opt}
              className={cls}
              onClick={() => handleSelect(opt)}
              disabled={!!selected}
            >
              {opt}
            </button>
          );
        })}
      </div>
      {selected && (
        <p className={`lp-practice__feedback ${isCorrect ? 'lp-practice__feedback--correct' : 'lp-practice__feedback--wrong'}`}>
          {isCorrect ? '✓ Correct!' : `✗ Incorrect. Hint: ${exercise.hint}`}
        </p>
      )}
    </div>
  );
}

function OpenEndedExercise({ exercise, onAnswer }) {
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
    </div>
  );
}

export default function PracticeSection({ practice, level }) {
  const [results, setResults] = useState({});

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
        {answered > 0 && (
          <span className="lp-practice__score">
            {correct}/{answered} correct
          </span>
        )}
      </div>
      <p className="lp-practice__instructions">{practice.instructions}</p>

      <div className="lp-practice__exercises">
        {practice.exercises.map((exercise) =>
          isFillBlank ? (
            <FillBlankExercise
              key={exercise.id}
              exercise={exercise}
              onAnswer={handleAnswer}
            />
          ) : (
            <OpenEndedExercise
              key={exercise.id}
              exercise={exercise}
              onAnswer={handleAnswer}
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
