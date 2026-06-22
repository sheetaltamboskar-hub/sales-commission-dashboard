import { useEffect } from 'react'
import { BarChart3, Shield, TrendingUp, DollarSign } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/context/AuthContext'
import { useNavigate } from 'react-router-dom'

export function Login() {
  const { user, signIn, isLoading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (user) navigate('/')
  }, [user, navigate])

  const features = [
    { icon: TrendingUp, title: 'Real-time Achievement Tracking', desc: 'Monitor quota attainment across quarters instantly' },
    { icon: DollarSign, title: 'Automated Commission Calculation', desc: 'Cliff, kicker, milestone and dual credit logic built-in' },
    { icon: BarChart3, title: 'Executive Analytics', desc: 'Region and team performance dashboards' },
    { icon: Shield, title: 'Audit Trail', desc: 'Full deal-wise and employee-wise commission audit reports' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0F4C81] to-[#1a6cb5] flex items-center justify-center p-6">
      <div className="max-w-4xl w-full grid md:grid-cols-2 gap-8 items-center">
        {/* Left */}
        <div className="text-white space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center">
              <span className="text-[#0F4C81] font-bold text-xl">SC</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold">Sales Commission</h1>
              <p className="text-blue-200 text-sm">Management Dashboard</p>
            </div>
          </div>

          <div className="space-y-4">
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex gap-3">
                <div className="w-9 h-9 bg-white/10 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                  <Icon className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="font-medium">{title}</p>
                  <p className="text-blue-200 text-sm">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-2xl">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Welcome back</h2>
          <p className="text-gray-500 text-sm mb-8">Sign in to access your commission dashboard</p>

          <Button
            onClick={signIn}
            disabled={isLoading}
            className="w-full flex items-center gap-3 h-12"
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
            ) : (
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            )}
            {isLoading ? 'Signing in…' : 'Sign in with Google'}
          </Button>

          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-xs text-blue-700 dark:text-blue-300 font-medium">Demo Mode</p>
            <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
              No Google credentials configured — clicking above loads demo data automatically.
            </p>
          </div>

          <p className="text-xs text-gray-400 text-center mt-6">
            By signing in you agree to the company's data usage policies.
          </p>
        </div>
      </div>
    </div>
  )
}
