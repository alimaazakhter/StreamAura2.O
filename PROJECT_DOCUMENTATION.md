# 🌌 StreamAura 2.0 — Master Project Documentation

StreamAura 2.0 is a state-of-the-art streaming discovery, interactive gaming, and community cinematic tracking application built using Next.js 16 (App Router), React 19, Tailwind CSS v4, Prisma ORM, and Supabase (PostgreSQL). It delivers a highly premium, dark-mode visual interface styled with glassmorphic cards, Apple-like micro-interactions, responsive grids, and immersive media pages.

---

## 🚀 1. Core Features & Architecture

### 🎬 Cinematic Catalog (TMDb API Engine)
StreamAura leverages the **The Movie Database (TMDb) API** as its primary metadata provider. 
* **Dynamic Feeds**: Home page features trending movies/TV shows, popular lists, now playing, upcoming titles, and dynamically discoverable genres.
* **Smart Search System**: Instant search functionality for movie and TV show titles with multi-match sorting (`/search`).
* **Detailed Showrooms**: Dynamic media page routes (`/movie/[id]` and `/tv/[id]`) display cast list, synopsis, trailers, structural categories, rating scores, runtime metrics, and similar recommendations.
* **Entrypoint**: Configured in `src/lib/tmdb.ts`.

### 🤖 Intelligent AI Guide ("Aura")
StreamAura embeds a floating AI movie specialist named **Aura** on the lower-right side of the viewport.
* **Powered by Gemini**: Queries Google Gemini (`gemini-2.5-flash:generateContent`) under a system instructions profile to answer movie trivia, cast histories, director details, and recommend titles.
* **Dynamic Poster Cards**: When recommending titles, Aura formats them as `[Movie: Title]` or `[Show: Title]`. The frontend parser extracts these tags using regular expressions, queries TMDb in parallel, and renders clickable poster cards directly beneath the chatbot bubble.
* **Sandbox / Mock Mode Fallback**: If the Gemini API key is missing or unconfigured, the app falls back to a sandbox keyword parser, suggesting pre-populated recommendations (Sci-Fi, Action, Animation) to prevent crash points.
* **Entrypoint**: Endpoint in `src/app/api/chat/route.ts` and component interface in `src/components/Chatbot.tsx`.

### 🎥 Immersive Interactive Video Player
Users can stream trailers or full local files using an advanced in-app player overlay.
* **Trailers Integration**: Retrieves official trailers from TMDb API and plays them seamlessly in a YouTube overlay.
* **Local Hosting Support**: Scans `public/videos/` for MP4, MKV, WebM, and other video formats. If a file exists, it offers local stream alternatives.
* **Distraction-Free Mode**: The player is linked with document-level body classes. When active, it adds `video-player-active` to `document.body` which automatically triggers the AI Chatbot to hide, providing a clean, cinematic experience.
* **Player UI**: Custom play/pause, volume, velocity controls, theater-mode sizing, and fullscreen support.
* **Entrypoint**: Located in `src/components/MoviePlayerModal.tsx` and local scanner in `src/app/api/videos/local-file/route.ts`.

### 🏆 Gamified User Dashboard & Profile Center
To drive engagement, StreamAura implements a custom gamification structure.
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
* **Entrypoint**: Located at `src/app/profile/page.tsx` and data fetch logic in `src/app/api/user/profile/route.ts`.

### 🔒 NextAuth v5 Secure Authentication
StreamAura incorporates secure authentication via NextAuth (Auth.js v5).
* **Multiple Auth Providers**: Credentials Provider (email & hashed passwords) and Google OAuth Provider.
* **JWT Strategy**: Token callback injection adds user database IDs and custom avatars.
* **Session Audits**: Built-in login event listeners automatically insert audit rows in the `LoginLog` PostgreSQL table.
* **Entrypoint**: Configured in `src/auth.ts` and `src/components/AuthProvider.tsx`.

### ✍️ Community Reviews & Ratings System
* **Post Reviews**: Signed-in members can rate any TMDb title from 1 to 10 stars and write comments.
* **Prisma Constraint Catching**: Built-in handlers intercept foreign-key violations if sessions are outdated, instructing users to re-sign for user profile synchronization.
* **Entrypoint**: Configured in `src/app/api/reviews/route.ts` and UI in `src/components/MovieReviews.tsx`.

### 📢 Contact System & Integration Engine
The contact form `/contact` does more than just save feedback:
1. **Supabase Capture**: Stores the record inside the `ContactSubmission` database table.
2. **Slack Webhook**: Transmits a formatted alert message detailing sender name, email, subject, database IDs, and submission text.
3. **Resend Email Engine**: Dispatches an HTML autoresponder email using the Resend API to the customer's email address confirming receipt of their inquiry.
4. **Audit Logger**: Administrative audit events are stored in the database (`AdminActivityLog`) for system tracking.
5. **Entrypoint**: Configured in `src/lib/integrations.ts` and endpoint route `src/app/api/contact/route.ts`.

---

## 🛠️ 2. The Technology Stack & Free-Tier Ecosystem

StreamAura is designed to run completely on **free tiers** for all services, enabling a premium cloud architecture at $0/month.

| Layer | Technology | Free Tier Details |
| :--- | :--- | :--- |
| **Framework** | Next.js 16 (App Router), React 19, TypeScript | Deployed on **Vercel** ($0/month, unlimited builds) |
| **Database ORM** | Prisma ORM (v7.8.0) | Local code client generator ($0) |
| **Database Host** | Supabase (PostgreSQL) | **Supabase Free**: 2 active databases, 500MB storage, 50,000 monthly active users. |
| **Authentication** | NextAuth.js v5.0.0-beta.31 | Integrated OAuth login and JWT tokens ($0) |
| **AI Processing** | Google Gemini 2.5 Flash API | Free developer API limits |
| **Email Delivery** | Resend API Service | **Resend Free**: 3,000 free emails/month (100 emails/day) |
| **Notifications** | Slack Webhook Integration | **Slack Free**: Unlimited workspace logs and incoming Webhook alerts |
| **Spreadsheet DB** | Airtable API | **Airtable Free**: Unlimited spreadsheets, up to 1,200 records per table |

---

## 🔌 3. API Integrations

### 1. 🎬 The Movie Database (TMDb) API
* **Purpose**: Serves as the primary content catalog for the streaming platform.
* **Usage**:
  * Fetching popular, top-rated, upcoming, and trending movies/TV shows.
  * Loading detailed movie metadata (directors, cast, runtime, release date).
  * Retrieving official trailer keys (YouTube links) for the video players.
  * Performing multi-search queries in the application search bar.

### 2. 🤖 Google Gemini AI API (Gemini 2.5 Flash)
* **Purpose**: Powers the intelligent virtual assistant (**Aura**).
* **Usage**:
  * Processes natural language movie queries in the chat window.
  * Recommends movie titles (which the frontend parses and resolves using TMDb to render clickable poster cards).

### 3. 🔑 NextAuth.js & Google OAuth API
* **Purpose**: Handles secure authentication.
* **Usage**:
  * Logs users in with their Google credentials.
  * Manages sessions using JSON Web Tokens (JWT) for route safety.

### 4. 🗄️ Supabase Database API (PostgreSQL + Prisma)
* **Purpose**: The core persistent storage engine.
* **Usage**:
  * User accounts, encrypted credentials, watchlists, reviews, contact submissions, and administrative logs.

### 5. ✉️ Resend Email API
* **Purpose**: Dispatches transactional emails.
* **Usage**:
  * Sends password reset verification links with cryptographically secure expiry tokens.
  * Delivers styled HTML feedback confirmation emails to users.

### 6. 💬 Slack Webhook API
* **Purpose**: Developer system logging and error alert engine.
* **Usage**:
  * Dispatches instant channel alerts on errors, security audit events, and user feedback submissions.

---

## 💡 4. Core Concepts to Remember

### 1) Prisma (Database ORM)
Prisma is a modern database ORM (Object Relational Mapper) that helps developers interact with databases using simple JavaScript or TypeScript code instead of writing complex SQL queries manually. It acts as a bridge between the application and the database, making backend development faster, cleaner, and easier to manage.

### 2) Environment Files (.env / .env.local)
A `.env` or `.env.local` file is a secure configuration file used to store sensitive information such as API keys, database URLs, passwords, and secret tokens. Instead of hardcoding these values directly into the source code, developers keep them inside environment files to improve security and make the project easier to manage.

### 3) Supabase Advisors
Supabase Advisors are automated monitoring and auditing tools designed to help you maintain a healthy database:
1. **Security Advisor**: Scans the database structure to find vulnerability risks or bad configurations.
2. **Performance Advisor**: Analyzes queries running in your cluster to identify slow commands or heavy indexes.
3. **Query Performance Advisor**: Tracks database execution times and suggests optimizations to keep queries fast.

### 4) Row Level Security (RLS)
Row Level Security (RLS) is a database security feature that restricts who can view, insert, or modify rows in a table. It acts like a "data gatekeeper".
* **Without RLS**: Once someone gains access to the database, they can see or edit every row (for example, User A could read User B's watchlist or delete reviews).
* **With RLS**: RLS policies enforce that users can only read or edit their *own* rows (for example, Ali can access only Ali's watchlist, and Ahmed can access only Ahmed's watchlist—similar to Netflix profile rules).

---

## 📊 5. Supabase Database Schema & Tables

The schema defined in `prisma/schema.prisma` contains the following live synced tables:

### 1. User (Registered Accounts)
* **What it stores**: Registered user details: email, password hash, profile image URL, and reset tokens for password recovery.
* **In Supabase**: Shows user account records (emails, names, reset states).

### 2. LoginLog (Login Audit & Security Logger)
* **What it stores**: History of successful user logins: User ID, timestamp (`loggedInAt`), and client browser userAgent.
* **In Supabase**: Logs login events for security checks and user tracking.

### 3. Review (Ratings & Community Feedback)
* **What it stores**: Ratings (1 to 10 stars) and comment text written by users, linked to specific TMDb Movie/TV IDs (`mediaId` & `mediaType`).
* **In Supabase**: Saves submitted reviews and links them to the reviewer.

### 4. WatchlistItem (Cloud Watchlist Sync)
* **What it stores**: Saved watchlists, syncing media IDs, titles, and poster paths.
* **In Supabase**: Syncs user watchlist items so they load on any device.

### 5. NextAuth Tables (Account, Session, VerificationToken)
* **What they store**: OAuth identifiers (for Google login) and session records.

---

### 💡 Pro Tip: SQL Web Queries
If you want to run quick direct SQL queries inside Supabase, click on **SQL Editor** (the terminal `>_` icon) in the Supabase sidebar and run:

```sql
-- See your most active users
SELECT * FROM "User" ORDER BY "createdAt" DESC;

-- Audit all login attempts
SELECT * FROM "LoginLog" ORDER BY "timestamp" DESC;

-- View top-rated community reviews
SELECT * FROM "Review" WHERE rating >= 7;
```

---

## 📁 6. Directory Tree Explanation

```
streamaura2.O/
├── data/                    # Local dev JSON database fallbacks
├── prisma/                  # Prisma configuration
│   └── schema.prisma        # Supabase PostgreSQL database tables and relationships
├── public/                  # Static assets
│   ├── videos/              # Video directory for streaming local MP4 files
│   └── logo-v5.png          # Branded horizontal application logo
├── src/
│   ├── app/                 # Next.js App Router folders
│   │   ├── api/             # Backend Route APIs
│   │   │   ├── auth/        # Custom email register, signup, forgot/reset password, and NextAuth endpoints
│   │   │   ├── chat/        # Google Gemini AI chatbot query parsing
│   │   │   ├── contact/     # Contact feedback processing and notifications
│   │   │   ├── reviews/     # User reviews submission and DB updates
│   │   │   └── user/        # Profile statistics & XP calculation
│   │   │   └── videos/      # Local directory scanner for custom video play options
│   │   ├── contact/         # Customer support interface
│   │   ├── forgot-password/ # Password recovery form
│   │   ├── reset-password/  # Password update form
│   │   ├── profile/         # Gamified statistics & timeline panel
│   │   ├── watchlist/       # User watchlist view
│   │   ├── page.tsx         # Main Landing Homepage
│   │   └── layout.tsx       # Root layout holding Navbar & Footer
│   ├── components/          # Shared layout components (Chatbot, Navbar, Player, Reviews)
│   ├── hooks/               # Custom hooks (e.g. useWatchlist)
│   └── lib/                 # Core utilities (Prisma Client, integrations, TMDB client)
```

---

## ⚙️ 7. Development & Deployment Guide

### Local Installation
1. Install project node modules:
   ```bash
   npm install
   ```
2. Generate the Prisma database client:
   ```bash
   npx prisma generate
   ```
3. Push database schema modifications to Supabase:
   ```bash
   npx prisma db push
   ```
4. Start the local server:
   ```bash
   npm run dev
   ```

### Vercel Deployment Checklist
1. Import your GitHub repository to Vercel.
2. Enter the Environment Variables under Vercel Settings (Ensure `NEXTAUTH_URL` is set to the live Vercel URL with no trailing slash `/`).
3. Deploy the application.

### Google Console OAuth Settings
Ensure the OAuth Client has the following parameters to avoid `redirect_uri_mismatch`:
* **Authorized JavaScript origins**: `https://your-domain.vercel.app`
* **Authorized redirect URIs**: `https://your-domain.vercel.app/api/auth/callback/google`

---

## 🔧 8. Fix & Update Logs
* **Redirection Issue Resolution**: Resolved a production redirection bug where NextAuth callback URLs were incorrectly linking to `http://localhost:3000`. Set Vercel's `NEXTAUTH_URL` environment variable to match the deployed domain, and updated Google Credentials Console to reflect the same domains.
* **Dynamic Origin Generation**: Refactored `src/app/api/auth/forgot-password/route.ts` to dynamically resolve origin URLs from request headers, preventing hardcoded local URLs on emails sent during recovery processes.

---

## ⚠️ 9. Challenges Faced & Solutions Implemented

During the development and deployment phases, we navigated and resolved several core engineering challenges:

### 1. NextAuth Production Redirection Loops (Localhost Redirection)
* **The Challenge**: After deploying to Vercel, users attempting to sign up or sign in were routed back to `http://localhost:3000/api/auth/callback/...` instead of the live site, resulting in a connection error (`ERR_CONNECTION_REFUSED`).
* **The Solution**: NextAuth utilizes the `NEXTAUTH_URL` environment variable to formulate callback URLs. We updated this variable in Vercel's Environment Settings to point to the production domain (`https://stream-aura2-o-ii3v.vercel.app`) without a trailing slash, forcing NextAuth to request authentication redirections to the live URL.

### 2. Google OAuth Redirect URI Mismatches
* **The Challenge**: Users attempting Google Sign-In encountered a `400: redirect_uri_mismatch` error from Google's authorization page.
* **The Solution**: We accessed Google Cloud Console Credentials settings and replaced placeholder URLs with the actual production domain. We added the domain to the **Authorized JavaScript origins** and mapped the precise path `https://stream-aura2-o-ii3v.vercel.app/api/auth/callback/google` to the **Authorized redirect URIs**, resolving the mismatches.

### 3. Hardcoded Localhost Links in Recovery Emails
* **The Challenge**: The password recovery system sent emails where the "Reset Password" button linked to `http://localhost:3000/reset-password?token=...`, making it impossible for remote users to reset passwords.
* **The Solution**: Refactored `src/app/api/auth/forgot-password/route.ts` to resolve the client's URL dynamically. By reading request headers (`origin`, `host`, and `x-forwarded-proto`), the API now constructs the reset URL dynamically, making recovery emails compatible with local, preview, and production domains automatically.

### 4. Next.js Static Asset Compilation Mismatches
* **The Challenge**: Traditional cache-busting syntax (e.g., `<Image src="/logo.png?v=5" ... />`) triggered Next.js compilation errors during Turbopack and Webpack optimization steps.
* **The Solution**: Standardized versioning directly in the file system by renaming the static file to `/logo-v5.png` in the `public/` directory, satisfying caching requirements without compiler errors.

### 5. Automated Prisma Client Type Synchronization
* **The Challenge**: Schema pushes to Supabase occasionally caused typescript validation failures during production builds because the local Prisma Client types were out of sync with the live database.
* **The Solution**: Modified the build script in `package.json` to execute `prisma generate` prior to running the Next.js compile task (`prisma generate && next build`), ensuring database types are compiled on every single deployment pipeline automatically.
