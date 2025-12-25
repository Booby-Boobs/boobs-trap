import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface LeaderboardEntry {
  id?: string;
  name: string;
  time: number;
  created_at?: string;
  rank?: number;
}

export async function saveScore(name: string, time: number): Promise<LeaderboardEntry | null> {
  try {
    const { data, error } = await supabase
      .from('leaderboard')
      .insert([{ name, time }])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error saving score:', error);
    return null;
  }
}

export async function getLeaderboard(limit: number = 10): Promise<LeaderboardEntry[]> {
  try {
    const { data, error } = await supabase
      .from('leaderboard')
      .select('*')
      .order('time', { ascending: true })
      .limit(limit);

    if (error) throw error;
    
    // Add rank numbers
    return (data || []).map((entry, index) => ({
      ...entry,
      rank: index + 1
    }));
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return [];
  }
}


