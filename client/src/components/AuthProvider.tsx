import React, { createContext, useContext, useEffect, useState } from 'react'

/**
 * AuthProvider
 *
 * This file creates a React Context that centralizes authentication state
 * and helper functions for the app. Wrap your app with `AuthProvider`
 * so any component can read the current `user`, update it via `setUser`,
 * or call `logout()` to end the session.
 */

// Define the shape of the authenticated user object used in the app.
// The user can be `null` when not authenticated.
type User = {
  _id: string
  email: string
  username?: string
  firstName?: string
  profilePicture?: string
  friendCode?: string
} | null

// Define what the Auth context exposes to consumers.
// - `user`: current user or `null`
// - `setUser`: allows components to update the user state (e.g., after login)
// - `logout`: helper that calls the server and clears the local user
type AuthContextType = {
  // `user` can be:
  // - `undefined` while the provider is restoring session (loading)
  // - `null` when there's no authenticated user
  // - user object when authenticated
  user: User | undefined
  setUser: (u: User | undefined) => void
  logout: () => Promise<void>
}

// Create the context. We initialize with `undefined` so that `useAuth`
// can detect if it's being used outside of a provider and throw a helpful error.
const AuthContext = createContext<AuthContextType | undefined>(undefined)

/**
 * useAuth
 * Convenience hook for consuming the auth context. Throws if used
 * outside of an `AuthProvider` to fail fast and make debugging easier.
 */
export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

/**
 * AuthProvider component
 * Wraps the app and provides `user`, `setUser` and `logout`.
 * The implementation intentionally keeps the authentication logic
 * simple: it restores a session on mount and exposes a logout helper.
 */
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // start as `undefined` to indicate we haven't finished restoring session
  const [user, setUser] = useState<User | undefined>(undefined)

  // On mount, attempt to restore an existing session by calling the
  // backend endpoint `/api/auth/me`. `credentials: 'include'` ensures
  // cookies (e.g., session cookies) are sent with the request.
  // If the response is OK we set the returned `user`; otherwise we
  // leave `user` as null. Network errors also result in `user = null`.
  useEffect(() => {
    fetch('http://localhost:5000/api/auth/me', { credentials: 'include' })
      .then(async (res) => {
        if (!res.ok) return setUser(null)
        const data = await res.json()
        setUser(data.user ?? null)
      })
      .catch(() => setUser(null))
  }, [])

  // logout helper: POST to the server logout endpoint to clear server-side
  // session/cookies, then clear the local `user` state so the UI updates.
  // Returning a Promise gives consumers the option to await logout if needed.
  const logout = async () => {
    await fetch('http://localhost:5000/api/auth/logout', { method: 'POST', credentials: 'include' })
    setUser(null)
  }

  // Provide the auth state and helpers to children components.
  // Note: `setUser` is intentionally included so components (like a login
  // form) can directly update the context after a successful auth request.
  return (
    <AuthContext.Provider value={{ user, setUser, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthProvider
