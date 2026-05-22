import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://vcqyalevkieegxooddod.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZjcXlhbGV2a2llZWd4b29kZG9kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ4ODIwNzAsImV4cCI6MjA5MDQ1ODA3MH0.iXSZiTCJ84knZQ42Crr_u8x_q9wm92HV8a70xeF-3t4'
)

export default supabase