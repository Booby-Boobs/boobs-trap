# Boobs Trap

An anti-productivity Turing test that filters out "productive humans" and "AI bots", allowing only "lazy humans" to pass. A satirical web toy that mimics Google's reCAPTCHA but with a twist - it's designed to be impossibly difficult to solve.

## Overview

Boobs Trap is a viral web toy that challenges users to select all squares containing "DESPAIR" from a 4×4 grid of images. Unlike traditional CAPTCHAs, this one is intentionally designed to be extremely difficult, testing your ability to identify despair in various forms of workplace misery.

### Features

- **Anti-Productivity Verification**: Only the truly unproductive can pass
- **Despair Detection Challenge**: Find all squares containing DESPAIR in a 4×4 grid
- **Real-time Timer**: Track your time with 0.1-second precision (displayed in bottom-right corner)
- **Leaderboard**: Save your times and compete with others
- **Responsive Design**: Works on both desktop and mobile devices

## Tech Stack

- **Next.js** (React) with App Router
- **TypeScript**
- **Tailwind CSS**
- **Supabase** (for leaderboard)

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- A Supabase account (for leaderboard functionality)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Booby-Boobs/boobs-trap.git
cd boobs-trap
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
   - Copy `.env.local.example` to `.env.local`
   - Fill in your Supabase credentials (see Supabase Setup below)

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Supabase Setup

To enable the leaderboard feature, you need to set up a Supabase project:

### 1. Create a Supabase Project

1. Go to [Supabase](https://supabase.com) and create an account
2. Create a new project

### 2. Create the Database Table

Run the following SQL in the Supabase SQL Editor:

```sql
-- Create leaderboard table
CREATE TABLE IF NOT EXISTS leaderboard (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  time NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Add indexes for faster queries
CREATE INDEX IF NOT EXISTS leaderboard_time_idx ON leaderboard(time ASC);
CREATE INDEX IF NOT EXISTS leaderboard_created_at_idx ON leaderboard(created_at DESC);

-- Enable Row Level Security
ALTER TABLE leaderboard ENABLE ROW LEVEL SECURITY;

-- Create policies (public read and insert)
CREATE POLICY "Anyone can read leaderboard" ON leaderboard
  FOR SELECT USING (true);

CREATE POLICY "Anyone can insert into leaderboard" ON leaderboard
  FOR INSERT WITH CHECK (true);
```

### 3. Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

You can find these values in your Supabase project settings:
- Project Settings → API → Project URL
- Project Settings → API → anon/public key

### 4. Restart the Development Server

After setting environment variables, restart the dev server:

```bash
npm run dev
```

## How It Works

### Challenge Phases

1. **Landing Page**: Check the box "I am a waste of space"
2. **Wait Phase**: 7-second loading screen (you can't rush this)
3. **Challenge Phase**: 
   - Select ALL squares containing "DESPAIR"
   - Timer counts up in bottom-right corner
   - Verify button is disabled for 5 seconds
   - Clicking too fast (< 0.5s after enable) triggers robot detection
4. **Result Phase**: 
   - Success: Enter your name to save your time
   - Failure: Try again (or give up and go to LinkedIn)

### Difficulty Balance

The challenge is designed to be **extremely difficult but not impossible**:
- You must select EXACTLY all squares containing DESPAIR
- Selecting any non-despair square = failure
- Missing any despair square = failure
- Only those who truly understand despair can pass

## Project Structure

```
boobs-trap/
├── app/
│   ├── globals.css
│   ├── layout.tsx
│   ├── page.tsx
│   └── how-to-use/
│       └── page.tsx
├── components/
│   └── Captcha.tsx
├── lib/
│   └── supabase.ts
└── README.md
```

## Development

```bash
# Development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint
npm run lint
```

## License

WTFPL (Do What The F*ck You Want To Public License)

## Contributing

Feel free to submit issues and enhancement requests!

## Acknowledgments

Inspired by Google reCAPTCHA's ability to make you question your humanity.


