console.log('SUPABASE STUB ACTIVE:', __filename)

// utils/supabase-browser.ts
export const supabaseBrowser = () => {
  const chain = {
    select: (..._a: any[]) => chain,
    eq: (..._a: any[]) => chain,
    single: (..._a: any[]) => ({ data: null, error: null }),
    maybeSingle: (..._a: any[]) => ({ data: null, error: null }),
    upsert: (..._a: any[]) => ({ data: null, error: null }),
  } as any

  return {
    auth: {
      getSession: async () => ({ data: { session: null }, error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      signInWithOAuth: async () => ({ error: null }),
      signOut: async () => ({ error: null }),
    },
    from: (_table: string) => chain,
    storage: {
      from: (_bucket: string) => ({
        createSignedUrls: async (paths: string[], _ttl: number) => ({
          data: paths.map(() => ({ signedUrl: '/' })), // never used in prod, just shape-safe
          error: null,
        }),
      }),
    },
  }
}
