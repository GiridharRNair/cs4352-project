# WindDown - Screen-Time Transition App for Families

https://cs4352-project.vercel.app/

An app helping parents and children (ages 10-17) manage screen-time transitions without conflict. WindDown reduces friction around ending games, leaving chats, and pausing digital activities by combining task completion with peer accountability and daily reflection rituals.

**Target Users:** Parents and children ages 10-17 who experience daily friction around screen-time transitions and digital disengagement.

**Live Demo:** https://youtu.be/ADTnJb7PrOs

---

## Features

### 🎯 My Tasks
- Create, edit, delete tasks with 5-second undo
- Pomodoro timer (15/25/45/60 min) with per-task focus tracking
- Completion streaks
- Task completion status with timestamps

### 👥 Peer Connections
- Connect via unique 6-digit PIN
- Real-time activity feed with emoji reactions (🔥 👏 💪 🎉 ❤️)
- View peer tasks and completion stats
- Streak leaderboard with medals
- Send/accept/remove connection requests

### 🌙 Wind Down Ritual
- Daily mood check-in (😊 😐 😔)
- Gratitude and reflection notes
- Optional peer sharing
- View peer reflections (last 7 days)
- Auto-populated task accomplishments

### ⚡ Other Features
- Google OAuth authentication
- Dark/light theme
- Fully responsive design
- Real-time updates via Supabase

---

## Quick Start

### Prerequisites
- Node.js 18+
- Modern browser (Chrome 90+, Firefox 88+, Safari 14+)
- Supabase account

### Installation

1. **Clone and install:**
   ```bash
   git clone https://github.com/GiridharRNair/cs4352-project.git
   cd cs4352-project
   npm install
   ```

2. **Create Supabase project:**
   - Go to https://supabase.com/dashboard
   - Create new project
   - Get Project URL and Anon Key from Settings → API

3. **Set environment variables:**
   Create `.env.local`:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=your_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   ```

4. **Run database migrations:**
   In Supabase SQL Editor, run these files **in order**:
   1. `supabase/schema.sql` - Core tables and RLS
   2. `supabase/fix-user-creation.sql` - Auto-generate profiles
   3. `supabase/fix-pin-search.sql` - PIN search optimization
   4. `supabase/add-focus-sessions.sql` - Focus timer support
   5. `supabase/add-peer-motivation.sql` - Activity feed & reactions
   6. `supabase/add-daily-reflections.sql` - Reflection system
   7. `supabase/fix-peer-visibility.sql` - Bidirectional connections
   8. `supabase/fix-connection-delete-policy.sql` - Peer removal

5. **Configure Google OAuth:**
   - Create OAuth credentials in [Google Cloud Console](https://console.cloud.google.com/)
   - Add redirect URI: `https://[YOUR-PROJECT-REF].supabase.co/auth/v1/callback`
   - Enable Google provider in Supabase Authentication → Providers
   - Add Client ID and Secret

6. **Start dev server:**
   ```bash
   npm run dev
   ```
   Open http://localhost:3000

---

## Usage

### Getting Started
1. Sign in with Google
2. Note your 6-digit PIN (displayed at top)
3. Create tasks in "My Tasks" tab
4. Connect with peers using their PINs
5. Complete tasks and fill daily reflection

### Testing Peer Features
Use Gmail's `+` trick to create test accounts:
- `yourname+test1@gmail.com`
- `yourname+test2@gmail.com`

Exchange PINs between accounts to test peer connections, activity feed, reactions, and shared reflections.

---

## Known Limitations

- **Online only** - No offline mode
- **One reflection per day** - Cannot edit past days
- **PIN-based connections** - No username search
- **No file attachments** - Text-only tasks
- **No notifications** - No email/push alerts
- **Timer limitations** - Pauses if you leave page
- **Browser-only** - No native mobile/desktop apps

---

## Troubleshooting

### Authentication fails
- Verify Google OAuth callback URL matches Supabase
- Check Client ID/Secret in Supabase settings
- Restart dev server after `.env.local` changes

### Cannot see peer data
- Run `fix-peer-visibility.sql`
- Ensure connection is "accepted" not "pending"

### Database errors
- Verify all SQL migrations ran successfully
- Check RLS policies exist in Supabase

### Timer not saving
- Complete full session without page refresh
- Verify `add-focus-sessions.sql` was executed

---

## Tech Stack

- **Frontend:** Next.js 15.5.8, React 19, TypeScript 5
- **Backend:** Supabase (PostgreSQL + Auth + Realtime)
- **Styling:** Tailwind CSS 3.4.1, Radix UI, shadcn/ui
- **Icons:** Lucide React
- **Theme:** next-themes

See `SOURCES.md` for detailed dependency documentation.

---

## Deployment

```bash
npm run build
npm start
```

**Recommended platforms:** Vercel, Netlify, Railway

**Remember to:**
- Update OAuth redirect URLs for production domain
- Set production environment variables
- Update `NEXT_PUBLIC_SITE_URL`

---

## Resources

- [Next.js Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [GitHub Repo](https://github.com/GiridharRNair/cs4352-project)

---

**License:** Educational project for CS4352 (Human-Computer Interaction)