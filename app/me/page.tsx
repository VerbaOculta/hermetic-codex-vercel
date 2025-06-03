'use client';

import { useEffect, useState } from 'react';
import jwt from 'jsonwebtoken';

export default function MePage() {
  const [decoded, setDecoded] = useState(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const jwtToken = getCookie('whop_jwt');
    if (!jwtToken) {
      setError('No se encontró el JWT');
      return;
    }

    try {
      const data = jwt.decode(jwtToken);
      setDecoded(data);
    } catch (err: any) {
      setError(err.message);
    }
  }, []);

  function getCookie(name: string): string | null {
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? decodeURIComponent(match[2]) : null;
  }

  if (error) {
    return (
      <main style={{ padding: '2rem' }}>
        <h1>Error</h1>
        <p>{error}</p>
      </main>
    );
  }

  if (!decoded) {
    return (
      <main style={{ padding: '2rem' }}>
        <p>Cargando...</p>
      </main>
    );
  }

  return (
    <main style={{ padding: '2rem' }}>
      <h1>Datos del Usuario (desde JWT)</h1>
      <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
        {JSON.stringify(decoded, null, 2)}
      </pre>
    </main>
  );
}
