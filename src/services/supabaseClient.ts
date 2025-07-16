// Check if Supabase should be disabled (set in vite.config.ts)
const isSupabaseDisabled = (import.meta as any).env.VITE_DISABLE_SUPABASE === 'true';

// Mock Supabase client for when authentication is disabled
const mockSupabaseClient = {
  auth: {
    signInWithPassword: async () => ({ 
      data: { 
        user: { id: 'mock-user', email: 'demo@example.com' }, 
        session: { access_token: 'mock-token', refresh_token: 'mock-refresh', expires_at: Date.now() + 86400000 } 
      }, 
      error: null 
    }),
    signOut: async () => ({ error: null }),
    getSession: async () => ({ 
      data: { 
        session: { access_token: 'mock-token', refresh_token: 'mock-refresh', expires_at: Date.now() + 86400000 } 
      }, 
      error: null 
    }),
    refreshSession: async () => ({ error: null }),
    onAuthStateChange: (callback: any) => {
      // Immediately call with signed in state for mock
      setTimeout(() => {
        callback('SIGNED_IN', { 
          access_token: 'mock-token', 
          refresh_token: 'mock-refresh', 
          expires_at: Date.now() + 86400000 
        });
      }, 100);
      return { 
        data: { 
          subscription: { 
            unsubscribe: () => {} 
          } 
        } 
      };
    }
  }
};

// Create client based on whether Supabase is disabled
let supabaseClient: any;

if (isSupabaseDisabled) {
  console.log('🚫 Supabase disabled - using mock authentication');
  supabaseClient = mockSupabaseClient;
} else {
  console.log('🔗 Supabase enabled - but package not available, using mock');
  // For now, always use mock since we don't have the package installed
  supabaseClient = mockSupabaseClient;
}

export const supabase = supabaseClient;
export default supabase;
