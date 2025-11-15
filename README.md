WindDown - Task Management Application

What is WindDown?
A web app that helps you reduce screen time and stay productive by organizing tasks and connecting with peers for accountability.

UI Features:

Landing Page
- Hero section with the WindDown logo and tagline
- Three feature cards explaining what the app does (task management, screen time tracking, daily reflection)
- Navigation bar with theme switcher and sign-in button
- Fully responsive for mobile and desktop

Authentication
- Sign in with Google (OAuth)
- Simple one-click authentication process

Dashboard (Main Interface)
Once logged in, you'll see:
- Your name and unique PIN code at the top
- Streak counter showing current and longest task completion streaks
- Two tabs: "My Tasks" and "Peers"
  
My Tasks Tab:
- Input field to add new tasks
- List of all your tasks with checkboxes
- Check boxes to mark tasks complete
- Tasks save automatically

Peers Tab:
- Search for other users by their PIN
- Connect with friends for accountability
- See your connections

Theme Toggle:
- Switch between light and dark mode
- Preference saves across sessions

Requirements to Run:

Software needed:
- Node.js (version 18 or higher)
- npm, yarn, or pnpm
- A Supabase account (free at supabase.com)
- Modern web browser (Chrome, Firefox, Safari, or Edge)

Setup Instructions:

1. Clone the repository
   git clone https://github.com/GiridharRNair/cs4352-project.git
   cd cs4352-project

2. Install dependencies
   npm install

3. Set up Supabase
   - Go to supabase.com/dashboard and create a new project
   - Navigate to Settings → API
   - Copy your Project URL and Publishable Key

4. Create environment file
   - Make a new file called .env.local in the project root
   - Add these lines:
     NEXT_PUBLIC_SUPABASE_URL=your_project_url
     NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_publishable_key

5. Set up the database
   - In Supabase, go to the SQL Editor
   - Run the SQL files from the supabase/ folder in this order:
     a. schema.sql
     b. fix-user-creation.sql
     c. fix-pin-search.sql

6. Enable Google OAuth in Supabase
   - Go to Authentication → Providers in your Supabase dashboard
   - Enable Google provider
   - Add authorized redirect URLs

7. Start the app
   npm run dev
   
8. Open http://localhost:3000 in your browser

How to Use:

Getting Started:
- Click "Sign In" and authenticate with your Google account
- You'll be redirected to your dashboard after login

Adding Tasks:
- Go to the "My Tasks" tab
- Type your task in the input field
- Press Enter or click submit
- Check the box when you're done with a task

Connecting with Friends:
- Go to the "Peers" tab
- Your PIN is shown at the top of the dashboard
- Share your PIN with friends
- Enter a friend's PIN to connect

Switching Themes:
- Click the theme icon in the navigation bar to toggle dark/light mode

Browser Requirements:
Works on Chrome 90+, Firefox 88+, Safari 14+, Edge 90+. JavaScript must be enabled.

Known Limitations:
- Needs internet connection
- Peer updates might need a page refresh
- No mobile app version (browser only)
- No file uploads for tasks

Troubleshooting:
- Can't sign in? Make sure Google OAuth is enabled in Supabase
- Tasks not saving? Check browser console for errors
- Database errors? Verify all SQL scripts ran successfully
