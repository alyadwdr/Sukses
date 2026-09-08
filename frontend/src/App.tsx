import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from '@/context/ThemeContext'
import { BusinessFilterProvider } from '@/context/BusinessFilterContext'
import { AuthProvider } from '@/context/AuthContext'
import ProtectedRoute from '@/components/ProtectedRoute/ProtectedRoute'
import MainLayout from '@/layouts/MainLayout'
import Login from '@/pages/Login/Login'
import Dashboard from '@/pages/Dashboard/Dashboard'
import Transactions from '@/pages/Transactions/Transactions'
import Products from '@/pages/Products/Products'
import Inventory from '@/pages/Inventory/Inventory'
import Expenses from '@/pages/Expenses/Expenses'
import Income from '@/pages/Income/Income'
import Reports from '@/pages/Reports/Reports'
import Notifications from '@/pages/Notifications/Notifications'
import Settings from '@/pages/Settings/Settings'

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <BusinessFilterProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route
                element={
                  <ProtectedRoute>
                    <MainLayout />
                  </ProtectedRoute>
                }
              >
                <Route path="/" element={<Dashboard />} />
                <Route path="/transactions" element={<Transactions />} />
                <Route path="/products" element={<Products />} />
                <Route path="/inventory" element={<Inventory />} />
                <Route path="/expenses" element={<Expenses />} />
                <Route path="/income" element={<Income />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/notifications" element={<Notifications />} />
                <Route path="/settings" element={<Settings />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </BusinessFilterProvider>
      </ThemeProvider>
    </AuthProvider>
  )
}