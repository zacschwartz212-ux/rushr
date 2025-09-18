// utils/supabase-server.ts
// Server stub: no cookies, no DB. Always "no session".
export const supabaseServer = () => {
  return {
    auth: {
      getSession: async () => ({ data: { session: null }, error: null }),
    },
    from: (_table: string) => ({
      select: () => ({ data: null, error: null }),
      eq: () => ({ data: null, error: null }),
      single: () => ({ data: null, error: null }),
    }),
  }
}
