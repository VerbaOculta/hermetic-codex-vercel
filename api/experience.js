import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const auth = req.headers.authorization || '';
  const token = auth.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ error: 'Missing JWT' });
  }

  try {
    const decoded = jwt.decode(token, { complete: true });
    return res.status(200).json({ decoded });
  } catch (err) {
    console.error('JWT decode error:', err);
    return res.status(500).json({ error: 'Failed to decode JWT' });
  }
}
