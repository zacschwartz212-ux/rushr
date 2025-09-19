import { createClient } from '@supabase/supabase-js'

// Dev-only: hardcode here so StackBlitz works instantly.
// The anon key is safe to use in the browser.
const supabaseUrl = 'https://phdeqderioqekabbawoq.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBoZGVxZGVyaW9xZWthYmJhd29xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU4MzAxMDIsImV4cCI6MjA3MTQwNjEwMn0.ndP91XGBH9-TeGkZX8MOIbVKUsXqCRqKOp_XTLNZUN0'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
