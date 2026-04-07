# 🚀 Streamify — Real-Time Video Conferencing Platform

A premium, enterprise-grade video conferencing application built with React, Socket.io, WebRTC, Clerk Authentication, and Supabase.

![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=nodedotjs&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-06B6D4?logo=tailwindcss&logoColor=white)
![Socket.IO](https://img.shields.io/badge/Socket.IO-4.7-010101?logo=socketdotio&logoColor=white)
![Clerk](https://img.shields.io/badge/Clerk-Auth-6C47FF?logo=clerk&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-DB-3ECF8E?logo=supabase&logoColor=white)

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Prerequisites](#-prerequisites)
- [Environment Variables](#-environment-variables)
- [Supabase Database Setup](#-supabase-database-setup)
- [Local Development](#-local-development)
- [Deploying to Render](#-deploying-to-render)
- [Troubleshooting](#-troubleshooting)

---

## ✨ Features

- **HD Video Calls** — WebRTC peer-to-peer with adaptive bitrate
- **Real-time Chat** — In-meeting messaging via Socket.IO
- **Screen Sharing** — Share screen, window, or tab
- **Live Captions** — Browser-based speech recognition
- **Meeting Recording** — Record and download as `.webm`
- **Host Controls** — Waiting room, kick, mute participants
- **Meeting History** — View past meetings with date, time & duration
- **User Reviews** — Dynamic testimonials stored in Supabase
- **Skeleton Screens** — Premium loading states across the app
- **End-to-End Secure** — STUN/TURN servers for NAT traversal

---

## 🛠 Tech Stack

| Layer | Technology |
|------------|----------------------------------------------|
| Frontend   | React 18, Tailwind CSS, Framer Motion        |
| Auth       | Clerk (Publishable Key on frontend)          |
| Database   | Supabase (PostgreSQL)                        |
| Backend    | Node.js, Express, Socket.IO                  |
| Video      | WebRTC (peer-to-peer)                        |
| Deployment | Render (Static Site + Web Service)           |

---

## 📁 Project Structure

```
Streamify/
├── backend/                    # Socket.IO signaling server
│   ├── src/
│   │   ├── app.js              # Express + Socket server entry
│   │   └── controllers/
│   │       └── socketManager.js # All WebRTC signaling logic
│   └── package.json
│
├── frontend/                   # React SPA (Create React App)
│   ├── public/
│   ├── src/
│   │   ├── components/         # UI components (Logo, Sidebar, Skeleton, etc.)
│   │   ├── contexts/           # AuthContext, ThemeContext
│   │   ├── pages/              # Landing, Home, History, VideoMeet, etc.
│   │   ├── utils/              # supabaseClient.js, withAuth.jsx
│   │   └── environment.js      # Backend URL auto-detection
│   ├── .env                    # Frontend environment variables
│   └── package.json
│
├── supabase_schema.sql         # Database schema for Supabase
└── README.md                   # This file
```

---

## 📝 Prerequisites

Before deploying, make sure you have accounts on:

1. **[Clerk](https://clerk.com)** — For authentication (sign-up/sign-in)
2. **[Supabase](https://supabase.com)** — For the PostgreSQL database
3. **[Render](https://render.com)** — For hosting both frontend & backend

---

## 🔑 Environment Variables

### Backend (Render Web Service)

The backend is a **pure Socket.IO signaling server**. It needs **no API keys** — only the PORT.

| Variable | Value            | Required |
|----------|------------------|----------|
| `PORT`   | `8000` (default) | Optional |

> **Note:** Render automatically sets `PORT` for Web Services, so you don't need to add it manually.

---

### Frontend (Render Static Site)

The frontend needs **3 environment variables** to connect to Clerk and Supabase.

| Variable | Where to Find | Required |
|----------|---------------|----------|
| `REACT_APP_CLERK_PUBLISHABLE_KEY` | Clerk Dashboard → API Keys → Publishable Key | ✅ Yes |
| `REACT_APP_SUPABASE_URL` | Supabase Dashboard → Settings → API → Project URL | ✅ Yes |
| `REACT_APP_SUPABASE_ANON_KEY` | Supabase Dashboard → Settings → API → `anon` `public` key | ✅ Yes |

#### Example `.env` (for local development)

```env
# Clerk Authentication
REACT_APP_CLERK_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxxxxxxx

# Supabase Database
REACT_APP_SUPABASE_URL=https://your-project-id.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6...
```

---

## 🗄 Supabase Database Setup

### Step 1: Create Tables

Go to your **Supabase Dashboard → SQL Editor** and run the following SQL:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Meeting History Table
CREATE TABLE IF NOT EXISTS public.meeting_history (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id TEXT NOT NULL,
    meeting_code TEXT NOT NULL,
    duration INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS meeting_history_user_id_idx ON public.meeting_history (user_id);

-- 2. Reports Table
CREATE TABLE IF NOT EXISTS public.reports (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id TEXT NOT NULL,
    reported_user TEXT NOT NULL,
    reason TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS reports_user_id_idx ON public.reports (user_id);

-- 3. Testimonials Table (User Reviews)
CREATE TABLE IF NOT EXISTS public.testimonials (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT DEFAULT 'Professional',
    content TEXT NOT NULL,
    rating INTEGER DEFAULT 5,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);
```

### Step 2: Enable Row Level Security (RLS)

```sql
-- Enable RLS
ALTER TABLE public.meeting_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

-- Meeting History Policies
CREATE POLICY "Allow public select" ON public.meeting_history FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON public.meeting_history FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON public.meeting_history FOR UPDATE USING (true);

-- Reports Policies
CREATE POLICY "Allow public insert" ON public.reports FOR INSERT WITH CHECK (true);

-- Testimonials Policies
CREATE POLICY "Allow public select" ON public.testimonials FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON public.testimonials FOR INSERT WITH CHECK (true);
```

---

## 💻 Local Development

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/streamify.git
cd streamify/Streamify
```

### 2. Setup Backend

```bash
cd backend
npm install
npm run dev
```

The signaling server will start on `http://localhost:8000`.

### 3. Setup Frontend

```bash
cd frontend
# Create .env file with your keys (see Environment Variables section above)
npm install
npm start
```

The React app will start on `http://localhost:3000`.

---

## 🌐 Deploying to Render

### Backend — Web Service

1. Go to [Render Dashboard](https://dashboard.render.com) → **New → Web Service**
2. Connect your GitHub repository
3. Configure:

| Setting | Value |
|---------|-------|
| **Name** | `streamify-backend` (or your choice) |
| **Root Directory** | `Streamify/backend` |
| **Runtime** | Node |
| **Build Command** | `npm install` |
| **Start Command** | `npm start` |
| **Plan** | Free |

4. **Environment Variables:** None required (PORT is auto-set by Render)

5. Click **Deploy** and copy the deployed URL (e.g., `https://streamify-backend-xxxx.onrender.com`)

---

### Frontend — Static Site

1. Go to [Render Dashboard](https://dashboard.render.com) → **New → Static Site**
2. Connect your GitHub repository
3. Configure:

| Setting | Value |
|---------|-------|
| **Name** | `streamify-frontend` (or your choice) |
| **Root Directory** | `Streamify/frontend` |
| **Build Command** | `npm install && npm run build` |
| **Publish Directory** | `build` |

4. **Environment Variables** (add all 3):

| Key | Value |
|-----|-------|
| `REACT_APP_CLERK_PUBLISHABLE_KEY` | `pk_test_your_clerk_key_here` |
| `REACT_APP_SUPABASE_URL` | `https://your-project.supabase.co` |
| `REACT_APP_SUPABASE_ANON_KEY` | `your_supabase_anon_key_here` |

5. Click **Deploy**

---

### 🔗 Connect Frontend to Backend

After deploying the backend, update the backend URL in the frontend:

Open `frontend/src/environment.js` and update the production URL:

```js
const IS_PROD = window.location.hostname !== 'localhost';
const server = IS_PROD ?
    "https://your-backend-name.onrender.com" :  // ← Your Render backend URL
    "http://localhost:8000";

export default server;
```

> **Current production URL:** `https://streamifybackend-o6vn.onrender.com`

---

### Clerk Configuration

In your **Clerk Dashboard**, add your Render frontend URL to the allowed origins:

1. Go to **Clerk Dashboard → Settings → Domains**
2. Add your frontend URL: `https://your-frontend.onrender.com`
3. This ensures Clerk auth works on the deployed site

---

## 🔧 Quick Reference — Where to Get Each Key

| Key | Service | Path |
|-----|---------|------|
| `REACT_APP_CLERK_PUBLISHABLE_KEY` | [Clerk](https://dashboard.clerk.com) | Dashboard → API Keys → **Publishable key** |
| `REACT_APP_SUPABASE_URL` | [Supabase](https://supabase.com/dashboard) | Project → Settings → API → **Project URL** |
| `REACT_APP_SUPABASE_ANON_KEY` | [Supabase](https://supabase.com/dashboard) | Project → Settings → API → **anon public** key |

---

## 🐛 Troubleshooting

### "WebSocket connection failed" in production
- Make sure your Render backend is awake (free tier goes to sleep after inactivity)
- Visit your backend URL directly to wake it up

### "Clerk: Invalid publishable key"
- Ensure `REACT_APP_CLERK_PUBLISHABLE_KEY` starts with `pk_test_` or `pk_live_`
- Confirm the key matches your Clerk application

### "Supabase: relation does not exist"
- Run the full SQL schema from the [Database Setup](#-supabase-database-setup) section
- Make sure you ran it in the correct Supabase project

### Video/Audio not working on mobile
- Ensure HTTPS is used (Render provides this automatically)
- WebRTC requires HTTPS for camera/mic access

### Reviews not showing on landing page
- Check that the `testimonials` table exists in Supabase
- Verify RLS policies allow public `SELECT`

### Meeting duration shows "Unknown"
- Run: `ALTER TABLE meeting_history ADD COLUMN duration INTEGER DEFAULT 0;`
- Duration is recorded when a user clicks "End Call"

---

## 📄 License

This project is for educational purposes.

---

**Built with ❤️ by Rohit Mandal**
