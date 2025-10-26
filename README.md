# Baby Sleep Tracker - MVP

A science-backed baby sleep tracking app with AI-powered insights built with Next.js, Supabase, and Claude AI.

## Features

✅ **One-Tap Sleep Tracking**
- Simple start/stop sleep button
- Real-time sleep duration tracking
- Automatic session logging

✅ **Data Visualization**
- Daily sleep timeline
- Weekly sleep trends graph
- Wake window analysis

✅ **AI-Powered Insights**
- Pattern recognition
- Personalized recommendations
- Age-appropriate sleep guidance

✅ **User Authentication**
- Secure login/signup with Supabase Auth
- Protected routes with middleware

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth
- **AI**: Anthropic Claude API
- **Charts**: Recharts
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+ (Note: Next.js 16 requires Node 20+, but works with 18 with warnings)
- npm or yarn
- Supabase account
- Anthropic API key (optional, for AI insights)

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Project Settings → API
3. Copy your project URL and anon key
4. Go to SQL Editor and run the schema from `supabase-schema.sql`

### 3. Configure Environment Variables

Update the `.env.local` file in the root directory:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# AI API Configuration (Optional)
ANTHROPIC_API_KEY=your-anthropic-api-key
```

**Getting API Keys:**
- Supabase: https://supabase.com/dashboard → Your Project → Settings → API
- Anthropic: https://console.anthropic.com/

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

### 5. Set Up the Database

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of `supabase-schema.sql`
4. Click "Run" to execute the schema

This will create:
- `children` table
- `sleep_sessions` table
- Row Level Security (RLS) policies
- Indexes for performance

## Project Structure

```
baby-sleep-tracker/
├── app/
│   ├── actions/          # Server actions (auth)
│   ├── api/              # API routes
│   │   ├── insights/     # AI analysis endpoint
│   │   └── sleep/        # Sleep tracking endpoints
│   ├── dashboard/        # Main app pages
│   │   ├── history/      # Sleep history & charts
│   │   ├── insights/     # AI recommendations
│   │   └── setup/        # Child profile setup
│   ├── login/            # Authentication pages
│   └── signup/
├── lib/
│   ├── supabase/         # Supabase client utilities
│   └── types/            # TypeScript type definitions
├── middleware.ts         # Auth middleware
├── supabase-schema.sql   # Database schema
└── .env.local           # Environment variables
```

## Usage

### First Time Setup

1. Sign up for an account
2. Create your baby's profile (name and birth date)
3. Start tracking sleep!

### Tracking Sleep

1. Tap "Start Sleep" when your baby goes to sleep
2. Tap "Wake Up" when they wake
3. View today's summary on the dashboard
4. Check history for trends and patterns
5. Get AI insights after recording 3+ sessions

### AI Insights

The AI insights page provides:
- Sleep pattern analysis (avg duration, wake windows)
- Personalized recommendations
- Age-appropriate guidance
- Confidence levels for each recommendation

**Note:** AI insights require an Anthropic API key. The app works without it, showing pattern analysis only.

## Deployment to Vercel

### Quick Deploy

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import your repository
4. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `ANTHROPIC_API_KEY` (optional)
5. Deploy!

## Troubleshooting

### Node Version Warning

If you see warnings about Node version (requires 20.9.0+), the app will still work with Node 18. To suppress warnings, upgrade to Node 20:

```bash
nvm install 20
nvm use 20
```

### Database Connection Issues

1. Check your Supabase URL and anon key in `.env.local`
2. Ensure the database schema has been run
3. Verify RLS policies are enabled

### AI Insights Not Working

1. Verify `ANTHROPIC_API_KEY` is set in `.env.local`
2. Check your API key at https://console.anthropic.com/
3. Ensure you have at least 3 completed sleep sessions

## Future Enhancements

- [ ] Multiple child profiles
- [ ] Partner sync/sharing
- [ ] Quick-add past sleep sessions
- [ ] Push notifications
- [ ] Export data (CSV, PDF)
- [ ] Scientific study citations
- [ ] Mobile app (React Native)

---

Built with ❤️ for tired parents everywhere.
