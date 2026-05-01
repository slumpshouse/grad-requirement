const TARGET_COUNT = {
  'fill-blank': 8,
  correction: 6,
  build: 6,
};

function cloneJson(value) {
  return JSON.parse(JSON.stringify(value));
}

function shuffle(array) {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function pickOne(array, fallback) {
  if (!array || !array.length) return fallback;
  return array[Math.floor(Math.random() * array.length)];
}

function rand() {
  return Math.random().toString(36).slice(2, 7);
}

function cleanPronoun(pronoun) {
  if (!pronoun) return 'Yo';
  const first = pronoun.split('/')[0] || pronoun;
  return first.charAt(0).toUpperCase() + first.slice(1);
}

function pronounToEnglish(pronoun) {
  const key = String(pronoun || '').toLowerCase();
  if (key.startsWith('yo')) return 'I';
  if (key.startsWith('tú') || key.startsWith('tu')) return 'you';
  if (key.startsWith('él') || key.startsWith('el') || key.startsWith('ella')) return 'he/she';
  if (key.startsWith('nosotros')) return 'we';
  if (key.startsWith('vosotros')) return 'you all';
  if (key.startsWith('ellos') || key.startsWith('ellas')) return 'they';
  return 'subject';
}

function buildOptionTranslations(rows) {
  const map = {};
  rows.forEach((row) => {
    if (row.form && row.translation) map[row.form] = row.translation;
  });
  return map;
}

function makeOptions(correct, pool, count = 4) {
  const others = shuffle(pool.filter((f) => f !== correct));
  return shuffle([correct, ...others.slice(0, count - 1)]);
}

function dedupeByPrompt(exercises) {
  const seen = new Set();
  return exercises.filter((exercise) => {
    const key = String(exercise?.prompt || '').trim().toLowerCase();
    if (!key) return true;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function buildFillBlankPool(lesson) {
  const rows = lesson?.conjugation?.table || [];
  const vocab = lesson?.vocabulary || [];
  const verb = lesson?.conjugation?.verb || '';
  const allForms = rows.map((r) => r.form).filter(Boolean);
  const optionTranslations = buildOptionTranslations(rows);

  const nouns = vocab.filter((v) => v.type === 'noun');
  const nounPool = nouns.length
    ? nouns
    : [{ spanish: 'pan', english: 'bread' }, { spanish: 'agua', english: 'water' }];

  const pool = [];

  rows.forEach((row, i) => {
    const subject = cleanPronoun(row.pronoun);
    const subjectEn = pronounToEnglish(row.pronoun);
    const options = makeOptions(row.form, allForms);

    // Pattern A: Subject ___ noun.
    const noun = pickOne(nounPool, nounPool[0]);
    pool.push({
      id: 'pA-' + i + '-' + rand(),
      prompt: subject + ' ___ ' + noun.spanish + '.',
      answer: row.form,
      options,
      hint: 'Use the correct form of ' + (verb || 'the verb') + ' for ' + subject + '.',
      promptTranslations: { [subject]: subjectEn, [noun.spanish]: noun.english },
      optionTranslations,
    });

    // Pattern B: Choose the correct form of [verb] for [pronoun]:
    if (verb) {
      pool.push({
        id: 'pB-' + i + '-' + rand(),
        prompt: 'Choose the correct form of "' + verb + '" for ' + subject + ':',
        answer: row.form,
        options: makeOptions(row.form, allForms),
        hint: 'The ending changes based on who is doing the action.',
        promptTranslations: {},
        optionTranslations,
      });
    }

    // Pattern C: What does '[form]' mean in English?
    if (row.translation) {
      const correct = row.translation;
      const wrongs = rows
        .filter((r) => r.translation && r.translation !== correct)
        .map((r) => r.translation);
      if (wrongs.length >= 3) {
        pool.push({
          id: 'pC-' + i + '-' + rand(),
          prompt: 'What does "' + row.form + '" mean in English?',
          answer: correct,
          options: makeOptions(correct, wrongs),
          hint: 'Think about which subject "' + row.form + '" goes with.',
          promptTranslations: {},
          optionTranslations: {},
        });
      }
    }

    // Pattern D: How do you say '[English]' in Spanish?
    if (row.translation) {
      pool.push({
        id: 'pD-' + i + '-' + rand(),
        prompt: 'How do you say "' + row.translation + '" in Spanish?',
        answer: row.form,
        options: makeOptions(row.form, allForms),
        hint: 'Match the Spanish verb form to the English meaning.',
        promptTranslations: {},
        optionTranslations,
      });
    }

    // Pattern E: Which subject pronoun goes with '[form]'?
    pool.push({
      id: 'pE-' + i + '-' + rand(),
      prompt: 'Which subject pronoun goes with the verb form "' + row.form + '"?',
      answer: subject,
      options: makeOptions(subject, rows.map((r) => cleanPronoun(r.pronoun))),
      hint: 'Each pronoun has its own unique verb ending.',
      promptTranslations: {},
      optionTranslations: {},
    });
  });

  // Pattern F: vocabulary meaning questions
  const meaningVocab = vocab.filter((v) => v.type !== 'pronoun');
  meaningVocab.forEach((item, i) => {
    const others = meaningVocab.filter((v) => v.spanish !== item.spanish);
    if (others.length < 3) return;
    const wrongMeanings = shuffle(others).slice(0, 3).map((v) => v.english);
    pool.push({
      id: 'pF-' + i + '-' + rand(),
      prompt: 'What does "' + item.spanish + '" mean in English?',
      answer: item.english,
      options: makeOptions(item.english, wrongMeanings),
      hint: 'Think about the context this word is used in.',
      promptTranslations: {},
      optionTranslations: {},
    });
  });

  return pool;
}

function buildOpenEndedPool(lesson) {
  const vocab = lesson?.vocabulary || [];
  const rows = lesson?.conjugation?.table || [];
  const verb = lesson?.conjugation?.verb || '';
  const connectors = vocab.filter((v) => v.type === 'connector' || v.type === 'expression');
  const nouns = vocab.filter((v) => v.type === 'noun');
  const pool = [];

  vocab.forEach((item, i) => {
    pool.push({
      id: 'oe-trans-' + i + '-' + rand(),
      prompt: 'Translate into Spanish: "' + item.english + '"',
      answer: item.spanish,
      hint: 'The answer is a ' + item.type + '.',
    });
  });

  rows.forEach((row, i) => {
    const subject = cleanPronoun(row.pronoun);
    const noun = pickOne(nouns, null);
    if (noun) {
      pool.push({
        id: 'oe-build-' + i + '-' + rand(),
        prompt: 'Write a complete Spanish sentence using "' + row.form + '"' + (row.translation ? ' (' + row.translation + ')' : '') + '.',
        answer: 'Example: ' + subject + ' ' + row.form + ' ' + noun.spanish + '.',
        hint: 'Use "' + row.form + '" as the verb. Add a subject and an object.',
      });
    }
  });

  connectors.forEach((item, i) => {
    pool.push({
      id: 'oe-conn-' + i + '-' + rand(),
      prompt: 'Write a Spanish sentence that uses "' + item.spanish + '" (' + item.english + ').',
      answer: 'Example: use "' + item.spanish + '" to connect two clauses.',
      hint: '"' + item.spanish + '" means "' + item.english + '" — place it between two ideas.',
    });
  });

  if (verb && rows.length >= 2) {
    const wrongRow = pickOne(rows, rows[0]);
    const otherRow = pickOne(rows.filter((r) => r.pronoun !== wrongRow.pronoun), rows[0]);
    if (otherRow && wrongRow.form !== otherRow.form) {
      pool.push({
        id: 'oe-corr-' + rand(),
        prompt: 'Find and correct the verb error: "' + cleanPronoun(otherRow.pronoun) + ' ' + wrongRow.form + '."',
        answer: 'Corrected: ' + cleanPronoun(otherRow.pronoun) + ' ' + otherRow.form + '.',
        hint: cleanPronoun(otherRow.pronoun) + ' needs its own verb ending, not the one for ' + cleanPronoun(wrongRow.pronoun) + '.',
      });
    }
  }

  if (lesson?.example?.sentence) {
    pool.push({
      id: 'oe-rewrite-' + rand(),
      prompt: 'Rewrite this sentence in Spanish using different words: "' + lesson.example.sentence + '"',
      answer: 'Sample: ' + lesson.example.sentence,
      hint: 'Keep the same meaning while changing some of the wording.',
    });
    pool.push({
      id: 'oe-tr-' + rand(),
      prompt: 'Translate into English: "' + lesson.example.sentence + '"',
      answer: lesson.example.translation || '(see translation in the grammar section)',
      hint: 'Focus on the verb tense and the main meaning.',
    });
  }

  return pool;
}

export function enrichLessonPractice(lesson) {
  if (!lesson?.practice || !Array.isArray(lesson.practice.exercises)) {
    return lesson;
  }

  const cloned = cloneJson(lesson);
  const practiceType = cloned.practice.type;
  const baseExercises = practiceType === 'fill-blank'
    ? cloned.practice.exercises.map((exercise) => {
      if (!Array.isArray(exercise.options)) return exercise;
      return {
        ...exercise,
        options: shuffle(exercise.options),
      };
    })
    : cloned.practice.exercises;
  const target = TARGET_COUNT[practiceType] || Math.max(6, baseExercises.length);

  const generated =
    practiceType === 'fill-blank'
      ? buildFillBlankPool(cloned)
      : buildOpenEndedPool(cloned);

  const fullPool = shuffle([...baseExercises, ...generated]);
  const uniquePool = dedupeByPrompt(fullPool);

  const selected = uniquePool.slice(0, target);
  if (selected.length < target) {
    const already = new Set(selected.map((item) => item.id));
    for (const exercise of fullPool) {
      if (selected.length >= target) break;
      if (already.has(exercise.id)) continue;
      selected.push(exercise);
      already.add(exercise.id);
    }
  }

  cloned.practice.exercises = selected;

  return cloned;
}
