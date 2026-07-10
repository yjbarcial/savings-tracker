export interface Deposit {
  id: string;
  goal_id: string;
  amount: number;
  deposited_at: string;
  note: string | null;
  created_at: string;
}

export interface NewDepositInput {
  goal_id: string;
  amount: number;
  deposited_at: string;
  note?: string;
}

export function useDeposits() {
  // See the same note in useGoals.ts — typed as `any` until real database
  // types are generated.
  const supabase = useSupabaseClient<any>();

  async function listDeposits(goalId: string): Promise<Deposit[]> {
    const { data, error } = await supabase
      .from("deposits")
      .select("*")
      .eq("goal_id", goalId)
      .order("deposited_at", { ascending: false });

    if (error) throw error;
    return data as Deposit[];
  }

  async function addDeposit(input: NewDepositInput) {
    const { data, error } = await supabase
      .from("deposits")
      .insert(input)
      .select()
      .single();

    if (error) throw error;
    return data as Deposit;
  }

  async function deleteDeposit(id: string) {
    const { error } = await supabase.from("deposits").delete().eq("id", id);
    if (error) throw error;
  }

  return { listDeposits, addDeposit, deleteDeposit };
}
