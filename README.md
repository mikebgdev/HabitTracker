# HabitMaster

## Description

HabitMaster is a full-stack application for tracking and managing daily habits. It features a React-based client and a Node.js/Express-based server, organized using Hexagonal Architecture, Domain-Driven Design (DDD), and SOLID principles.

## Features

- Create, edit, and delete habits
- Track daily habit completion and statistics
- Manage habit streaks and reminders
- User authentication (Firebase Google Sign-In on client, JWT on server)
- Clear separation of concerns with Ports & Adapters pattern
- Modular and testable codebase following DDD & SOLID

## Tech Stack

- **Client**: React, TypeScript, Vite, TailwindCSS, React Query, Firebase Auth
- **Server**: Node.js, TypeScript, Express, Drizzle ORM, PostgreSQL, JWT
- **Architecture**: Hexagonal Architecture (Ports & Adapters), Domain-Driven Design, SOLID principles

## Prerequisites

- Node.js v14 or higher
- npm v6 or higher
- PostgreSQL database
- Firebase project (to obtain API credentials)

## Environment Variables

Create a `.env` file in the project root and add the following variables:

```dotenv
# Server: PostgreSQL connection URL
DATABASE_URL=postgresql://username:password@localhost:5432/habittracker

# Server: JWT settings
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=7d

# (Optional) Client: API base URL if server runs on a different host/port
# VITE_API_URL=http://localhost:5000

# Client: Firebase web configuration
VITE_FIREBASE_API_KEY=your_firebase_api_key_here
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id_here
VITE_FIREBASE_APP_ID=your_firebase_app_id_here
```

## Installation

```bash
git clone https://github.com/yourusername/HabitMaster.git
cd HabitMaster
npm install
```

## Database Migrations

Apply database schema changes:

```bash
npm run db:push
```

## Development

Start the server in development mode (with Vite middleware):

```bash
npm run dev
```

The server runs on port 5000 and serves the React client. Open http://localhost:5000 in your browser.

### Development with Docker Compose

Alternatively, you can launch the application using Docker Compose:

```bash
docker-compose up
```

This will start a PostgreSQL database and the Node.js/Vite application. The server will be available at http://localhost:5000. Use `docker-compose down` to stop the services.

## Production Build

Build client and server for production:

```bash
npm run build
npm run start
```

- Client static files are output to `dist/public`.
- Server bundle is in `dist/`.

## Project Structure

```
HabitMaster/
├── client/                     # React frontend
│   ├── public/                 # Vite public assets
│   ├── src/
│   │   ├── domain/             # Domain models (entities, value objects)
│   │   ├── application/        # Use-case hooks (business logic)
│   │   ├── infrastructure/     # API adapters, utilities
│   │   └── presentation/       # React components & pages
│   └── vite.config.ts          # Client-specific Vite config
├── server/                     # Express backend
│   ├── domain/                 # Domain entities, value objects, domain services
│   ├── application/            # Use cases, port interfaces
│   ├── infrastructure/         # Adapters: web (routes/controllers), db, config
│   └── index.ts                # Composition root (server setup)
├── shared/                     # Shared DTOs and schemas
├── .env                        # Environment variables (ignored by git)
├── drizzle.config.ts           # Drizzle ORM migrations config
├── vite.config.ts              # Monorepo Vite config (client & server)
├── package.json
├── LICENSE.md
└── README.md
```

## License

This project is licensed under the MIT License. See [LICENSE.md](LICENSE.md) for details.

## Contact

For inquiries and collaborations, feel free to reach out to me through the contact form on the portfolio or via email at [mike@mikebgdev.com](mailto:mike@mikebgdev.com).
