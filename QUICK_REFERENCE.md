# ⚡ LinguaAI - Quick Reference Card

## 🚀 Getting Started (Copy & Paste Commands)

### 1️⃣ First Time Setup
```bash
# Install dependencies
npm install

# Configure environment (.env file)
# DATABASE_URL="postgresql://user:pass@localhost:5432/linguaai"
# AUTH_SECRET="your-32-character-secret-key"
# OPENAI_API_KEY="sk-..." (optional)

# Start PostgreSQL
npm run db:up

# Create database (if needed)
createdb linguaai

# Run migrations
npm run prisma:migrate

# Seed sample data
npm run seed

# Start development server
npm run dev
```

Visit: **http://localhost:3000**

---

## 📋 Common Commands

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Run production build |
| `npm test` | Run all tests |
| `npm test:watch` | Run tests in watch mode |
| `npm run seed` | Populate database with samples |
| `npm run lint` | Check code quality |
| `npm run prisma:generate` | Generate Prisma client |
| `npm run prisma:migrate` | Run database migrations |
| `npm run prisma:studio` | Open database GUI |
| `npm run db:up` | Start PostgreSQL (Docker) |
| `npm run db:down` | Stop PostgreSQL (Docker) |

---

## 🔑 Key Files to Know

### Core Features
- **Authentication**: `lib/auth.js` + `app/api/auth/*`
- **Quiz System**: `lib/mistakes.js` + `app/api/quiz/*`
- **AI Integration**: `lib/ai.js`
- **Database**: `prisma/schema.prisma`
- **Auth Context**: `lib/useAuth.js`

### Frontend Pages
- **Dashboard**: `app/dashboard/page.jsx` (stats, navigation)
- **Quiz**: `app/quiz/page.jsx` (interactive quiz)
- **Lessons**: `app/lessons/page.jsx` (browse lessons)
- **Chat**: `app/chat/page.jsx` (language practice)

### Tests
- **Auth Tests**: `__tests__/auth.test.js`
- **API Tests**: `__tests__/api.test.js`
- **Mistake Tests**: `__tests__/mistakes.test.js`

---

## 📊 Project Statistics

- **33** JavaScript/JSX files
- **9** REST API endpoints
- **7** Database models
- **6** Frontend pages
- **3** Reusable components
- **19** Total compiled routes
- **40+** Test cases
- **0** Build errors ✅

---

## 🔐 Test Credentials (After Setup)

Sign up with any email/password:
```
Email: learner@example.com
Password: SpanishLearner123!
Name: Spanish Learner
```

---

## 🐛 Quick Troubleshooting

### Error: "DATABASE_URL is not set"
```bash
# Add to .env file:
DATABASE_URL="postgresql://user:password@localhost:5432/linguaai"
```

### Error: "Cannot find module '@/lib/...'"
```bash
# Make sure jsconfig.json exists in project root:
npm run build  # This will regenerate it
```

### Error: "Port 3000 already in use"
```bash
# Kill process on port 3000:
# Windows: netstat -ano | findstr :3000
# Mac/Linux: lsof -i :3000
```

### Error: "PostgreSQL connection refused"
```bash
# Start PostgreSQL:
npm run db:up

# Or if using local PostgreSQL:
# Make sure PostgreSQL service is running
```

### Error: "OpenAI API key error"
```bash
# This is okay - AI features will use fallback responses
# To enable: add OPENAI_API_KEY to .env
```

---

## 🎯 Development Workflow

### 1. Make Code Changes
```bash
# Edit your files in VS Code
# Example: app/dashboard/page.jsx
```

### 2. Test Changes
```bash
npm run dev  # Dev server auto-reloads
```

### 3. Run Lint
```bash
npm run lint  # Check for code issues
```

### 4. Run Tests
```bash
npm test      # Run test suite
```

### 5. Build for Production
```bash
npm run build  # Verify build succeeds
```

---

## 🚀 Deployment Checklist

- [ ] Database configured (PostgreSQL 17+)
- [ ] Environment variables set (.env file)
- [ ] All tests passing (`npm test`)
- [ ] Build succeeds (`npm run build`)
- [ ] Dependencies installed (`npm install`)
- [ ] Migrations run (`npm run prisma:migrate`)
- [ ] Sample data seeded (`npm run seed`)
- [ ] Hosting provider chosen (Vercel/AWS/Railway)
- [ ] Domain configured
- [ ] Environment variables set in hosting
- [ ] Database backups configured
- [ ] Monitoring enabled

---

## 📚 API Quick Reference

### Sign Up
```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123",
    "name": "John Doe"
  }'
```

### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123"
  }'
```

### Get Quiz Questions
```bash
curl http://localhost:3000/api/quiz/questions \
  -H "Cookie: authToken=YOUR_JWT"
```

### Submit Answer
```bash
curl -X POST http://localhost:3000/api/quiz/submit \
  -H "Content-Type: application/json" \
  -H "Cookie: authToken=YOUR_JWT" \
  -d '{
    "questionId": "q-id",
    "userAnswer": "Your answer"
  }'
```

---

## 🎓 Architecture Quick View

```
User Browser
    ↓
Landing Page (/) → Public content
    ↓
Login/Signup Pages → JWT issuance
    ↓
Protected Pages
├─ Dashboard → Stats display
├─ Quiz → Question fetching + submission
├─ Lessons → Browse content
└─ Chat → Real-time messaging
    ↓
API Routes (/api)
├─ auth/* → Authentication
├─ quiz/* → Learning
├─ lessons/* → Content
├─ chat/* → Social
└─ user/* → Analytics
    ↓
Business Logic
├─ lib/auth.js → JWT/password
├─ lib/mistakes.js → Personalization
└─ lib/ai.js → OpenAI integration
    ↓
PostgreSQL Database
└─ 7 Models (Users, Lessons, Questions, etc.)
```

---

## 🔗 Important Links

- **Prisma Docs**: https://www.prisma.io/docs/
- **Next.js Docs**: https://nextjs.org/docs
- **React Docs**: https://react.dev
- **Tailwind Docs**: https://tailwindcss.com/docs
- **OpenAI API**: https://platform.openai.com/docs
- **PostgreSQL Docs**: https://www.postgresql.org/docs/

---

## 💡 Tips & Tricks

### Debug Database Queries
```bash
npm run prisma:studio
# Opens http://localhost:5555 - visual database editor
```

### Watch Tests During Development
```bash
npm test:watch
# Re-runs tests as you change files
```

### View Build Analysis
```bash
npm run build -- --debug
# Shows detailed build information
```

### Clear Cache
```bash
rm -rf .next && npm run build
# Force rebuild from scratch
```

### Check Node Version
```bash
node --version
# Should be 24+
```

---

## ✨ Next Steps

1. **Set up database**: `npm run db:up && npm run prisma:migrate`
2. **Seed data**: `npm run seed`
3. **Start dev server**: `npm run dev`
4. **Test features**:
   - Visit http://localhost:3000
   - Sign up with test account
   - Navigate to dashboard
   - Try quiz functionality
5. **Customize**: Edit lessons in database or UI code
6. **Add OpenAI**: Set OPENAI_API_KEY for full AI features
7. **Deploy**: Follow SETUP_GUIDE.md deployment section

---

## 📞 Support

- **Documentation**: See README_LINGUAAI.md
- **Setup Help**: See SETUP_GUIDE.md  
- **Implementation Details**: See IMPLEMENTATION_SUMMARY.md
- **Code Examples**: Check __tests__/ directory
- **Database Schema**: See prisma/schema.prisma

---

## ✅ Status

✅ **Project Complete & Ready**
- 33 files created
- 19 routes compiled
- 0 build errors
- 7 database models
- 9 API endpoints
- Full documentation
- Comprehensive tests

**Next Action**: Run `npm install && npm run dev`

Happy coding! 🎉
