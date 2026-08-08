# 🎨 BrandForge AI

> AI-Powered Brand Poster Generator — Create stunning, branded social-media posters with AI-generated marketing copy while preserving your exact brand identity.

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

---

## 🌟 Core Principle

**"AI creates the marketing message and theme direction; deterministic templates preserve brand identity."**

- **AI generates** only marketing copy (headline, subtext, CTA, theme, tone)
- **Templates compose** the poster deterministically using Konva.js canvas
- **Your logo** is always the real uploaded image — never AI-generated
- **Your brand colors, tagline, and contacts** are always accurately rendered

---

## ✨ Features

### Authentication
- Email/password signup & login via Supabase Auth
- Protected routes with automatic redirects
- Clean onboarding experience

### Brand Kit
- Upload company logo (PNG/JPG/SVG/WebP, ≤5MB)
- Set primary & secondary brand colors with live preview
- Save company name, tagline, contact details
- Live preview card showing complete brand identity

### AI Content Generation
- Natural language prompt input ("10% Diwali discount on cloud services")
- Gemini AI integration for intelligent marketing copy
- **Fully functional fallback** — works without any API key
- Structured JSON output: `{ headline, subtext, cta, theme, tone }`

### 3 Premium Poster Templates
1. **🔥 Bold Offer** — Large headline, strong color blocks (sales/discounts)
2. **✨ Elegant Festive** — Gold accents, decorative elements (Diwali, Christmas, New Year)
3. **💼 Minimal Corporate** — Clean layout, geometric shapes (business announcements)

### Poster Editor
- Live Konva.js canvas preview (1080×1350px)
- Edit headline, subtext, CTA
- Adjust font sizes and logo size
- Switch templates
- Toggle contact details
- Regenerate marketing copy
- Export high-quality PNG and PDF

### Dashboard & History
- Welcome dashboard with brand kit status
- Full poster history with search/filter
- Open, duplicate, download, delete posters

---

## 🏗️ Architecture

```
brandforge-ai/
├── client/          # React + Vite + TypeScript + Tailwind CSS
│   └── src/
│       ├── components/
│       │   ├── layout/    # Navbar
│       │   └── poster/    # PosterCanvas, templates/
│       ├── contexts/      # AuthContext
│       ├── lib/           # Supabase client
│       ├── pages/         # All 8 pages
│       ├── types/         # Shared types
│       └── utils/         # Export utilities
├── server/          # Express + TypeScript
│   └── src/
│       ├── middleware/     # JWT auth
│       ├── routes/        # generate, posters
│       └── services/      # Gemini AI, fallback
└── supabase/
    └── schema.sql   # Database + RLS + triggers
```

### Data Flow
```
User prompt → Backend API → Gemini AI (or fallback) → Structured JSON
                                                         ↓
Brand Kit + JSON → Konva.js Template Engine → Canvas Render → PNG/PDF Export
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- A [Supabase](https://supabase.com) project (free tier works)
- (Optional) [Gemini API key](https://aistudio.google.com/apikey)

### 1. Clone & Install

```bash
# Install dependencies for all packages
npm install
cd client && npm install
cd ../server && npm install
cd ..
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run the entire contents of `supabase/schema.sql`
3. Go to **Settings → API** and copy your credentials

### 3. Configure Environment

```bash
# Create .env files from the example
cp .env.example .env

# Client env (create client/.env)
echo "VITE_SUPABASE_URL=https://your-project.supabase.co" > client/.env
echo "VITE_SUPABASE_ANON_KEY=your-anon-key" >> client/.env

# Server env (create server/.env)
echo "SUPABASE_URL=https://your-project.supabase.co" > server/.env
echo "SUPABASE_SERVICE_ROLE_KEY=your-service-role-key" >> server/.env
echo "PORT=3001" >> server/.env
# Optional: echo "GEMINI_API_KEY=your-gemini-key" >> server/.env
```

### 4. Run Development Server

```bash
# From the root directory — starts both client and server
npm run dev
```

- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:3001

---

## 🤖 AI & Fallback Behavior

### With Gemini API Key
When `GEMINI_API_KEY` is set in `server/.env`:
- The backend calls Gemini 2.0 Flash for marketing copy generation
- Response is validated with Zod schema
- Falls back to local generation if AI request fails

### Without Gemini API Key (Default)
The app works fully without any AI API configured:
- Smart local content generator detects keywords and themes
- Extracts discount percentages and product names from prompts
- Generates contextual headlines, subtexts, and CTAs
- Supports: Diwali, Christmas, New Year, Eid, Holi, Independence Day, sales, launches, corporate, events
- Shows subtle notice: "Using smart local copy generation"

---

## 🎨 How Logo/Brand Preservation Works

The poster rendering pipeline is **fully deterministic**:

1. **Logo**: The user's uploaded logo image is loaded from Supabase Storage and rendered as a Konva `Image` node directly on the canvas. No AI image generation is involved.

2. **Brand Colors**: The user's hex colors are passed to template functions and used for backgrounds, accents, CTA buttons, and decorative elements.

3. **Tagline & Contacts**: Rendered as Konva `Text` nodes at template-defined positions.

4. **Templates**: Each template is a TypeScript function that returns Konva node configurations. The template engine composes these nodes into a layered canvas.

---

## 📊 Database Schema

| Table | Purpose |
|-------|---------|
| `profiles` | User profile (auto-created on signup) |
| `brand_kits` | Brand identity: logo, colors, tagline, contacts |
| `posters` | Saved posters with full config JSON for re-editing |

All tables have **Row Level Security (RLS)** — users can only access their own data.

---

## 📄 Demo Flow

1. **Sign up** with email/password
2. **Create Brand Kit**: upload a logo, set colors, add company info
3. **Generate Poster**: type a prompt like "50% Diwali sale on electronics"
4. **Edit** in the canvas editor: adjust text, switch templates, resize logo
5. **Export** as PNG or PDF
6. **View history** on the dashboard

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite 6, TypeScript |
| Styling | Tailwind CSS v4 |
| Canvas | Konva.js + react-konva |
| PDF Export | jsPDF |
| Backend | Express.js, TypeScript |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth (email/password) |
| Storage | Supabase Storage (logos) |
| AI | Google Gemini 2.0 Flash (optional) |
| Icons | Lucide React |
| Notifications | React Hot Toast |

---

## 📁 Key Files

| File | Purpose |
|------|---------|
| `supabase/schema.sql` | Full database schema with RLS |
| `server/src/services/gemini.ts` | Gemini AI integration |
| `server/src/services/fallback.ts` | Deterministic content generator |
| `client/src/components/poster/PosterCanvas.tsx` | Core Konva.js renderer |
| `client/src/components/poster/templates/` | 3 poster templates |
| `client/src/pages/PosterEditorPage.tsx` | Full canvas editor |
| `client/src/contexts/AuthContext.tsx` | Auth state management |

---

## 📜 License

MIT
