Sources and Dependencies

GitHub Repository: https://github.com/GiridharRNair/cs4352-project

External Dependencies Used:

Next.js (https://nextjs.org/)
The main framework for the application. Handles routing, server-side rendering, and provides the structure for building the web app. We use it for all page navigation and API routes.

React v19.0.0 (https://react.dev/)
JavaScript library for building the user interface. All the components like task lists, forms, and buttons are built with React. It handles state management and user interactions.

TypeScript v5 (https://www.typescriptlang.org/)
Adds type safety to our JavaScript code. Helps catch errors during development and makes the code more maintainable.

Supabase (https://supabase.com/)
Backend-as-a-service that we use for Google OAuth authentication and PostgreSQL database. Stores user profiles, tasks, and peer connections. Also provides real-time database updates.

Tailwind CSS v3.4.1 (https://tailwindcss.com/)
CSS framework used for styling. Makes it easy to create responsive designs and keeps styling consistent across the app.

Radix UI (https://www.radix-ui.com/)
Provides accessible UI components. We use their checkbox component for task completion, dropdown menus for navigation, tabs for switching between tasks and peers, and labels for forms.

Lucide React v0.511.0 (https://lucide.dev/)
Icon library that provides all the icons used throughout the interface.

class-variance-authority v0.7.1 (https://cva.style/)
Utility for managing component variants. Used to create different button styles (primary, secondary, ghost, etc.).

clsx v2.1.1 (https://github.com/lukeed/clsx) and tailwind-merge v3.3.0 (https://github.com/dcastil/tailwind-merge)
Small utilities that help with conditional CSS classes and merging Tailwind styles together.

next-themes v0.4.6 (https://github.com/pacocoursey/next-themes)
Handles the dark/light mode theme switching and saves user preferences.

ESLint v9 (https://eslint.org/) and Prettier v3.6.2 (https://prettier.io/)
Code quality tools that help maintain consistent code style and catch errors.

PostCSS v8 (https://postcss.org/) and Autoprefixer v10.4.20 (https://github.com/postcss/autoprefixer)
Process CSS and add browser compatibility prefixes automatically.

How it all works together:
Next.js and React form the foundation of the app. Supabase handles all authentication and database needs. Tailwind and Radix UI provide the styling and interactive components. The utility libraries help manage styles and themes efficiently.