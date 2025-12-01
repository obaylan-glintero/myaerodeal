export default async function handler(req, res) {

  console.log('📥 Webhook received:', req.method, req.url);

 

  // Only accept POST

  if (req.method !== 'POST') {

    return res.status(405).json({ error: 'Method not allowed' });

  // Handle CORS preflight

  if (req.method === 'OPTIONS') {

    res.setHeader('Access-Control-Allow-Origin', '*');

    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');

    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Stripe-Signature');

    return res.status(200).end();

  }

 

  // Only accept POST

  if (req.method !== 'POST') {

    return res.status(405).json({ error: 'Method not allowed', method: req.method });

  }
