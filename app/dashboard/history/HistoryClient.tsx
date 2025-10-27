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
      <div className="bg-white rounded-3xl shadow-sm border border-purple-100 p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-cyan-400 flex items-center justify-center">
            <span className="text-xl">📊</span>
          </div>
          <h2 className="text-xl font-bold text-gray-800">
            Sleep Duration - Last 7 Days
          </h2>
        </div>

        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E9D5FF" />
              <XAxis dataKey="date" style={{ fontSize: '12px', fill: '#6B7280' }} />
              <YAxis
                label={{ value: 'Hours', angle: -90, position: 'insideLeft', style: { fill: '#6B7280' } }}
                style={{ fontSize: '12px', fill: '#6B7280' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '2px solid #E9D5FF',
                  borderRadius: '16px',
                  padding: '8px 12px'
                }}
              />
              <Bar
                dataKey="hours"
                fill="url(#colorGradient)"
                radius={[16, 16, 0, 0]}
              />
              <defs>
                <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#A78BFA" />
                  <stop offset="100%" stopColor="#EC4899" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="text-center py-12">
            <span className="text-5xl mb-3 block">📈</span>
            <p className="text-gray-500">No sleep data available yet</p>
            <p className="text-sm text-gray-400 mt-1">Start tracking to see trends!</p>
          </div>
        )}
      </div>

      {/* Wake Windows */}
      <div className="bg-white rounded-3xl shadow-sm border border-purple-100 p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-pink-400 flex items-center justify-center">
            <span className="text-xl">⏰</span>
          </div>
          <h2 className="text-xl font-bold text-gray-800">Wake Windows</h2>
        </div>

        <div className="mb-6 p-6 rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-100">
          <div className="text-4xl font-bold text-purple-600 mb-1">
            {formatWakeWindow(averageWakeWindow)}
          </div>
          <p className="text-gray-600 text-sm font-medium">Average wake window</p>
        </div>

        {wakeWindows.length > 0 && (
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {wakeWindows.slice(-10).reverse().map((window, index) => (
              <div
                key={index}
                className="flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-100"
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center flex-shrink-0">
                  <span className="text-lg">👁️</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-600">
                    {formatTime(window.start)} → {formatTime(window.end)}
                  </p>
                </div>
                <div className="font-bold text-blue-600">
                  {formatWakeWindow(window.duration)}
                </div>
              </div>
            ))}
          </div>
        )}

        {wakeWindows.length === 0 && (
          <div className="text-center py-8">
            <span className="text-4xl mb-3 block">🌅</span>
            <p className="text-gray-500 text-sm">
              Track at least 2 sleep sessions to see wake windows
            </p>
          </div>
        )}
      </div>

      {/* All Sleep Sessions */}
      <div className="bg-white rounded-3xl shadow-sm border border-purple-100 p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center">
            <span className="text-xl">📋</span>
          </div>
          <h2 className="text-xl font-bold text-gray-800">All Sleep Sessions</h2>
        </div>

        {sleepSessions.length > 0 ? (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {sleepSessions.map((session) => (
              <div
                key={session.id}
                className="flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-100"
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-500 flex items-center justify-center flex-shrink-0">
                  <span className="text-xl">
                    {session.sleep_type === 'night' ? '🌙' : '☀️'}
                  </span>
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-gray-800">
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
                  <div className="font-bold text-purple-600">
                    {session.end_time
                      ? formatDuration(session.start_time, session.end_time)
                      : 'In progress'}
                  </div>
                  {session.sleep_type && (
                    <div className="text-xs text-gray-500 capitalize mt-1">
                      {session.sleep_type}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <span className="text-5xl mb-3 block">😴</span>
            <p className="text-gray-500">No sleep sessions recorded yet</p>
            <p className="text-sm text-gray-400 mt-1">Start tracking to see your history</p>
          </div>
        )}
      </div>
    </div>
  )
}
