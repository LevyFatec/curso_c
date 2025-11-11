import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';


const SUPABASE_URL = process.env.SUPABASE_URL || 'https://hlrewmxnzldqzpahmzgt.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhscmV3bXhuemxkcXpwYWhtemd0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIzODQwMjMsImV4cCI6MjA3Nzk2MDAyM30.CxSkMw-j9SiCSkclQF0xT_E_jPtycWMw3otPEVyY5q0';


const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export default supabase;