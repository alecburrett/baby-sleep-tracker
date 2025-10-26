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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Baby Sleep Tracker</h1>
          <form action={logout}>
            <button
              type="submit"
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Sign out
            </button>
          </form>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Child Info Card */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{child.name}</h2>
              <p className="text-gray-600">{ageInMonths} months old</p>
            </div>
          </div>
        </div>

        {/* Sleep Tracking Card */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-6">
          <div className="text-center">
            {activeSleepSession ? (
              <>
                <div className="mb-4">
                  <span className="text-6xl">😴</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Sleeping</h3>
                <p className="text-gray-600 mb-1">
                  Since {formatTime(activeSleepSession.start_time)}
                </p>
                <p className="text-lg font-semibold text-indigo-600 mb-6">
                  {currentSleepDuration}
                </p>
              </>
            ) : (
              <>
                <div className="mb-4">
                  <span className="text-6xl">👶</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Awake</h3>
                <p className="text-gray-600 mb-6">Tap below to start tracking sleep</p>
              </>
            )}

            <button
              onClick={handleSleepToggle}
              disabled={loading}
              className={`w-full max-w-md py-4 px-8 rounded-lg text-xl font-semibold text-white transition-colors ${
                activeSleepSession
                  ? 'bg-green-600 hover:bg-green-700'
                  : 'bg-indigo-600 hover:bg-indigo-700'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {loading
                ? 'Processing...'
                : activeSleepSession
                ? 'Wake Up'
                : 'Start Sleep'}
            </button>
          </div>
        </div>

        {/* Today's Summary */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Today's Sleep</h3>
          <div className="text-3xl font-bold text-indigo-600 mb-4">
            {todaysSleepHours}h
          </div>

          {todaySessions.length > 0 && (
            <div className="space-y-2">
              {todaySessions.map((session) => (
                <div
                  key={session.id}
                  className="flex justify-between items-center py-2 border-t"
                >
                  <div>
                    <span className="text-gray-700">
                      {formatTime(session.start_time)}
                      {session.end_time && ` - ${formatTime(session.end_time)}`}
                    </span>
                  </div>
                  <div className="text-gray-600">
                    {session.end_time
                      ? formatDuration(session.start_time, session.end_time)
                      : 'In progress'}
                  </div>
                </div>
              ))}
            </div>
          )}

          {todaySessions.length === 0 && (
            <p className="text-gray-500 text-sm">No sleep sessions recorded yet today</p>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => router.push('/dashboard/history')}
            className="bg-white rounded-lg shadow-md p-6 text-left hover:shadow-lg transition-shadow"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              📊 View History
            </h3>
            <p className="text-gray-600 text-sm">See past sleep patterns and trends</p>
          </button>

          <button
            onClick={() => router.push('/dashboard/insights')}
            className="bg-white rounded-lg shadow-md p-6 text-left hover:shadow-lg transition-shadow"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              💡 AI Insights
            </h3>
            <p className="text-gray-600 text-sm">Get personalized recommendations</p>
          </button>
        </div>
      </main>
    </div>
  )
}
