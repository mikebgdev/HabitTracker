# Habit Tracker

[![Build Status](https://drone.mikebgdev.com/api/badges/mikebgdev/HabitTracker/status.svg)](https://drone.mikebgdev.com/mikebgdev/HabitTracker)

**Habit Tracker** is a web application to create, organize, and track your daily routines and habits.

## Features

- Create, edit, and delete routines
- Organize routines into categories
- Daily progress tracking
- Archive and restore routines
- Internationalization (English and Spanish)
- Light and dark themes
- Bulk complete routines by group (mass actions)
- Browser notifications for scheduled routines and group time‑ranges
- Export progress heatmap and analytics as CSV or PNG image
- SEO optimizations: dynamic metadata (Open Graph, Twitter Cards), robots & canonical tags, sitemap
- Analytics & error monitoring with Umami
- Pre‑commit hooks with Husky & lint‑staged (autoformat & type checks)
- CI pipeline with linting, type‑check, tests and build on PRs (with caching)

## Technologies

- React
- TypeScript
- Vite
- Tailwind CSS
- Firebase (Authentication, Firestore)
- Radix UI
- React Query
- Framer Motion

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/mikebgdev/HabitTracker.git
   cd habit-tracker
   ```

2. Install dependencies and set up Git hooks:
   ```bash
   npm install
   npm run prepare
   ```

3. Configure environment variables:
    - Copy `.env` to `.env.local` and fill in the sensitive values:
      ```bash
      cp .env .env.local
      ```
    - Edit `.env.local` with:
      ```ini
      VITE_FIREBASE_API_KEY=...
      VITE_FIREBASE_PROJECT_ID=...
      VITE_FIREBASE_APP_ID=...
      ```

4. Run in development mode:
   ```bash
   npm run dev
   ```
   The application will be available at `http://localhost:5173`.

## Useful Scripts

- `npm run dev` — Start development server with hot-reload.
- `npm run build` — Build for production.
- `npm run preview` — Preview the production build.
- `npm run lint` — Run ESLint.
- `npm test` — Run unit tests with Jest.
- `npm run test:coverage` — Run tests with coverage report.
- `npm run prepare` — Set up Git hooks (Husky + lint-staged; run once after cloning)

## Project Structure

```
.
├── src/
│   ├── components/   # Reusable React components
│   ├── lib/          # Constants, helpers, and configuration (Firebase, i18n)
│   ├── locales/      # Translation files (en, es)
│   └── pages/        # Application views and pages
├── public/           # Static assets
├── .env              # Default environment variables
├── .env.local        # Sensitive environment variables (not versioned)
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## Architecture & API Documentation

For details on the Firestore schema, security rules, and TypeScript data models, see
[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Internationalization

All UI text strings are centralized in `src/locales/{en,es}`. To add or modify translations, edit the corresponding JSON
files.

## Contributing

Contributions are welcome! To get started:

1. Fork the repository.
2. Create a new feature branch: `git checkout -b feature/my-feature`.
3. Make your changes and address formatting issues.
4. Open a pull request describing your changes.