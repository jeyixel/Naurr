import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './components/AuthProvider'
import Loading from './components/Loading'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import HomePage from './pages/HomePage'
import CookieConsent from './components/CookieConsent'
import './App.css'

// Protected route wrapper
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  
  // `undefined` = still restoring session
  if (user === undefined) return <Loading />

  if (user === null) return <Navigate to="/login" replace />

  return <>{children}</>
}

// Public route wrapper (redirect to home if already logged in)
function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  
  if (user === undefined) return <Loading />

  if (user) return <Navigate to="/home" replace />

  return <>{children}</>
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route
            path="/login"
            element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            }
          />
          <Route
            path="/signup"
            element={
              <PublicRoute>
                <SignupPage />
              </PublicRoute>
            }
          />
          <Route
            path="/home"
            element={
              <ProtectedRoute>
                <HomePage />
              </ProtectedRoute>
            }
          />
        </Routes>
        <CookieConsent />
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
