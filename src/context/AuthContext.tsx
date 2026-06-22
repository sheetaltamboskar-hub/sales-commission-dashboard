import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'
import type { AppUser } from '@/types'

interface AuthContextValue {
  user: AppUser | null
  token: string | null
  isLoading: boolean
  signIn: () => void
  signOut: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

const DEMO_USER: AppUser = {
  id: 'demo-admin',
  name: 'Admin User',
  email: 'admin@company.com',
  picture: '',
  role: 'admin',
  employeeId: 'E001',
}

declare global {
  interface Window {
    google?: {
      accounts: {
        oauth2: {
          initTokenClient: (config: {
            client_id: string
            scope: string
            callback: (response: { access_token?: string; error?: string }) => void
          }) => { requestAccessToken: () => void }
        }
        id: {
          initialize: (config: {
            client_id: string
            callback: (response: { credential: string }) => void
          }) => void
          renderButton: (element: HTMLElement, config: object) => void
          prompt: () => void
        }
      }
    }
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Auto-login with demo user when no Google client id is configured
  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID
    if (!clientId || clientId === 'your_google_client_id_here') {
      setUser(DEMO_USER)
    }
  }, [])

  const signIn = useCallback(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID
    if (!clientId || clientId === 'your_google_client_id_here') {
      setUser(DEMO_USER)
      return
    }

    setIsLoading(true)
    const client = window.google?.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: 'https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email',
      callback: (response) => {
        if (response.access_token) {
          setToken(response.access_token)
          fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: { Authorization: `Bearer ${response.access_token}` },
          })
            .then(r => r.json())
            .then(info => {
              setUser({
                id: info.sub,
                name: info.name,
                email: info.email,
                picture: info.picture,
                role: 'admin',
              })
            })
            .finally(() => setIsLoading(false))
        } else {
          setIsLoading(false)
        }
      },
    })
    client?.requestAccessToken()
  }, [])

  const signOut = useCallback(() => {
    setUser(null)
    setToken(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, token, isLoading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
