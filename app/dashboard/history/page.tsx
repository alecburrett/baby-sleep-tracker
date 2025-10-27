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
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-cyan-400 flex items-center justify-center">
              <span className="text-xl">📊</span>
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Sleep History
            </h1>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        <HistoryClient
          child={child}
          sleepSessions={sleepSessions || []}
        />
      </main>
    </div>
  )
}
