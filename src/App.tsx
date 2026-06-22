import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider, useAuth } from '@/context/AuthContext'
import { DataProvider } from '@/context/DataContext'
import { ThemeProvider } from '@/context/ThemeContext'
import { Layout } from '@/components/Layout'
import { Toaster } from '@/components/Toaster'
import { Login } from '@/pages/Login'
import { ExecutiveDashboard } from '@/pages/ExecutiveDashboard'
import { CommissionCalculator } from '@/pages/CommissionCalculator'
import { DealTracker } from '@/pages/DealTracker'
import { EmployeeDashboard } from '@/pages/EmployeeDashboard'
import { Leaderboard } from '@/pages/Leaderboard'
import { ClawbackDashboard } from '@/pages/ClawbackDashboard'
import { AuditReport } from '@/pages/AuditReport'
import { FileImport } from '@/pages/FileImport'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 2, staleTime: 5 * 60 * 1000 },
  },
})

function ProtectedRoutes() {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />

  return (
    <DataProvider>
      <Layout />
    </DataProvider>
  )
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route element={<ProtectedRoutes />}>
                <Route path="/" element={<ExecutiveDashboard />} />
                <Route path="/calculator" element={<CommissionCalculator />} />
                <Route path="/deals" element={<DealTracker />} />
                <Route path="/employee" element={<EmployeeDashboard />} />
                <Route path="/leaderboard" element={<Leaderboard />} />
                <Route path="/clawback" element={<ClawbackDashboard />} />
                <Route path="/audit" element={<AuditReport />} />
                <Route path="/import" element={<FileImport />} />
              </Route>
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
          <Toaster />
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  )
}
