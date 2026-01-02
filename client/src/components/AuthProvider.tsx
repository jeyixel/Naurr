import React, { createContext, useContext, useEffect, useState } from 'react'

type User = { id: string; email: string; firstName?: string; profilePicture?: string } | null

type AuthContextType = {
  user: User
  setUser: (u: User) => void
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User>(null)

  // Check session on mount
  useEffect(() => {
    fetch('http://localhost:5000/api/auth/me', { credentials: 'include' })
      .then(async (res) => {
        if (!res.ok) return setUser(null)
        const data = await res.json()
        setUser(data.user)
      })
      .catch(() => setUser(null))
  }, [])

  const logout = async () => {
    await fetch('http://localhost:5000/api/auth/logout', { method: 'POST', credentials: 'include' })
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, setUser, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthProvider
