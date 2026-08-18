# Goalberry

A habit tracking app: create, edit, and delete habits; mark them done or skip them; pick which days each habit repeats on; and track progress with streaks, points, and rewards. Built with React 19, TanStack Start/Router/Query, Tailwind CSS 4, shadcn/Radix UI, and Supabase for backend and auth.

## Development

This project runs on [Bun](https://bun.sh).

```sh
git clone <this-repository-url>
cd goalberry-habit-tracker
bun install
bun run dev
```

## Environment

The app needs a Supabase project. Copy your project's URL and publishable (anon) key into a `.env` file at the repo root:

```
SUPABASE_URL="https://<your-project-ref>.supabase.co"
SUPABASE_PUBLISHABLE_KEY="<your-publishable-key>"
VITE_SUPABASE_URL="https://<your-project-ref>.supabase.co"
VITE_SUPABASE_PUBLISHABLE_KEY="<your-publishable-key>"
```

Database schema and Row Level Security policies are defined in `supabase/migrations/`.
