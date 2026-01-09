# My Projects - Custom Solution Client Portal

My Projects is an independent app within the Allied iMpact platform ecosystem that provides custom solution clients with a dedicated portal to track their projects, communicate with the development team, manage deliverables, and handle milestone payments.

## Overview

**Purpose**: Custom solution client portal  
**Domain**: myprojects.alliedimpact.com  
**Port**: 3006 (development)  
**Type**: Independent Next.js app with SSO integration

## Features

### Core Features (V1)
- ✅ Client registration (from solution discovery flow)
- ✅ Project dashboard (overview, progress, health)
- ✅ Milestone tracking
- ✅ Deliverable management (uploads, approvals)
- ✅ Communication system (comments + tickets)
- ✅ Milestone payments (bank transfer + in-app)
- ✅ SSO integration with platform

### User Flows

#### Flow 1: New Client
1. Complete solution discovery questionnaire on alliedimpact.com
2. Click "Start My Project"
3. Register in My Projects app
4. Project automatically created (Discovery status)
5. Access project dashboard

#### Flow 2: Returning Client
1. Direct access to myprojects.alliedimpact.com
2. Login with Allied iMpact credentials (SSO)
3. View all projects
4. Track progress, communicate, pay milestones

#### Flow 3: Via Platform
1. Login to alliedimpact.com
2. See My Projects in app grid
3. Click My Projects → SSO redirect
4. Access projects

## Architecture

### Independence
- Separate app with own codebase
- Own domain and routing
- Independent deployment
- Can scale separately
- PWA support (can be installed)

### Integration
- Uses `@allied-impact/auth` for authentication
- Reports entitlements to platform
- Shown on Individual Dashboard with other apps
- SSO across all Allied iMpact apps

### Payment Model
- Payments happen IN the app (not on platform)
- Milestone-based payments
- Supports bank transfer + Stripe/PayFast
- Platform only tracks "has access" entitlement

## Development

### Setup
```bash
cd apps/myprojects
pnpm install
pnpm dev
```

### Environment Variables
```env
NEXT_PUBLIC_MYPROJECTS_URL=http://localhost:3006
NEXT_PUBLIC_PLATFORM_URL=http://localhost:3001
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
```

### Build
```bash
pnpm build
pnpm start
```

### Testing
```bash
pnpm test              # Run unit tests
pnpm test:watch        # Watch mode
pnpm test:coverage     # With coverage
```

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **UI**: React 18 + Tailwind CSS
- **Components**: Shadcn/ui
- **Auth**: Firebase + SSO
- **Database**: Firestore
- **Storage**: Firebase Storage
- **Payments**: Stripe + PayFast

## Platform Services Used

- `@allied-impact/auth` - Authentication
- `@allied-impact/entitlements` - Access control
- `@allied-impact/projects` - Project management
- `@allied-impact/shared` - Utilities
- `@allied-impact/ui` - UI components

## Project Structure

```
apps/myprojects/
├── app/
│   ├── page.tsx                    # Main dashboard
│   ├── layout.tsx                  # Root layout
│   ├── signup/
│   │   └── page.tsx                # Registration
│   ├── login/
│   │   └── page.tsx                # Login
│   ├── project/
│   │   └── [id]/
│   │       └── page.tsx            # Project details
│   ├── tickets/
│   │   └── page.tsx                # Support tickets
│   ├── deliverables/
│   │   └── page.tsx                # Files & deliverables
│   └── settings/
│       └── page.tsx                # Settings
├── components/                     # App components
├── lib/                           # Utilities
├── hooks/                         # Custom hooks
├── public/                        # Static assets
└── package.json
```

## User Types

**Only custom solution clients use this app**:
- NGOs needing websites
- Businesses needing software
- Schools needing portals
- Governments needing systems
- Individuals needing apps

**NOT for**:
- General project management
- App subscribers (they use other apps)
- Internal team projects

## Communication

### Comments System
- Comment on projects
- Comment on milestones
- Comment on deliverables
- Rich text + attachments
- @mentions
- Email notifications

### Ticket System
- Create support tickets
- Categories: Question, Bug, Feature, Support
- Priority levels
- Status tracking
- Threaded replies
- File attachments

## Payments

### Milestone Payments
- Each milestone has payment amount
- Payment status: Pending → Awaiting → Paid
- Due dates and reminders
- Invoice generation

### Payment Methods
1. **Bank Transfer**: Display details, upload proof, admin approves
2. **In-App**: Stripe/PayFast integration, instant confirmation

## Deliverables

### File Management
- Upload to Firebase Storage
- Version history
- File types: Design, Code, Docs, Assets
- Preview for images/PDFs
- Download management

### Approval Workflow
1. Team uploads deliverable
2. Client gets notification
3. Client reviews
4. Client approves OR requests revision
5. Status updates trigger next milestone

## Roadmap

### Phase 1 (Current - V1)
- ✅ Core project tracking
- ✅ Basic communication (comments + tickets)
- ✅ Milestone payments
- ✅ File management

### Phase 2 (Post-V1)
- Mobile app (React Native)
- Advanced analytics
- Time tracking
- Team collaboration features
- Custom branding per client

### Phase 3 (Future)
- API access for clients
- Webhooks
- Integration marketplace
- White-label option

## License

Private - Allied iMpact © 2026
