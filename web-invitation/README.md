# Luxury Wedding Invitation Platform

A config-driven, mobile-first wedding invitation platform with interactive gate/opening sequences, procedural SVG wax seals, and a real-time visual editor.

## Tech Stack
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript (strict mode, zero `any`)
- **Styling**: Tailwind CSS + CSS variables
- **Animations**: GSAP + ScrollTrigger
- **Backend / Database**: Supabase (PostgreSQL, Storage, RLS)
- **Schema Validation**: Zod
- **Testing**: Vitest (Unit) + Playwright (E2E)

## Architecture Principles
1. **100% Config-Driven**: Page renders entirely from a single validated JSON config.
2. **Style Cascade**: `global theme` -> `section` -> `element`.
3. **Procedural Wax Seal**: SVG filter-based (`feTurbulence`, `feDisplacementMap`, `feSpecularLighting`).
4. **Mobile First**: Optimized for standard mobile (380px) through desktop breakpoints.
5. **Accessibility**: iOS Safari gesture safe media, reduced-motion compliance, keyboard navigable.

## Project Structure
```
web-invitation/
├── app/
│   ├── [slug]/          # Public invitation page
│   ├── editor/          # Visual editor
│   ├── dashboard/       # Organizer dashboard
│   ├── api/             # API routes
│   ├── layout.tsx       # Root layout
│   └── page.tsx         # Home route
├── components/
│   ├── sections/        # Section components (Gate, Hero, Schedule, etc.)
│   ├── elements/        # Reusable editable atomic elements
│   ├── seal/            # Procedural SVG wax seal
│   ├── editor/          # Visual configuration panels & canvas
│   └── ui/              # Base UI components
├── lib/
│   ├── schema/          # Zod schemas for invitation configuration
│   ├── theme/           # Palette generator & CSS variables
│   ├── animation/       # GSAP & motion preferences
│   ├── supabase/        # Supabase client & queries
│   └── utils/           # Utility helpers
├── config/              # Default & sample invitation configurations
├── supabase/
│   └── migrations/      # PostgreSQL migrations & RLS policies
└── tests/
    ├── unit/            # Vitest unit tests
    └── e2e/             # Playwright E2E tests
```

## Setup & Running

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Environment Variables**:
   Copy `.env.example` to `.env.local` and add your Supabase credentials:
   ```bash
   cp .env.example .env.local
   ```

3. **Development Server**:
   ```bash
   npm run dev
   ```

4. **Run Verification Commands**:
   ```bash
   npm run typecheck    # TypeScript strict check
   npm run lint         # ESLint check
   npm run test         # Vitest unit tests
   npm run build        # Production Next.js build
   npm run e2e          # Playwright test suite
   ```
