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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-purple-100">
        <div className="max-w-4xl mx-auto px-6 py-5 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center">
              <span className="text-xl">✨</span>
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Sleep Tracker
            </h1>
          </div>
          <form action={logout}>
            <button
              type="submit"
              className="px-4 py-2 rounded-full text-sm font-medium text-purple-600 hover:bg-purple-100 transition-colors"
            >
              Sign out
            </button>
          </form>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-8">
        {/* Child Profile Card */}
        <div className="bg-white rounded-3xl shadow-sm border border-purple-100 p-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-200 via-purple-200 to-pink-200 flex items-center justify-center border-4 border-white shadow-lg">
              <span className="text-4xl">👶</span>
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-800">{child.name}</h2>
              <p className="text-purple-600 font-medium">{ageInMonths} months old</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-purple-600">{todaysSleepHours}h</div>
              <p className="text-xs text-gray-500">today</p>
            </div>
          </div>
        </div>

        {/* Sleep Status Card */}
        <div className={`rounded-3xl shadow-lg p-8 mb-6 border-4 ${
          activeSleepSession
            ? 'bg-gradient-to-br from-blue-100 to-blue-200 border-blue-300'
            : 'bg-gradient-to-br from-purple-100 to-pink-100 border-purple-300'
        }`}>
          <div className="text-center">
            <div className="mb-4">
              <span className="text-7xl drop-shadow-lg">
                {activeSleepSession ? '😴' : '🌟'}
              </span>
            </div>

            {activeSleepSession ? (
              <>
                <h3 className="text-3xl font-bold text-blue-900 mb-2">Sleeping...</h3>
                <p className="text-blue-700 mb-1">Since {formatTime(activeSleepSession.start_time)}</p>
                <div className="inline-block bg-white/80 backdrop-blur-sm rounded-full px-6 py-2 mb-6">
                  <p className="text-2xl font-bold text-blue-600">{currentSleepDuration}</p>
                </div>
              </>
            ) : (
              <>
                <h3 className="text-3xl font-bold text-purple-900 mb-2">Awake & Happy</h3>
                <p className="text-purple-700 mb-6">Ready to track the next sleep</p>
              </>
            )}

            <button
              onClick={handleSleepToggle}
              disabled={loading}
              className={`w-full py-5 px-8 rounded-full text-xl font-bold text-white shadow-xl transition-all transform hover:scale-105 active:scale-95 ${
                activeSleepSession
                  ? 'bg-gradient-to-r from-green-400 to-emerald-500 hover:from-green-500 hover:to-emerald-600'
                  : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600'
              } disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none`}
            >
              {loading
                ? '⏳ Processing...'
                : activeSleepSession
                ? '✓ Wake Up'
                : '+ Start Sleep'}
            </button>
          </div>
        </div>

        {/* Today's Sessions */}
        {todaySessions.length > 0 && (
          <div className="bg-white rounded-3xl shadow-sm border border-purple-100 p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                <span className="text-lg">📋</span>
              </div>
              <h3 className="text-lg font-bold text-gray-800">Today's Sessions</h3>
            </div>

            <div className="space-y-3">
              {todaySessions.map((session, idx) => (
                <div
                  key={session.id}
                  className="flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-100"
                >
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    session.end_time
                      ? 'bg-gradient-to-br from-blue-400 to-blue-500'
                      : 'bg-gradient-to-br from-orange-400 to-orange-500'
                  }`}>
                    <span className="text-xl">{session.end_time ? '✓' : '⏱️'}</span>
                  </div>

                  <div className="flex-1">
                    <p className="font-semibold text-gray-800">
                      {session.end_time
                        ? formatDuration(session.start_time, session.end_time)
                        : 'In progress'}
                    </p>
                    <p className="text-sm text-gray-600">
                      {formatTime(session.start_time)}
                      {session.end_time && ` - ${formatTime(session.end_time)}`}
                    </p>
                  </div>

                  <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center">
                    <span className="text-lg">⭐</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {todaySessions.length === 0 && !activeSleepSession && (
          <div className="bg-white rounded-3xl shadow-sm border border-purple-100 p-8 mb-6 text-center">
            <span className="text-5xl mb-4 block">🌙</span>
            <p className="text-gray-500">No sleep sessions yet today</p>
            <p className="text-sm text-gray-400 mt-1">Tap the button above to start tracking</p>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => router.push('/dashboard/history')}
            className="bg-white rounded-3xl shadow-sm border border-purple-100 p-6 text-center hover:shadow-md hover:border-purple-200 transition-all"
          >
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-400 to-cyan-400 flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl">📊</span>
            </div>
            <h3 className="font-bold text-gray-800 mb-1">History</h3>
            <p className="text-xs text-gray-500">View patterns</p>
          </button>

          <button
            onClick={() => router.push('/dashboard/insights')}
            className="bg-white rounded-3xl shadow-sm border border-purple-100 p-6 text-center hover:shadow-md hover:border-purple-200 transition-all"
          >
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl">💡</span>
            </div>
            <h3 className="font-bold text-gray-800 mb-1">AI Insights</h3>
            <p className="text-xs text-gray-500">Get tips</p>
          </button>
        </div>
      </main>
    </div>
  )
}
