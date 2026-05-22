# 🌌 StreamAura 2.0 — Premium Streaming & Discovery Platform

StreamAura 2.0 is a state-of-the-art streaming discovery and cinematic tracking application built using Next.js 16 (App Router), React 19, Tailwind CSS v4, Prisma ORM, and Supabase (PostgreSQL). It delivers a highly premium, dark-mode visual interface styled with glassmorphic cards, Apple-like micro-interactions, responsive grids, and immersive media pages.

Beyond visual design, StreamAura integrates **Google Gemini 2.5 Flash AI** for context-aware movie advice, a **custom HTML5 video player** featuring chatbot auto-hiding during playback, **NextAuth v5 session management**, a **gamified leveling/achievement center**, and an **integrations engine** targeting Resend (email automation) and Slack channels.

---

## 🚀 Interactive Features & Architecture

### 1. Cinematic Catalog (TMDb API Engine)
StreamAura leverages the **The Movie Database (TMDb) API** as its primary metadata provider. 
* **Dynamic Content Feeds**: Queries trending movies/TV shows, popular lists, now playing, upcoming titles, and dynamically discoverable genres.
* **Smart Search System**: Instant queries targeting movie and TV show titles with multi-match sorting (`/search`).
* **Detailed Showrooms**: Dynamic media page routes (`/movie/[id]` and `/tv/[id]`) display full cast, synopsis, trailers, structural categories, rating scores, runtime metrics, and similar recommendations.
* **API Integration Details**: Located in [src/lib/tmdb.ts](file:///c:/Users/alimo/OneDrive/Desktop/Project----Streaming-platform-main/streamaura2.O/src/lib/tmdb.ts).

### 2. Intelligent AI Guide ("Aura")
StreamAura embeds a floating AI movie specialist named **Aura** on the lower-right side of the viewport.
* **Powered by Gemini**: Queries Google Gemini (`gemini-2.5-flash:generateContent`) under a system instructions profile to answer movie trivia, cast histories, director details, and recommend titles.
* **Dynamic Poster Cards**: When recommending titles, Aura formats them as `[Movie: Title]` or `[Show: Title]`. The frontend parser extracts these tags using regular expressions, queries TMDb in parallel, and renders clickable poster cards directly beneath the chatbot bubble.
* **Sandbox / Mock Mode Fallback**: If the Gemini API key is missing or unconfigured, the app falls back to a sandbox keyword parser, suggesting pre-populated recommendations (Sci-Fi, Action, Animation) to prevent crash points.
* **Implementation**: Endpoint in [src/app/api/chat/route.ts](file:///c:/Users/alimo/OneDrive/Desktop/Project----Streaming-platform-main/streamaura2.O/src/app/api/chat/route.ts) and component interface in [src/components/Chatbot.tsx](file:///c:/Users/alimo/OneDrive/Desktop/Project----Streaming-platform-main/streamaura2.O/src/components/Chatbot.tsx).

### 3. Immersive Interactive Video Player
Users can stream trailers or full local files using an advanced in-app player overlay.
* **Trailers Integration**: Retrieves official trailers from TMDb API and plays them seamlessly in a YouTube overlay.
* **Local Hosting Support**: Scans `public/videos/` for MP4, MKV, WebM, and other video formats. If a file exists, it offers local stream alternatives.
* **Distraction-Free Mode**: The player is linked with document-level body classes. When active, it adds `video-player-active` to `document.body` which automatically triggers the AI Chatbot to hide, providing a clean, cinematic experience.
* **Player UI**: Custom play/pause, volume, velocity controls, theater-mode sizing, and fullscreen support.
* **Implementation**: Located in [src/components/MoviePlayerModal.tsx](file:///c:/Users/alimo/OneDrive/Desktop/Project----Streaming-platform-main/streamaura2.O/src/components/MoviePlayerModal.tsx) and local scanner in [src/app/api/videos/local-file/route.ts](file:///c:/Users/alimo/OneDrive/Desktop/Project----Streaming-platform-main/streamaura2.O/src/app/api/videos/local-file/route.ts).

### 4. Gamified User Dashboard & Profile Center
To drive engagement, StreamAura implements a custom gamification structure in [src/app/api/user/profile/route.ts](file:///c:/Users/alimo/OneDrive/Desktop/Project----Streaming-platform-main/streamaura2.O/src/app/api/user/profile/route.ts).
* **Live Statistics**: Tracks watchlist items count, written reviews count, logged-in counts, and estimates overall watch hours.
* **Experience Points (XP) & Levels**: Calculates XP dynamically:
  * Adding a title to watchlist = `+50 XP`
  * Submitting a community review = `+100 XP`
  * Signing in to the platform = `+10 XP`
  * Level Formula: Level changes every `300 XP` increments (`Level = Math.floor(XP / 300) + 1`).
* **Achievement Badges (Dynamic Locks)**:
  * **First Step** 🚀: Logged in and verified.
  * **Collector Apprentice** 🍿: Add at least 3 items to Watchlist.
  * **Super Collector** 👑: Add at least 10 items to Watchlist.
  * **Cinema Critic** ✍️: Submit at least 1 written community review.
  * **Review Veteran** 🏆: Submit at least 5 written reviews.
  * **Frequent Streamer** ⚡: Sign in 3 or more times.
  * **Night Owl** 🦉: Automatically unlocks if a watchlist add, review, or login occurs late night (between 11:00 PM and 5:00 AM).
* **Unified Activity Timeline**: Aggregates all user actions into a single sorted chronological list.
* **Page View**: Rendered at [src/app/profile/page.tsx](file:///c:/Users/alimo/OneDrive/Desktop/Project----Streaming-platform-main/streamaura2.O/src/app/profile/page.tsx).

### 5. NextAuth v5 Secure Authentication
StreamAura incorporates secure authentication via NextAuth (Auth.js v5).
* **Multiple Auth Providers**: Credentials Provider (email & hashed passwords) and Google OAuth Provider.
* **JWT Strategy**: Token callback injection adds user database IDs and custom avatars.
* **Session Audits**: Built-in login event listeners automatically insert audit rows in the `LoginLog` PostgreSQL table.
* **Implementation**: Located in [src/auth.ts](file:///c:/Users/alimo/OneDrive/Desktop/Project----Streaming-platform-main/streamaura2.O/src/auth.ts) and [src/components/AuthProvider.tsx](file:///c:/Users/alimo/OneDrive/Desktop/Project----Streaming-platform-main/streamaura2.O/src/components/AuthProvider.tsx).

### 6. Ratings & Review System
Allows users to participate in community criticism.
* **Post Reviews**: Signed-in members can rate any TMDb title from 1 to 10 stars and write comments.
* **Prisma Constraint Catching**: Built-in handlers intercept foreign-key violations if sessions are outdated, instructing users to re-sign for user profile synchronization.
* **Implementation**: Located in [src/app/api/reviews/route.ts](file:///c:/Users/alimo/OneDrive/Desktop/Project----Streaming-platform-main/streamaura2.O/src/app/api/reviews/route.ts) and [src/components/MovieReviews.tsx](file:///c:/Users/alimo/OneDrive/Desktop/Project----Streaming-platform-main/streamaura2.O/src/components/MovieReviews.tsx).

### 7. Rich Contact System & Integrations Engine
The contact form `/contact` goes beyond simple storage by dispatching requests to external systems:
1. **Supabase Capture**: Stores the record inside the `ContactSubmission` database table.
2. **Slack Webhook**: Transmits a formatted alert message detailing sender name, email, subject, database IDs, and submission text.
3. **Resend Email Engine**: Dispatches an HTML autoresponder email using the Resend API to the customer's email address confirming receipt of their inquiry.
4. **Audit Logger**: Administrative audit events are stored in the database (`AdminActivityLog`) for system tracking.
5. **Implementation**: Located in [src/lib/integrations.ts](file:///c:/Users/alimo/OneDrive/Desktop/Project----Streaming-platform-main/streamaura2.O/src/lib/integrations.ts) and endpoint route [src/app/api/contact/route.ts](file:///c:/Users/alimo/OneDrive/Desktop/Project----Streaming-platform-main/streamaura2.O/src/app/api/contact/route.ts).

---

## 🛠️ The Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Framework** | Next.js 16 (App Router), React 19, TypeScript |
| **Styling** | Tailwind CSS v4, Vanilla CSS variables, PostCSS |
| **Database ORM** | Prisma ORM (v7.8.0) |
| **Database Host** | Supabase (PostgreSQL) |
| **Authentication** | NextAuth.js v5.0.0-beta.31 |
| **AI Processing** | Google Gemini 2.5 Flash API |
| **Email Delivery** | Resend API Service |
| **Notifications** | Slack Webhook Integration |
| **Visual Assets** | Lucide React Icons |

---

## 📁 Project Directory Structure

```
streamaura2.O/
├── data/                    # Local dev JSON database fallbacks
├── prisma/                  # Database definitions
│   └── schema.prisma        # Supabase PostgreSQL Prisma models
├── public/                  # Static files (images, custom horizontal logo, videos)
│   ├── videos/              # Scanner folder for local video streaming fallbacks
│   └── logo-v5.png          # Transparent horizontal brand asset
├── src/
│   ├── app/                 # Next.js app router structure
│   │   ├── api/             # Backend Route Handlers (auth, chat, contact, reviews, profile)
│   │   ├── contact/         # Contact Feedback page
│   │   ├── forgot-password/ # Password Reset request page
│   │   ├── reset-password/  # Password Update token page
│   │   ├── profile/         # Gamified statistics & timeline panel
│   │   ├── watchlist/       # Local/DB synchronized watchlist page
│   │   ├── page.tsx         # Main Landing Homepage loading categories
│   │   └── layout.tsx       # Parent layout loading Navbar & Footer
│   ├── components/          # Reusable UI components
│   │   ├── Chatbot.tsx      # Aura AI Guide Overlay
│   │   ├── Navbar.tsx       # Scroll-faded header loading brand assets
│   │   ├── Footer.tsx       # Bottom layout links
│   │   ├── MoviePlayerModal.tsx # Full interactive custom media player
│   │   └── MovieReviews.tsx # Community ratings review section
│   ├── hooks/               # Custom react hooks (useWatchlist)
│   └── lib/                 # Service layers (prisma connection, Resend/Slack, TMDB)
├── package.json             # Dependencies configuration file
└── tsconfig.json            # TypeScript configuration
```

---

## 📊 Supabase Database Schema

The database structures defined in [prisma/schema.prisma](file:///c:/Users/alimo/OneDrive/Desktop/Project----Streaming-platform-main/streamaura2.O/prisma/schema.prisma) are detailed below:

### User & Auth Sessions
* **`User`**: Core account information. Connects to `Account`, `Session`, `Review`, `WatchlistItem`, and `LoginLog`. Includes custom columns: `resetToken` and `resetTokenExpiry` for password recovery.
* **`Account`**: Linked OAuth accounts (Google provider details).
* **`Session`**: Dynamic active browser tokens for NextAuth session verification.
* **`VerificationToken`**: Standard NextAuth verification tokens.

### Platform Activities
* **`Review`**: Records movie and TV show scores. Contains `mediaId` (TMDb identification), `mediaType` (`movie` or `tv`), `content` (review comments), and `rating` (1 to 10 stars).
* **`WatchlistItem`**: Sync-able watchlist items for authenticated profiles containing media IDs, title strings, and image paths.
* **`LoginLog`**: Log tracking user sign-in timestamps and user agents for login audits.
* **`ContactSubmission`**: Captures user inputs from the contact page (name, email, subject, message).
* **`AdminActivityLog`**: Global system administrative events (e.g., `CONTACT_SUBMISSION`, `USER_REGISTRATION`, `CONTACT_FORM_ERROR`).

---

## 🔑 Environment Variables Setup

Create a `.env` (or `.env.local`) file in the root directory:

```env
# TMDb API Configurations
NEXT_PUBLIC_TMDB_API_KEY=your_tmdb_api_key_here
NEXT_PUBLIC_TMDB_BASE_URL=https://api.themoviedb.org/3
NEXT_PUBLIC_TMDB_IMAGE_BASE=https://image.tmdb.org/t/p

# NextAuth configuration
AUTH_SECRET=generate_a_random_32_byte_string_for_nextauth
NEXTAUTH_URL=http://localhost:3000

# Google OAuth Credentials
GOOGLE_CLIENT_ID=your_google_oauth_client_id
GOOGLE_CLIENT_SECRET=your_google_oauth_client_secret

# Resend API Key for Autoresponder Emails
RESEND_API_KEY=re_your_resend_api_key

# PostgreSQL Connection URLs (Supabase)
DATABASE_URL="postgresql://postgres.[db-id]:[password]@[host]:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.[db-id]:[password]@[host]:5432/postgres"

# Slack Webhook URL for Admin Alerts
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/your/slack/webhook/channel

# Google Gemini API Key for AI Chatbot
GEMINI_API_KEY=your_gemini_api_key_here
```

---

## ⚙️ Local Development Installation

Follow these steps to run StreamAura 2.0 locally:

1. **Verify Prerequisites**:
   Ensure you have **Node.js** (v18.x or higher) and **git** installed.

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Database Client Generation**:
   Sync and compile the Prisma client against the schema specifications:
   ```bash
   npx prisma generate
   ```

4. **Database Migration / Sync**:
   Verify Prisma schemas are pushed directly to your active Supabase instance:
   ```bash
   npx prisma db push
   ```

5. **Start Dev Server**:
   Launch the development pipeline:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) on your local browser.

6. **Validate Production Compilation**:
   Ensure zero-error builds before push cycles:
   ```bash
   npm run build
   ```

---

## 🎨 Logo Customization & Cache Buster
* **Brand Asset**: The premium, modern-styled horizontal brand logo is located at `/logo-v5.png` within the `public/` directory.
* **Cache Buster**: Next.js builds fail if static local images are referenced with search parameters (e.g. `/logo.png?v=5`). StreamAura bypasses compiler checks by referencing a versioned file string (`/logo-v5.png`) in:
  * Navbar component
  * Footer component
  * Login page
  * Signup page
  * Reset Password pages

---

## ☁️ Deployment & GitHub Workflows

Detailed step-by-step procedures for deployment are provided below.

### Phase 1: Initialize Git and Create a New GitHub Repository

1. **Check Git Status**:
   Verify if Git is initialized in the project directory:
   ```bash
   git status
   ```

2. **Initialize Git (If not already initialized)**:
   ```bash
   git init
   ```

3. **Stage all Files**:
   Ensure `.gitignore` contains standard folders (like `.next`, `node_modules`, `.env`, `.env.local` to protect secrets). Stage the files:
   ```bash
   git add .
   ```

4. **Commit the Baseline**:
   Create your baseline commit:
   ```bash
   git commit -m "feat: initial commit for StreamAura 2.0 with premium dark UI, Gemini AI, and gamification"
   ```

5. **Create GitHub Repo**:
   * Open your browser and navigate to [GitHub](https://github.com).
   * Click **New** (or "+" in the top-right corner -> **New repository**).
   * Set Repository Name: `streamAura2.0`
   * Keep it **Public** or **Private** (according to your preferences).
   * **DO NOT** check "Add a README file", "Add .gitignore", or "Choose a license" (as they are already configured in this local folder).
   * Click **Create repository**.

6. **Link Repository and Push Code**:
   Copy the commands from the GitHub instruction screen and execute them:
   ```bash
   # Set the primary branch to main
   git branch -M main

   # Add the remote origin URL (Replace username with your actual GitHub username)
   git remote add origin https://github.com/username/streamAura2.0.git

   # Push to main
   git push -u origin main
   ```

---

### Phase 2: Deploying to Vercel

1. **Log in to Vercel**:
   Go to [Vercel](https://vercel.com) and log in using your GitHub account.

2. **Import Repository**:
   * On your dashboard, click **Add New** -> **Project**.
   * Under "Import Git Repository", find `streamAura2.0` (ensure your GitHub integration has access) and click **Import**.

3. **Configure Settings**:
   * **Framework Preset**: Next.js (detected automatically).
   * **Root Directory**: `./` (detected automatically).
   * **Build and Output Settings**: Keep default settings.

4. **Environment Variables Config (CRITICAL)**:
   Toggle the **Environment Variables** accordion and add the following keys from your `.env.local`:
   * `NEXT_PUBLIC_TMDB_API_KEY` (TMDb Web Access Key)
   * `NEXT_PUBLIC_TMDB_BASE_URL` (`https://api.themoviedb.org/3`)
   * `NEXT_PUBLIC_TMDB_IMAGE_BASE` (`https://image.tmdb.org/t/p`)
   * `AUTH_SECRET` (Use a generated secret key string)
   * `NEXTAUTH_URL` (Enter your production deployment URL, e.g., `https://stream-aura-2-0.vercel.app`, or leave it blank as Vercel NextAuth handles this automatically)
   * `GOOGLE_CLIENT_ID`
   * `GOOGLE_CLIENT_SECRET`
   * `RESEND_API_KEY`
   * `DATABASE_URL` (Your Supabase connection string)
   * `DIRECT_URL` (Your direct connection string)
   * `SLACK_WEBHOOK_URL`
   * `GEMINI_API_KEY`

5. **Deploy**:
   Click **Deploy**. Vercel will clone the repo, run `npm run build`, export compilation routes, and complete your hosting pipeline.

6. **Post-Deployment Database sync**:
   Ensure that any environment changes are in place. If you update the Prisma schema in the future, run:
   ```bash
   npx prisma db push
   ```
   to synchronize the Supabase instance, followed by redeploying the Vercel project.
