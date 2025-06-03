import { makeUserTokenVerifier } from '@whop/api';

const verifier = makeUserTokenVerifier(process.env.WHOP_APP_SECRET);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' });

  const { token } = req.body;
  if (!token) return res.status(400).json({ error: 'Falta el token' });

  try {
    const user = await verifier(token);
    return res.status(200).json({ user });
  } catch (err) {
    console.error('❌ Error al verificar JWT:', err);
    return res.status(401).json({ error: 'Token inválido o expirado' });
  }
}
