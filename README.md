# myFood - Personal Cooking Decision Assistant

A smart cooking assistant that helps you decide what to cook, rediscover forgotten meals, and avoid food waste.

## Features

- **Smart Home Feed** — Suggestions based on pantry match, cooking history, and expiring ingredients
- **Recipe Management** — Add recipes manually, paste text, or import from URL
- **Pantry Tracking** — Track ingredients with quantities and expiration dates
- **Shopping List** — Auto-generated from missing ingredients or meal plans
- **Meal Planner** — Weekly calendar to plan meals
- **Cooking History** — Track when you last cooked each recipe

## Tech Stack

- **Frontend**: Next.js 16 (App Router), TypeScript, Tailwind CSS v4, Radix UI
- **Backend**: Next.js Server Actions
- **Database**: PostgreSQL + Prisma ORM
- **DevOps**: Docker + docker-compose

## Quick Start (Docker)

```bash
# Start PostgreSQL + App
docker-compose up -d

# Run migrations
docker exec -it foodman-app-1 npx prisma migrate deploy

# Seed the database
docker exec -it foodman-app-1 npx tsx prisma/seed/index.ts

# Open http://localhost:3000
```

## Local Development

### Prerequisites
- Node.js 20+
- PostgreSQL (or use Docker for just the database)

### Setup

```bash
# 1. Start PostgreSQL only
docker-compose up -d db

# 2. Install dependencies
npm install

# 3. Generate Prisma client
npx prisma generate

# 4. Run migrations
npx prisma migrate dev --name init

# 5. Seed the database
npm run db:seed

# 6. Start dev server
npm run dev

# Open http://localhost:3000
```

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:migrate` | Run database migrations |
| `npm run db:seed` | Seed database with sample data |
| `npm run db:studio` | Open Prisma Studio |

## Deployment (Vercel + External DB)

1. Create a PostgreSQL database on [Neon](https://neon.tech), [Supabase](https://supabase.com), or [Railway](https://railway.app)
2. Deploy to Vercel:
   ```bash
   vercel deploy
   ```
3. Set environment variables in Vercel:
   - `DATABASE_URL` — your external PostgreSQL connection string
4. Run migrations against your production DB:
   ```bash
   DATABASE_URL="your-production-url" npx prisma migrate deploy
   ```

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── page.tsx            # Smart Home (main page)
│   ├── recipes/            # Recipe CRUD
│   ├── pantry/             # Pantry management
│   ├── shopping-list/      # Shopping list
│   └── meal-planner/       # Weekly meal planner
├── actions/                # Server Actions
├── components/
│   ├── ui/                 # shadcn/radix base components
│   ├── recipes/            # Recipe-specific components
│   ├── pantry/             # Pantry components
│   ├── shopping-list/      # Shopping list components
│   ├── meal-planner/       # Meal planner components
│   ├── home/               # Home page sections
│   └── layout/             # Navigation
├── lib/
│   ├── db.ts               # Prisma client
│   ├── utils.ts            # Utility functions
│   ├── validations.ts      # Zod schemas
│   └── services/
│       ├── matching.ts     # Smart matching algorithm
│       ├── parsing.ts      # Ingredient/recipe parsing
│       └── shopping-list.ts # Shopping list generation
└── types/                  # TypeScript types
```
