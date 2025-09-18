// utils/supabase-server-writable.ts
// Route-handlers/actions stub — matches the same "no session" contract.
export const supabaseServerWritable = () => {
  return {
    auth: {
      getSession: async () => ({ data: { session: null }, error: null }),
    },
    from: (_table: string) => ({
      select: () => ({ data: null, error: null }),
      eq: () => ({ data: null, error: null }),
      single: () => ({ data: null, error: null }),
      upsert: () => ({ data: null, error: null }),
    }),
  }
}
