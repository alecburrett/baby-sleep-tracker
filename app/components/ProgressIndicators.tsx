'use client'

import { Database } from '@/lib/types/database'

type SleepSession = Database['public']['Tables']['sleep_sessions']['Row']

interface ProgressIndicatorsProps {
  todaySessions: SleepSession[]
  yesterdaySessions: SleepSession[]
  childAgeInMonths: number
}

export default function ProgressIndicators({ todaySessions, yesterdaySessions, childAgeInMonths }: ProgressIndicatorsProps) {
  // Calculate today's total sleep
  const todaysSleepMinutes = todaySessions
    .filter(session => session.end_time)
    .reduce((total, session) => {
      const start = new Date(session.start_time)
      const end = new Date(session.end_time!)
      return total + (end.getTime() - start.getTime()) / (1000 * 60)
    }, 0)

  const todaysSleepHours = todaysSleepMinutes / 60

  // Calculate yesterday's total sleep
  const yesterdaysSleepMinutes = yesterdaySessions
    .filter(session => session.end_time)
    .reduce((total, session) => {
      const start = new Date(session.start_time)
      const end = new Date(session.end_time!)
      return total + (end.getTime() - start.getTime()) / (1000 * 60)
    }, 0)

  const yesterdaysSleepHours = yesterdaysSleepMinutes / 60

  // Get recommended sleep based on age
  const getRecommendedSleep = () => {
    if (childAgeInMonths <= 1) return 16 // 14-17 hours for newborns
    if (childAgeInMonths <= 3) return 15 // 14-17 hours for 1-3 months
    if (childAgeInMonths <= 6) return 14 // 12-16 hours for 4-6 months
    if (childAgeInMonths <= 12) return 13 // 12-15 hours for 6-12 months
    return 12 // 11-14 hours for 12+ months
  }

  const recommendedSleep = getRecommendedSleep()
  const progressPercentage = Math.min(100, Math.round((todaysSleepHours / recommendedSleep) * 100))

  // Calculate trend
  const trend = todaysSleepHours - yesterdaysSleepHours
  const trendPercentage = yesterdaysSleepHours > 0
    ? Math.round((trend / yesterdaysSleepHours) * 100)
    : 0

  const getTrendIcon = () => {
    if (trend > 0.5) return '↑'
    if (trend < -0.5) return '↓'
    return '→'
  }

  const getTrendColor = () => {
    if (trend > 0.5) return 'text-green-600'
    if (trend < -0.5) return 'text-orange-600'
    return 'text-gray-600'
  }

  return (
    <div className="grid grid-cols-2 gap-4 mb-6">
      {/* Sleep Goal Progress */}
      <div className="bg-white rounded-3xl shadow-sm border border-purple-100 p-5">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
            <span className="text-lg">🎯</span>
          </div>
          <h4 className="text-sm font-bold text-gray-700">Today's Goal</h4>
        </div>

        {/* Circular Progress */}
        <div className="relative w-20 h-20 mx-auto mb-2">
          <svg className="transform -rotate-90" viewBox="0 0 36 36">
            {/* Background circle */}
            <path
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="#E9D5FF"
              strokeWidth="3"
            />
            {/* Progress circle */}
            <path
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="url(#progressGradient)"
              strokeWidth="3"
              strokeDasharray={`${progressPercentage}, 100`}
              strokeLinecap="round"
            />
            <defs>
              <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#A78BFA" />
                <stop offset="100%" stopColor="#EC4899" />
              </linearGradient>
            </defs>
          </svg>
          {/* Percentage text */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-lg font-bold text-purple-600">{progressPercentage}%</span>
          </div>
        </div>

        <p className="text-center text-xs text-gray-600">
          {todaysSleepHours.toFixed(1)}h / {recommendedSleep}h
        </p>
      </div>

      {/* Trend Comparison */}
      <div className="bg-white rounded-3xl shadow-sm border border-purple-100 p-5">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
            <span className="text-lg">📈</span>
          </div>
          <h4 className="text-sm font-bold text-gray-700">vs Yesterday</h4>
        </div>

        <div className="text-center">
          <div className={`text-3xl font-bold ${getTrendColor()} mb-1`}>
            {getTrendIcon()} {Math.abs(trend).toFixed(1)}h
          </div>
          <p className="text-xs text-gray-600">
            {trend > 0.1 ? 'More sleep' : trend < -0.1 ? 'Less sleep' : 'Same as yesterday'}
          </p>
          {trendPercentage !== 0 && yesterdaysSleepHours > 0 && (
            <p className={`text-xs font-semibold mt-1 ${getTrendColor()}`}>
              {trend > 0 ? '+' : ''}{trendPercentage}%
            </p>
          )}
        </div>
      </div>

      {/* Sessions Count */}
      <div className="bg-white rounded-3xl shadow-sm border border-purple-100 p-5">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center">
            <span className="text-lg">⭐</span>
          </div>
          <h4 className="text-sm font-bold text-gray-700">Sessions</h4>
        </div>

        <div className="text-center">
          <div className="text-3xl font-bold text-yellow-600 mb-1">
            {todaySessions.length}
          </div>
          <p className="text-xs text-gray-600">
            {todaySessions.length === 0 ? 'None yet' : todaySessions.length === 1 ? 'Good start!' : 'Well tracked!'}
          </p>
        </div>
      </div>

      {/* Streak (placeholder for future) */}
      <div className="bg-white rounded-3xl shadow-sm border border-purple-100 p-5">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
            <span className="text-lg">🔥</span>
          </div>
          <h4 className="text-sm font-bold text-gray-700">Tracking</h4>
        </div>

        <div className="text-center">
          <div className="text-3xl font-bold text-green-600 mb-1">
            {todaySessions.length > 0 ? '✓' : '○'}
          </div>
          <p className="text-xs text-gray-600">
            {todaySessions.length > 0 ? 'Logged today' : 'Start tracking'}
          </p>
        </div>
      </div>
    </div>
  )
}
