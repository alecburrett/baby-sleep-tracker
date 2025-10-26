import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

// Helper function to analyze sleep patterns
function analyzeSleepPatterns(sessions: any[], childAgeMonths: number) {
  const completedSessions = sessions.filter(s => s.end_time)

  if (completedSessions.length === 0) {
    return {
      avgSleepDuration: 0,
      totalSessions: 0,
      avgWakeWindow: 0,
      nightVsDay: { night: 0, day: 0 },
    }
  }

  // Calculate average sleep duration
  const totalMinutes = completedSessions.reduce((sum, session) => {
    const start = new Date(session.start_time)
    const end = new Date(session.end_time)
    return sum + (end.getTime() - start.getTime()) / (1000 * 60)
  }, 0)

  const avgSleepDuration = totalMinutes / completedSessions.length

  // Calculate wake windows
  const sortedSessions = [...completedSessions].sort(
    (a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
  )

  const wakeWindows: number[] = []
  for (let i = 0; i < sortedSessions.length - 1; i++) {
    const currentEnd = new Date(sortedSessions[i].end_time)
    const nextStart = new Date(sortedSessions[i + 1].start_time)
    const wakeMinutes = (nextStart.getTime() - currentEnd.getTime()) / (1000 * 60)
    wakeWindows.push(wakeMinutes)
  }

  const avgWakeWindow = wakeWindows.length > 0
    ? wakeWindows.reduce((sum, w) => sum + w, 0) / wakeWindows.length
    : 0

  // Categorize by night vs day (night = 7pm - 7am)
  const nightVsDay = completedSessions.reduce(
    (acc, session) => {
      const hour = new Date(session.start_time).getHours()
      if (hour >= 19 || hour < 7) {
        acc.night++
      } else {
        acc.day++
      }
      return acc
    },
    { night: 0, day: 0 }
  )

  return {
    avgSleepDuration,
    totalSessions: completedSessions.length,
    avgWakeWindow,
    nightVsDay,
  }
}

export async function GET(request: Request) {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's first child
    const { data: children } = await supabase
      .from('children')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)

    if (!children || children.length === 0) {
      return NextResponse.json({ error: 'No child profile found' }, { status: 404 })
    }

    const child = children[0]

    // Calculate child's age in months
    const birthDate = new Date(child.birth_date)
    const today = new Date()
    const ageInMonths = Math.floor(
      (today.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24 * 30.44)
    )

    // Get sleep sessions from the past 7 days
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)

    const { data: sleepSessions } = await supabase
      .from('sleep_sessions')
      .select('*')
      .eq('child_id', child.id)
      .gte('start_time', weekAgo.toISOString())
      .order('start_time', { ascending: false })

    if (!sleepSessions || sleepSessions.length < 3) {
      return NextResponse.json({
        message: 'Need at least 3 sleep sessions to generate insights',
        patterns: null,
        recommendations: null,
      })
    }

    // Analyze patterns
    const patterns = analyzeSleepPatterns(sleepSessions, ageInMonths)

    // Check if API key is configured
    const anthropicKey = process.env.ANTHROPIC_API_KEY

    if (!anthropicKey || anthropicKey === 'your-anthropic-api-key') {
      // Return pattern analysis without AI recommendations
      return NextResponse.json({
        patterns,
        recommendations: [
          {
            title: 'Configure AI for Personalized Insights',
            description: 'Add your Anthropic API key to .env.local to get AI-powered recommendations based on your baby\'s sleep patterns.',
            confidence: 'high',
          },
        ],
        aiEnabled: false,
      })
    }

    // Generate AI recommendations
    const anthropic = new Anthropic({
      apiKey: anthropicKey,
    })

    const prompt = `You are a pediatric sleep consultant. Analyze this baby's sleep data and provide 3-4 actionable, evidence-based recommendations.

Child Age: ${ageInMonths} months old
Sleep Data (Past 7 days):
- Average sleep duration per session: ${Math.round(patterns.avgSleepDuration)} minutes
- Total sleep sessions: ${patterns.totalSessions}
- Average wake window: ${Math.round(patterns.avgWakeWindow)} minutes
- Night sessions: ${patterns.nightVsDay.night}, Day sessions: ${patterns.nightVsDay.day}

Please provide recommendations in this exact JSON format:
[
  {
    "title": "Brief recommendation title",
    "description": "Detailed explanation and action steps",
    "confidence": "high|medium|low"
  }
]

Focus on: wake windows, nap timing, bedtime optimization, and age-appropriate sleep patterns. Be specific and actionable.`

    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    })

    // Parse AI response
    const aiText = message.content[0].type === 'text' ? message.content[0].text : ''
    let recommendations

    try {
      // Try to extract JSON from response
      const jsonMatch = aiText.match(/\[[\s\S]*\]/)
      if (jsonMatch) {
        recommendations = JSON.parse(jsonMatch[0])
      } else {
        recommendations = [
          {
            title: 'AI Analysis',
            description: aiText,
            confidence: 'medium',
          },
        ]
      }
    } catch {
      recommendations = [
        {
          title: 'AI Analysis',
          description: aiText,
          confidence: 'medium',
        },
      ]
    }

    return NextResponse.json({
      patterns,
      recommendations,
      aiEnabled: true,
    })
  } catch (error) {
    console.error('Error generating insights:', error)
    return NextResponse.json(
      { error: 'Failed to generate insights' },
      { status: 500 }
    )
  }
}
