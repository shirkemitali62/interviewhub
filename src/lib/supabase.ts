import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://gksyevvumkoywgrdtpcj.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_yf8zDObr-vcHTleTnvd46A_ARPNqSHG'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)