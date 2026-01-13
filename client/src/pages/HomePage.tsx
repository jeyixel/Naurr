import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../components/AuthProvider'
import { FiX } from 'react-icons/fi'
import FriendsList from '../components/friendList'
import type { FriendListFriend } from '../components/friendList'
import naurlogo from '../assets/naurrlogohorizontal.png'
import '../styles/HomePage.css'

export default function HomePage() {
  const { user, logout, setUser } = useAuth()
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [isFriendPopupOpen, setIsFriendPopupOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [isAddFriendOpen, setIsAddFriendOpen] = useState(false)
  const [friendCodeInput, setFriendCodeInput] = useState('')
  const [friendFeedback, setFriendFeedback] = useState<string | null>(null)
  const [friendSubmitting, setFriendSubmitting] = useState(false)
  const [activeFriend, setActiveFriend] = useState<FriendListFriend | null>(null)

  const [copied, setCopied] = useState(false)
  const copyResetRef = useRef<number | null>(null)
  const profilePopupRef = useRef<HTMLDivElement | null>(null)

  // get the username first, if not available, use firstName, then email
  const displayName = user?.username || user?.firstName || user?.email
  const fullName = user?.firstName || displayName || '—'
  const isFriendCodeReady = Boolean(user?.friendCode)

  // this is for the add friend popup
  useEffect(() => {
    if (!isFriendPopupOpen) return
    // close when user hits esc
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsFriendPopupOpen(false)
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [isFriendPopupOpen])

  // Close add-friend dialog on Escape
  useEffect(() => {
    if (!isAddFriendOpen) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsAddFriendOpen(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [isAddFriendOpen])

  // Reset copied state when friend code changes
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

  // Close profile popover on outside click or Escape
  useEffect(() => {
    if (!isProfileOpen) return

    const handleOutsideClick = (e: MouseEvent) => {
      if (profilePopupRef.current && !profilePopupRef.current.contains(e.target as Node)) {
        setIsProfileOpen(false)
      }
    }

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsProfileOpen(false)
    }

    document.addEventListener('mousedown', handleOutsideClick)
    window.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick)
      window.removeEventListener('keydown', handleEscape)
    }
  }, [isProfileOpen])

  // Copy friend code to clipboard
  const handleCopy = async () => {
    if (!user?.friendCode) return

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(user.friendCode) // modern async clipboard API, waits till done
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

  // Regenerate friend code
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

  const handleDeleteAccount = async () => {
    if (deleting) return
    if (!confirm('This will permanently delete your account. Continue?')) return

    setDeleting(true)
    try {
      const res = await fetch('http://localhost:5000/api/auth/delete-account', {
        method: 'DELETE',
        credentials: 'include',
      })

      const data = await res.json().catch(() => null)

      if (res.ok) {
        setUser(null)
        alert(data?.message || 'Account deleted successfully')
        return
      }

      alert(data?.message || 'Failed to delete account')
    } catch (err) {
      console.error(err)
      alert('Failed to connect to server')
    } finally {
      setDeleting(false)
    }
  }

  const handleEditInfo = () => {
    alert('still under development')
  }

  const handleFriendSelect = (friend: FriendListFriend) => {
    setActiveFriend(friend)
  }

  const handleSubmitFriendCode = async () => {
    if (!friendCodeInput.trim()) {
      setFriendFeedback('Friend code is required')
      return
    }

    setFriendSubmitting(true)
    setFriendFeedback(null)
    try {
      const res = await fetch('http://localhost:5000/api/friends/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ friendCode: friendCodeInput.trim() }),
      })

      const data = await res.json().catch(() => ({}))
      const message = data?.message || (res.ok ? 'Friend added successfully!' : 'Something went wrong')
      setFriendFeedback(message)
    } catch (err) {
      console.error(err)
      setFriendFeedback('Failed to connect to server')
    } finally {
      setFriendSubmitting(false)
    }
  }

  return (
    <div className="home-container">
      <nav className="navbar">
        <div className="nav-content">
          <img src={naurlogo} alt="Naurr Logo" className="nav-logo" />
          <div className="nav-user">
            <button
              type="button"
              className="user-info"
              onClick={() => setIsProfileOpen((prev) => !prev)}
              aria-haspopup="dialog"
              aria-expanded={isProfileOpen}
            >
              {user?.profilePicture ? (
                <img src={user.profilePicture} alt="avatar" className="user-avatar" />
              ) : (
                <span className="user-avatar fallback">{displayName?.[0]?.toUpperCase() ?? '?'}</span>
              )}
              <span className="user-name">{displayName}</span>
            </button>

            {/* add friend button */}
            <button
              type="button"
              className="add-friend-button"
              onClick={() => setIsFriendPopupOpen(true)}
            >
              Get Friend Code
            </button>

            <button
              type="button"
              className="add-friend-button secondary"
              onClick={() => {
                setIsAddFriendOpen(true)
                setFriendCodeInput('')
                setFriendFeedback(null)
              }}
            >
              Add new friend
            </button>

            {isProfileOpen && (
              <div className="profile-popover" ref={profilePopupRef} role="dialog" aria-label="Profile">
                <div className="profile-header">
                  {user?.profilePicture ? (
                    <img src={user.profilePicture} alt="avatar" className="profile-avatar" />
                  ) : (
                    <span className="profile-avatar fallback">{displayName?.[0]?.toUpperCase() ?? '?'}</span>
                  )}
                  <div className="profile-text">
                    <p className="profile-username">@{user?.username ?? 'Unknown user'}</p>
                    <p className="profile-name">{fullName}</p>
                    <p className="profile-email">{user?.email ?? '—'}</p>
                  </div>
                </div>
                <div className="profile-actions">
                  <button type="button" className="profile-action primary" onClick={handleEditInfo}>
                    Edit info
                  </button>
                  <button type="button" className="profile-action" onClick={logout}>
                    Logout
                  </button>
                  <button
                    type="button"
                    className="profile-action danger"
                    onClick={handleDeleteAccount}
                    disabled={deleting}
                  >
                    {deleting ? 'Deleting…' : 'Delete account'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>

      {isFriendPopupOpen && (
        <div
          className="friend-popup-overlay"
          role="dialog"
          aria-modal="true"
          onMouseDown={() => setIsFriendPopupOpen(false)}
        >
          <div className="friend-popup" onMouseDown={(e) => e.stopPropagation()}>
            <div className="friend-code-card">
              <div className="friend-code-header">
                <div>
                  <p className="friend-code-title">Your friend code</p>
                  <p className="friend-code-subtitle">Share it so friends can add you instantly.</p>
                </div>
                <div className="friend-code-actions">
                  {copied && <span className="friend-code-toast">Copied!</span>}
                  <button
                    type="button"
                    className="friend-popup-close"
                    aria-label="Close"
                    onClick={() => setIsFriendPopupOpen(false)}
                  >
                    {/* The X in react icon package is actually called FiX */}
                    <FiX aria-hidden="true" focusable="false" />
                  </button>
                </div>
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
      )}

      {isAddFriendOpen && (
        <div className="add-friend-overlay" role="dialog" aria-modal="true">
          <div className="add-friend-modal">
            <div className="add-friend-header">
              <h3>Add a friend</h3>
              <button
                type="button"
                className="friend-popup-close"
                aria-label="Close"
                onClick={() => setIsAddFriendOpen(false)}
              >
                <FiX aria-hidden="true" focusable="false" />
              </button>
            </div>
            <p className="add-friend-subtitle">Enter their friend code to connect.</p>
            <input
              type="text"
              className="add-friend-input"
              value={friendCodeInput}
              onChange={(e) => setFriendCodeInput(e.target.value)}
              placeholder="e.g. ABCD-1234"
              autoFocus
            />
            {friendFeedback && <div className="add-friend-feedback">{friendFeedback}</div>}
            <div className="add-friend-actions">
              <button
                type="button"
                className="profile-action"
                onClick={() => setIsAddFriendOpen(false)}
                disabled={friendSubmitting}
              >
                Cancel
              </button>
              <button
                type="button"
                className="profile-action primary"
                onClick={handleSubmitFriendCode}
                disabled={friendSubmitting}
              >
                {friendSubmitting ? 'Sending…' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="home-content">
        <aside className="friends-sidebar">
          <FriendsList selectedId={activeFriend?.id} onSelect={handleFriendSelect} />
        </aside>
        <main className="home-main">
          <div className="welcome-message">
            <h2>Welcome to Naurr! 🎉</h2>
            <p>Your modern Gen Z chat experience starts here...</p>
            <p className="coming-soon">✨ More features coming soon ✨</p>
            {activeFriend && (
              <div className="active-friend-notice">
                <p>Previewing chat for {activeFriend.username}</p>
                <small>We will surface chat bubbles here soon.</small>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
