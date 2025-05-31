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
   git clone https://github.com/your-username/habit-tracker.git
   cd habit-tracker
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   - Copy `.env` to `.env.local` and fill in the sensitive values:
     ```bash
     cp .env .env.local
     ```
   - Edit `.env.local` with:
     ```ini
     DATABASE_URL=...
     JWT_SECRET=...
     JWT_EXPIRES_IN=...
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

## Internationalization

All UI text strings are centralized in `src/locales/{en,es}`. To add or modify translations, edit the corresponding JSON files.

## Contributing

Contributions are welcome! To get started:

1. Fork the repository.
2. Create a new feature branch: `git checkout -b feature/my-feature`.
3. Make your changes and address formatting issues.
4. Open a pull request describing your changes.