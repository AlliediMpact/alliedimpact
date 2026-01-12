# 🎓 EduTech - Education & Skills Development Platform

> **Empowering learners from computer basics to professional coding**

---

## 📖 Overview

EduTech is Allied iMpact's comprehensive education platform offering dual learning tracks:

- **Computer Skills Track** (FREE - Sponsored) - Digital literacy, office skills, financial education
- **Coding Track** (PREMIUM - Subscription) - Software development from beginner to job-ready

**Status**: Active Development | Target Launch: Q2 2026  
**Port**: 3007  
**URL**: edutech.alliedimpact.com (staging)

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- pnpm 8+
- Firebase account

### Installation

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev

# Open browser
# http://localhost:3007
```

### Build for Production

```bash
# Type check
pnpm type-check

# Run tests
pnpm test

# Build
pnpm build

# Start production server
pnpm start
```

---

## 🏗️ Architecture

### Tech Stack
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript 5.3
- **Styling**: Tailwind CSS + shadcn/ui
- **Backend**: Firebase (Auth, Firestore, Storage, Functions)
- **Testing**: Jest + React Testing Library + Playwright
- **i18n**: next-intl

### Platform Integration
- **Auth**: `@allied-impact/auth` - Centralized authentication
- **Entitlements**: `@allied-impact/entitlements` - Access control
- **Types**: `@allied-impact/types` - Shared TypeScript definitions
- **UI**: `@allied-impact/ui` - Component library
- **Shared**: `@allied-impact/shared` - Common utilities

### Database Structure

```typescript
// Firestore Collections
edutech_users/{userId}           // User profiles & preferences
edutech_courses/{courseId}       // Course catalog
edutech_enrollments/{userId}/courses/{courseId}  // Enrollments
edutech_certificates/{certId}    // Issued certificates
edutech_assessments/{assessId}   // Quizzes & tests
edutech_submissions/{userId}/assessments/{assessId}  // User submissions
edutech_forum_posts/{postId}     // Discussion forums
```

---

## 🎯 Features

### Phase 1: Foundation (Weeks 1-2) ✅
- [x] App structure & routing
- [x] Authentication integration
- [x] Basic layout components
- [ ] Firebase configuration

### Phase 2: Core Features (Weeks 3-4) 🚧
- [ ] Course catalog
- [ ] Course detail pages
- [ ] Enrollment system
- [ ] Learner dashboard

### Phase 3: Learning Experience (Weeks 5-6)
- [ ] Lesson viewer (video/reading)
- [ ] Progress tracking
- [ ] Quiz system
- [ ] Code editor integration

### Phase 4: Certification (Weeks 7-8)
- [ ] Assessment system
- [ ] Certificate generation
- [ ] Verification system

### Phase 5: Community (Weeks 9-10)
- [ ] Discussion forums
- [ ] User profiles
- [ ] Achievements/badges

### Phase 6: Admin Tools (Weeks 11-12)
- [ ] Instructor dashboard
- [ ] Course creation
- [ ] Admin panel

### Phase 7: Polish (Weeks 13-14)
- [ ] Performance optimization
- [ ] Mobile optimization
- [ ] PWA support

### Phase 8: Launch Prep (Weeks 15-16)
- [ ] Comprehensive testing
- [ ] Documentation
- [ ] Beta testing

---

## 📊 Product Tiers

### FREE - Computer Skills Track
- **Access**: All computer skills courses
- **Features**:
  - Digital literacy
  - Microsoft Office basics
  - Financial education
  - Community resources
  - Basic certificates
- **Sponsored by**: NGOs & Government
- **Target**: 10,000+ users by Q4 2026

### PREMIUM - R199/month
- **Access**: Computer Skills + Coding Track
- **Features**:
  - All FREE features
  - Professional coding courses
  - Interactive coding labs
  - Industry certifications
  - Project portfolio
  - Career support
- **Target**: 1,000+ subscribers by Q4 2026

### ENTERPRISE - Custom Pricing
- **Access**: Full platform + customization
- **Features**:
  - All PREMIUM features
  - Team dashboards
  - Custom content
  - Analytics & reporting
  - Priority support
- **Target**: 10+ organizations by Q4 2026

---

## 🧪 Testing

```bash
# Unit & Component Tests
pnpm test                # Run once
pnpm test:watch          # Watch mode
pnpm test:coverage       # With coverage report
pnpm test:ci             # CI mode

# E2E Tests
pnpm test:e2e            # Headless
pnpm test:e2e:headed     # With browser
pnpm test:e2e:debug      # Debug mode
```

**Target**: 80%+ test coverage

---

## 📚 Documentation

- [ARCHITECTURE.md](./ARCHITECTURE.md) - Technical architecture
- [FEATURES.md](./FEATURES.md) - Complete feature list
- [DEVELOPMENT.md](./DEVELOPMENT.md) - Development guide
- [TESTING.md](./TESTING.md) - Testing strategy
- [../../docs/EDUTECH_ECOSYSTEM_ANALYSIS.md](../../docs/EDUTECH_ECOSYSTEM_ANALYSIS.md) - Ecosystem analysis

---

## 🌍 Internationalization

Supported languages:
- English (en)
- Zulu (zu)
- Xhosa (xh)

All UI text uses next-intl for translations.

---

## 🔐 Security

- Firebase Auth for authentication
- Firestore Security Rules
- Input validation (Zod)
- XSS prevention
- CSRF protection
- Environment variables secured

---

## 📈 Success Metrics

### Launch (Q2 2026)
- 100% feature parity
- 80%+ test coverage
- <2s page load time
- Lighthouse 90+ score

### Q3 2026
- 1,000+ registered users
- 100+ paying subscribers
- 5,000+ course enrollments
- 1,000+ certificates issued

### Q4 2026
- 10,000+ registered users
- 1,000+ paying subscribers
- 50,000+ course enrollments
- 10,000+ certificates issued

---

## 🤝 Contributing

1. Create feature branch from `main`
2. Make changes with tests
3. Run `pnpm test` and `pnpm lint`
4. Submit PR with clear description

---

## 📞 Support

- **Slack**: #edutech-dev
- **Email**: edutech@alliedimpact.com
- **Docs**: [Platform Documentation](../../docs/)

---

## 📝 License

Private - Allied iMpact Proprietary

---

**Last Updated**: January 11, 2026  
**Version**: 0.1.0 (In Development)  
**Team**: Allied iMpact Education Team
