import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No se envió token' });
  }

  const token = auth.split(' ')[1];

  try {
    const decoded = jwt.decode(token, { complete: true });
    return res.status(200).json({ message: 'Token recibido y decodificado', decoded });
  } catch (err) {
    return res.status(400).json({ error: 'Token inválido', details: err.message });
  }
}
