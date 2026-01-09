# CareerBox System Overview

## Purpose

CareerBox is an AI-powered career mobility platform that intelligently connects job seekers with employers through sophisticated matching algorithms. Unlike traditional job boards that rely on keyword searching, CareerBox uses a weighted, multi-factor approach to identify the best matches based on role fit, location, industry, skills, and availability.

## Core Value Proposition

**For Job Seekers:**
- Discover opportunities you wouldn't find through traditional search
- Get matched with companies actively seeking your skills
- Save time by focusing only on high-quality matches
- Connect directly with hiring managers through in-app messaging

**For Companies:**
- Access a curated pool of qualified candidates
- Reduce time-to-hire with intelligent matching
- Focus on candidates who are genuinely interested
- Streamline communication with built-in messaging

## Architecture

### Technology Stack

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript 5.3
- **Styling**: Tailwind CSS 3.4, PostCSS
- **Backend**: Next.js API Routes (serverless)
- **Database**: Firebase Firestore (NoSQL)
- **Authentication**: Firebase Auth + Allied iMpact Platform Auth
- **Hosting**: Vercel (frontend), Firebase (database)
- **Entitlements**: `@allied-impact/entitlements` package

### Database Schema

#### Collections

1. **careerbox_individuals** - Individual user profiles
   - Fields: uid, userType, displayName, email, role, skills, location, preferences, stats
   - Indexes: profileComplete + isActive + createdAt

2. **careerbox_companies** - Company profiles
   - Fields: uid, userType, displayName, email, industry, size, locations, team
   - Indexes: profileComplete + isActive + createdAt

3. **careerbox_listings** - Position listings
   - Fields: id, companyUid, title, description, requirements, location, salary, status
   - Indexes: isActive + isPaused + createdAt, companyUid + isActive + createdAt

4. **careerbox_matches** - Match records
   - Fields: id, individualUid, companyUid, listingId, matchScore, matchReasons, status
   - Indexes: individualUid + status + matchScore, companyUid + status + matchScore

5. **careerbox_messages** - Individual messages
   - Fields: id, conversationId, senderUid, recipientUid, content, timestamps
   - Indexes: conversationId + createdAt

6. **careerbox_conversations** - Conversation threads
   - Fields: id, individualUid, companyUid, listingId, lastMessage, unreadCounts
   - Indexes: individualUid/companyUid + isActive + lastMessageAt

7. **careerbox_moderation** - Flagged content
   - Fields: contentType, contentId, reason, severity, status, timestamps
   - Indexes: status + severity + createdAt

8. **careerbox_placements** - Job placements (success tracking)
   - Fields: individualUid, companyUid, listingId, matchId, startDate, status
   - Indexes: status + startDate

### Matching Algorithm

The matching engine uses a **5-factor weighted scoring system**:

```
Total Score = (Role × 40%) + (Location × 30%) + (Industry × 15%) + (Skills × 10%) + (Availability × 5%)
```

#### Factor Details

1. **Role Match (40%)**
   - Extracts keywords from listing title and individual's current/desired role
   - Calculates keyword overlap percentage
   - Weight: 40% (most critical factor)

2. **Location Match (30%)**
   - Exact location match: 100%
   - Same province: 70%
   - Relocation willing: 50%
   - Remote-eligible: 100%
   - Weight: 30% (second most important)

3. **Industry Match (15%)**
   - Exact industry: 100%
   - Related industry: 70%
   - Different industry: 0%
   - Weight: 15%

4. **Skills Match (10%)**
   - Calculates overlap between candidate skills and required skills
   - Percentage of required skills possessed
   - Weight: 10%

5. **Availability Match (5%)**
   - Immediate availability + urgent hire: 100%
   - Availability timing alignment: 50-100%
   - Misaligned timing: 0%
   - Weight: 5%

#### Minimum Threshold

- Matches below **50% total score** are not shown
- Ensures only quality matches are presented

#### Triggering

- **Individual Profile Update**: Triggers matching against all active listings
- **New Listing**: Triggers matching against all complete individual profiles
- **Frequency**: Real-time, limited by subscription tier
  - Free: No automatic matching
  - Entry: Once per profile update (10 matches/month limit)
  - Classic: Real-time matching (unlimited)

## User Flows

### Individual User Flow

1. **Signup** → Select "Job Seeker" → Create account
2. **Profile Setup** → Complete skills, location, preferences
3. **Matching** → System automatically finds matches (if paid tier)
4. **Browse Matches** → View match scores and company profiles
5. **Message Companies** → Initiate conversations with hiring managers
6. **Track Applications** → Monitor responses and interview requests

### Company User Flow

1. **Signup** → Select "Company" → Create account
2. **Company Profile** → Add industry, locations, team info
3. **Post Listing** → Create position with requirements
4. **Matching** → System automatically finds candidates
5. **Review Candidates** → View match scores and profiles
6. **Message Candidates** → Reach out to top matches
7. **Track Hires** → Monitor interview pipeline

## Subscription Tiers

### Free Tier (R0)

**Individuals:**
- See match count only
- View company names only
- No messaging
- No location details

**Companies:**
- See candidate count only
- View names only
- No messaging
- No profile details

**Purpose**: Teaser to encourage upgrades

### Entry Tier (R1,000/month)

**Individuals:**
- 10 matches per month
- 5 messages per month
- City/province location
- Full company profiles

**Companies:**
- 10 candidate views per month
- 5 messages per month
- City/province candidate locations
- Full candidate profiles

**Purpose**: Affordable entry point for individuals and small businesses

### Classic Tier (R5,000/month)

**Individuals:**
- Unlimited matches
- Unlimited messaging
- Exact location details
- Priority matching
- Advanced filters

**Companies:**
- Unlimited candidate views
- Unlimited messaging
- Exact candidate locations
- Priority matching
- Advanced filters
- Team member access (up to 5 users)

**Purpose**: Full-featured plan for serious job seekers and active recruiters

## Moderation System

### Auto-Flagging

Content is automatically scanned for:
- **Offensive language**: Profanity, slurs
- **Discriminatory terms**: Racist, sexist, homophobic content
- **Contact information**: Phone numbers, emails (should use in-app messaging)
- **Spam patterns**: "Click here", "Buy now", etc.
- **Violence**: Threats, harmful content

### Severity Levels

- **Low**: Minor issues, content auto-approved
- **Medium**: Flagged for review, content auto-approved
- **High**: Flagged for immediate review, content auto-approved
- **Critical**: Auto-rejected, requires admin action before approval

### User Reporting

Users can report inappropriate content via:
- Profile "Report" button
- Listing "Report" button
- Message "Report" button

All reports are queued for admin review with medium severity default.

## Security

### Authentication

- Firebase Authentication for user management
- Allied iMpact Platform session validation via middleware
- JWT tokens for API authentication

### Authorization

- Middleware enforces entitlement check for 'careerbox' product
- Tier-based feature access controlled server-side
- Firestore security rules prevent unauthorized data access

### Data Protection

- All passwords hashed by Firebase Auth
- Firestore security rules enforce read/write permissions
- API routes validate user ownership before mutations
- Messages encrypted in transit (HTTPS)

## Success Metrics

### Primary KPIs

1. **Match Quality Score** - % of matches leading to messages
2. **Conversion Rate** - % of free users upgrading to paid
3. **Time to First Match** - Average time from signup to first match
4. **Message Response Rate** - % of messages receiving replies
5. **Placement Rate** - % of matches resulting in job placements

### Secondary Metrics

- Monthly active users (MAU)
- Profile completion rate
- Average matches per user
- Monthly recurring revenue (MRR)
- Customer acquisition cost (CAC)
- Customer lifetime value (LTV)

### Platform Health

- API response times
- Matching engine performance
- Moderation flag rate
- User-reported content
- Firestore read/write costs

## Roadmap

### Phase 1: MVP (Current)
- ✅ Core matching engine
- ✅ Individual and company profiles
- ✅ Listing management
- ✅ Messaging system
- ✅ Basic moderation

### Phase 2: Enhanced Matching (Q2 2026)
- Advanced skill assessments
- Video profiles
- AI-powered role recommendations
- Industry-specific matching weights

### Phase 3: Enterprise Features (Q3 2026)
- Applicant tracking system (ATS) integration
- Team collaboration tools
- Advanced analytics dashboard
- API for third-party integrations

### Phase 4: Market Expansion (Q4 2026)
- Regional customization (other African countries)
- Multi-language support expansion
- Industry verticals (tech, healthcare, finance)
- Recruitment agency partnerships

## Integration Points

### Allied iMpact Platform

- **Authentication**: Shared session management via `@allied-impact/auth`
- **Entitlements**: Subscription checks via `@allied-impact/entitlements`
- **Portal**: Listed in product catalog at `web/portal`
- **Billing**: Subscription management handled by platform

### External Services (Future)

- **Payment Gateway**: Stripe/PayStack for subscriptions
- **Email Service**: SendGrid for notifications
- **SMS Service**: Twilio for alerts
- **Video API**: Daily.co for video interviews
- **Analytics**: Google Analytics, Mixpanel

## Support and Maintenance

### Regular Tasks

- Monitor Firestore costs and optimize queries
- Review moderation flags weekly
- Update matching algorithm based on feedback
- Analyze match quality metrics monthly
- Security audits quarterly

### Incident Response

1. Monitor error logs via Vercel dashboard
2. Check Firestore operations for anomalies
3. Review user-reported issues
4. Deploy hotfixes within 24 hours for critical bugs
5. Post-mortem documentation for major incidents

## Team Roles

- **Product Owner**: Define features and priorities
- **Tech Lead**: Architecture decisions and code reviews
- **Backend Developer**: API routes, matching engine, moderation
- **Frontend Developer**: UI/UX, dashboards, public pages
- **QA Engineer**: Testing, bug tracking, quality assurance
- **DevOps**: Deployment, monitoring, infrastructure

## Contact

- **Product**: [product@alliedimpact.com]
- **Technical**: [tech@alliedimpact.com]
- **Support**: [support@alliedimpact.com]
