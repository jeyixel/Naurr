import React, { useEffect, useRef, useState } from 'react'
import { useAuth } from '../components/AuthProvider'
import naurlogo from '../assets/naurrlgo2.jpg'
import '../styles/HomePage.css'

export default function HomePage() {
  const { user, logout, setUser } = useAuth()
  const [loading, setLoading] = useState(false)

  const [copied, setCopied] = useState(false)
  const copyResetRef = useRef<number | null>(null)

  const displayName = user?.firstName || user?.username || user?.email
  const isFriendCodeReady = Boolean(user?.friendCode)

  useEffect(() => {
    setCopied(false)
    if (copyResetRef.current) {
      window.clearTimeout(copyResetRef.current)
      copyResetRef.current = null
    }
  }, [user?.friendCode])

  useEffect(() => {
    return () => {
      if (copyResetRef.current) {
        window.clearTimeout(copyResetRef.current)
      }
    }
  }, [])

  const handleCopy = async () => {
    if (!user?.friendCode) return

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(user.friendCode)
      } else {
        // Fallback prompt for older browsers
        window.prompt('Copy your friend code', user.friendCode)
      }

      setCopied(true)
      if (copyResetRef.current) window.clearTimeout(copyResetRef.current)
      copyResetRef.current = window.setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy friend code', err)
      setCopied(false)
    }
  }

  // New regenerate code handler (not yet wired up)
  const handleRegenerateCode = async () => {
    if (!confirm("Are you sure? Your old code will stop working.")) return;
    
    setLoading(true);
    
    try {
      // 2. Call the backend
      const res = await fetch('http://localhost:5000/api/auth/regenerate-code', {
        method: 'PUT', // or POST, depending on your route
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // Important for cookies!
      });

      const data = await res.json();

      if (res.ok && user) {
        // 3. Update the UI instantly
        setUser({ ...user, friendCode: data.newFriendCode });
        alert("Code updated!");
      } else {
        alert(data.message || "Error updating code");
      }

    } catch (err) {
      console.error(err);
      alert("Failed to connect to server");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="home-container">
      <nav className="navbar">
        <div className="nav-content">
          <img src={naurlogo} alt="Naurr Logo" className="nav-logo" />
          <div className="nav-user">
            <div className="user-info">
              {user?.profilePicture && (
                <img src={user.profilePicture} alt="avatar" className="user-avatar" />
              )}
              <span className="user-name">{displayName}</span>
            </div>
            <button onClick={logout} className="logout-button">
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="home-content">
        <div className="home-grid">
          <div className="welcome-message">
            <h2>Welcome to Naurr! 🎉</h2>
            <p>Your modern Gen Z chat experience starts here...</p>
            <p className="coming-soon">✨ More features coming soon ✨</p>
          </div>

          <div className="friend-code-card">
            <div className="friend-code-header">
              <div>
                <p className="friend-code-title">Your friend code</p>
                <p className="friend-code-subtitle">Share it so friends can add you instantly.</p>
              </div>
              {copied && <span className="friend-code-toast">Copied!</span>}
            </div>

            <div className="friend-code-display">
              <span className={`friend-code-value ${isFriendCodeReady ? '' : 'pending'}`}>
                {user?.friendCode ?? 'Generating...'}
              </span>
              <button
                type="button"
                className="copy-code-button"
                onClick={handleCopy}
                disabled={!isFriendCodeReady}
              >
                {isFriendCodeReady ? (copied ? 'Copied' : 'Copy code') : 'Please wait'}
              </button>
              <button
                type="button"
                className="regenerate-code-button"
                onClick={handleRegenerateCode}
                disabled={loading || !isFriendCodeReady}
              >
                {loading ? 'Regenerating…' : 'Regenerate code'}
              </button>
            </div>

            <p className="friend-code-hint">
              {isFriendCodeReady
                ? 'Anyone with this code can send you a friend request.'
                : 'Codes are generated the first time you sign in.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
