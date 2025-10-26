'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { logout } from '@/app/actions/auth'
import { Database } from '@/lib/types/database'

type Child = Database['public']['Tables']['children']['Row']
type SleepSession = Database['public']['Tables']['sleep_sessions']['Row']
type User = { id: string; email?: string }

interface Props {
  user: User
  child: Child
  todaySessions: SleepSession[]
  activeSleepSession: SleepSession | null
  recentSessions: SleepSession[]
}

export default function DashboardClient({
  user,
  child,
  todaySessions,
  activeSleepSession: initialActiveSleepSession,
  recentSessions,
}: Props) {
  const router = useRouter()
  const [activeSleepSession, setActiveSleepSession] = useState(initialActiveSleepSession)
  const [loading, setLoading] = useState(false)

  // Calculate child's age in months
  const birthDate = new Date(child.birth_date)
  const today = new Date()
  const ageInMonths = Math.floor(
    (today.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24 * 30.44)
  )

  // Calculate today's total sleep time
  const todaysSleepMinutes = todaySessions
    .filter(session => session.end_time)
    .reduce((total, session) => {
      const start = new Date(session.start_time)
      const end = new Date(session.end_time!)
      return total + (end.getTime() - start.getTime()) / (1000 * 60)
    }, 0)

  const todaysSleepHours = (todaysSleepMinutes / 60).toFixed(1)

  // Calculate current sleep duration if sleeping
  const [currentSleepDuration, setCurrentSleepDuration] = useState('')

  // Update current sleep duration every minute
  useEffect(() => {
    if (!activeSleepSession) {
      setCurrentSleepDuration('')
      return
    }

    const startTime = new Date(activeSleepSession.start_time)

    const updateDuration = () => {
      const now = new Date()
      const durationMinutes = Math.floor((now.getTime() - startTime.getTime()) / (1000 * 60))
      const hours = Math.floor(durationMinutes / 60)
      const mins = durationMinutes % 60
      setCurrentSleepDuration(hours > 0 ? `${hours}h ${mins}m` : `${mins}m`)
    }

    // Update immediately
    updateDuration()

    // Update every minute
    const interval = setInterval(updateDuration, 60000)

    // Cleanup on unmount or when activeSleepSession changes
    return () => clearInterval(interval)
  }, [activeSleepSession])

  const handleSleepToggle = async () => {
    setLoading(true)
    try {
      if (activeSleepSession) {
        // End sleep session
        const response = await fetch('/api/sleep/end', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId: activeSleepSession.id }),
        })

        if (response.ok) {
          setActiveSleepSession(null)
          router.refresh()
        }
      } else {
        // Start new sleep session
        const response = await fetch('/api/sleep/start', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ childId: child.id }),
        })

        if (response.ok) {
          const data = await response.json()
          setActiveSleepSession(data.session)
          router.refresh()
        }
      }
    } catch (error) {
      console.error('Error toggling sleep:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
  }

  const formatDuration = (start: string, end: string) => {
    const startTime = new Date(start)
    const endTime = new Date(end)
    const durationMinutes = Math.floor((endTime.getTime() - startTime.getTime()) / (1000 * 60))
    const hours = Math.floor(durationMinutes / 60)
    const mins = durationMinutes % 60
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-6 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/dashboard/insights')}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Settings"
            >
              <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
            <form action={logout}>
              <button
                type="submit"
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Logout"
              >
                <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Profile Section with Circular Progress */}
        <div className="flex items-center gap-6 mb-8">
          {/* Circular Progress Ring */}
          <div className="relative">
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
              <div className="w-28 h-28 rounded-full bg-white flex items-center justify-center">
                <span className="text-5xl">👶</span>
              </div>
            </div>
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-2 bg-purple-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
              {todaysSleepHours}h today
            </div>
          </div>

          {/* Child Info */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{child.name}, {ageInMonths}mo</h2>
            <div className="flex items-center gap-2 mt-2 text-gray-600">
              <span className="inline-block w-2 h-2 bg-green-500 rounded-full"></span>
              <span className="text-sm">Tracking active</span>
            </div>
          </div>
        </div>

        {/* Status Card */}
        <div className="bg-gray-50 rounded-2xl p-6 mb-6 border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center">
              <span className="text-3xl">{activeSleepSession ? '😴' : '👁️'}</span>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-900 mb-1">
                {activeSleepSession ? 'Currently Sleeping' : 'Currently Awake'}
              </h3>
              <p className="text-sm text-gray-600">
                {activeSleepSession
                  ? `Since ${formatTime(activeSleepSession.start_time)} • ${currentSleepDuration}`
                  : 'Ready to track next sleep session'}
              </p>
            </div>
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>

        {/* Main Action Button */}
        <button
          onClick={handleSleepToggle}
          disabled={loading}
          className={`w-full py-5 px-8 rounded-full text-lg font-semibold text-white transition-all transform active:scale-95 mb-8 ${
            activeSleepSession
              ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 shadow-lg shadow-green-500/30'
              : 'bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 shadow-lg shadow-purple-500/30'
          } disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none`}
        >
          {loading
            ? 'Processing...'
            : activeSleepSession
            ? '✓ End Sleep Session'
            : '+ Start Sleep Session'}
        </button>

        {/* Stats Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4 border-b border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 pb-3 border-b-2 border-purple-600">Today</h3>
            <button className="text-sm font-semibold text-gray-400 pb-3">This Week</button>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            {/* Total Sleep */}
            <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Total Sleep</p>
                  <p className="text-xl font-bold text-gray-900">{todaysSleepHours}h</p>
                </div>
              </div>
            </div>

            {/* Sessions */}
            <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
                  <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Sessions</p>
                  <p className="text-xl font-bold text-gray-900">{todaySessions.length}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Sessions List */}
          {todaySessions.length > 0 && (
            <div className="space-y-2">
              {todaySessions.slice(0, 3).map((session) => (
                <div
                  key={session.id}
                  className="bg-white rounded-xl p-4 border border-gray-100 flex justify-between items-center"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                      <span className="text-lg">💤</span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        {session.end_time
                          ? formatDuration(session.start_time, session.end_time)
                          : 'In progress'}
                      </p>
                      <p className="text-xs text-gray-600">
                        {formatTime(session.start_time)}
                        {session.end_time && ` - ${formatTime(session.end_time)}`}
                      </p>
                    </div>
                  </div>
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Premium-style CTA Card */}
        <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-3xl p-6 text-white mb-8 shadow-xl">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <span className="text-xl">✨</span>
            </div>
            <h3 className="text-xl font-bold">AI Sleep Insights</h3>
          </div>
          <p className="text-white/90 mb-4 text-sm leading-relaxed">
            Get personalized recommendations and track sleep patterns with AI-powered analysis.
          </p>
          <button
            onClick={() => router.push('/dashboard/insights')}
            className="w-full bg-white text-purple-600 py-3 px-6 rounded-full font-semibold hover:bg-gray-50 transition-colors"
          >
            View Insights
          </button>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => router.push('/dashboard/history')}
            className="bg-white rounded-2xl p-5 border border-gray-100 text-center hover:border-purple-200 transition-colors"
          >
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <p className="text-sm font-semibold text-gray-900">History</p>
            <p className="text-xs text-gray-500 mt-1">View trends</p>
          </button>

          <button
            onClick={() => router.push('/dashboard/insights')}
            className="bg-white rounded-2xl p-5 border border-gray-100 text-center hover:border-purple-200 transition-colors"
          >
            <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <p className="text-sm font-semibold text-gray-900">Insights</p>
            <p className="text-xs text-gray-500 mt-1">AI analysis</p>
          </button>
        </div>
      </main>
    </div>
  )
}
