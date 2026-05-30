import type { ReactNode } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import AppShell from '@/components/layout/AppShell'
import Home from '@/pages/Home'
import JourneyPage from '@/pages/JourneyPage'
import LoadingPage from '@/pages/LoadingPage'
import NotFoundPage from '@/pages/NotFoundPage'
import ResultPage from '@/pages/ResultPage'
import WenzhouBudgetPage from '@/pages/WenzhouBudgetPage'
import WenzhouSimPage from '@/pages/WenzhouSimPage'
import { useAppStore, type FlowStage } from '@/store/app-store'

type FlowGuardProps = {
  allow: FlowStage[]
  redirectTo?: string
  children: ReactNode
}

function FlowGuard({ allow, redirectTo = '/', children }: FlowGuardProps) {
  const flowStage = useAppStore((state) => state.flowStage)

  if (!allow.includes(flowStage)) {
    return <Navigate to={redirectTo} replace />
  }

  return children
}

export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route
        path="/loading"
        element={
          <FlowGuard allow={['loading', 'journey', 'wenzhou-budget']}>
            <LoadingPage />
          </FlowGuard>
        }
      />
      <Route element={<AppShell />}>
        <Route
          path="/journey"
          element={
            <FlowGuard allow={['journey', 'result']} redirectTo="/">
              <JourneyPage />
            </FlowGuard>
          }
        />
        <Route
          path="/result"
          element={
            <FlowGuard allow={['result']} redirectTo="/">
              <ResultPage />
            </FlowGuard>
          }
        />
      </Route>
      <Route
        path="/wenzhou-sim"
        element={
          <FlowGuard allow={['wenzhou-sim', 'journey', 'result']} redirectTo="/">
            <WenzhouSimPage />
          </FlowGuard>
        }
      />
      <Route
        path="/wenzhou-budget"
        element={
          <FlowGuard allow={['wenzhou-budget', 'wenzhou-sim']} redirectTo="/">
            <WenzhouBudgetPage />
          </FlowGuard>
        }
      />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
