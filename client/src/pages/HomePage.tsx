import React from 'react'
import { useAuth } from '../components/AuthProvider'
import '../styles/HomePage.css'

export default function HomePage() {
  const { user, logout } = useAuth()

  return (
    <div className="home-container">
      <nav className="navbar">
        <div className="nav-content">
          <h1 className="nav-logo">💬 Naurr</h1>
          <div className="nav-user">
            <div className="user-info">
              {user?.profilePicture && (
                <img src={user.profilePicture} alt="avatar" className="user-avatar" />
              )}
              <span className="user-name">{user?.firstName || user?.email}</span>
            </div>
            <button onClick={logout} className="logout-button">
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="home-content">
        <div className="welcome-message">
          <h2>Welcome to Naurr! 🎉</h2>
          <p>Your modern Gen Z chat experience starts here...</p>
          <p className="coming-soon">✨ More features coming soon ✨</p>
        </div>
      </div>
    </div>
  )
}
