# Momentum

A focus timer app to track your productivity and build momentum.

## ✨ Features

- ⏱️ **Focus Timer** - Count-up timer with start/stop/reset
- 📊 **Dashboard** - Track today's stats, hourly distribution, and weekly/monthly progress
- 📜 **History** - View all your past sessions with search and date filtering
- 🌗 **Dark/Light Mode** - Theme toggle with system preference detection
- 📱 **PWA Support** - Installable on mobile and desktop

## 🛠️ Tech Stack

- React 19 with TypeScript
- Vite for fast builds
- Supabase for data persistence
- Tailwind CSS v4 with shadcn/ui
- TanStack Router for routing

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 📁 Project Structure

```
src/
├── components/     # React components
├── hooks/         # Custom React hooks
├── lib/           # Utilities and services
├── routes/        # TanStack Router routes
├── constants/     # App constants
└── context/       # React context providers
```

## 📦 Database Schema

```sql
CREATE TABLE sessions (
  id UUID PRIMARY KEY,
  start_at TIMESTAMPTZ NOT NULL,
  end_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

## 🔧 Environment Variables

Create a `.env` file:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 📱 PWA

The app is PWA-ready with offline support and installable on mobile/desktop.

## 📄 License

Private - Personal use only
```