import React, { useState } from 'react'
import { useAuth } from './AuthProvider'

export default function Signup() {
  const { setUser } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [username, setUsername] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const form = new FormData()
    form.append('email', email)
    form.append('password', password)
    form.append('firstName', firstName)
    form.append('lastName', lastName)
    form.append('username', username)
    if (file) form.append('profile-image', file)

    const res = await fetch('http://localhost:5000/api/auth/signup', {
      method: 'POST',
      body: form,
      credentials: 'include',
    })

    if (!res.ok) {
      const txt = await res.text()
      setError(txt || 'Signup failed')
      return
    }

    const data = await res.json()
    setUser(data.user)
  }

  return (
    <form onSubmit={onSubmit} style={{ maxWidth: 400 }}>
      <h2>Sign up</h2>
      <div>
        <label>Email</label>
        <input value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      <div>
        <label>Password</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      </div>
      <div>
        <label>First name</label>
        <input value={firstName} onChange={(e) => setFirstName(e.target.value)} />
      </div>
      <div>
        <label>Last name</label>
        <input value={lastName} onChange={(e) => setLastName(e.target.value)} />
      </div>
      <div>
        <label>Username</label>
        <input value={username} onChange={(e) => setUsername(e.target.value)} />
      </div>
      <div>
        <label>Profile image</label>
        <input type="file" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
      </div>
      <div>
        <button type="submit">Sign up</button>
      </div>
      {error && <div style={{ color: 'red' }}>{error}</div>}
    </form>
  )
}
