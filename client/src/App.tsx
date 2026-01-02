import React from 'react'
import './App.css'
import { AuthProvider, useAuth } from './components/AuthProvider'
import Signup from './components/Signup'
import Login from './components/Login'

function Home() {
  const { user, logout } = useAuth()
  if (!user)
    return (
      <div style={{ display: 'flex', gap: 20 }}>
        <Signup />
        <Login />
      </div>
    )

  return (
    <div>
      <h2>Welcome, {user.firstName || user.email}</h2>
      {user.profilePicture && <img src={user.profilePicture} alt="avatar" width={80} />}
      <div>
        <button onClick={logout}>Logout</button>
      </div>
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <div style={{ padding: 20 }}>
        <h1>Auth Demo</h1>
        <Home />
      </div>
    </AuthProvider>
  )
}

export default App
