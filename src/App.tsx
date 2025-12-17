import { Routes, Route, Navigate } from 'react-router-dom'
import { MainLayout } from '@/components/MainLayout'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import Login from '@/pages/Login'
import Signup from '@/pages/Signup'
import Dashboard from '@/pages/Dashboard'
import Transactions from '@/pages/Transactions'
import Categories from '@/pages/Categories'
import Reminders from '@/pages/Reminders'
import History from '@/pages/History'
import Budgets from '@/pages/Budgets'
import Settings from '@/pages/Settings'

function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      {/* Protected routes with layout */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <MainLayout>
              <Navigate to="/dashboard" replace />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <MainLayout>
              <Dashboard />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/transactions"
        element={
          <ProtectedRoute>
            <MainLayout>
              <Transactions />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/categories"
        element={
          <ProtectedRoute>
            <MainLayout>
              <Categories />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/reminders"
        element={
          <ProtectedRoute>
            <MainLayout>
              <Reminders />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/history"
        element={
          <ProtectedRoute>
            <MainLayout>
              <History />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/budgets"
        element={
          <ProtectedRoute>
            <MainLayout>
              <Budgets />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <MainLayout>
              <Settings />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

export default App
