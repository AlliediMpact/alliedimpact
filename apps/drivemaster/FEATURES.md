# 🚗 DriveMaster - Features Documentation

## Table of Contents
1. [Core Features](#core-features)
2. [User Journey](#user-journey)
3. [Gamification System](#gamification-system)
4. [Subscription Model](#subscription-model)
5. [B2B Features (Schools)](#b2b-features-schools)
6. [Admin Features](#admin-features)
7. [Quality Enhancements](#quality-enhancements)
8. [Future Roadmap](#future-roadmap)

---

## Core Features

### 1. Journey-Based Learning 🎮

**Description:** Instead of static quizzes, users experience realistic driving scenarios through interactive journeys.

**How It Works:**
1. User selects a journey from their current stage
2. Journey simulates a real driving route (e.g., "Suburbs to City Center - 12km")
3. Along the route, events trigger (stop signs, traffic lights, pedestrians)
4. Each event presents a contextual question
5. Correct answer → earn points, continue journey
6. Incorrect answer → lose credits, see explanation
7. Complete journey → earn certificate if 95%+ score achieved

**Key Benefits:**
- **Contextual Learning:** Questions tied to real-world scenarios
- **Engagement:** Feels like a driving game, not a boring quiz
- **Memory Retention:** Scenario-based learning improves recall
- **Confidence Building:** Practice before getting behind the wheel

**Journeys by Stage:**
| Stage | Journeys | Difficulty | Mastery Required |
|-------|----------|------------|------------------|
| Beginner | 12+ | Easy | 95% |
| Intermediate | 15+ | Medium | 97% |
| Advanced | 10+ | Hard | 98% |
| K53 Simulation | 5 | Expert | 100% |

---

### 2. Strict Mastery-Based Progression 📈

**Description:** Users MUST achieve 95-100% scores to progress. Payment never bypasses learning.

**Progression Model:**
```
Beginner Stage (95%+ required)
  ↓
Complete 8/12 journeys with 95%+
  ↓
Unlock Intermediate Stage
  ↓
Complete 10/15 journeys with 97%+
  ↓
Unlock Advanced Stage
  ↓
Complete 7/10 journeys with 98%+
  ↓
Unlock K53 Simulation
  ↓
Complete all 5 simulations with 100%
  ↓
Master Level Achieved 🏆
```

**Why Strict Mastery?**
- **Safety:** Ensures users truly understand road rules before driving
- **Integrity:** No shortcuts = real learning
- **Confidence:** Users know they've earned their knowledge
- **Reputation:** DriveMaster becomes known for quality education

**Feedback Loops:**
- ✅ Passed journey → Badge earned, next journey unlocked
- ❌ Failed journey → Detailed explanation, retry allowed
- 🔁 Retry mechanics → Spend 15 credits, attempt again
- 📊 Progress tracking → Dashboard shows % complete per stage

---

### 3. Credit System (Gamification Currency) 💰

**Description:** Virtual currency earned through activity and spent on journeys.

**Earning Credits:**
| Action | Credits Earned |
|--------|----------------|
| Sign up | +100 credits |
| Complete journey (pass) | +50 credits |
| Daily login streak (7 days) | +20 credits |
| Share certificate on social media | +30 credits |
| Refer a friend (signs up) | +100 credits |
| Perfect score (100%) | +50 bonus |
| Watching ad (optional) | +10 credits |

**Spending Credits:**
| Action | Credits Cost |
|--------|--------------|
| Start journey | -15 credits |
| Retry failed journey | -15 credits |
| Skip explanation (not recommended) | -5 credits |
| Unlock hint | -3 credits |

**Bankruptcy Protection:**
- If credits reach 0, users can:
  - Watch 3 ads to earn 30 credits
  - Wait 24 hours for +20 daily bonus
  - Refer a friend for +100 credits
  - Subscribe to unlock unlimited journeys

**Why Credits Work:**
- **Engagement:** Gamifies the learning experience
- **Retention:** Users return daily for streak bonuses
- **Monetization:** Encourages subscription to avoid credit management
- **Fair Play:** Free users can still progress, just slower

---

### 4. Multi-Stage Learning Path 🎓

**Stage 1: Beginner (Accessible to All)**
- **Focus:** Road signs, basic rules, vehicle controls
- **Journeys:** Residential areas, school zones, parking lots
- **Difficulty:** Easy questions, generous time limits
- **Example Journey:** "Neighborhood Drive - Learn Stop Signs"

**Stage 2: Intermediate (Trial/Paid Only)**
- **Focus:** Traffic navigation, right-of-way, defensive driving
- **Journeys:** City streets, shopping centers, roundabouts
- **Difficulty:** Medium complexity, situational awareness
- **Example Journey:** "City Rush Hour - Master Traffic Flow"

**Stage 3: Advanced (Paid Only)**
- **Focus:** Highways, hazard perception, night driving
- **Journeys:** Freeways, rural roads, adverse conditions
- **Difficulty:** Hard scenarios, quick decision-making
- **Example Journey:** "Highway Challenge - High-Speed Decisions"

**Stage 4: K53 Simulation (Paid Only)**
- **Focus:** Official K53 test simulation
- **Journeys:** Exact replicas of Department of Transport tests
- **Difficulty:** Expert level, 100% accuracy required
- **Example Journey:** "Official K53 Test #1 - Yard Test"

---

### 5. Certificate System 🏆

**Description:** Verified digital certificates for journey completion and stage mastery.

**Certificate Types:**
1. **Journey Completion:** Earned with 95%+ score
2. **Stage Mastery:** Earned by completing all journeys in a stage
3. **K53 Simulation:** Earned with 100% on official simulation
4. **Master Certificate:** Earned by completing all stages

**Certificate Features:**
- **Unique Number:** DM-2026-001234 (verifiable)
- **QR Code:** Links to verification page
- **PDF Download:** Printable copy
- **Social Sharing:** LinkedIn, Twitter, Facebook, WhatsApp
- **Verification Portal:** Public page to verify authenticity

**Verification Process:**
```
User completes journey with 95%+
  ↓
Certificate generated with unique number
  ↓
Stored in Firestore with user details
  ↓
PDF generated with QR code
  ↓
Email sent with certificate attachment
  ↓
Anyone can verify at /verify/[certificateNumber]
```

**Use Cases:**
- Share on LinkedIn to show learning progress
- Show to driving schools for lesson discounts
- Add to CV/resume as a skill
- Print and frame for motivation

---

### 6. Badges & Achievements 🎖️

**Description:** Collectible badges for various accomplishments.

**Badge Categories:**

**Completion Badges:**
- 🚗 "First Journey" - Complete your first journey
- 🏁 "Stage Master" - Complete all journeys in a stage
- 🎯 "Perfect Score" - Achieve 100% on any journey
- 🔥 "Speed Demon" - Complete 10 journeys in one day

**Streak Badges:**
- 📅 "Consistent Learner" - 7-day login streak
- 🔥 "On Fire" - 30-day login streak
- ⭐ "Dedicated" - 100-day login streak

**Skill Badges:**
- 🚦 "Sign Master" - Answer 100 road sign questions correctly
- 🛑 "Rules Expert" - Master all traffic rules
- 👀 "Hazard Spotter" - Identify 50 hazards correctly

**Social Badges:**
- 🤝 "Referral King" - Refer 10 friends
- 📢 "Influencer" - Share 5 certificates on social media
- 💬 "Helpful" - Leave 10 journey reviews

**Display:**
- Badge showcase on profile
- Badge progress tracking
- Rare badge notifications
- Leaderboards for competitive users

---

## User Journey

### New User Flow

```
1. Landing Page → View Features
   ↓
2. Sign Up (Email/Google/Facebook)
   ↓
3. Onboarding Tutorial (3 steps)
   - "Welcome to DriveMaster"
   - "How Credits Work"
   - "Choose Your First Journey"
   ↓
4. Dashboard → +100 Welcome Credits
   ↓
5. Browse Beginner Journeys (12 available)
   ↓
6. Select Journey → Preview (stats, difficulty)
   ↓
7. Start Journey → Spend 15 Credits
   ↓
8. Play Through Journey
   - Answer questions
   - Get instant feedback
   - See explanations
   ↓
9. Complete Journey → See Results
   - Score: 97% (PASSED)
   - Credits earned: +50
   - Badge earned: "First Journey" 🎖️
   - Certificate generated
   ↓
10. Post-Journey Options
   - Download certificate PDF
   - Share on social media (+30 credits)
   - Start next journey
   - Review answers
```

### Returning User Flow

```
1. Login → Dashboard
   ↓
2. Daily Streak Bonus (+20 credits if consecutive day)
   ↓
3. See Progress
   - Current stage: Intermediate
   - Journeys completed: 15/40
   - Average score: 96.5%
   - Next unlock: Advanced Stage (2 journeys away)
   ↓
4. Continue Learning
   - Resume incomplete journey
   - Start new journey
   - Review past attempts
   - Check leaderboard
```

---

## Gamification System

### Progression Mechanics

**Experience Points (XP):**
- Not currently implemented, but planned for Phase 2
- Would unlock cosmetic rewards (car skins, profile themes)

**Leaderboards:**
- Weekly: Top scores this week
- Monthly: Most journeys completed
- All-Time: Highest average score
- Friends: Compare with Facebook/Google contacts

**Daily Challenges:**
- "Complete 3 journeys today" → +50 bonus credits
- "Achieve 100% on any journey" → Rare badge
- "Login streak of 7 days" → +100 credits

**Achievements:**
- 50+ unique achievements to unlock
- Progress tracking per achievement
- Notifications when close to unlocking

---

## Subscription Model

### Tiers

**1. Free Plan**
- ✅ Beginner stage access (12 journeys)
- ✅ Limited to 3 journeys per day
- ✅ Credit system (earn/spend)
- ✅ Basic certificates
- ✅ Ads shown (optional for credits)
- ❌ No intermediate/advanced/K53 stages
- ❌ No priority support

**2. 7-Day Trial (Free)**
- ✅ All 4 stages unlocked
- ✅ Unlimited journeys
- ✅ No credit restrictions
- ✅ All certificate types
- ✅ No ads
- ✅ Priority email support
- ⏰ Auto-expires after 7 days (can cancel anytime)

**3. Lifetime Access (R99 once-off)**
- ✅ All 4 stages unlocked forever
- ✅ Unlimited journeys
- ✅ No credit restrictions
- ✅ All certificate types
- ✅ No ads
- ✅ Priority support
- ✅ Early access to new features
- ✅ Lifetime updates

### Conversion Strategy

**Free → Trial:**
- Banner on dashboard: "Unlock all stages with 7-day trial"
- After completing 6 beginner journeys: "Ready for more? Start trial"
- When clicking locked journey: Modal with trial CTA

**Trial → Lifetime:**
- Email on Day 5: "2 days left - Upgrade now"
- Email on Day 6: "1 day left - Last chance"
- Email on Day 7: "Trial expired - Only R99 for lifetime"
- In-app notification: "Upgrade to keep your progress"

**Free → Lifetime (Skip Trial):**
- Clear value proposition on pricing page
- "Skip the trial, get lifetime access now"
- Show savings: "R99 = Unlimited vs R15/journey = R600 for 40 journeys"

### Payment Integration

**PayFast (South African Gateway):**
- Supports all major SA payment methods
- EFT, Credit Card, Instant EFT, Zapper, SnapScan
- 3.9% + R2 per transaction
- Instant payment notifications (ITN)
- Secure PCI-compliant

**Payment Flow:**
```
1. User clicks "Subscribe"
   ↓
2. Generate PayFast payment data + signature
   ↓
3. Redirect to PayFast secure page
   ↓
4. User completes payment
   ↓
5. PayFast sends ITN (webhook) to our server
   ↓
6. Verify signature
   ↓
7. Update user subscription in Firestore
   ↓
8. Send confirmation email
   ↓
9. Redirect user back to dashboard (subscription active)
```

---

## B2B Features (Schools)

### Driving School Partnership Program

**Value Proposition:**
- Schools get free leads from DriveMaster users
- DriveMaster earns 10% commission on confirmed bookings
- Win-win: schools grow, we monetize, users find quality schools

### School Registration

**Process:**
1. School owner visits /schools/register
2. Fills form:
   - School name
   - Registration number (verified)
   - Owner details
   - Location
   - Pricing
   - Bank details (for commission payouts)
3. Submits for approval
4. Admin reviews (verify registration, check reputation)
5. Approved → School goes live on platform

### Lead Generation

**How It Works:**
```
User completes journey
  ↓
Popup: "Ready to start real lessons? Connect with a driving school"
  ↓
User browses schools (filtered by location)
  ↓
User clicks "Contact School"
  ↓
Lead created in Firestore:
  - User details (name, phone, email)
  - Preferred date/time
  - Current progress (stage, certificates)
  - Status: "new"
  ↓
Email sent to school owner
  ↓
School contacts user
  ↓
If confirmed booking:
  - School marks lead as "converted"
  - Commission tracked (10% of booking value)
  - Paid out monthly
```

### School Dashboard

**Features for School Owners:**
- View all leads (new, contacted, converted)
- Lead details (name, phone, progress)
- Conversion analytics
- Commission tracker
- Update school profile
- Manage pricing

### Admin School Management

**Admin Features:**
- Approve/reject school registrations
- View all schools and leads
- Monitor conversion rates
- Manage commissions
- Handle disputes
- Bulk actions (approve multiple, export data)

---

## Admin Features

### Admin Dashboard

**Key Metrics:**
- Total users (growth chart)
- Revenue (line chart)
- Subscription conversions (pie chart)
- Journey completion rate (bar chart)
- Top schools leaderboard (table)
- Pending school approvals (alert banner)

### User Management

- View all users
- Search/filter users
- Ban/unban users
- Reset passwords
- Grant free lifetime access (promo)
- View user journey history

### Content Management

- Add/edit/delete journeys
- Upload journey images
- Manage questions database
- Create new badges
- Update certificate templates

### Analytics & Reports

- User growth over time
- Revenue breakdown (subscriptions, ads)
- Journey performance (pass rates, difficulty)
- School lead conversions
- Referral tracking

### Commission Management

- View pending commissions
- Approve payouts
- Generate commission statements
- Export for accounting
- School performance reports

---

## Quality Enhancements

### Recent Additions (Sprint 12 & 13)

**High-Priority Features (19/19 Complete):**
1. ✅ Email Service (SendGrid, 8 email types)
2. ✅ Error Boundaries (3-tier)
3. ✅ Loading States (skeletons)
4. ✅ Security (.gitignore, env validation)
5. ✅ Rate Limiting (API protection)
6. ✅ Auth Middleware (route protection)
7. ✅ Offline Sync (retry logic)
8. ✅ School Search (real-time filtering)
9. ✅ Journey Preview Modal (stats before starting)
10. ✅ Journey History (complete with charts)
11. ✅ Toast Notifications (25+ variants)
12. ✅ Bulk Admin Actions (approve multiple schools)
13. ✅ Analytics Tracking (30+ events)
14. ✅ Keyboard Shortcuts (gameplay controls)
15. ✅ Empty State Components (6 types)
16. ✅ Confirmation Dialogs (4 types)
17. ✅ PWA Manifest (installable app)
18. ✅ SEO Optimization (metadata system)

**Medium-Priority Features (9/9 Complete):**
1. ✅ Print-Friendly Certificates (A4 optimization)
2. ✅ Difficulty Indicators (Easy/Medium/Hard badges)
3. ✅ Journey Bookmarks (save favorites)
4. ✅ Social Sharing (LinkedIn, Twitter, Facebook, WhatsApp)
5. ✅ Question Explanations (detailed modal)
6. ✅ Feedback Widget (bug/feature/general)
7. ✅ Dark Mode (theme toggle)
8. ✅ Admin Charts (revenue, users, completion, schools)
9. ✅ Multi-Language (English + Afrikaans)

### User Experience Enhancements

**Accessibility:**
- Keyboard navigation support
- Screen reader friendly
- High contrast mode (dark mode)
- Focus indicators
- Alt text on images

**Performance:**
- Code splitting
- Image optimization (AVIF/WebP)
- Lazy loading
- Bundle size < 200KB
- Page load time < 2s
- Lighthouse score > 90

**Mobile Optimization:**
- Responsive design (mobile-first)
- Touch-friendly buttons
- Swipe gestures
- PWA installable
- Offline support

---

## Future Roadmap

### Phase 2 (Q3 2026)

**Multiplayer Journeys:**
- Race against friends
- Co-op learning mode
- Live leaderboards

**Advanced Analytics:**
- Personal learning insights
- Weak areas identification
- Adaptive difficulty

**Content Expansion:**
- 50+ new journeys
- Video explanations
- Interactive 3D scenarios

### Phase 3 (Q4 2026)

**Mobile Apps:**
- iOS app (React Native)
- Android app (React Native)
- Offline-first architecture

**AI Integration:**
- Personalized learning paths
- Smart question recommendations
- Voice-based learning

**Social Features:**
- Friend system
- Study groups
- Challenge friends
- Global leaderboards

### Phase 4 (2027)

**VR/AR Experience:**
- Virtual reality driving
- Augmented reality road signs
- Immersive 360° scenarios

**Marketplace:**
- User-generated journeys
- Premium content packs
- Instructor-led courses

---

*Last Updated: January 15, 2026*
