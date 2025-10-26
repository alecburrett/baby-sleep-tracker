'use client'

import { Database } from '@/lib/types/database'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

type Child = Database['public']['Tables']['children']['Row']
type SleepSession = Database['public']['Tables']['sleep_sessions']['Row']

interface Props {
  child: Child
  sleepSessions: SleepSession[]
}

export default function HistoryClient({ child, sleepSessions }: Props) {
  // Group sessions by day and calculate total sleep
  const dailyData = sleepSessions.reduce((acc, session) => {
    if (!session.end_time) return acc

    const date = new Date(session.start_time).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    })

    const startTime = new Date(session.start_time)
    const endTime = new Date(session.end_time)
    const durationHours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60)

    if (!acc[date]) {
      acc[date] = { date, totalSleep: 0, sessions: [] }
    }

    acc[date].totalSleep += durationHours
    acc[date].sessions.push(session)

    return acc
  }, {} as Record<string, { date: string; totalSleep: number; sessions: SleepSession[] }>)

  const chartData = Object.values(dailyData)
    .map(day => ({
      date: day.date,
      hours: parseFloat(day.totalSleep.toFixed(1)),
    }))
    .reverse()
    .slice(-7) // Last 7 days

  // Calculate wake windows
  const completedSessions = sleepSessions
    .filter(session => session.end_time)
    .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())

  const wakeWindows: Array<{ start: string; end: string; duration: number }> = []

  for (let i = 0; i < completedSessions.length - 1; i++) {
    const currentEnd = new Date(completedSessions[i].end_time!)
    const nextStart = new Date(completedSessions[i + 1].start_time)
    const wakeMinutes = (nextStart.getTime() - currentEnd.getTime()) / (1000 * 60)

    wakeWindows.push({
      start: completedSessions[i].end_time!,
      end: completedSessions[i + 1].start_time,
      duration: wakeMinutes,
    })
  }

  const averageWakeWindow = wakeWindows.length > 0
    ? wakeWindows.reduce((sum, w) => sum + w.duration, 0) / wakeWindows.length
    : 0

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

  const formatWakeWindow = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = Math.round(minutes % 60)
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
  }

  return (
    <div className="space-y-6">
      {/* Weekly Sleep Chart */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Sleep Duration - Last 7 Days
        </h2>

        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis label={{ value: 'Hours', angle: -90, position: 'insideLeft' }} />
              <Tooltip />
              <Bar dataKey="hours" fill="#4F46E5" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-gray-500 text-center py-8">
            No sleep data available yet. Start tracking to see trends!
          </p>
        )}
      </div>

      {/* Wake Windows */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Wake Windows</h2>

        <div className="mb-4">
          <div className="text-3xl font-bold text-indigo-600">
            {formatWakeWindow(averageWakeWindow)}
          </div>
          <p className="text-gray-600 text-sm">Average wake window</p>
        </div>

        {wakeWindows.length > 0 && (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {wakeWindows.slice(-10).reverse().map((window, index) => (
              <div
                key={index}
                className="flex justify-between items-center py-2 border-t text-sm"
              >
                <span className="text-gray-700">
                  {formatTime(window.start)} → {formatTime(window.end)}
                </span>
                <span className="font-semibold text-gray-900">
                  {formatWakeWindow(window.duration)}
                </span>
              </div>
            ))}
          </div>
        )}

        {wakeWindows.length === 0 && (
          <p className="text-gray-500 text-sm">
            Track at least 2 sleep sessions to see wake windows
          </p>
        )}
      </div>

      {/* All Sleep Sessions */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">All Sleep Sessions</h2>

        {sleepSessions.length > 0 ? (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {sleepSessions.map((session) => (
              <div
                key={session.id}
                className="flex justify-between items-center py-3 border-t"
              >
                <div>
                  <div className="text-gray-700">
                    {new Date(session.start_time).toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </div>
                  <div className="text-sm text-gray-600">
                    {formatTime(session.start_time)}
                    {session.end_time && ` - ${formatTime(session.end_time)}`}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-gray-900">
                    {session.end_time
                      ? formatDuration(session.start_time, session.end_time)
                      : 'In progress'}
                  </div>
                  {session.sleep_type && (
                    <div className="text-sm text-gray-600 capitalize">
                      {session.sleep_type}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">
            No sleep sessions recorded yet
          </p>
        )}
      </div>
    </div>
  )
}
