import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../components/AuthProvider'
import '../styles/AuthPages.css'

export default function SignupPage() {
  const { setUser } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [username, setUsername] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const parseError = async (res: Response) => {
    const contentType = res.headers.get('content-type')
    if (contentType?.includes('application/json')) {
      try {
        const data = await res.json()
        if (data?.message) return data.message as string
      } catch (_) {
        // fall back to text
      }
    }
    const txt = await res.text()
    return txt || 'Signup failed'
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const form = new FormData()
    form.append('email', email)
    form.append('password', password)
    form.append('firstName', firstName)
    form.append('lastName', lastName)
    form.append('username', username)
    if (file) form.append('profile-image', file)

    try {
      const res = await fetch('http://localhost:5000/api/auth/signup', {
        method: 'POST',
        body: form,
        credentials: 'include',
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
      <div className="auth-box signup-box">
        <div className="auth-header">
          <h1 className="auth-logo">💬 Naurr</h1>
          <h2 className="auth-title">Create an account</h2>
        </div>

        <form onSubmit={onSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">EMAIL *</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
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
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">PASSWORD *</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="firstName">FIRST NAME</label>
              <input
                id="firstName"
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="lastName">LAST NAME</label>
              <input
                id="lastName"
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="profile-image">PROFILE PICTURE</label>
            <input
              id="profile-image"
              type="file"
              accept="image/*"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              disabled={loading}
              className="file-input"
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>

          <div className="auth-footer">
            <Link to="/login" className="auth-link">Already have an account?</Link>
          </div>
        </form>
      </div>
    </div>
  )
}
