// Vercel Serverless Function: Stripe Webhook Proxy
// This receives Stripe webhooks and forwards them to Supabase with auth

export default async function handler(req, res) {
  // Only accept POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Forward request to Supabase Edge Function with authentication
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    const response = await fetch(`${supabaseUrl}/functions/v1/stripe-webhook`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseKey}`,
        'Stripe-Signature': req.headers['stripe-signature'] || '',
      },
      body: JSON.stringify(req.body),
    });

    const data = await response.json();

    return res.status(response.status).json(data);
  } catch (error) {
    console.error('Webhook proxy error:', error);
    return res.status(500).json({ error: error.message });
  }
}
