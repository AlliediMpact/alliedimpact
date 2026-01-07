# 🚀 Platform Portal - Development Kickoff

**Date:** January 7, 2026  
**Status:** Ready to Build  
**Design Reference:** Coin Box (for consistency)

---

## ✅ Approved Plan Summary

### Design System
- **Colors:** Coin Box style (#193281 Deep Blue, #5e17eb Purple)
- **Typography:** Inter font, Coin Box sizing
- **Components:** Mirror Coin Box UI patterns
- **Consistency:** All apps look and feel the same

### Key Pages
1. **Public Pages:** Home, Products, Pricing, About, Contact (with tickets & chat)
2. **Dashboard:** Personalized hub with quick access
3. **Account:** Settings, subscriptions, notifications
4. **Legal:** Terms, Privacy, Cookies

### Enhanced Contact Page 🌟
- **Public:** Basic contact form
- **Logged-In:** Support tickets + Live chat + Knowledge base
- **Features:** File attachments, status tracking, AI assistant

---

## 🏗️ Phase 1: Foundation (Start Now!)

### Week 1 Goals
Build the core infrastructure that everything else depends on.

### Tasks Breakdown

#### 1. Setup Design System (2-3 hours)
**File:** `src/app/globals.css`
- [ ] Copy Coin Box CSS variables
- [ ] Set up light/dark mode
- [ ] Add custom utilities

**File:** `tailwind.config.ts`
- [ ] Copy Coin Box Tailwind config
- [ ] Add product colors
- [ ] Configure font (Inter)

#### 2. Create Layout Components (3-4 hours)

**Header Component** - `src/components/layout/Header.tsx`
- [ ] Logo (Allied iMpact)
- [ ] Navigation menu (Home, Products, Pricing, About, Contact)
- [ ] Auth buttons (Sign In / Sign Up) - public state
- [ ] User dropdown - authenticated state
- [ ] Theme toggle
- [ ] Mobile hamburger menu
- [ ] Sticky positioning
- [ ] Coin Box blue background (#193281)

**Footer Component** - `src/components/layout/Footer.tsx`
- [ ] Company links (About, Contact, Careers)
- [ ] Products grid (all 6 products)
- [ ] Legal links (Terms, Privacy, Cookies)
- [ ] Social media icons
- [ ] Copyright notice
- [ ] 4-column grid layout

**Mobile Menu** - `src/components/layout/MobileMenu.tsx`
- [ ] Slide-in drawer
- [ ] Navigation links
- [ ] Auth buttons
- [ ] Close button
- [ ] Backdrop overlay

#### 3. Base UI Components (2-3 hours)

**Button Component** - `src/components/ui/Button.tsx`
- [ ] Variants: primary, secondary, outline, ghost, link
- [ ] Sizes: sm, md, lg
- [ ] Loading state
- [ ] Disabled state
- [ ] Icon support

**Card Component** - `src/components/ui/Card.tsx`
- [ ] Base card with shadow
- [ ] Card header, body, footer
- [ ] Hover effects

**Input Component** - `src/components/ui/Input.tsx`
- [ ] Text input with label
- [ ] Error state
- [ ] Helper text
- [ ] Icons (left/right)

#### 4. Layout Structure (1-2 hours)

**Public Layout** - `src/app/(public)/layout.tsx`
- [ ] Header + content + Footer
- [ ] Max-width container
- [ ] Consistent spacing

**Authenticated Layout** - `src/app/(protected)/layout.tsx`
- [ ] Header + Sidebar (optional) + content
- [ ] User context provider

**Route Groups:**
```
src/app/
├── (public)/
│   ├── page.tsx          # Home
│   ├── products/
│   ├── pricing/
│   ├── about/
│   └── contact/
├── (auth)/
│   ├── login/
│   ├── signup/
│   └── reset-password/
└── (protected)/
    ├── dashboard/
    ├── settings/
    └── subscriptions/
```

#### 5. Auth Context & Hooks (2-3 hours)

**Auth Context** - `src/contexts/AuthContext.tsx`
- [ ] Firebase Auth integration
- [ ] User state management
- [ ] Sign in, sign out, sign up methods
- [ ] Auth state listener

**useAuth Hook** - `src/hooks/useAuth.ts`
- [ ] Access auth context
- [ ] Type-safe user object

**Protected Route** - `src/components/ProtectedRoute.tsx`
- [ ] Check authentication
- [ ] Redirect to login if not authenticated
- [ ] Loading state

---

## 📦 Week 1 Deliverables

By end of Week 1, we should have:

✅ **Design system** fully configured  
✅ **Header** working (public + auth states)  
✅ **Footer** complete  
✅ **Base UI components** (Button, Card, Input)  
✅ **Route structure** set up  
✅ **Auth flow** integrated  
✅ **Mobile responsive** navigation  

This foundation will allow us to build pages quickly in Week 2!

---

## 🎨 Design Examples (from Coin Box)

### Header Style
```tsx
<header className="sticky top-0 z-40 w-full border-b shadow-sm" 
        style={{ backgroundColor: '#193281' }}>
  <nav className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
    {/* Logo, Nav, Auth Buttons */}
  </nav>
</header>
```

### Button Gradient (Sign Up)
```tsx
<Button className="bg-gradient-to-r from-blue-500 to-purple-500 
                   hover:from-blue-600 hover:to-purple-600">
  Sign Up
</Button>
```

### Card Style
```tsx
<Card className="hover:shadow-lg transition-shadow duration-200">
  <CardHeader>
    <CardTitle className="text-h4">Product Name</CardTitle>
  </CardHeader>
  <CardBody>
    {/* Content */}
  </CardBody>
</Card>
```

---

## 🛠️ Tech Stack Confirmed

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS (Coin Box config)
- **UI Components:** Custom + Radix UI primitives
- **Auth:** Firebase Auth (@allied-impact/auth)
- **Database:** Firestore
- **Hosting:** Vercel
- **Icons:** Lucide React

---

## 📋 Development Checklist - Phase 1

### Day 1: Design System ✅
- [ ] Copy Coin Box globals.css
- [ ] Copy Coin Box tailwind.config.ts
- [ ] Test color variables
- [ ] Test typography classes

### Day 2: Header & Footer
- [ ] Build Header component
- [ ] Build Footer component
- [ ] Mobile menu
- [ ] Test responsive

### Day 3: Base Components
- [ ] Button variants
- [ ] Card component
- [ ] Input component
- [ ] Test all variants

### Day 4: Layouts & Routes
- [ ] Public layout
- [ ] Protected layout
- [ ] Set up route groups
- [ ] Test navigation

### Day 5: Auth Integration
- [ ] Auth context
- [ ] useAuth hook
- [ ] Protected route wrapper
- [ ] Test sign in/out

### Weekend: Polish & Test
- [ ] Responsive testing
- [ ] Dark mode testing
- [ ] Accessibility check
- [ ] Performance check

---

## 🚀 Let's Start Building!

**First Task:** Set up the design system (globals.css + tailwind.config.ts)

Ready to begin? Let me know and I'll start with:
1. Copying Coin Box design tokens to portal
2. Creating the Header component
3. Creating the Footer component
4. Setting up the layout structure

We'll build iteratively, testing as we go! 💪

