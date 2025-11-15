// Vercel Serverless Function: Stripe Webhook Proxy
// This receives Stripe webhooks and forwards them to Supabase with auth

// Disable body parsing so we can get raw body for Stripe signature verification
export const config = {
  api: {
    bodyParser: false,
  },
};

// Helper to get raw body
async function getRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}

export default async function handler(req, res) {
  console.log('📥 Webhook received:', req.method, req.url);

  // Only accept POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get raw body for Stripe signature verification
    const rawBody = await getRawBody(req);

    console.log('📦 Body length:', rawBody.length);
    console.log('🔑 Stripe signature present:', !!req.headers['stripe-signature']);

    // Forward request to Supabase Edge Function with authentication
    const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.error('❌ Missing Supabase credentials');
      return res.status(500).json({ error: 'Configuration error' });
    }

    console.log('🚀 Forwarding to Supabase:', `${supabaseUrl}/functions/v1/stripe-webhook`);

    const response = await fetch(`${supabaseUrl}/functions/v1/stripe-webhook`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseKey}`,
        'Stripe-Signature': req.headers['stripe-signature'] || '',
      },
      body: rawBody,
    });

    const responseText = await response.text();
    console.log('📨 Supabase response:', response.status, responseText);

    let data;
    try {
      data = JSON.parse(responseText);
    } catch {
      data = { message: responseText };
    }

    return res.status(response.status).json(data);
  } catch (error) {
    console.error('❌ Webhook proxy error:', error);
    return res.status(500).json({ error: error.message });
  }
}
