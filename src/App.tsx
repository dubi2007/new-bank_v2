import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './hooks/useAuth'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import { Toast } from 'primereact/toast'

// Componente para rutas protegidas
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth()
  return user ? <>{children}</> : <Navigate to="/login" replace />
}

// Componente para rutas públicas (redirige al dashboard si ya está autenticado)
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth()
  return !user ? <>{children}</> : <Navigate to="/dashboard" replace />
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="w-full min-h-screen">
          <Toast />
          <Routes>
            {/* Rutas públicas */}
            <Route 
              path="/login" 
              element={
                <PublicRoute>
                  <LoginPage />
                </PublicRoute>
              } 
            />
            <Route 
              path="/register" 
              element={
                <PublicRoute>
                  <RegisterPage />
                </PublicRoute>
              } 
            />
            
            {/* Rutas protegidas */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              } 
            />
            
            {/* Ruta por defecto */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App
