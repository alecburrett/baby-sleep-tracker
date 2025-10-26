import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { sessionId } = body

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 })
    }

    // Get the session and verify it belongs to the user's child
    const { data: session } = await supabase
      .from('sleep_sessions')
      .select('*, children!inner(user_id)')
      .eq('id', sessionId)
      .single()

    if (!session || session.children.user_id !== user.id) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    if (session.end_time) {
      return NextResponse.json(
        { error: 'This session has already ended' },
        { status: 400 }
      )
    }

    // Update the session with end time
    const { data: updatedSession, error } = await supabase
      .from('sleep_sessions')
      .update({ end_time: new Date().toISOString() })
      .eq('id', sessionId)
      .select()
      .single()

    if (error) {
      console.error('Error ending sleep session:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ session: updatedSession })
  } catch (error) {
    console.error('Error in end sleep API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
