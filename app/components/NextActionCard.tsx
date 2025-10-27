'use client'

import { Database } from '@/lib/types/database'

type SleepSession = Database['public']['Tables']['sleep_sessions']['Row']

interface NextActionCardProps {
  recentSessions: SleepSession[]
  activeSleepSession: SleepSession | null
  childAgeInMonths: number
}

export default function NextActionCard({ recentSessions, activeSleepSession, childAgeInMonths }: NextActionCardProps) {
  // Calculate average wake window from recent completed sessions
  const calculateAverageWakeWindow = () => {
    const completedSessions = recentSessions
      .filter(session => session.end_time)
      .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())

    if (completedSessions.length < 2) return null

    const wakeWindows: number[] = []
    for (let i = 0; i < completedSessions.length - 1; i++) {
      const currentEnd = new Date(completedSessions[i].end_time!)
      const nextStart = new Date(completedSessions[i + 1].start_time)
      const wakeMinutes = (nextStart.getTime() - currentEnd.getTime()) / (1000 * 60)
      if (wakeMinutes > 0 && wakeMinutes < 300) { // Filter out unrealistic values
        wakeWindows.push(wakeMinutes)
      }
    }

    if (wakeWindows.length === 0) return null
    return wakeWindows.reduce((sum, w) => sum + w, 0) / wakeWindows.length
  }

  // Get recommended wake window based on age
  const getRecommendedWakeWindow = () => {
    if (childAgeInMonths <= 1) return 45 // 45 minutes for newborns
    if (childAgeInMonths <= 3) return 75 // 1h 15m for 2-3 months
    if (childAgeInMonths <= 6) return 105 // 1h 45m for 4-6 months
    if (childAgeInMonths <= 9) return 150 // 2h 30m for 7-9 months
    return 180 // 3h for 10+ months
  }

  const avgWakeWindow = calculateAverageWakeWindow()
  const recommendedWakeWindow = getRecommendedWakeWindow()
  const wakeWindowToUse = avgWakeWindow || recommendedWakeWindow

  // Calculate next action
  const getNextAction = () => {
    if (activeSleepSession) {
      const startTime = new Date(activeSleepSession.start_time)
      const avgSleepDuration = calculateAverageSleepDuration()
      if (avgSleepDuration) {
        const predictedWakeTime = new Date(startTime.getTime() + avgSleepDuration * 60 * 1000)
        const minutesUntilWake = Math.floor((predictedWakeTime.getTime() - Date.now()) / (1000 * 60))

        if (minutesUntilWake > 0) {
          return {
            icon: '😴',
            title: 'Baby is sleeping',
            description: `Usually wakes in about ${minutesUntilWake}m`,
            color: 'from-blue-100 to-cyan-100',
            borderColor: 'border-blue-200'
          }
        }
      }
      return {
        icon: '😴',
        title: 'Baby is sleeping',
        description: 'Sleep session in progress',
        color: 'from-blue-100 to-cyan-100',
        borderColor: 'border-blue-200'
      }
    }

    // If awake, predict next nap
    const lastSession = recentSessions.find(s => s.end_time)
    if (lastSession && lastSession.end_time) {
      const lastWakeTime = new Date(lastSession.end_time)
      const minutesAwake = Math.floor((Date.now() - lastWakeTime.getTime()) / (1000 * 60))
      const minutesUntilNextNap = Math.max(0, wakeWindowToUse - minutesAwake)

      if (minutesUntilNextNap <= 0) {
        return {
          icon: '🌙',
          title: 'Time for a nap!',
          description: `Awake for ${Math.floor(minutesAwake / 60)}h ${minutesAwake % 60}m`,
          color: 'from-purple-100 to-pink-100',
          borderColor: 'border-purple-200'
        }
      } else if (minutesUntilNextNap <= 15) {
        return {
          icon: '⏰',
          title: 'Nap time soon',
          description: `In about ${minutesUntilNextNap}m based on wake window`,
          color: 'from-orange-100 to-yellow-100',
          borderColor: 'border-orange-200'
        }
      } else {
        const hours = Math.floor(minutesUntilNextNap / 60)
        const mins = minutesUntilNextNap % 60
        return {
          icon: '👁️',
          title: 'Awake and active',
          description: `Next nap in ${hours > 0 ? `${hours}h ` : ''}${mins}m`,
          color: 'from-green-100 to-emerald-100',
          borderColor: 'border-green-200'
        }
      }
    }

    return {
      icon: '🌟',
      title: 'Ready to track',
      description: 'Start tracking your baby\'s sleep',
      color: 'from-purple-100 to-pink-100',
      borderColor: 'border-purple-200'
    }
  }

  const calculateAverageSleepDuration = () => {
    const completedSessions = recentSessions
      .filter(s => s.end_time)
      .slice(0, 10) // Last 10 sessions

    if (completedSessions.length === 0) return null

    const durations = completedSessions.map(s => {
      const start = new Date(s.start_time)
      const end = new Date(s.end_time!)
      return (end.getTime() - start.getTime()) / (1000 * 60)
    })

    return durations.reduce((sum, d) => sum + d, 0) / durations.length
  }

  const action = getNextAction()

  return (
    <div className={`rounded-3xl shadow-sm border-2 ${action.borderColor} bg-gradient-to-r ${action.color} p-6 mb-6`}>
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center flex-shrink-0 shadow-md">
          <span className="text-4xl">{action.icon}</span>
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-800 mb-1">{action.title}</h3>
          <p className="text-gray-700">{action.description}</p>
        </div>
      </div>
    </div>
  )
}
