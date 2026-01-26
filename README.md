# MAIC Website

This is the source code for the MSOE AI Club (MAIC) website. It is a modern React application built with [Vite](https://vitejs.dev/) and TypeScript.

This documentation is designed to help developers of all experience levels set up, run, and maintain the website.

## 🚀 Quick Start

### Prerequisites

Before you begin, ensure you have the following installed on your computer:

1.  **Node.js**: A JavaScript runtime. We recommend the latest LTS version (v20+).  
    [Download Node.js](https://nodejs.org/)
2.  **Git**: Version control system to manage the code.  
    [Download Git](https://git-scm.com/)
3.  **Code Editor**: We recommend [Visual Studio Code](https://code.visualstudio.com/) (VS Code).

### Installation

1.  **Clone the repository**:
    Open your terminal (Command Prompt, PowerShell, or Git Bash) and run:

    ```bash
    git clone https://github.com/MSOE-AI-Club/maic-website.git
    cd maic-website
    ```

2.  **Install dependencies**:
    This downloads all the necessary libraries specified in `package.json`.

    ```bash
    npm install
    ```

    _(Note: If you use `bun`, you can run `bun install` instead.)_

3.  **Setup Environment Variables**:
    The application relies on environment variables for configuration (like API content URLs).
    1.  Copy the example environment file:
        - **Windows**: Copy `.example.env` and rename it to `.env`.
        - **Mac/Linux**: `cp .example.env .env`
    2.  Open `.env` in your text editor. It should look like this:
        ```bash
        VITE_BRANCH=main
        VITE_CONTENT_BASE_URL=/content
        VITE_PUBLIC_POSTHOG_KEY=your_key_here
        VITE_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com
        VITE_CLERK_PUBLISHABLE_KEY=your_key_here
        ```
    3.  **Important**: You will need to obtain the `VITE_CLERK_PUBLISHABLE_KEY` (for authentication) and `VITE_PUBLIC_POSTHOG_KEY` (for analytics) from a team lead or the project administrator. The app will not fully function without them.

### Running the Application

To start the local development server:

```bash
npm run dev
```

The terminal will show a URL (usually `http://localhost:5173/`). helper Open this in your browser to see the website. Changes you make to the code will automatically reload the page.

---

## 🛠 Project Structure

Here is a high-level overview of the most important files and folders:

```
maic-website/
├── public/              # Static assets that are served directly (e.g., icons)
├── src/                 # Main source code
│   ├── assets/          # Images and other static files imported in code
│   ├── components/      # Reusable UI components (Buttons, Cards, Headers, etc.)
│   ├── hooks/           # Custom React hooks (logic reuse)
│   │   └── github-hook.ts  # Logic for fetching dynamic content (see below)
│   ├── pages/           # Components that represent full pages (Home, About, etc.)
│   ├── App.tsx          # Main application component & routing setup
│   ├── main.tsx         # Entry point of the React application
│   └── index.css        # Global styles and Tailwind imports
├── .env                 # Environment variables (do not commit this file!)
├── package.json         # Project metadata, scripts, and dependencies
├── tailwind.config.js   # Tailwind CSS configuration (if present)
├── tsconfig.json        # TypeScript configuration
└── vite.config.ts       # Vite build tool configuration
```

## 🧩 Key Concepts & Architecture

### The Content Hook (`github-hook.ts`)

A unique feature of this website is that it **fetches its content dynamically** from a separate repository (`maic-content`). This allows non-developers to update website text/images without touching the website code.

- **How it works**:
  The `github-hook.ts` file contains logic to fetch a `manifest.json` file from a remote URL (the Content CDN). This manifest lists all available markdown files and images. The website then uses this list to display articles, tutorials, or other content.

- **Configuration**:
  The hook looks for the content URL in this order:
  1.  `VITE_CONTENT_BASE_URL` from your `.env` file.
  2.  Defaults to `https://msoe-ai-club.github.io/maic-content/` (Production).
  3.  Falls back to local setups if configured.

  **Local Content Development**:
  If you are also editing content, you can run a local server (like Python's `http.server`) in the content repo on port 8000. In `vite.config.ts`, there is a proxy set up so requests to `/content` are forwarded to `http://localhost:8000`.

### Styling

We use **Tailwind CSS** for styling. Instead of writing traditional CSS files, we use utility classes directly in the JSX code (e.g., `className="text-center text-blue-500"`).

- Docs: [Tailwind CSS Documentation](https://tailwindcss.com/)

### Routing

We use **React Router** to handle navigation. New pages are defined in `src/App.tsx` (or wherever the Router is defined) and the page components live in `src/pages/`.

## 📦 Building for Production

When you are ready to deploy the website, you need to build a production version. This creates a highly optimized `dist/` folder.

```bash
npm run build
```

To test the production build locally before deploying:

```bash
npm run preview
```

## 📚 Resources for New Developers

If you are new to React or Web Development, these resources will be helpful:

- **React**: [Official React Documentation](https://react.dev/learn) (Start here!)
- **TypeScript**: [TypeScript for React Developers](https://www.typescriptlang.org/docs/handbook/react.html)
- **Vite**: [Vite Guide](https://vitejs.dev/guide/)

## 🤝 Contributing

1.  Pull the latest changes: `git pull origin main`
2.  Create a new branch for your feature: `git checkout -b feature/my-new-feature`
3.  Commit your changes: `git commit -m "Add my new feature"`
4.  Push to GitHub: `git push origin feature/my-new-feature`
5.  Open a Pull Request on GitHub.
