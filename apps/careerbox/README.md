# Allied iMpact CareerBox

> **Status:** 🚧 In Development  
> **Version:** 1.0.0  
> **Last Updated:** January 10, 2026

## 🎯 Overview

CareerBox is a **matching-first career mobility platform** that connects job-seeking individuals with hiring companies through an intelligent matching engine. It is ONE standalone app within the Allied iMpact ecosystem.

### What CareerBox Is
- ✅ Matching-first career mobility platform
- ✅ Instant candidate-to-position matching
- ✅ Real-time profile-based matching
- ✅ Lightweight skill-based matching (not CV-heavy)

### What CareerBox Is NOT
- ❌ Full HR/ATS system
- ❌ LinkedIn competitor
- ❌ Resume builder
- ❌ Applicant tracking system

## 🚀 Quick Start

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev

# Open http://localhost:3006
```

## 👥 User Types

### 1. Individuals (Job Seekers)
- Create profile with role preferences, skills, location
- View matching positions
- Message employers (paid plans)
- Track application status

### 2. Companies (Employers)
- Create company profile
- Post position listings
- View matching candidates
- Message candidates (paid plans)

### 3. General Visitors
- Browse marketing pages
- View pricing
- Must register to see matches

## 💰 Pricing Tiers

### 🆓 Free Plan
- See **number** of potential matches
- See **names only** (no full profiles)
- ❌ No messaging
- ❌ No exact location
- ❌ No contact details

### 💼 Entry Plan (R1,000/month)
- Full profiles
- **Limited:** 10 matches/month, 5 messages/month
- Approximate location (city/province)

### 🏆 Classic Plan (R5,000/month)
- **Unlimited** matches and messaging
- Exact location visibility
- Priority matching
- Advanced filters
- Team members (companies)

## 🧠 Matching Engine

### Weighted Factors
1. **Role/Position** (40%) - Desired role vs position title
2. **Location** (30%) - Current location + relocation preference
3. **Industry** (15%) - Sector alignment
4. **Skills** (10%) - Lightweight skill tags
5. **Availability** (5%) - Start date alignment

### Minimum Score
- Matches must score **≥50%** to be shown

### Real-Time Matching
- Triggered on profile update
- Frequency depends on subscription tier
- Results cached for performance

## 📁 Project Structure

```
careerbox/
├── src/
│   ├── app/
│   │   ├── [locale]/              # i18n routes
│   │   │   ├── page.tsx           # Homepage
│   │   │   ├── auth/              # Login/signup
│   │   │   ├── dashboard/
│   │   │   │   ├── individual/    # Individual dashboard
│   │   │   │   └── company/       # Company dashboard
│   │   │   ├── pricing/
│   │   │   ├── about/
│   │   │   └── legal/
│   │   └── api/                   # API routes
│   │       ├── matching/
│   │       ├── profiles/
│   │       ├── listings/
│   │       └── messages/
│   ├── components/
│   │   ├── individual/
│   │   ├── company/
│   │   ├── shared/
│   │   └── matches/
│   ├── lib/
│   │   ├── matching-engine.ts     # Core matching logic
│   │   ├── firebase.ts
│   │   └── moderation.ts
│   ├── types/
│   │   └── index.ts               # TypeScript types
│   └── config/
│       └── env.ts                 # Environment config
├── middleware.ts                   # Auth & entitlement checks
├── package.json
├── next.config.js
├── tailwind.config.ts
└── tsconfig.json
```

## 🔧 Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript 5.3
- **Styling:** Tailwind CSS 3.4
- **Database:** Firebase Firestore
- **Auth:** Firebase Authentication via `@allied-impact/auth`
- **Deployment:** Vercel
- **i18n:** next-intl (en/zu/st)

## 🗄️ Database Collections

```
careerbox_individuals    # Individual profiles
careerbox_companies      # Company profiles
careerbox_listings       # Position listings
careerbox_matches        # Match records
careerbox_messages       # Messaging
careerbox_conversations  # Conversation threads
careerbox_moderation     # Flagged content
careerbox_placements     # Job placements (success tracking)
```

## 🔐 Authentication Flow

```
User clicks "CareerBox" from Portal Dashboard
↓
Redirects to careerbox.alliedimpact.com
↓
Middleware checks:
  1. Platform session cookie exists?
  2. User has 'careerbox' entitlement?
↓
If YES: Access granted
If NO: Redirect to Portal with error
```

## 🚦 Development Mode

In development, auth and entitlement checks are **bypassed** for faster iteration:

```bash
NODE_ENV=development pnpm dev
```

⚠️ **Warning:** Always test with production auth before deploying!

## 📊 Success Metrics

1. Number of matches created
2. Subscriptions sold (Entry + Classic)
3. Messages exchanged
4. Interviews scheduled
5. **Job placements** (users who got jobs)

## 🛡️ AI Moderation

- **Automated flagging** of inappropriate content
- Flags: profiles, listings, messages
- Severity levels: low, medium, high, critical
- Admin review dashboard (future)

## 🧪 Testing

```bash
# Unit tests
pnpm test

# Watch mode
pnpm test:watch

# Coverage
pnpm test:coverage

# E2E tests
pnpm test:e2e
```

## 🚀 Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment instructions.

**Quick Deploy:**
```bash
# 1. Configure environment variables in Vercel
# 2. Deploy via Git
git push origin main
```

## 🔗 Integration with Platform

- **Product ID:** `careerbox`
- **Entitlement Check:** `hasProductAccess(uid, 'careerbox')`
- **Database Isolation:** All collections prefixed with `careerbox_`
- **Shared Packages:**
  - `@allied-impact/auth` - Authentication
  - `@allied-impact/entitlements` - Access control
  - `@allied-impact/types` - Shared types
  - `@allied-impact/shared` - Utilities

## 📝 Environment Variables

See [.env.example](.env.example) for all required variables.

**Required:**
- Firebase configuration
- Feature flags
- API base URL

**Optional:**
- Google Analytics ID
- Redis (for rate limiting)

## 🤝 Contributing

1. Create feature branch
2. Make changes
3. Write tests
4. Submit PR

## 📄 License

Proprietary - Allied iMpact (Pty) Ltd

## 🆘 Support

- Documentation: `/docs`
- Issues: GitHub Issues
- Email: support@alliedimpact.com

---

**Built with ❤️ by Allied iMpact Team**
