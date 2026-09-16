import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { PostHogProvider } from 'posthog-js/react'
import type { PostHogConfig } from 'posthog-js'
// import { ClerkProvider } from '@clerk/clerk-react'

// const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

// if (!PUBLISHABLE_KEY) {
//   throw new Error('Add your Clerk Publishable Key to the .env file')
// }

const posthogKey = import.meta.env.VITE_PUBLIC_POSTHOG_KEY as string | undefined
const app = <App />

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {posthogKey ? (
      <PostHogProvider
        apiKey={posthogKey}
        options={{ api_host: import.meta.env.VITE_PUBLIC_POSTHOG_HOST } as Partial<PostHogConfig>}
      >
        {app}
      </PostHogProvider>
    ) : (
      app
    )}
  </StrictMode>,
)
