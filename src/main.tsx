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

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PostHogProvider
      apiKey={import.meta.env.VITE_PUBLIC_POSTHOG_KEY}
      options={{ api_host: import.meta.env.VITE_PUBLIC_POSTHOG_HOST } as Partial<PostHogConfig>}
    >
      {/* <ClerkProvider publishableKey={PUBLISHABLE_KEY}> */}
        <App />
      {/* </ClerkProvider> */}
    </PostHogProvider>
  </StrictMode>,
)