import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://cbxzgtafuzaulxhtcnzg.supabase.co'
const supabaseAnonKey = 'sb_publishable_dsiejhppaI3hIC4MOuKVSg_uIohHvHv'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
