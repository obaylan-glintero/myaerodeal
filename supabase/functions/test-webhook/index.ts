import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

serve(async (req) => {
  console.log('🎯 Test webhook called!', req.method, req.url)
  console.log('📥 Headers:', Object.fromEntries(req.headers.entries()))

  return new Response(
    JSON.stringify({
      success: true,
      message: 'Test webhook works!',
      method: req.method,
      headers: Object.fromEntries(req.headers.entries())
    }),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    }
  )
})
