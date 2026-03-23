/**
 * Sessions domain: Pinia remains the source of truth for cache, mutations, and loading flags.
 * Use this composable when you prefer a function-style import over calling the store directly.
 */
export function useSessions() {
  return useSessionsStore()
}
