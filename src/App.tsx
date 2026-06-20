import { RouterProvider, createRouter } from '@tanstack/react-router'
import { routeTree } from './routeTree.gen'
import { ThemeProvider } from '@/context/ThemeContext'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { ErrorBoundarySmall } from '@/components/ErrorBoundarySmall'

const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

function App() {
  return (
    <ThemeProvider>
      {/* Main app error boundary */}
      <ErrorBoundary
        onError={(error, errorInfo) => {
          // You can log to an error tracking service here
          console.error('App Error:', error)
          console.error('Error Info:', errorInfo)
        }}
      >
        {/* Router provider with its own small boundary */}
        <ErrorBoundarySmall>
          <RouterProvider router={router} />
        </ErrorBoundarySmall>
      </ErrorBoundary>
    </ThemeProvider>
  )
}

export default App