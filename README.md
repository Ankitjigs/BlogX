# BlogX

BlogX is a modern, full-stack blogging platform built with Next.js 16, designed for performance, SEO, and a rich user experience. It features a powerful WYSIWYG editor, robust authentication, and social interaction capabilities.

## 🚀 Features

-   **Modern Tech Stack:** Built with Next.js 16 (App Router), TypeScript, and Tailwind CSS v4.
-   **Rich Text Editor:** Integrated [Novel](https://novel.sh/) (Tiptap-based) editor for a premium writing experience.
-   **Authentication:** Secure user authentication and management via [Clerk](https://clerk.com/).
-   **Database & ORM:** PostgreSQL hosted on [Supabase](https://supabase.com/), managed with [Prisma](https://www.prisma.io/).
-   **Social Interactions:**
    -   Like, Bookmark, and Comment on posts.
    -   Nested comments with replies.
    -   User Following system.
    -   Real-time notifications.
-   **Content Management:**
    -   Create, Edit, Publish, and Delete posts.
    -   Draft mode and autosaving.
    -   Categories and Tags.
    -   Image uploads (Supabase Storage).
-   **SEO Optimized:**
    -   Dynamic meta tags, Open Graph support, and canonical URLs.
    -   Sitemap and Robots.txt generation.
-   **✨ AI-Powered Enhancements:**
    -   Smart Post Summary Generation (Short, Long, Bullets).
    -   AI SEO & Content suggestions (Titles, Excerpts, Tags, and Meta descriptions).
    -   Publish Readiness Checks (Readability, Structure, SEO scores).
    -   Contextual Text Rewriter inside the editor.
    -   Multi-provider LLM support (Gemini & Groq natively integrated).
-   **Responsive Design:** Mobile-first approach using Tailwind CSS.

## 🛠️ Tech Stack

-   **Framework:** [Next.js 16](https://nextjs.org/)
-   **Language:** [TypeScript](https://www.typescriptlang.org/)
-   **Styling:** [Tailwind CSS v4](https://tailwindcss.com/), [Radix UI](https://www.radix-ui.com/), [Lucide Icons](https://lucide.dev/)
-   **Database:** [PostgreSQL](https://www.postgresql.org/) (Supabase)
-   **ORM:** [Prisma](https://www.prisma.io/)
-   **Auth:** [Clerk](https://clerk.com/)
-   **Storage:** Supabase Storage
-   **AI Providers:** Google Gemini, Groq
-   **Testing:** Jest, React Testing Library

## 🏁 Getting Started

### Prerequisites

-   Node.js 18+ established
-   npm or yarn or pnpm
-   A Supabase project (for Database & Storage)
-   A Clerk application (for Authentication)

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/yourusername/blogx.git
    cd blogx/web
    ```

2.  Install dependencies:
    ```bash
    npm install
    # or
    pnpm install
    ```

3.  Set up environment variables:
    Create a `.env` file in the `web` directory and add the following keys:

    ```env
    # Database (Supabase)
    DATABASE_URL="postgresql://postgres.[ref]:[password]@aws-0-region.pooler.supabase.com:6543/postgres"
    DIRECT_URL="postgresql://postgres.[ref]:[password]@aws-0-region.supabase.co:5432/postgres"

    # Clerk Auth
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
    CLERK_SECRET_KEY=sk_test_...
    NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
    NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

    # Supabase Storage
    NEXT_PUBLIC_SUPABASE_URL=https://[ref].supabase.co
    NEXT_PUBLIC_SUPABASE_ANON_KEY=...
    
    # AI Providers (At least one required for AI enhancements)
    GEMINI_API_KEY=your_gemini_api_key
    GROQ_API_KEY=gsk_your_groq_api_key
    ```

4.  Initialize the database:
    ```bash
    npx prisma generate
    npx prisma db push
    ```

5.  Run the development server:
    ```bash
    npm run dev
    ```

    Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 📜 Scripts

-   `npm run dev`: Starts the development server.
-   `npm run build`: Builds the application for production.
-   `npm run start`: Starts the production server.
-   `npm run lint`: Runs ESLint.
-   `npm test`: Runs Jest tests.

## 📂 Project Structure

```
web/
├── app/              # Next.js App Router pages and layouts
├── components/       # React components (UI, Editor, etc.)
├── lib/              # Utility helper functions
├── prisma/           # Database schema and migrations
├── public/           # Static assets
└── types/            # TypeScript type definitions
```
