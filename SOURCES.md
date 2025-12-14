# Sources and Dependencies

## GitHub Repository
**Project Repository:** https://github.com/GiridharRNair/cs4352-project

---

## External Dependencies

### Core Framework & Language

#### 1. Next.js 15.5.8
- **Download/Documentation:** https://nextjs.org/
- **SDK Installation:** `npm install next@15.5.8`
- **Function in Project:** 
  - Main React framework providing server-side rendering (SSR) and static site generation (SSG)
  - Handles all routing via the App Router (`app/` directory)
  - Manages API routes for authentication callbacks
  - Enables server components for improved performance
  - Provides built-in optimization for images, fonts, and scripts

#### 2. React 19.0.0
- **Download/Documentation:** https://react.dev/
- **SDK Installation:** `npm install react@19.0.0 react-dom@19.0.0`
- **Function in Project:**
  - Core library for building the user interface with component-based architecture
  - Manages component state with `useState` hook (task editing, loading states, form inputs)
  - Handles side effects with `useEffect` hook (data fetching, real-time subscriptions)
  - Powers all interactive components: task lists, peer connections, focus timer, daily reflections
  - Enables real-time UI updates through state management

#### 3. TypeScript 5
- **Download/Documentation:** https://www.typescriptlang.org/
- **SDK Installation:** `npm install --save-dev typescript@5 @types/node @types/react @types/react-dom`
- **Function in Project:**
  - Provides static type checking for all components and functions
  - Defines type interfaces in `lib/types/database.ts` (Profile, Task, Connection, etc.)
  - Catches errors during development before runtime
  - Improves code maintainability and IDE autocomplete
  - Ensures type safety for Supabase database queries

---

### Backend & Database

#### 4. Supabase (supabase-js latest, @supabase/ssr latest)
- **Download/Documentation:** https://supabase.com/docs
- **SDK Installation:** `npm install @supabase/supabase-js @supabase/ssr`
- **Function in Project:**
  - **Authentication:** Google OAuth sign-in/sign-up via `supabase.auth.signInWithOAuth()`
  - **Database:** PostgreSQL database storing users, tasks, connections, reflections, focus sessions
  - **Row Level Security (RLS):** Ensures users can only access their own data and connected peers' data
  - **Real-time Subscriptions:** Live updates for activity feed and peer reactions via Postgres changes
  - **Server-Side Rendering:** `@supabase/ssr` package enables secure authentication in Next.js server components
  - Used in: All data operations, authentication flows, peer connections, activity tracking

---

### UI Component Libraries

#### 5. Radix UI Primitives
- **Download/Documentation:** https://www.radix-ui.com/
- **SDK Installation:** Individual packages installed as needed
- **Components Used & Functions:**
  - **@radix-ui/react-dialog:** Modal dialogs for task editing, delete confirmations, peer removal
  - **@radix-ui/react-checkbox:** Task completion checkboxes with accessible keyboard navigation
  - **@radix-ui/react-dropdown-menu:** User menu and settings dropdowns
  - **@radix-ui/react-label:** Form labels for inputs with proper accessibility
  - **@radix-ui/react-tabs:** Tab navigation between "My Tasks", "Peers", and "Wind Down" sections
  - **@radix-ui/react-tooltip:** Hover tooltips explaining streaks, timer, and PIN features
  - **@radix-ui/react-slot:** Utility for composing components with custom children
- **Overall Function:** Provides unstyled, accessible UI primitives that are styled with Tailwind CSS following the shadcn/ui pattern

---

### Styling & Design

#### 6. Tailwind CSS 3.4.1
- **Download/Documentation:** https://tailwindcss.com/
- **SDK Installation:** `npm install tailwindcss@3.4.1 postcss autoprefixer`
- **Function in Project:**
  - Utility-first CSS framework for all styling
  - Responsive design with breakpoint utilities (`md:`, `lg:`)
  - Dark mode support with `dark:` variants
  - Custom design system configured in `tailwind.config.ts`
  - Enables rapid UI development with consistent spacing, colors, and typography

#### 7. tailwindcss-animate 1.0.7
- **Download/Documentation:** https://github.com/jamiebuilds/tailwindcss-animate
- **SDK Installation:** `npm install tailwindcss-animate@1.0.7`
- **Function in Project:**
  - Adds animation utilities to Tailwind CSS
  - Powers spinner animations for loading states
  - Enables slide-in animations for notifications and toasts
  - Provides smooth transitions for expandable peer task lists
  - Used in: Loading spinners, success messages, undo notifications

#### 8. class-variance-authority (CVA) 0.7.1
- **Download/Documentation:** https://cva.style/docs
- **SDK Installation:** `npm install class-variance-authority@0.7.1`
- **Function in Project:**
  - Creates type-safe component variants (button styles, card types)
  - Defines variant patterns: default, destructive, outline, ghost, secondary
  - Enables size variants: sm, md, lg for buttons
  - Used in: Button component with multiple visual styles
  - Combines with Tailwind for dynamic styling based on props

#### 9. clsx 2.1.1 & tailwind-merge 3.3.0
- **clsx Documentation:** https://github.com/lukeed/clsx
- **tailwind-merge Documentation:** https://github.com/dcastil/tailwind-merge
- **SDK Installation:** `npm install clsx@2.1.1 tailwind-merge@3.3.0`
- **Function in Project:**
  - **clsx:** Conditionally constructs className strings (active states, disabled states)
  - **tailwind-merge:** Intelligently merges Tailwind classes, preventing conflicts
  - Combined in `lib/utils.ts` as `cn()` utility function
  - Used everywhere components accept custom className props
  - Example: Merging default button styles with custom user styles

---

### Icons & Visuals

#### 10. Lucide React 0.511.0
- **Download/Documentation:** https://lucide.dev/
- **SDK Installation:** `npm install lucide-react@0.511.0`
- **Function in Project:**
  - Provides icon library for UI elements
  - Icons used: Check marks, calendars, timers, user avatars, flames (streaks)
  - SVG-based icons that match the app's design system
  - Accessible with proper ARIA labels
  - Note: While installed, most icons in the project use inline SVG for customization

---

### Theme Management

#### 11. next-themes 0.4.6
- **Download/Documentation:** https://github.com/pacocoursey/next-themes
- **SDK Installation:** `npm install next-themes@0.4.6`
- **Function in Project:**
  - Manages dark/light mode theme switching
  - Persists user theme preference in localStorage
  - Prevents flash of unstyled content on page load
  - Provides `ThemeProvider` wrapper in layout
  - Enables system theme detection
  - Used in: Theme switcher component in header

---

### Development Tools

#### 12. ESLint 9
- **Download/Documentation:** https://eslint.org/
- **SDK Installation:** `npm install --save-dev eslint@9 eslint-config-next`
- **Function in Project:**
  - Lints JavaScript/TypeScript code for errors and style issues
  - Next.js specific rules via `eslint-config-next`
  - Enforces React best practices (hooks rules, accessibility)
  - Prevents common bugs (unused variables, missing dependencies)
  - Runs on `npm run lint` and during build process

#### 13. Prettier 3.6.2
- **Download/Documentation:** https://prettier.io/
- **SDK Installation:** `npm install --save-dev prettier@3.6.2`
- **Function in Project:**
  - Automatic code formatting for consistent style
  - Formats JSX, TypeScript, CSS, and Markdown files
  - Runs on `npm run format`
  - Ensures consistent indentation, quotes, and line breaks
  - Integrates with ESLint to avoid conflicts

#### 14. PostCSS 8 & Autoprefixer 10.4.20
- **PostCSS Documentation:** https://postcss.org/
- **Autoprefixer Documentation:** https://github.com/postcss/autoprefixer
- **SDK Installation:** `npm install --save-dev postcss@8 autoprefixer@10.4.20`
- **Function in Project:**
  - PostCSS: Processes CSS with JavaScript plugins
  - Autoprefixer: Automatically adds vendor prefixes for browser compatibility
  - Ensures styles work across different browsers (Chrome, Safari, Firefox)
  - Configured in `postcss.config.mjs`
  - Runs automatically during Tailwind CSS compilation

---

## Architecture Overview

### How Dependencies Work Together

1. **Frontend Stack:** Next.js + React + TypeScript provide the foundation
   - Next.js manages routing, SSR, and page structure
   - React builds the interactive UI components
   - TypeScript ensures type safety across the codebase

2. **Backend Integration:** Supabase handles all backend needs
   - Authentication via Google OAuth
   - PostgreSQL database with RLS for security
   - Real-time subscriptions for live updates

3. **Styling System:** Tailwind CSS + Radix UI + shadcn/ui pattern
   - Radix UI provides accessible, unstyled primitives
   - Tailwind CSS applies utility-first styling
   - CVA manages component variants
   - clsx/tailwind-merge handle conditional styling

4. **Developer Experience:** TypeScript + ESLint + Prettier
   - Type checking prevents runtime errors
   - Linting enforces code quality
   - Formatting ensures consistency

5. **User Experience:** next-themes + tailwindcss-animate
   - Smooth theme transitions
   - Loading animations and feedback
   - Responsive design across devices

---

## Installation

To install all dependencies for this project:

```bash
# Clone the repository
git clone https://github.com/GiridharRNair/cs4352-project.git
cd cs4352-project

# Install dependencies
npm install

# Run development server
npm run dev
```

All dependencies are managed through npm and defined in `package.json`.