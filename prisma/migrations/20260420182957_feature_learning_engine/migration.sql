-- AlterTable
ALTER TABLE "chat_messages" ADD COLUMN     "levelGroup" TEXT NOT NULL DEFAULT 'beginner';

-- AlterTable
ALTER TABLE "lessons" ADD COLUMN     "conjugationTopic" TEXT,
ADD COLUMN     "grammarTopic" TEXT,
ADD COLUMN     "sentenceType" TEXT;

-- AlterTable
ALTER TABLE "mistake_logs" ADD COLUMN     "correctAnswer" TEXT,
ADD COLUMN     "errorType" TEXT NOT NULL DEFAULT 'grammar_error',
ADD COLUMN     "incorrectAnswer" TEXT;

-- AlterTable
ALTER TABLE "questions" ADD COLUMN     "conjugationTense" TEXT,
ADD COLUMN     "conjugationVerb" TEXT,
ADD COLUMN     "errorType" TEXT,
ADD COLUMN     "grammarRuleId" TEXT,
ADD COLUMN     "sentenceId" TEXT;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "dialectPreference" TEXT NOT NULL DEFAULT 'latin_america';

-- CreateTable
CREATE TABLE "grammar_rules" (
    "id" TEXT NOT NULL,
    "language" TEXT NOT NULL DEFAULT 'Spanish',
    "level" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "ruleName" TEXT NOT NULL,
    "ruleDescription" TEXT NOT NULL,
    "examples" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "grammar_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verb_conjugations" (
    "id" TEXT NOT NULL,
    "language" TEXT NOT NULL DEFAULT 'Spanish',
    "verb" TEXT NOT NULL,
    "tense" TEXT NOT NULL,
    "person" TEXT NOT NULL,
    "pronoun" TEXT NOT NULL,
    "conjugatedForm" TEXT NOT NULL,
    "isIrregular" BOOLEAN NOT NULL DEFAULT false,
    "difficultyLevel" TEXT NOT NULL DEFAULT 'beginner',
    "skillStage" TEXT NOT NULL DEFAULT 'present',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "verb_conjugations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verb_masteries" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "verb" TEXT NOT NULL,
    "tense" TEXT NOT NULL,
    "masteryScore" INTEGER NOT NULL DEFAULT 0,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "correctAnswers" INTEGER NOT NULL DEFAULT 0,
    "unlocked" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "verb_masteries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sentences" (
    "id" TEXT NOT NULL,
    "lessonId" TEXT,
    "language" TEXT NOT NULL DEFAULT 'Spanish',
    "text" TEXT NOT NULL,
    "subjectWord" TEXT,
    "verbWord" TEXT,
    "objectWord" TEXT,
    "conjugationRule" TEXT,
    "breakdown" JSONB NOT NULL,
    "sentenceType" TEXT NOT NULL DEFAULT 'declarative',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sentences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "achievements" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "unlockedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "achievements_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "grammar_rules_language_level_topic_idx" ON "grammar_rules"("language", "level", "topic");

-- CreateIndex
CREATE INDEX "verb_conjugations_verb_tense_idx" ON "verb_conjugations"("verb", "tense");

-- CreateIndex
CREATE UNIQUE INDEX "verb_conjugations_language_verb_tense_person_key" ON "verb_conjugations"("language", "verb", "tense", "person");

-- CreateIndex
CREATE INDEX "verb_masteries_userId_masteryScore_idx" ON "verb_masteries"("userId", "masteryScore");

-- CreateIndex
CREATE UNIQUE INDEX "verb_masteries_userId_verb_tense_key" ON "verb_masteries"("userId", "verb", "tense");

-- CreateIndex
CREATE INDEX "sentences_lessonId_idx" ON "sentences"("lessonId");

-- CreateIndex
CREATE INDEX "sentences_language_sentenceType_idx" ON "sentences"("language", "sentenceType");

-- CreateIndex
CREATE INDEX "achievements_userId_category_idx" ON "achievements"("userId", "category");

-- CreateIndex
CREATE UNIQUE INDEX "achievements_userId_code_key" ON "achievements"("userId", "code");

-- CreateIndex
CREATE INDEX "mistake_logs_errorType_idx" ON "mistake_logs"("errorType");

-- CreateIndex
CREATE INDEX "questions_sentenceId_idx" ON "questions"("sentenceId");

-- CreateIndex
CREATE INDEX "questions_grammarRuleId_idx" ON "questions"("grammarRuleId");

-- AddForeignKey
ALTER TABLE "verb_masteries" ADD CONSTRAINT "verb_masteries_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sentences" ADD CONSTRAINT "sentences_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "lessons"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "questions" ADD CONSTRAINT "questions_sentenceId_fkey" FOREIGN KEY ("sentenceId") REFERENCES "sentences"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "questions" ADD CONSTRAINT "questions_grammarRuleId_fkey" FOREIGN KEY ("grammarRuleId") REFERENCES "grammar_rules"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "achievements" ADD CONSTRAINT "achievements_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
