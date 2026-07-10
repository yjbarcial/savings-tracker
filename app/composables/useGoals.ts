// Wraps all goal-related Supabase queries in one place.
// If the schema changes later, this is the only file that should need edits.

export interface GoalStatus {
  id: string
  user_id: string
  name: string
  target_amount: number
  bank: string
  start_month: string
  status: 'active' | 'completed' | 'archived'
  created_at: string
  amount_saved: number
  remaining: number
}

export interface NewGoalInput {
  name: string
  target_amount: number
  bank: string
  start_month: string
}

export function useGoals() {
  const supabase = useSupabaseClient()

  async function listGoals(): Promise<GoalStatus[]> {
    const { data, error } = await supabase
      .from('goal_status')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data as GoalStatus[]
  }

  async function getGoal(id: string): Promise<GoalStatus | null> {
    const { data, error } = await supabase
      .from('goal_status')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data as GoalStatus
  }

  async function createGoal(input: NewGoalInput) {
    const user = useSupabaseUser()
    const { data, error } = await supabase
      .from('goals')
      .insert({
        name: input.name,
        target_amount: input.target_amount,
        bank: input.bank,
        start_month: input.start_month,
        user_id: user.value?.id,
      })
      .select()
      .single()

    if (error) throw error
    return data
  }

  async function updateGoalStatus(id: string, status: GoalStatus['status']) {
    const { error } = await supabase.from('goals').update({ status }).eq('id', id)
    if (error) throw error
  }

  async function deleteGoal(id: string) {
    const { error } = await supabase.from('goals').delete().eq('id', id)
    if (error) throw error
  }

  return { listGoals, getGoal, createGoal, updateGoalStatus, deleteGoal }
}
