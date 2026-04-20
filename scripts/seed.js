/**
 * Database seeding script
 * Populate the database with sample lessons and questions
 * Run with: node scripts/seed.js
 */

import 'dotenv/config';
import { prisma } from '../lib/prisma.js';

const SAMPLE_GRAMMAR_RULES = [
  {
    language: 'Spanish',
    level: 'beginner',
    topic: 'present_tense',
    ruleName: 'Present tense of regular -AR verbs',
    ruleDescription: 'Drop -ar and add o, as, a, amos, an depending on pronoun.',
    examples: ['Yo hablo', 'Tu hablas', 'Nosotros hablamos'],
  },
  {
    language: 'Spanish',
    level: 'beginner',
    topic: 'gender_agreement',
    ruleName: 'Noun-adjective gender agreement',
    ruleDescription: 'Adjectives agree in gender and number with the noun.',
    examples: ['La casa blanca', 'El libro rojo'],
  },
  {
    language: 'Spanish',
    level: 'beginner',
    topic: 'sentence_structure',
    ruleName: 'Basic SVO sentence structure',
    ruleDescription: 'Use Subject + Verb + Object for beginner sentence building.',
    examples: ['Yo como manzana', 'Ella lee un libro'],
  },
];

const SAMPLE_CONJUGATIONS = [
  { verb: 'comer', tense: 'present', person: 'first_singular', pronoun: 'yo', conjugatedForm: 'como', isIrregular: false },
  { verb: 'comer', tense: 'present', person: 'second_singular', pronoun: 'tu', conjugatedForm: 'comes', isIrregular: false },
  { verb: 'hablar', tense: 'present', person: 'first_singular', pronoun: 'yo', conjugatedForm: 'hablo', isIrregular: false },
  { verb: 'ser', tense: 'present', person: 'first_singular', pronoun: 'yo', conjugatedForm: 'soy', isIrregular: true },
  { verb: 'ir', tense: 'present', person: 'first_singular', pronoun: 'yo', conjugatedForm: 'voy', isIrregular: true },
].map((item) => ({
  language: 'Spanish',
  difficultyLevel: 'beginner',
  skillStage: 'present',
  ...item,
}));

const SAMPLE_LESSONS = [
  {
    title: 'Spanish Greetings',
    description: 'Learn basic Spanish greetings and how to introduce yourself',
    language: 'Spanish',
    level: 'beginner',
    content: `
      <h2>Spanish Greetings</h2>
      <ul>
        <li><strong>Hola</strong> - Hello</li>
        <li><strong>Buenos días</strong> - Good morning</li>
        <li><strong>Buenas tardes</strong> - Good afternoon</li>
        <li><strong>Buenas noches</strong> - Good evening/night</li>
        <li><strong>¿Cómo estás?</strong> - How are you? (informal)</li>
        <li><strong>Bien, gracias</strong> - Good, thanks</li>
      </ul>
    `,
    topic: 'vocabulary',
    duration: 15,
  },
  {
    title: 'Present Tense Verbs',
    description: 'Master the present tense conjugation of common verbs',
    language: 'Spanish',
    level: 'beginner',
    content: `
      <h2>Present Tense Conjugation</h2>
      <h3>Regular -AR verbs (e.g., hablar - to speak)</h3>
      <ul>
        <li>Yo hablo - I speak</li>
        <li>Tú hablas - You speak</li>
        <li>Él/Ella habla - He/She speaks</li>
        <li>Nosotros hablamos - We speak</li>
        <li>Vosotros habláis - You all speak (Spain)</li>
        <li>Ellos/Ellas hablan - They speak</li>
      </ul>
    `,
    topic: 'grammar',
    duration: 20,
  },
  {
    title: 'Common Verbs in Spanish',
    description: 'Learn the most commonly used Spanish verbs',
    language: 'Spanish',
    level: 'beginner',
    content: `
      <h2>Common Spanish Verbs</h2>
      <ul>
        <li><strong>Ser</strong> - To be (permanent)</li>
        <li><strong>Estar</strong> - To be (location/condition)</li>
        <li><strong>Tener</strong> - To have</li>
        <li><strong>Hacer</strong> - To do/make</li>
        <li><strong>Ir</strong> - To go</li>
        <li><strong>Poder</strong> - Can/To be able to</li>
        <li><strong>Decir</strong> - To say</li>
        <li><strong>Dar</strong> - To give</li>
      </ul>
    `,
    topic: 'vocabulary',
    duration: 15,
  },
];

const SAMPLE_QUESTIONS = [
  {
    type: 'multiple_choice',
    question: 'What is the Spanish word for "hello"?',
    options: ['Hola', 'Adiós', 'Gracias', 'Por favor'],
    correctAnswer: 'Hola',
    explanation: 'Hola is the standard Spanish greeting for "hello".',
    mistakeType: 'vocabulary',
  },
  {
    type: 'multiple_choice',
    question: 'How do you conjugate "hablar" (to speak) for "I speak"?',
    options: ['Hablo', 'Hablas', 'Habla', 'Hablamos'],
    correctAnswer: 'Hablo',
    explanation: 'Hablo is the first-person singular present tense conjugation.',
    mistakeType: 'grammar',
  },
  {
    type: 'fill_blank',
    question: 'Complete: "Yo _____ (tener) un gato"',
    options: ['tengo', 'tienes', 'tiene', 'tenemos'],
    correctAnswer: 'tengo',
    explanation: 'Tengo is the first-person singular present of "tener".',
    mistakeType: 'grammar',
  },
  {
    type: 'multiple_choice',
    question: 'What does "buenas noches" mean?',
    options: ['Good morning', 'Good afternoon', 'Good evening/night', 'Good day'],
    correctAnswer: 'Good evening/night',
    explanation: 'Buenas noches is used as a greeting in the evening or night, and as a farewell anytime.',
    mistakeType: 'vocabulary',
  },
  {
    type: 'multiple_choice',
    question: 'Which verb means "to go" in Spanish?',
    options: ['Ir', 'Venir', 'Salir', 'Andar'],
    correctAnswer: 'Ir',
    explanation: 'Ir means "to go". Venir means "to come", Salir means "to leave", and Andar means "to walk".',
    mistakeType: 'vocabulary',
  },
];

async function seed() {
  try {
    console.log('Starting database seed...');

    console.log('Creating grammar rules...');
    for (const rule of SAMPLE_GRAMMAR_RULES) {
      await prisma.grammarRule.upsert({
        where: {
          id: `${rule.language}-${rule.level}-${rule.topic}-${rule.ruleName}`.replace(/\s+/g, '-').toLowerCase(),
        },
        update: rule,
        create: {
          id: `${rule.language}-${rule.level}-${rule.topic}-${rule.ruleName}`.replace(/\s+/g, '-').toLowerCase(),
          ...rule,
        },
      });
      console.log(`✓ Upserted grammar rule: ${rule.ruleName}`);
    }

    console.log('Creating verb conjugations...');
    for (const conjugation of SAMPLE_CONJUGATIONS) {
      await prisma.verbConjugation.upsert({
        where: {
          language_verb_tense_person: {
            language: conjugation.language,
            verb: conjugation.verb,
            tense: conjugation.tense,
            person: conjugation.person,
          },
        },
        update: conjugation,
        create: conjugation,
      });
      console.log(`✓ Upserted conjugation: ${conjugation.pronoun} ${conjugation.conjugatedForm}`);
    }

    // Create lessons
    console.log('Creating lessons...');
    const createdLessons = [];
    for (const lesson of SAMPLE_LESSONS) {
      const created = await prisma.lesson.create({
        data: lesson,
      });
      createdLessons.push(created);
      console.log(`✓ Created lesson: ${created.title}`);
    }

    // Create questions for the first lesson
    console.log('Creating questions...');
    if (createdLessons.length > 0) {
      const grammarRule = await prisma.grammarRule.findFirst({
        where: { topic: 'present_tense', language: 'Spanish', level: 'beginner' },
      });

      for (const question of SAMPLE_QUESTIONS) {
        const sentence = await prisma.sentence.create({
          data: {
            lessonId: createdLessons[0].id,
            language: 'Spanish',
            text: question.correctAnswer,
            subjectWord: question.correctAnswer.split(' ')[0] || null,
            verbWord: question.correctAnswer.split(' ')[1] || null,
            objectWord: question.correctAnswer.split(' ').slice(2).join(' ') || null,
            conjugationRule: 'present tense',
            breakdown: [
              { word: question.correctAnswer.split(' ')[0] || question.correctAnswer, role: 'subject' },
              { word: question.correctAnswer.split(' ')[1] || null, role: 'verb' },
              { word: question.correctAnswer.split(' ').slice(2).join(' ') || null, role: 'object' },
            ],
          },
        });

        const created = await prisma.question.create({
          data: {
            ...question,
            lessonId: createdLessons[0].id, // Add to first lesson
            sentenceId: sentence.id,
            grammarRuleId: grammarRule?.id || null,
            errorType: question.mistakeType === 'vocabulary' ? 'vocabulary_error' : 'grammar_error',
            conjugationVerb: question.mistakeType === 'grammar' ? 'tener' : null,
            conjugationTense: question.mistakeType === 'grammar' ? 'present' : null,
          },
        });
        console.log(`✓ Created question: ${created.type}`);
      }
    }

    console.log('\n✅ Database seeding completed successfully!');
    console.log(`Created ${createdLessons.length} lessons and ${SAMPLE_QUESTIONS.length} questions`);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

seed();
