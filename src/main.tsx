import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { PostHogProvider } from 'posthog-js/react'
import type { PostHogConfig } from 'posthog-js'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PostHogProvider
      apiKey={import.meta.env.VITE_PUBLIC_POSTHOG_KEY}
      options={{ api_host: import.meta.env.VITE_PUBLIC_POSTHOG_HOST } as Partial<PostHogConfig>}
    >
        <App />
    </PostHogProvider>
  </StrictMode>,
)