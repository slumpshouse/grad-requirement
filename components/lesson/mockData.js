/**
 * Mock lesson data for all three levels.
 * Used as a fallback when the API is unavailable.
 */

export const MOCK_LESSONS = {
  beginner: {
    level: 'beginner',
    title: 'Your First Spanish Sentences',
    category: 'Food & Basics',
    progress: 20,
    grammar: {
      title: 'Subject + Verb + Object',
      rules: [
        'Use the present tense for things happening now or regularly.',
        'Spanish verbs change their ending based on the subject.',
        'The basic order is: who does something (subject) → action (verb) → what (object).',
      ],
      tense: 'Present Tense',
    },
    vocabulary: [
      { spanish: 'yo', english: 'I', type: 'pronoun' },
      { spanish: 'como', english: 'I eat', type: 'verb' },
      { spanish: 'pan', english: 'bread', type: 'noun' },
      { spanish: 'bebo', english: 'I drink', type: 'verb' },
      { spanish: 'agua', english: 'water', type: 'noun' },
      { spanish: 'tengo', english: 'I have', type: 'verb' },
      { spanish: 'hambre', english: 'hunger', type: 'noun' },
    ],
    example: {
      sentence: 'Yo como pan.',
      translation: 'I eat bread.',
      breakdown: [
        { word: 'Yo', role: 'subject', label: 'subject (I)' },
        { word: 'como', role: 'verb', label: 'verb – present tense of comer' },
        { word: 'pan', role: 'object', label: 'object (bread)' },
      ],
    },
    conjugation: {
      verb: 'comer',
      translation: 'to eat',
      table: [
        { pronoun: 'yo', form: 'como' },
        { pronoun: 'tú', form: 'comes' },
        { pronoun: 'él/ella', form: 'come' },
        { pronoun: 'nosotros', form: 'comemos' },
        { pronoun: 'vosotros', form: 'coméis' },
        { pronoun: 'ellos/ellas', form: 'comen' },
      ],
    },
    practice: {
      type: 'fill-blank',
      instructions: 'Fill in the blank with the correct word.',
      exercises: [
        {
          id: 'b1',
          prompt: 'Yo ___ pan.',
          answer: 'como',
          options: ['como', 'comes', 'come', 'comen'],
          hint: 'First person singular of comer',
        },
        {
          id: 'b2',
          prompt: 'Ella ___ agua.',
          answer: 'bebe',
          options: ['bebo', 'bebe', 'beben', 'bebemos'],
          hint: 'Third person singular of beber',
        },
        {
          id: 'b3',
          prompt: 'Nosotros ___ hambre.',
          answer: 'tenemos',
          options: ['tengo', 'tienes', 'tiene', 'tenemos'],
          hint: 'First person plural of tener',
        },
      ],
    },
  },

  intermediate: {
    level: 'intermediate',
    title: 'Talking About the Past',
    category: 'Travel & Dining',
    progress: 50,
    grammar: {
      title: 'Past Tense + Time Indicators',
      rules: [
        'Use the preterite (simple past) tense for completed actions.',
        'Time words like ayer (yesterday) and anoche (last night) help place events in the past.',
        'Connecting words like porque (because) and y (and) link ideas together.',
      ],
      tense: 'Preterite Tense',
    },
    vocabulary: [
      { spanish: 'comí', english: 'I ate', type: 'verb' },
      { spanish: 'restaurante', english: 'restaurant', type: 'noun' },
      { spanish: 'ayer', english: 'yesterday', type: 'time' },
      { spanish: 'viajé', english: 'I traveled', type: 'verb' },
      { spanish: 'ciudad', english: 'city', type: 'noun' },
      { spanish: 'compré', english: 'I bought', type: 'verb' },
      { spanish: 'mercado', english: 'market', type: 'noun' },
      { spanish: 'porque', english: 'because', type: 'connector' },
    ],
    example: {
      sentence: 'Yo comí en el restaurante ayer.',
      translation: 'I ate at the restaurant yesterday.',
      breakdown: [
        { word: 'Yo', role: 'subject', label: 'subject (I)' },
        { word: 'comí', role: 'verb', label: 'verb – preterite of comer' },
        { word: 'en el restaurante', role: 'object', label: 'object (at the restaurant)' },
        { word: 'ayer', role: 'time', label: 'time indicator (yesterday)' },
      ],
    },
    conjugation: {
      verb: 'comer',
      translation: 'to eat',
      table: [
        { pronoun: 'yo', form: 'comí' },
        { pronoun: 'tú', form: 'comiste' },
        { pronoun: 'él/ella', form: 'comió' },
        { pronoun: 'nosotros', form: 'comimos' },
        { pronoun: 'vosotros', form: 'comisteis' },
        { pronoun: 'ellos/ellas', form: 'comieron' },
      ],
      note: 'Irregular verbs like ir (to go): fui, fuiste, fue, fuimos, fuisteis, fueron.',
    },
    practice: {
      type: 'correction',
      instructions: 'Correct the sentence or translate the phrase.',
      exercises: [
        {
          id: 'i1',
          prompt: 'Find the error: "Yo como en el restaurante ayer."',
          answer: 'Yo comí en el restaurante ayer.',
          hint: 'Ayer signals past tense – change the verb.',
        },
        {
          id: 'i2',
          prompt: 'Translate: "I traveled to the city yesterday."',
          answer: 'Yo viajé a la ciudad ayer.',
          hint: 'Use the preterite of viajar.',
        },
        {
          id: 'i3',
          prompt: 'Connect: "I was hungry. I ate at the market."',
          answer: 'Tenía hambre porque comí en el mercado.',
          hint: 'Use porque to connect the two ideas.',
        },
      ],
    },
  },

  advanced: {
    level: 'advanced',
    title: 'Conditionals & Abstract Expression',
    category: 'Culture & Opinion',
    progress: 80,
    grammar: {
      title: 'Conditional Sentences & Subjunctive',
      rules: [
        'Use si + imperfect subjunctive + conditional to express hypothetical situations.',
        'Express opinions with creo que (I think), en mi opinión (in my opinion).',
        'Complex sentences chain multiple clauses with contrast (aunque – although) and purpose (para que – so that).',
      ],
      tense: 'Conditional / Subjunctive',
    },
    vocabulary: [
      { spanish: 'tuviera', english: 'I had (subjunctive)', type: 'verb' },
      { spanish: 'tiempo', english: 'time', type: 'noun' },
      { spanish: 'comería', english: 'I would eat', type: 'verb' },
      { spanish: 'saludable', english: 'healthy', type: 'adjective' },
      { spanish: 'aunque', english: 'although', type: 'connector' },
      { spanish: 'creo que', english: 'I think that', type: 'expression' },
      { spanish: 'cultura', english: 'culture', type: 'noun' },
      { spanish: 'emoción', english: 'emotion', type: 'noun' },
    ],
    example: {
      sentence: 'Si tuviera tiempo, comería más saludable.',
      translation: 'If I had time, I would eat healthier.',
      breakdown: [
        { word: 'Si tuviera tiempo', role: 'condition', label: 'condition clause (if I had time)' },
        { word: 'comería', role: 'verb', label: 'verb – conditional of comer' },
        { word: 'más saludable', role: 'object', label: 'modifier (healthier)' },
      ],
    },
    conjugation: {
      verb: 'comer',
      translation: 'to eat',
      table: [
        { pronoun: 'yo', form: 'comería' },
        { pronoun: 'tú', form: 'comerías' },
        { pronoun: 'él/ella', form: 'comería' },
        { pronoun: 'nosotros', form: 'comeríamos' },
        { pronoun: 'vosotros', form: 'comeríais' },
        { pronoun: 'ellos/ellas', form: 'comerían' },
      ],
      subjunctiveTable: [
        { pronoun: 'yo', form: 'comiera' },
        { pronoun: 'tú', form: 'comieras' },
        { pronoun: 'él/ella', form: 'comiera' },
        { pronoun: 'nosotros', form: 'comiéramos' },
        { pronoun: 'vosotros', form: 'comierais' },
        { pronoun: 'ellos/ellas', form: 'comieran' },
      ],
    },
    practice: {
      type: 'build',
      instructions: 'Build a sentence or express your opinion.',
      exercises: [
        {
          id: 'a1',
          prompt: 'Build a conditional sentence using: hablar / tiempo / más',
          answer: 'Si tuviera tiempo, hablaría más español.',
          hint: 'Use si + imperfect subjunctive + conditional.',
        },
        {
          id: 'a2',
          prompt: 'Express your opinion: Is technology good for language learning?',
          answer: 'En mi opinión, la tecnología es muy útil para aprender idiomas.',
          hint: 'Start with En mi opinión or Creo que…',
        },
        {
          id: 'a3',
          prompt: 'Combine: "I like culture. It helps me understand people."',
          answer: 'Me gusta la cultura porque me ayuda a entender a las personas.',
          hint: 'Use porque to show the reason.',
        },
      ],
    },
  },
};
