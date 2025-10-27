'use client'

import { useRouter } from 'next/navigation'
import { Database } from '@/lib/types/database'

type SleepSession = Database['public']['Tables']['sleep_sessions']['Row']
type Child = Database['public']['Tables']['children']['Row']

interface InsightsWidgetProps {
  child: Child
  todaySessions: SleepSession[]
  recentSessions: SleepSession[]
}

export default function InsightsWidget({ child, todaySessions, recentSessions }: InsightsWidgetProps) {
  const router = useRouter()

  // Calculate insights
  const getTopInsight = () => {
    const completedToday = todaySessions.filter(s => s.end_time)

    if (completedToday.length === 0) {
      return {
        icon: '📊',
        title: 'Start tracking to get insights',
        description: 'Log sleep sessions to receive personalized recommendations',
        confidence: 'info' as const
      }
    }

    // Calculate today's total sleep
    const todaysSleepMinutes = completedToday.reduce((total, session) => {
      const start = new Date(session.start_time)
      const end = new Date(session.end_time!)
      return total + (end.getTime() - start.getTime()) / (1000 * 60)
    }, 0)

    // Calculate average from recent week
    const lastWeekCompleted = recentSessions.filter(s => s.end_time).slice(0, 30)
    const avgSleepMinutes = lastWeekCompleted.length > 0
      ? lastWeekCompleted.reduce((total, session) => {
          const start = new Date(session.start_time)
          const end = new Date(session.end_time!)
          return total + (end.getTime() - start.getTime()) / (1000 * 60)
        }, 0) / Math.max(1, lastWeekCompleted.length / 4) // Approximate days
      : 0

    const difference = todaysSleepMinutes - avgSleepMinutes

    if (Math.abs(difference) < 30) {
      return {
        icon: '✨',
        title: 'Consistent sleep pattern',
        description: `Today's sleep is on track with your ${Math.floor(avgSleepMinutes / 60)}h daily average`,
        confidence: 'high' as const
      }
    } else if (difference > 60) {
      return {
        icon: '🎉',
        title: 'Great sleep day!',
        description: `${Math.floor(difference / 60)}h ${Math.round(difference % 60)}m more sleep than average`,
        confidence: 'high' as const
      }
    } else if (difference < -60) {
      return {
        icon: '⚠️',
        title: 'Below average sleep',
        description: `Consider an extra nap if baby seems tired`,
        confidence: 'medium' as const
      }
    }

    // Check consistency
    if (completedToday.length >= 3) {
      return {
        icon: '⭐',
        title: `${completedToday.length} sessions logged today`,
        description: 'Regular tracking helps identify patterns',
        confidence: 'high' as const
      }
    }

    return {
      icon: '💡',
      title: 'Keep tracking',
      description: 'More data helps provide better insights',
      confidence: 'info' as const
    }
  }

  const insight = getTopInsight()

  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case 'high':
        return 'bg-green-100 text-green-700'
      case 'medium':
        return 'bg-yellow-100 text-yellow-700'
      default:
        return 'bg-blue-100 text-blue-700'
    }
  }

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-purple-100 p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center">
            <span className="text-lg">💡</span>
          </div>
          <h3 className="text-lg font-bold text-gray-800">Today's Insight</h3>
        </div>
        {insight.confidence !== 'info' && (
          <span className={`text-xs px-3 py-1 rounded-full font-semibold ${getConfidenceColor(insight.confidence)}`}>
            {insight.confidence}
          </span>
        )}
      </div>

      <div className="flex items-start gap-4 mb-4">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center flex-shrink-0">
          <span className="text-2xl">{insight.icon}</span>
        </div>
        <div className="flex-1">
          <h4 className="font-bold text-gray-800 mb-1">{insight.title}</h4>
          <p className="text-sm text-gray-600">{insight.description}</p>
        </div>
      </div>

      <button
        onClick={() => router.push('/dashboard/insights')}
        className="w-full py-3 px-4 rounded-full bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-100 text-purple-600 font-semibold hover:from-purple-100 hover:to-pink-100 transition-all"
      >
        View All Insights →
      </button>
    </div>
  )
}
