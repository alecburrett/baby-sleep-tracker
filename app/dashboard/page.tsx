import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import DashboardClient from './DashboardClient'

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get user's children
  const { data: children } = await supabase
    .from('children')
    .select('*')
    .order('created_at', { ascending: false })

  // If no child exists, redirect to setup
  if (!children || children.length === 0) {
    redirect('/dashboard/setup')
  }

  // Get the first child (for MVP, we'll use a single child)
  const child = children[0]

  // Get today's sleep sessions
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const { data: sleepSessions } = await supabase
    .from('sleep_sessions')
    .select('*')
    .eq('child_id', child.id)
    .gte('start_time', today.toISOString())
    .order('start_time', { ascending: false })

  // Get active sleep session (one without end_time)
  const activeSleepSession = sleepSessions?.find(session => !session.end_time) || null

  // Get yesterday's sleep sessions for comparison
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  yesterday.setHours(0, 0, 0, 0)
  const yesterdayEnd = new Date(yesterday)
  yesterdayEnd.setHours(23, 59, 59, 999)

  const { data: yesterdaySessions } = await supabase
    .from('sleep_sessions')
    .select('*')
    .eq('child_id', child.id)
    .gte('start_time', yesterday.toISOString())
    .lt('start_time', yesterdayEnd.toISOString())
    .order('start_time', { ascending: false })

  // Get all sleep sessions for the past 7 days for patterns
  const weekAgo = new Date()
  weekAgo.setDate(weekAgo.getDate() - 7)

  const { data: recentSessions } = await supabase
    .from('sleep_sessions')
    .select('*')
    .eq('child_id', child.id)
    .gte('start_time', weekAgo.toISOString())
    .order('start_time', { ascending: false })

  return (
    <DashboardClient
      user={user}
      child={child}
      todaySessions={sleepSessions || []}
      yesterdaySessions={yesterdaySessions || []}
      activeSleepSession={activeSleepSession}
      recentSessions={recentSessions || []}
    />
  )
}
