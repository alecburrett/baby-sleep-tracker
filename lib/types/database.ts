export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      children: {
        Row: {
          id: string
          user_id: string
          name: string
          birth_date: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          birth_date: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          birth_date?: string
          created_at?: string
        }
      }
      sleep_sessions: {
        Row: {
          id: string
          child_id: string
          start_time: string
          end_time: string | null
          sleep_type: 'nap' | 'night' | null
          location: string | null
          wake_reason: string | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          child_id: string
          start_time: string
          end_time?: string | null
          sleep_type?: 'nap' | 'night' | null
          location?: string | null
          wake_reason?: string | null
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          child_id?: string
          start_time?: string
          end_time?: string | null
          sleep_type?: 'nap' | 'night' | null
          location?: string | null
          wake_reason?: string | null
          notes?: string | null
          created_at?: string
        }
      }
    }
  }
}
