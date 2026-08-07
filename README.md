# CampusNest

CampusNest is a modern, social-housing platform tailored for Nigerian university students. It enables students to find lodges near their campus, request roommates, write reviews on landlords, and chat in real-time. Landlords and agents can publish listings, manage property details, and communicate directly with prospective student tenants.

## 🚀 Key Features

* **Real PostgreSQL Integration**: Backed by a full relational database using **Prisma ORM**.
* **Credentials OTP & Google Authentication**: 
  * Primary login via a secure, custom **6-digit numeric OTP** sent to email (displayed in console logs during development).
  * Secondary login option using **Google OAuth**.
* **Role-Selection Onboarding**: Intercepts first-time logins to verify student vs. landlord status and link students with their respective university.
* **Geolocated Interactive Maps**: Custom street-level basemaps rendered on the Discover `/discover` and Listing detail `/listing/[id]` pages using **OpenStreetMap (OSM)** tiles via **Leaflet** & `react-leaflet`, positioning property markers at their genuine lat/lng coordinates.
* **Live Chat Simulation**: Dynamic typing indicators, read receipts, and progressive delivery notifications backed by database persistence and automatic simulated chatbot responses.
* **Unified Social Feed**: Aggregates landlord lodge posts, student reviews, and roommate requests sorted chronologically by creation date.
* **Interactive Profile Editing**: Live update forms to update display name and bio details dynamically in the database.

---

## 🛠️ Tech Stack

* **Frontend**: Next.js 16 (App Router), React, Lucide Icons, Framer Motion
* **Styling**: Vanilla CSS (Global design tokens, modern glassmorphic styles)
* **Database & ORM**: PostgreSQL, Prisma Client 6.2.1
* **Authentication**: NextAuth.js
* **Maps**: Leaflet (leaflet, react-leaflet)

---

## ⚙️ Project Setup

### 1. Requirements
Ensure you have the following installed:
* Node.js (v18+)
* PostgreSQL

### 2. Environment Configuration
Create a `.env` or `.env.local` file in the root directory:

```env
DATABASE_URL="postgresql://victor@localhost:5433/campusnest?schema=public"
NEXTAUTH_SECRET="your-development-nextauth-secret-here"
NEXTAUTH_URL="http://localhost:3000"

# Google OAuth credentials (if configured)
GOOGLE_CLIENT_ID="google-client-id-placeholder"
GOOGLE_CLIENT_SECRET="google-client-secret-placeholder"
```

### 3. Database Migration & Seeding
CampusNest uses a custom seeding file to translate mock static data arrays into actual database relations.

Initialize migrations and run the seed script:
```bash
# Apply Prisma migrations
npx prisma migrate dev --name init

# Run database seeder
npx prisma db seed
```

### 4. Running the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser to inspect the application.

---

## 💾 Prisma Database Models

The schema is defined in `prisma/schema.prisma` and contains the following models:
* **User**: Profile, role (STUDENT, LANDLORD), verification status, joined date, and university association.
* **University**: Geolocated campus details, states, and surrounding campus areas.
* **Listing**: Geolocated housing properties containing prices, amenities, image assets, and landlord associations.
* **SavedListing**: Junction table tracking bookmarked/saved properties.
* **Post**: Unified feed items consisting of roommate requests and landlord review posts.
* **Review**: Verified property rating reviews associated with landlord lodges.
* **Conversation**: Chat rooms tracking participants and active typing statuses.
* **Message**: Individual message rows tracking sender, timestamp, and message receipt status (SENT, DELIVERED, READ).

---

## 🔒 Route Protection Middleware
Middleware is configured in `src/middleware.ts` to safeguard private routes:
* `/create` (Creating listings or roommate requests) and `/messages/*` (Active conversation rooms) are protected routes.
* Landing feeds, `/discover`, and listing details `/listing/[id]` remain open to guest visitors.
