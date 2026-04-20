export default {
  testEnvironment: 'node',
  transform: {},
  setupFiles: ['dotenv/config'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  collectCoverageFrom: [
    'lib/ai.js',
    'lib/grammar-engine.js',
    'lib/conjugation-engine.js',
    'lib/sentence-engine.js',
    'lib/mistakes.js',
    'app/api/**/*.js',
  ],
};
