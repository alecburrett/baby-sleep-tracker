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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link
            href="/dashboard"
            className="text-indigo-600 hover:text-indigo-800 font-medium"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">AI Insights</h1>

        {loading && (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Analyzing sleep patterns...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h3 className="text-red-800 font-semibold mb-2">Error</h3>
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {!loading && insights && insights.message && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
            <h3 className="text-yellow-800 font-semibold mb-2">Not Enough Data</h3>
            <p className="text-yellow-700">{insights.message}</p>
            <p className="text-yellow-600 text-sm mt-2">
              Keep tracking sleep sessions to unlock personalized insights!
            </p>
          </div>
        )}

        {!loading && insights && insights.patterns && (
          <>
            {/* Sleep Patterns Summary */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Sleep Patterns (Past 7 Days)
              </h2>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-indigo-50 rounded-lg">
                  <div className="text-2xl font-bold text-indigo-600">
                    {insights.patterns.totalSessions}
                  </div>
                  <div className="text-sm text-gray-600">Total Sessions</div>
                </div>

                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {formatDuration(insights.patterns.avgSleepDuration)}
                  </div>
                  <div className="text-sm text-gray-600">Avg Sleep Duration</div>
                </div>

                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {formatDuration(insights.patterns.avgWakeWindow)}
                  </div>
                  <div className="text-sm text-gray-600">Avg Wake Window</div>
                </div>

                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {insights.patterns.nightVsDay.night}/{insights.patterns.nightVsDay.day}
                  </div>
                  <div className="text-sm text-gray-600">Night/Day Split</div>
                </div>
              </div>
            </div>

            {/* AI Recommendations */}
            {insights.recommendations && insights.recommendations.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Personalized Recommendations
                  </h2>
                  {insights.aiEnabled && (
                    <span className="text-sm text-indigo-600 font-medium">
                      ✨ AI-Powered
                    </span>
                  )}
                </div>

                {insights.recommendations.map((rec, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-lg shadow-md p-6 border-l-4 border-indigo-600"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {rec.title}
                      </h3>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          rec.confidence === 'high'
                            ? 'bg-green-100 text-green-800'
                            : rec.confidence === 'medium'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {rec.confidence} confidence
                      </span>
                    </div>
                    <p className="text-gray-700 whitespace-pre-line">
                      {rec.description}
                    </p>
                  </div>
                ))}

                {!insights.aiEnabled && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-4">
                    <h3 className="text-blue-800 font-semibold mb-2">
                      💡 Unlock AI-Powered Insights
                    </h3>
                    <p className="text-blue-700 mb-4">
                      Get personalized, evidence-based recommendations by adding your
                      Anthropic API key to the <code className="bg-blue-100 px-2 py-1 rounded">.env.local</code> file.
                    </p>
                    <p className="text-blue-600 text-sm">
                      Visit{' '}
                      <a
                        href="https://console.anthropic.com/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline hover:text-blue-800"
                      >
                        console.anthropic.com
                      </a>{' '}
                      to get your API key.
                    </p>
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
