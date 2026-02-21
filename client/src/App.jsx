import { Routes, Route, Navigate } from 'react-router-dom'
import LandingPage from './components/LandingPage'
import { Login, Register, VerifyEmail, Dashboard, ForgotPassword, ResetPassword, CreatePost } from './pages'

// Protected Route Component
function ProtectedRoute({ children }) {
  const token = localStorage.getItem('accessToken')
  if (!token) {
    return <Navigate to="/login" replace />
  }
  return children
}

// Public Route (redirect if logged in)
function PublicRoute({ children }) {
  const token = localStorage.getItem('accessToken')
  const user = JSON.parse(localStorage.getItem('user') || '{}')

  if (token && user.isVerified) {
    return <Navigate to="/dashboard" replace />
  }
  return children
}

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        }
      />
      <Route path="/verify-email" element={<VerifyEmail />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* Protected Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/create-post"
        element={
          <ProtectedRoute>
            <CreatePost />
          </ProtectedRoute>
        }
      />

      {/* Catch all - redirect to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
