import { makeUserTokenVerifier } from '@whop/api';

const verifier = makeUserTokenVerifier(process.env.WHOP_APP_SECRET);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const { token } = req.body;
  if (!token) return res.status(400).json({ error: 'Falta el token JWT' });

  try {
    const userData = await verifier(token);
    res.status(200).json({ user: userData });
  } catch (error) {
    console.error('❌ Error verificando token:', error);
    res.status(401).json({ error: 'Token inválido' });
  }
}
