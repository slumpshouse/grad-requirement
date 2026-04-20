# 🌍 LinguaAI - AI-Powered Language Learning Platform

A full-stack web application for learning Spanish (and other languages) with AI-powered lessons, personalized quizzes, gamification, and real-time chat.

## 🎯 Features

### ✅ Authentication System
- User signup with email and password
- Secure password hashing with bcryptjs
- JWT-based session management with HTTP-only cookies
- Protected API routes and pages
- Logout functionality

### 📚 Learning Features
- **Lessons**: Browse and start Spanish lessons by level
- **Interactive Quizzes**: AI-generated questions personalized to user weaknesses
- **Mistake Tracking**: System tracks incorrect answers to identify weak areas
- **Smart Analysis**: Analyzes user weakness areas from failed attempts

### 🧠 AI Integration
- OpenAI API integration for generating quiz questions
- AI-powered explanations for incorrect answers
- Grammar suggestions for chat messages
- Personalized content generation

### 🎮 Gamification
- **XP System**: +10 XP for lesson completion, +5 XP for correct answers
- **Streak Tracking**: Daily activity streak counter
- **Level System**: Beginner → Intermediate → Advanced based on XP thresholds
- **Dashboard Stats**: Real-time view of progress and weak areas

### 💬 Social Learning
- Language-based chat rooms (Spanish, French, German)
- Real-time message storage
- AI grammar correction suggestions
- Community learning environment

### 📊 Analytics & Personalization
- User dashboard with stats and weak areas
- Personalized quiz generation based on past mistakes
- Detailed mistake frequency tracking
- User progress visualization

## 🏗️ Project Structure

```
grad-requirement/
├── app/
│   ├── api/
│   │   ├── auth/              # Authentication endpoints
│   │   │   ├── signup/
│   │   │   ├── login/
│   │   │   ├── logout/
│   │   │   └── session/
│   │   ├── chat/messages/     # Chat endpoints
│   │   ├── lessons/           # Lessons endpoints
│   │   │   └── [id]/
│   │   ├── quiz/              # Quiz endpoints
│   │   │   ├── questions/
│   │   │   └── submit/
│   │   └── user/weak-areas/   # User analytics
│   ├── dashboard/             # Protected dashboard page
│   ├── lessons/               # Lessons browser
│   ├── quiz/                  # Interactive quiz page
│   ├── chat/                  # Chat room page
│   ├── login/                 # Login page
│   ├── signup/                # Signup page
│   ├── layout.jsx             # Root layout with AuthProvider
│   └── page.jsx               # Landing page
├── components/
│   ├── LoginForm.jsx          # Login form component
│   ├── SignupForm.jsx         # Signup form component
│   └── ProtectedRoute.jsx     # Auth guard component
├── lib/
│   ├── auth.js                # Auth utilities (JWT, password hashing)
│   ├── middleware.js          # Auth middleware for API routes
│   ├── useAuth.js             # React context for auth state
│   ├── mistakes.js            # Mistake tracking and analysis
│   ├── ai.js                  # OpenAI API integration
│   └── prisma.js              # Prisma client with Pg adapter
├── prisma/
│   └── schema.prisma          # Database schema
├── scripts/
│   └── seed.js                # Database seeding script
├── __tests__/
│   ├── auth.test.js           # Authentication tests
│   ├── mistakes.test.js       # Mistake tracking tests
│   └── api.test.js            # API endpoint tests
├── package.json
├── jsconfig.json
├── prisma.config.js
├── next.config.mjs
└── docker-compose.yml         # PostgreSQL setup

```

## 🗄️ Database Schema

### User
- id, email (unique), password (hashed)
- name, selectedLanguage, level (beginner/intermediate/advanced)
- xp (experience points), streak, lastActivityDate
- Relations: quizAttempts, mistakeLogs, chatMessages, sessions

### Lesson
- id, title, description, language, level
- content (HTML/markdown), topic, duration
- Relations: questions

### Question
- id, lessonId, type (multiple_choice/fill_blank/translation/listening)
- question, options (array), correctAnswer, explanation
- mistakeType (grammar/vocabulary/tense/pronunciation)
- Relations: quizAttempts, mistakeLogs

### QuizAttempt
- id, userId, questionId, userAnswer, isCorrect
- xpGained, timeSpent, attemptedAt

### MistakeLog
- id, userId, questionId, mistakeType
- frequency (incremented on repeated mistakes)

### ChatMessage
- id, userId, room, message, suggestedCorrection
- createdAt (with indexes for efficient querying)

### Session
- id, sessionToken (unique), userId, expires

## 🔐 Authentication Flow

1. **Signup**: POST `/api/auth/signup`
   - Creates user with hashed password
   - Returns JWT token in HTTP-only cookie
   - Redirects to dashboard

2. **Login**: POST `/api/auth/login`
   - Verifies credentials
   - Creates JWT token
   - Returns user data with cookie

3. **Protected Routes**:
   - Middleware extracts JWT from cookie
   - Verifies token validity
   - Returns 401 if unauthorized

4. **Logout**: POST `/api/auth/logout`
   - Clears auth cookie
   - Frontend redirects to login

## 🚀 Getting Started

### Prerequisites
- Node.js 24+
- PostgreSQL 17 (or Docker)
- OpenAI API key (for AI features)

### Setup

1. **Install dependencies**
```bash
npm install
```

2. **Configure environment**
```bash
# Create .env file
DATABASE_URL="postgresql://user:password@localhost:5432/linguaai"
AUTH_SECRET="your-secret-key-min-32-chars"
OPENAI_API_KEY="sk-..."
```

3. **Start PostgreSQL**
```bash
# Using Docker
npm run db:up

# Or configure your own PostgreSQL instance
```

4. **Create database and run migrations**
```bash
# Create database
createdb linguaai

# Run Prisma migrations
npm run prisma:migrate
```

5. **Seed sample data**
```bash
npm run seed
```

6. **Run development server**
```bash
npm run dev
```

Visit `http://localhost:3000`

## 📖 Usage

### User Workflow

1. **Sign Up**: Create account at `/signup`
2. **Complete Profile**: Select learning language (Spanish)
3. **Dashboard**: View stats and choose learning path
4. **Take Lessons**: Browse lessons by level
5. **Take Quizzes**: AI-generated questions based on weaknesses
6. **Practice Chat**: Chat in Spanish with AI corrections
7. **Track Progress**: Monitor XP, streak, and weak areas

### API Endpoints

#### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/session` - Get current session

#### Learning
- `GET /api/lessons` - Get all lessons (queryable by level)
- `GET /api/lessons/[id]` - Get specific lesson with questions
- `GET /api/quiz/questions` - Get personalized quiz questions
- `POST /api/quiz/submit` - Submit quiz answer

#### Analytics
- `GET /api/user/weak-areas` - Get user's weak areas

#### Chat
- `GET /api/chat/messages` - Get room messages
- `POST /api/chat/messages` - Send message

## 🧪 Testing

Run the test suite:
```bash
# Run all tests
npm test

# Run tests in watch mode
npm test:watch

# Run with coverage report
npm test -- --coverage
```

### Test Coverage
- ✅ Authentication (signup, login, tokens)
- ✅ Mistake tracking and analysis
- ✅ API endpoint security
- ✅ Input validation
- ✅ Protected routes
- ✅ Quiz submission
- ✅ Error handling

## 🤖 AI Features

### OpenAI Integration
Set `OPENAI_API_KEY` environment variable to enable:

- **Quiz Generation**: Auto-generates Spanish questions
- **Explanations**: AI explains why answers are incorrect
- **Grammar Suggestions**: Real-time chat corrections

### Without OpenAI
- Fallback questions are used
- Basic explanations are provided
- Grammar suggestions are limited

## 📦 Dependencies

### Core
- `next` 16.2.2 - React framework
- `react` 19.2.4 - UI library
- `react-dom` 19.2.4 - DOM rendering

### Database
- `@prisma/client` 7.7.0 - ORM client
- `prisma` 7.7.0 - ORM toolkit
- `@prisma/adapter-pg` 7.7.0 - PostgreSQL adapter
- `pg` 8.20.0 - PostgreSQL driver

### Authentication
- `bcryptjs` 3.0.3 - Password hashing
- `jsonwebtoken` 9.0.3 - JWT tokens
- `next-auth` 4.24.14 - Auth framework

### Styling
- `tailwindcss` 4 - CSS utility framework

### Testing
- `jest` 29.7.0 - Test runner

## 🔧 Available Scripts

```bash
npm run dev              # Start dev server
npm run build            # Production build
npm run start            # Start production server
npm run lint             # Run ESLint
npm test                # Run tests
npm run test:watch      # Watch mode testing
npm run seed            # Seed database
npm run prisma:generate # Generate Prisma client
npm run prisma:migrate  # Run migrations
npm run prisma:studio   # Open Prisma Studio
npm run db:up           # Start PostgreSQL (Docker)
npm run db:down         # Stop PostgreSQL (Docker)
```

## 🔒 Security Considerations

- ✅ Passwords hashed with bcryptjs (rounds: 10)
- ✅ JWT tokens stored in HTTP-only cookies
- ✅ Protected API routes with middleware
- ✅ CORS protection (SameSite=Strict)
- ✅ Secure session management
- ✅ Input validation on all endpoints
- ✅ SQL injection prevention via Prisma
- ✅ XSS protection via React

## 📈 Scalability

Current implementation supports:
- Thousands of concurrent users
- Real-time message polling (can upgrade to WebSockets)
- Pagination for lessons/messages
- Database indexing on frequently queried fields
- Efficient Prisma queries with proper relations

### Future Improvements
- WebSocket implementation for real-time chat
- Redis caching for frequently accessed data
- Load balancing for multiple instances
- CDN for static assets
- Database read replicas

## 🐛 Troubleshooting

### "DATABASE_URL is not set"
```bash
# Add to .env
DATABASE_URL="postgresql://user:password@localhost:5432/linguaai"
```

### "Unauthorized" errors
- Check if auth cookie is being set
- Verify token hasn't expired
- Clear browser cookies and re-login

### "OpenAI API key not found"
- AI features will use fallbacks
- Set OPENAI_API_KEY to enable full AI functionality

### Build errors
```bash
npm run build -- --debug  # See detailed errors
```

## 📝 Sample Test Cases

### Auth Tests
```javascript
✓ Signup creates user with hashed password
✓ Login with invalid credentials returns 401
✓ Protected routes block unauthenticated users
✓ Session persists across requests
✓ Logout clears auth cookie
```

### Quiz Tests
```javascript
✓ Quiz endpoint requires authentication
✓ Quiz submit records attempt and XP
✓ Incorrect answers log mistakes
✓ Personalized quiz prioritizes weak areas
✓ AI explanations are generated for wrong answers
```

### Chat Tests
```javascript
✓ Chat messages require authentication
✓ Chat messages are stored with user ID
✓ Grammar suggestions are provided
✓ Messages can be filtered by room
```

## 📄 License

MIT License - Feel free to use this project for learning

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📧 Support

For issues or questions:
1. Check the troubleshooting section
2. Review test cases for expected behavior
3. Check environment variables are set correctly
4. Review database schema in `prisma/schema.prisma`

---

**Happy Learning! 🚀** Learn Spanish with LinguaAI and track your progress with our AI-powered platform.
