import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../components/AuthProvider'
import logo from '../assets/naurrlgo2.jpg'
import '../styles/AuthPages.css'

export default function LoginPage() {
  const { setUser } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const parseError = async (res: Response) => {
    const contentType = res.headers.get('content-type')
    if (contentType?.includes('application/json')) {
      try {
        const data = await res.json()
        if (data?.message) return data.message as string
      } catch (_) {
        // fallback to text
      }
    }
    const txt = await res.text()
    return txt || 'Login failed'
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const res = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, username, password }),
      })

      if (!res.ok) {
        const parsed = await parseError(res)
        setError(parsed)
        setLoading(false)
        return
      }

      const data = await res.json()
      setUser(data.user)
      navigate('/home')
    } catch (err) {
      setError('Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-box">
        <div className="auth-header">
          <img src={logo} alt="Naurr Logo" className="auth-logo" />
          <h2 className="auth-title">Welcome back!</h2>
          <p className="auth-subtitle">We're so excited to see you again!</p>
        </div>

        <form onSubmit={onSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">EMAIL</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="username">USERNAME</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoComplete="username"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">PASSWORD</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              disabled={loading}
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? 'Logging in...' : 'Log In'}
          </button>

          <div className="auth-footer">
            <span>Don't have an account? </span>
            <Link to="/signup" className="auth-link">Sign up</Link>
          </div>
        </form>
      </div>
    </div>
  )
}
