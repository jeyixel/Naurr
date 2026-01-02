import React, { useState } from 'react'
import { useAuth } from './AuthProvider'

export default function Login() {
  const { setUser } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const res = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password }),
    })

    if (!res.ok) {
      const txt = await res.text()
      setError(txt || 'Login failed')
      return
    }

    const data = await res.json()
    setUser(data.user)
  }

  return (
    <form onSubmit={onSubmit} style={{ maxWidth: 400 }}>
      <h2>Log in</h2>
      <div>
        <label>Email</label>
        <input value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      <div>
        <label>Password</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      </div>
      <div>
        <button type="submit">Log in</button>
      </div>
      {error && <div style={{ color: 'red' }}>{error}</div>}
    </form>
  )
}
