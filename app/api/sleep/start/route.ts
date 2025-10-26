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
    const { childId } = body

    if (!childId) {
      return NextResponse.json({ error: 'Child ID is required' }, { status: 400 })
    }

    // Verify the child belongs to the user
    const { data: child } = await supabase
      .from('children')
      .select('*')
      .eq('id', childId)
      .eq('user_id', user.id)
      .single()

    if (!child) {
      return NextResponse.json({ error: 'Child not found' }, { status: 404 })
    }

    // Check if there's already an active sleep session
    const { data: activeSessions } = await supabase
      .from('sleep_sessions')
      .select('*')
      .eq('child_id', childId)
      .is('end_time', null)

    if (activeSessions && activeSessions.length > 0) {
      return NextResponse.json(
        { error: 'There is already an active sleep session' },
        { status: 400 }
      )
    }

    // Create new sleep session
    const { data: session, error } = await supabase
      .from('sleep_sessions')
      .insert({
        child_id: childId,
        start_time: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating sleep session:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ session })
  } catch (error) {
    console.error('Error in start sleep API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
