'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface Recommendation {
  title: string
  description: string
  confidence: string
}

interface InsightsData {
  patterns: {
    avgSleepDuration: number
    totalSessions: number
    avgWakeWindow: number
    nightVsDay: { night: number; day: number }
  } | null
  recommendations: Recommendation[] | null
  aiEnabled: boolean
  message?: string
}

export default function InsightsPage() {
  const [loading, setLoading] = useState(true)
  const [insights, setInsights] = useState<InsightsData | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchInsights() {
      try {
        const response = await fetch('/api/insights')
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to fetch insights')
        }
        const data = await response.json()
        setInsights(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong')
      } finally {
        setLoading(false)
      }
    }

    fetchInsights()
  }, [])

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = Math.round(minutes % 60)
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-purple-100">
        <div className="max-w-4xl mx-auto px-6 py-5 flex items-center gap-4">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 px-4 py-2 rounded-full text-purple-600 hover:bg-purple-100 transition-colors font-medium"
          >
            <span>←</span>
            <span>Back</span>
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center">
              <span className="text-xl">💡</span>
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              AI Insights
            </h1>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        {loading && (
          <div className="bg-white rounded-3xl shadow-sm border border-purple-100 p-12 text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-200 border-t-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium">Analyzing sleep patterns...</p>
          </div>
        )}

        {error && (
          <div className="bg-white rounded-3xl shadow-sm border-2 border-red-200 p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <span className="text-2xl">⚠️</span>
              </div>
              <h3 className="text-red-800 font-bold text-lg">Error</h3>
            </div>
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {!loading && insights && insights.message && (
          <div className="bg-white rounded-3xl shadow-sm border-2 border-yellow-200 p-6 mb-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center">
                <span className="text-2xl">📊</span>
              </div>
              <h3 className="text-yellow-800 font-bold text-lg">Not Enough Data</h3>
            </div>
            <p className="text-yellow-700 mb-2">{insights.message}</p>
            <p className="text-yellow-600 text-sm">
              Keep tracking sleep sessions to unlock personalized insights!
            </p>
          </div>
        )}

        {!loading && insights && insights.patterns && (
          <>
            {/* Sleep Patterns Summary */}
            <div className="bg-white rounded-3xl shadow-sm border border-purple-100 p-6 mb-6">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-cyan-400 flex items-center justify-center">
                  <span className="text-xl">📈</span>
                </div>
                <h2 className="text-xl font-bold text-gray-800">
                  Sleep Patterns (Past 7 Days)
                </h2>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200">
                  <div className="text-3xl font-bold text-purple-600 mb-1">
                    {insights.patterns.totalSessions}
                  </div>
                  <div className="text-sm text-gray-700 font-medium">Total Sessions</div>
                </div>

                <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200">
                  <div className="text-3xl font-bold text-blue-600 mb-1">
                    {formatDuration(insights.patterns.avgSleepDuration)}
                  </div>
                  <div className="text-sm text-gray-700 font-medium">Avg Duration</div>
                </div>

                <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-pink-50 to-pink-100 border border-pink-200">
                  <div className="text-3xl font-bold text-pink-600 mb-1">
                    {formatDuration(insights.patterns.avgWakeWindow)}
                  </div>
                  <div className="text-sm text-gray-700 font-medium">Avg Wake Window</div>
                </div>

                <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-green-50 to-green-100 border border-green-200">
                  <div className="text-3xl font-bold text-green-600 mb-1">
                    {insights.patterns.nightVsDay.night}/{insights.patterns.nightVsDay.day}
                  </div>
                  <div className="text-sm text-gray-700 font-medium">Night/Day</div>
                </div>
              </div>
            </div>

            {/* AI Recommendations */}
            {insights.recommendations && insights.recommendations.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center">
                      <span className="text-lg">✨</span>
                    </div>
                    <h2 className="text-xl font-bold text-gray-800">
                      Personalized Tips
                    </h2>
                  </div>
                  {insights.aiEnabled && (
                    <span className="px-3 py-1 rounded-full bg-purple-100 text-purple-600 text-sm font-semibold">
                      AI-Powered
                    </span>
                  )}
                </div>

                {insights.recommendations.map((rec, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-3xl shadow-sm border-l-4 border-purple-400 p-6"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-lg font-bold text-gray-800 flex-1">
                        {rec.title}
                      </h3>
                      <span
                        className={`text-xs px-3 py-1 rounded-full font-semibold ml-3 ${
                          rec.confidence === 'high'
                            ? 'bg-green-100 text-green-700'
                            : rec.confidence === 'medium'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {rec.confidence}
                      </span>
                    </div>
                    <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                      {rec.description}
                    </p>
                  </div>
                ))}

                {!insights.aiEnabled && (
                  <div className="bg-white rounded-3xl shadow-sm border-2 border-blue-200 p-6 mt-6">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                        <span className="text-2xl">🚀</span>
                      </div>
                      <h3 className="text-blue-800 font-bold text-lg">
                        Unlock AI-Powered Insights
                      </h3>
                    </div>
                    <p className="text-blue-700 mb-4">
                      Get personalized, evidence-based recommendations by adding your
                      Anthropic API key to the <code className="bg-blue-100 px-2 py-1 rounded">ANTHROPIC_API_KEY</code> environment variable.
                    </p>
                    <a
                      href="https://console.anthropic.com/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block px-6 py-3 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold hover:from-blue-600 hover:to-cyan-600 transition-all"
                    >
                      Get API Key →
                    </a>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}
