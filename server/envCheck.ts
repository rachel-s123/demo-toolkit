export function checkEnv() {
  const required = [
    'KV_REST_API_URL',
    'KV_REST_API_TOKEN',
    'SUPABASE_URL',
    'SUPABASE_ANON_KEY'
  ];
  const missing = required.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    console.error(
      `Missing required environment variables: ${missing.join(', ')}`
    );
    process.exit(1);
  }
}
