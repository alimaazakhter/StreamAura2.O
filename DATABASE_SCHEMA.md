# 🗄️ StreamAura 2.O — Database Schema & Architecture

This document provides a detailed breakdown of the PostgreSQL database schema managed by Prisma ORM.

---

## 🗺️ 1. Entity-Relationship Diagram (ERD)

This diagram outlines how tables link to each other. Relational tables are connected to the central `User` entity, while standalone log/submission tables track telemetry and support queries.

```mermaid
erDiagram
    User ||--o{ Account : "has accounts (OAuth)"
    User ||--o{ Session : "has active sessions"
    User ||--o{ Review : "writes reviews"
    User ||--o{ WatchlistItem : "saves to watchlist"
    User ||--o{ LoginLog : "records log history"

    User {
        String id PK "cuid()"
        String name "Nullable"
        String email UK "Unique"
        String password "Nullable, Hashed"
        DateTime emailVerified "Nullable"
        String image "Nullable, URL"
        String resetToken UK "Nullable, Unique Reset Token"
        DateTime resetTokenExpiry "Nullable"
        DateTime createdAt "defaults to now()"
        DateTime updatedAt "auto-update on modify"
    }

    Account {
        String id PK "cuid()"
        String userId FK "Refers to User(id)"
        String type
        String provider
        String providerAccountId
        String refresh_token "text"
        String access_token "text"
        Int expires_at
        String token_type
        String scope
        String id_token "text"
        String session_state
    }

    Session {
        String id PK "cuid()"
        String sessionToken UK "Unique Token"
        String userId FK "Refers to User(id)"
        DateTime expires
    }

    VerificationToken {
        String identifier UK "Composite Unique"
        String token UK "Composite Unique"
        DateTime expires
    }

    Review {
        String id PK "cuid()"
        String mediaId IX "TMDb Movie/TV ID"
        String mediaType "'movie' or 'tv'"
        String content "text"
        Int rating "1 to 10"
        String userId FK "Refers to User(id)"
        DateTime createdAt "defaults to now()"
    }

    WatchlistItem {
        String id PK "cuid()"
        String mediaId UK "Composite Unique (userId + mediaId)"
        String mediaType "'movie' or 'tv'"
        String title
        String posterPath "Nullable"
        String userId FK "Composite Unique (userId + mediaId)"
        DateTime addedAt "defaults to now()"
    }

    LoginLog {
        String id PK "cuid()"
        String userId FK "Refers to User(id)"
        DateTime loggedInAt "defaults to now()"
        String userAgent "text"
    }

    ContactSubmission {
        String id PK "cuid()"
        String name
        String email
        String subject
        String message "text"
        DateTime createdAt "defaults to now()"
    }

    AdminActivityLog {
        String id PK "cuid()"
        String action "e.g. USER_REGISTRATION, CONTACT_SUBMISSION"
        String details "text"
        DateTime createdAt "defaults to now()"
    }
```

---

## 📊 2. Detailed Table Specifications

### 1. `User` (User Accounts)
Holds credential data and general user profiles.
* **Fields**:
  * `id` (`String` / `cuid`): Primary Key.
  * `name` (`String?`): Display name.
  * `email` (`String` / `@unique`): Login email index.
  * `password` (`String?`): Hashed password (omitted for OAuth profiles).
  * `emailVerified` (`DateTime?`): Email verification timestamp.
  * `image` (`String?`): Avatar image URL.
  * `resetToken` (`String?` / `@unique`): Password recovery hash token.
  * `resetTokenExpiry` (`DateTime?`): Token validation expiry.
  * `createdAt` (`DateTime`): Timestamp of sign up.
  * `updatedAt` (`DateTime`): Automatic edit timestamp updates.

### 2. `Account` (NextAuth OAuth credentials)
Links third-party authentication networks (such as Google OAuth) to User records.
* **Fields**:
  * `id` (`String`): Primary Key.
  * `userId` (`String`): Foreign Key -> `User.id` (OnDelete: Cascade).
  * `provider` / `providerAccountId`: Provider identity keys (e.g. `google`).
  * `access_token` / `refresh_token` (`String?` / `@db.Text`): Credentials strings.
* **Indexes**:
  * `@@unique([provider, providerAccountId])`

### 3. `Session` (Authentication Sessions)
Active authentication states for logged-in sessions.
* **Fields**:
  * `id` (`String`): Primary Key.
  * `sessionToken` (`String` / `@unique`): Web storage session token.
  * `userId` (`String`): Foreign Key -> `User.id` (OnDelete: Cascade).
  * `expires` (`DateTime`): Active authentication lifespan.

### 4. `VerificationToken` (Register validation tokens)
Validates registration steps or credentials modification pathways.
* **Fields**:
  * `identifier` (`String`): Identifier token mapping.
  * `token` (`String` / `@unique`): Unique security hash.
  * `expires` (`DateTime`): Lifespan constraints.
* **Indexes**:
  * `@@unique([identifier, token])`

### 5. `Review` (Cinema Ratings & Comments)
Community feedback and review ratings.
* **Fields**:
  * `id` (`String`): Primary Key.
  * `mediaId` (`String`): TMDb Movie/TV ID.
  * `mediaType` (`String`): Media type identifier (`movie` or `tv`).
  * `content` (`String` / `@db.Text`): Written review comments.
  * `rating` (`Int`): Star rating score range from `1` to `10`.
  * `userId` (`String`): Foreign Key -> `User.id` (OnDelete: Cascade).
  * `createdAt` (`DateTime`): Timestamp of publication.
* **Indexes**:
  * `@@index([mediaId])` (Speeds up reviews retrieval on Movie details pages).

### 6. `WatchlistItem` (User watchlist sync)
Persists saved titles on the cloud instead of localized cookies.
* **Fields**:
  * `id` (`String`): Primary Key.
  * `mediaId` (`String`): TMDb content index.
  * `mediaType` (`String`): Media type identifier (`movie` or `tv`).
  * `title` (`String`): Title of the show.
  * `posterPath` (`String?`): Poster image asset key.
  * `userId` (`String`): Foreign Key -> `User.id` (OnDelete: Cascade).
  * `addedAt` (`DateTime`): Bookmark creation timestamp.
* **Indexes**:
  * `@@unique([userId, mediaId])` (Prevents duplicate watchlist bookmarks per user).

### 7. `LoginLog` (Security telemetry log)
Tracks sign-in events.
* **Fields**:
  * `id` (`String`): Primary Key.
  * `userId` (`String`): Foreign Key -> `User.id` (OnDelete: Cascade).
  * `loggedInAt` (`DateTime`): Login timestamp.
  * `userAgent` (`String?` / `@db.Text`): Details on browser type and client OS.
* **Indexes**:
  * `@@index([userId])` (For rapid user activity search queries).

### 8. `ContactSubmission` (Feedback data)
Saves customer inquiries.
* **Fields**:
  * `id` (`String`): Primary key.
  * `name` / `email` / `subject` / `message`: Content inputs.
  * `createdAt` (`DateTime`): Submission timestamp.

### 9. `AdminActivityLog` (Administrative audit trail)
Global activity logs (events, submission reports, alerts).
* **Fields**:
  * `id` (`String`): Primary Key.
  * `action` (`String`): Action identifier type (e.g. `CONTACT_SUBMISSION`, `USER_REGISTRATION`).
  * `details` (`String` / `@db.Text`): Detailed explanation payload.
  * `createdAt` (`DateTime`): Timestamp of creation.

---

## 🔒 3. Integrity Constraints & Relationships

1. **Cascading Deletions**: Relational tables (`Account`, `Session`, `Review`, `WatchlistItem`, `LoginLog`) specify `onDelete: Cascade` referencing `User.id`. When a user deletes their profile, all related data is purged from Supabase automatically to avoid orphaned database rows.
2. **Composite Uniques**:
   * `Account` uses `@@unique([provider, providerAccountId])` to enforce that a single social account cannot map to multiple local profiles.
   * `WatchlistItem` uses `@@unique([userId, mediaId])` to maintain duplicate prevention.
3. **Foreign Key Relations**: Expressed via Prisma ORM constraints mapping direct keys to reference values on targeted PostgreSQL tables during build generation.
