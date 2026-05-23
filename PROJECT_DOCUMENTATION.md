# 🌌 Streaming Auraa 2.O — Master Project Documentation & Notes

This document contains the complete technical architecture, backend setups, database configurations, API specifications, study notes, and troubleshooting history for StreamAura 2.0.

---

## 🔑 1. Project Credentials & Connection Info

Use the following credentials to access the live Supabase PostgreSQL database:

* **Supabase Password**: `StreamAura@15151312`
* **Direct Database Connection URL**:
  ```env
  postgresql://postgres:StreamAura@15151312@db.imduporqegeuvcsftbro.supabase.co:5432/postgres
  ```

---

## ⚙️ 2. Setting up the Backend (Free Tiers)

StreamAura is architected to utilize free tiers for all cloud services:

### 1. ⚡ Supabase (Free Tier)
* **Cost**: `$0 / month`
* **What you get**:
  * 2 active databases (you can run 2 different apps for free).
  * 500MB of storage (enough to store hundreds of thousands of users and reviews).
  * 50,000 Monthly Active Users for authentication.
  * No credit card required. It will never charge you unless you manually upgrade to a paid tier.

### 2. 📊 Airtable (Free Tier)
* **Cost**: `$0 / month`
* **What you get**:
  * Unlimited Bases (spreadsheets).
  * Up to 1,200 records per base (your contact form can receive 1,200 messages before you have to delete old ones).
  * 100 API requests per minute (more than enough for contact form submissions).
  * 100% free to sign up and use.

### 3. 💬 Slack (Free Tier)
* **Cost**: `$0 / month`
* **What you get**:
  * Unlimited custom Slack workspaces (you can create a free private workspace just for yourself, like StreamAura Alerts).
  * Unlimited incoming Webhook integrations (so Next.js can send notifications to your Slack channels for free).
  * 100% free forever.

### 🏁 Summary
This is the ultimate developer stack because it allows you to build enterprise-grade, professional cloud architectures completely for free!

---

## 💡 3. Informations to Remember (Core Concepts)

### 1) Prisma
Prisma is a modern database ORM (Object Relational Mapper) that helps developers interact with databases using simple JavaScript or TypeScript code instead of writing complex SQL queries manually. It acts as a bridge between the application and the database, making backend development faster, cleaner, and easier to manage.

### 2) .env / .env.local File
A `.env` or `.env.local` file is a secure configuration file used to store sensitive information such as API keys, database URLs, passwords, and secret tokens. Instead of hardcoding these values directly into the source code, developers keep them inside environment files to improve security and make the project easier to manage.

### 3) Supabase Advisors (Database Health Inspector)
Supabase me Advisors basically ek smart monitoring/security checking system hota hai.
👉 Ye tera database automatically scan karta hai aur batata hai:
* Security issues
* Performance problems
* Bad configurations
* Optimization suggestions

It works like a **“database health inspector”** 😎:
1. **Security Advisor**: Security issues detect karta hai.
2. **Performance Advisor**: Slow queries detect karta hai.
3. **Query Performance**: Heavy database operations analyze karta hai.

### 4) RLS Kya Hai? 🔥 (Row Level Security)
RLS = Row Level Security. Ye database ka security feature hai.
👉 Ye decide karta hai: **Kaunsa user konsa data access kar sakta hai.**

#### Example 😄
Suppose Ali ka account hai aur another user Ahmed hai.
* **Without RLS ❌**: Ali, Ahmed ka watchlist dekh sakta hai aur dusre users ka data access ho sakta hai.
* **With RLS ✅**: Ali sirf apna data dekh sakta hai aur Ahmed sirf apna data. (Just like Netflix profile rules 🔥).

---

## 📊 4. Tables Created & Supabase View Guide

Here are the tables designed in `schema.prisma` that are synced live to your Supabase PostgreSQL cluster:

### 1. User (The Registered Accounts Table)
* **What it stores**: All registered users' details, including their email address, hashed passwords, profile image paths, and when they created their accounts.
* **In Supabase**: You will see a row for your newly created account (e.g. `AliMaaz Akhter`, `alimaaz1501@gmail.com`, and your custom Google OAuth image profile URL).

### 2. LoginLog (The Login Audit & Security Logger)
* **What it stores**: A history of every single time a user successfully logs in to the application! It automatically captures their User ID, the date and time (`loggedInAt`), and the `userAgent` (identifying their browser session).
* **In Supabase**: You will see exact timestamps for every time you log in, allowing you to audit active traffic!

### 3. Review (The Movie & TV Ratings System)
* **What it stores**: The exact ratings (1 to 10 stars) and feedback text written by community members, linked directly to the specific TMDb Movie or TV Show ID (`mediaId` & `mediaType`).
* **In Supabase**: You will see your fresh review safely logged and saved.

### 4. WatchlistItem (The Cloud Watchlist Sync)
* **What it stores**: When a logged-in user adds a movie or show to their watchlist, it is saved directly to this table rather than local storage. This allows users to access their saved watchlist on any device (phone, laptop, TV).

### 5. NextAuth Tables (Account, Session, VerificationToken)
* **What they store**: Session states and token allocations when logging in with Google OAuth or resetting passwords.

---

### 💡 Pro Tip: SQL Web Queries
If you want to run quick direct SQL queries inside Supabase, you can click on **SQL Editor** (the terminal `>_` icon) on the left sidebar and run queries like:

```sql
-- See your most active users
SELECT * FROM "User" ORDER BY "createdAt" DESC;

-- Audit all login attempts
SELECT * FROM "LoginLog" ORDER BY "timestamp" DESC;

-- View top-rated community reviews
SELECT * FROM "Review" WHERE rating >= 7;
```

---

## 🔌 5. APIs and Integrations Used

### 1. 🎬 The Movie Database (TMDb) API
* **Purpose**: Serves as the primary content database for the streaming platform.
* **Usage**:
  * Fetching popular, top-rated, upcoming, and trending movies/TV shows.
  * Loading detailed movie page metadata (directors, cast, crew, runtime, release date).
  * Retrieving trailer keys (YouTube watch links) for the video players.
  * Performing multi-search queries (when users type in the search bar).
  * Dynamic genre filters and recommendations.

### 2. 🤖 Google Gemini AI API (Gemini 2.5 Flash)
* **Purpose**: Powers the intelligent virtual assistant (**Aura**).
* **Usage**:
  * Processes natural language user messages in the chat interface.
  * Generates smart movie recommendations based on mood, actor, director, or category.
  * When Gemini returns text recommendations, the app automatically extracts movie names (e.g. `[Movie: Interstellar]`) and calls TMDb to display interactive, clickable movie cards in the chat bubble.

### 3. 🔑 NextAuth.js & Google OAuth API
* **Purpose**: Secures user authentication and session management.
* **Usage**:
  * **Google OAuth Provider**: Allows users to log in securely with their Google Accounts.
  * **NextAuth Session APIs**: Handles JSON Web Tokens (JWT) for secure page routing, logging user sessions, and managing login states.

### 4. 🗄️ Supabase Database API (PostgreSQL + Prisma)
* **Purpose**: The core application database.
* **Usage**:
  * User account storage (encrypted password logins, usernames, and profile images).
  * Tracking user watchlists, reviews, and ratings.
  * Saving contact form feedback submissions.
  * Recording system audit logs like `LoginLog` and `AdminActivityLog` for security tracking.

### 5. ✉️ Resend Email API
* **Purpose**: Handles transactional email delivery.
* **Usage**:
  * Sends password reset verification links with cryptographically secure expiry tokens.
  * Delivers branded thank-you autoresponders to users who submit feedback via the contact page.

### 6. 💬 Slack Webhook API
* **Purpose**: Internal logging, monitoring, and error alerts.
* **Usage**:
  * Sends live alerts directly to your Slack workspace when users submit feedback.
  * Broadcasts warning messages when a system error occurs (e.g., failed password reset requests or database faults).

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

## ⚠️ 7. Challenges Faced & Solutions Implemented

### 1. NextAuth Production Redirection Loops (Localhost Redirection)
* **The Challenge**: Users attempting to sign up or sign in were routed back to `http://localhost:3000/api/auth/callback/...` instead of the live site, resulting in a connection error (`ERR_CONNECTION_REFUSED`).
* **The Solution**: NextAuth utilizes the `NEXTAUTH_URL` environment variable to formulate callback URLs. We updated this variable in Vercel's Environment Settings to point to the production domain (`https://stream-aura2-o-ii3v.vercel.app`) without a trailing slash, forcing NextAuth to request authentication redirections to the live URL.

### 2. Google OAuth Redirect URI Mismatches
* **The Challenge**: Users attempting Google Sign-In encountered a `400: redirect_uri_mismatch` error from Google's authorization page.
* **The Solution**: We accessed Google Cloud Console Credentials settings and replaced placeholder URLs with the actual production domain. We added the domain to the **Authorized JavaScript origins** and mapped the precise path `https://stream-aura2-o-ii3v.vercel.app/api/auth/callback/google` to the **Authorized redirect URIs**, resolving the mismatches.

### 3. Hardcoded Localhost Links in Recovery Emails
* **The Challenge**: The password recovery system sent emails where the "Reset Password" button linked to `http://localhost:3000/reset-password?token=...`, making it impossible for remote users to reset passwords.
* **The Solution**: Refactored `src/app/api/auth/forgot-password/route.ts` to resolve the client's URL dynamically. By reading request headers (`origin`, `host`, and `x-forwarded-proto`), the API now constructs the reset URL dynamically, making recovery emails compatible with local, preview, and production domains automatically.
