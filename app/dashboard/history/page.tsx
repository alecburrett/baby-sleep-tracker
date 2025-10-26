import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import HistoryClient from './HistoryClient'

export default async function HistoryPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get user's first child
  const { data: children } = await supabase
    .from('children')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1)

  if (!children || children.length === 0) {
    redirect('/dashboard/setup')
  }

  const child = children[0]

  // Get all sleep sessions for the past 14 days
  const twoWeeksAgo = new Date()
  twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14)

  const { data: sleepSessions } = await supabase
    .from('sleep_sessions')
    .select('*')
    .eq('child_id', child.id)
    .gte('start_time', twoWeeksAgo.toISOString())
    .order('start_time', { ascending: false })

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
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Sleep History</h1>

        <HistoryClient
          child={child}
          sleepSessions={sleepSessions || []}
        />
      </main>
    </div>
  )
}
