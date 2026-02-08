# UK Bite Reports

A real-time, community-driven mobile app for UK anglers to share catch reports, discover fishing spots, and connect with fellow fishermen across the country.

Built by **Mircea Serban** — Computer Science student, angler, and mobile dev enthusiast.

---

## What is UK Bite Reports?

UK Bite Reports is a mobile application designed exclusively for the UK fishing community. The idea came from a simple problem: there's no quick, centralised way for anglers to share what they're catching, where they're catching it, and what's working right now.

This app solves that by giving anglers a platform to:

- **Post catch reports** with photos, species, weight, length, location, and notes about bait/conditions
- **Browse a live feed** of recent catches from anglers across the UK
- **Explore an interactive map** showing where fish are being caught, with pins you can tap for details
- **Like and comment** on other anglers' reports
- **Build a profile** showcasing your personal catch history and stats

The app is UK-only by design. During signup, users must provide a valid UK postcode, and the map defaults to a view of England, Scotland, and Wales. Dates are displayed in British format, and the species dropdown includes 25 common UK freshwater fish — from Carp and Pike to Barbel and Grayling.

---

## Features

### Authentication
- Email/password signup and login
- UK postcode validation on registration (client-side regex)
- Auth-gated navigation — unauthenticated users can only see the onboarding screen

### Home Feed
- Scrollable list of catch reports displayed as cards
- Each card shows: user avatar, catch photo, species badge, location, weight, timestamp, notes, like/comment counts
- Pull-to-refresh and infinite scroll pagination (10 reports per page)

### Interactive Map
- Full-screen map centred on the UK
- Custom fish markers for each catch report
- Tap a marker to open a detail modal with photo, species, location, and weight
- "View Full Report" button navigates to the full detail screen

### Post a Catch Report
- Photo upload via camera or gallery (with image cropping)
- Auto-detect current location using GPS with reverse geocoding
- Manual location name entry
- Species dropdown with 25 common UK freshwater fish
- Weight (lb/oz) and length (inches) fields
- Notes field for bait, conditions, story of the catch (500 char limit)
- Upload photo to Firebase Storage, save report to Firestore

### Report Detail
- Full-screen photo view
- User info, species badge, and catch date
- Weight, length, and location stats
- Like/unlike toggle with real-time count
- Comments section with ability to post new comments

### Profile
- User avatar (initials-based), display name, email, and postcode
- Stats card showing total catches and total likes received
- List of all your own catch reports
- Pull-to-refresh
- Log out button

### Extras
- Light and dark mode support (follows system preference)
- Fishing-themed colour palette (deep blues, teals, greens)
- Responsive design for various screen sizes
- Safe area handling for devices with notches and navigation bars
- Form validation using Zod schemas
- British date formatting (e.g. "3 Feb 2026 at 14:30")

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Expo SDK 54 (managed workflow) |
| Language | TypeScript 5.9 |
| UI | React Native 0.81 |
| Navigation | React Navigation 7 (native-stack + bottom-tabs) |
| Backend | Supabase (Auth, PostgreSQL, Storage) |
| Maps | react-native-maps |
| Camera/Photos | expo-image-picker, expo-camera |
| Location | expo-location (GPS + reverse geocoding) |
| Validation | Zod |
| Date Formatting | date-fns with en-GB locale |
| Icons | @expo/vector-icons (Ionicons) |

---

## Project Structure

```
src/
├── config/
│   └── supabase.ts              # Supabase client initialisation (gitignored)
├── types/
│   └── index.ts                 # TypeScript interfaces + UK fish species list
├── theme/
│   └── index.ts                 # Light/dark theme with fishing colours
├── hooks/
│   ├── useAuth.ts               # Supabase auth state listener
│   └── useTheme.ts              # System colour scheme hook
├── utils/
│   ├── validation.ts            # Zod schemas for forms
│   ├── formatting.ts            # UK date/weight/length formatters
│   └── database.ts              # All Supabase CRUD operations
├── components/
│   ├── Avatar.tsx               # Profile image or initials fallback
│   ├── Button.tsx               # Multi-variant button component
│   ├── Input.tsx                # Themed text input with icons
│   ├── ReportCard.tsx           # Feed card for catch reports
│   ├── EmptyState.tsx           # Placeholder for empty lists
│   └── LoadingScreen.tsx        # Centred loading spinner
├── navigation/
│   └── AppNavigator.tsx         # Auth-gated stack + tab navigation
└── screens/
    ├── auth/
    │   ├── OnboardingScreen.tsx  # Welcome screen with gradient
    │   ├── LoginScreen.tsx       # Email/password login
    │   └── SignupScreen.tsx      # Registration with postcode
    └── main/
        ├── HomeScreen.tsx        # Catch report feed
        ├── MapScreen.tsx         # Interactive UK map
        ├── PostReportScreen.tsx  # New catch report form
        ├── ReportDetailScreen.tsx # Full report + comments
        └── ProfileScreen.tsx     # User profile + stats
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- Expo Go app on your phone ([Android](https://play.google.com/store/apps/details?id=host.exp.exponent) / [iOS](https://apps.apple.com/app/expo-go/id982107779))
- A Supabase project (free tier works)

### Installation

1. Clone the repo:
   ```bash
   git clone https://github.com/S-Mircea/uk-bite-reports.git
   cd uk-bite-reports
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up Supabase:
   - Go to [supabase.com](https://supabase.com) and create a new project
   - Go to **SQL Editor** and run the entire contents of `supabase-schema.sql` — this creates all tables, RLS policies, storage bucket, and RPC functions
   - Go to **Authentication** > **Providers** > **Email** > turn off **"Confirm email"** (for development)
   - Go to **Settings** > **API** and copy your **Project URL** and **anon public key**

4. Create the Supabase config file:
   ```bash
   cp src/config/supabase.ts.example src/config/supabase.ts
   ```
   Then edit `src/config/supabase.ts` and paste your Supabase URL and anon key.

5. Start the app:
   ```bash
   npm start
   ```

6. Scan the QR code with Expo Go on your phone.

---

## Database Schema

The app uses four PostgreSQL tables in Supabase with Row Level Security (RLS):

- **`profiles`** — User profiles (id, display_name, email, postcode, avatar_url) linked to Supabase Auth
- **`reports`** — Catch reports with photo URL, species, weight, location coordinates, timestamps, like/comment counts
- **`comments`** — Comments linked to reports by `report_id`
- **`likes`** — Like records with unique constraint on (`report_id`, `user_id`) to prevent duplicates

Plus three RPC functions (`increment_likes`, `decrement_likes`, `increment_comments`) for atomic count updates, and a `report-photos` storage bucket for catch images.

The full schema is in `supabase-schema.sql`.

---

## Screenshots

*Coming soon — the app is fully functional, screenshots will be added after further UI testing.*

---

## Roadmap

These are features I'm planning to add in future iterations:

- [ ] SMS verification via Twilio for stronger UK identity checks
- [ ] Push notifications when someone likes or comments on your catch
- [ ] Image compression before upload to reduce storage costs
- [ ] Search and filter by species, date range, or location radius
- [ ] Admin moderation queue for reported content
- [ ] User profile photo editing
- [ ] Follow other anglers and see their catches in a dedicated feed
- [ ] Offline support with Supabase local persistence
- [ ] Share reports externally (WhatsApp, social media)
- [ ] Weather data integration for catch conditions

---

## Licence

This project is for educational purposes as part of my Computer Science coursework. Feel free to explore the code and use it as a reference for your own projects.

---

**Built with React Native, Supabase, and a love for fishing.**
