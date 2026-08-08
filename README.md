# 🎨 BrandForge AI

> AI-Powered Brand Poster Generator — Create stunning, branded social-media posters with AI-generated marketing copy & background visuals while preserving your exact brand identity.

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

---

## 🌟 Core Principle

**"AI creates the marketing message, theme direction, and custom backgrounds; deterministic templates preserve brand identity."**

- **AI generates** marketing copy (headline, subtext, CTA, theme, tone) and background visuals.
- **Dynamic AI Engine** composes the poster layout deterministically using Konva.js canvas.
- **Your logo** is always the real uploaded image — never AI-altered.
- **Your brand colors, tagline, and contact info** are accurately integrated across all designs.

---

## ✨ Features & Design Styles

### 🎨 6 Distinct Design Styles
Customize the background mood, overlay tint, and visual layout feel:
1. **🔥 Modern Style** — Clean, vibrant & contemporary with bold gradients.
2. **👑 Luxury Style** — Dark, elegant & premium with gold accents.
3. **🎨 Creative Style** — Bold, expressive & artistic with vivid color palettes.
4. **📄 Minimal Style** — Clean, airy & typography-focused with balanced white space.
5. **💼 Corporate Style** — Professional, structured & trustworthy.
6. **✨ Premium Style** — Ultra-high-end, dark neon & exclusive feel.

---

### 📐 5 Social Media Aspect Ratios
Generate posters perfectly formatted for any platform:
- **1:1** — Square (Instagram Feed, Facebook Posts) — 1080×1080px
- **4:5** — Portrait (Instagram Feed) — 1080×1350px
- **9:16** — Story / Reels / TikTok — 1080×1920px
- **16:9** — Landscape (YouTube Thumbnails, LinkedIn Banners) — 1920×1080px
- **3:4** — Portrait (Pinterest, Digital Print) — 1080×1440px

---

### 🔑 Key Functional Modules
- **Authentication**: JWT & MongoDB-backed user registration and secure login.
- **Brand Kit**: Custom logo upload (PNG/JPG/SVG/WebP), primary & secondary color pickers, tagline, email, website, phone, and social handles.
- **AI Content & Visual Generation**: Prompt-driven generation powered by Google Gemini (with local fallback if no key is supplied).
- **Poster Editor**: Live Konva.js canvas editor with drag-and-drop text positioning, font size scaling, logo resizing, background regeneration, and high-resolution PNG export.
- **Dashboard & History**: Manage, duplicate, preview, re-edit, or download your saved posters.

---

## 🏗️ Architecture

```
Poster Generater/
├── client/                 # React + Vite + TypeScript + Tailwind CSS
│   └── src/
│       ├── components/
│       │   ├── layout/     # Header, Sidebar, Navigation
│       │   ├── poster/     # PosterCanvas, DynamicAI renderer, templates
│       │   └── ui/         # UI Components
│       ├── contexts/       # AuthContext
│       ├── pages/          # Landing, Login, Register, BrandKit, Dashboard, Generate, Editor
│       ├── types/          # Design Styles, Aspect Ratios & Shared Types
│       └── utils/          # Export utilities
├── server/                 # Express + TypeScript + MongoDB (Mongoose)
│   └── src/
│       ├── middleware/     # JWT Auth middleware
│       ├── models/         # User, BrandKit, Poster schemas
│       ├── routes/         # Auth, Brand-kits, Generate, Refine, Posters, Upload
│       └── services/       # Gemini AI & local fallback generators
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- MongoDB installed locally (`mongodb://127.0.0.1:27017`) or a MongoDB Atlas URI
- (Optional) [Google Gemini API Key](https://aistudio.google.com/apikey)

### 1. Clone & Install Dependencies

```bash
# Install server dependencies
cd server && npm install

# Install client dependencies
cd ../client && npm install
```

### 2. Configure Environment Variables

Create `.env` in the `server` directory:

```env
PORT=3001
MONGODB_URI=mongodb://127.0.0.1:27017/brandforge
JWT_SECRET=your_jwt_secret_key
GEMINI_API_KEY=your_gemini_api_key  # Optional: smart fallback used if omitted
```

Create `.env` in the `client` directory (if required):

```env
VITE_API_URL=http://localhost:3001/api
```

### 3. Run Development Servers

```bash
# Start backend server (from server directory)
npm run dev

# Start frontend client (from client directory)
npm run dev
```

- **Frontend**: `http://localhost:5173`
- **Backend API**: `http://localhost:3001`

---

