import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

export default async function MePage() {
  const allCookies = cookies();
  const jwtToken = allCookies.get("whop_jwt")?.value;

  if (!jwtToken) {
    return (
      <main style={{ padding: "2rem" }}>
        <h1>No se encontró el JWT</h1>
        <p>Asegúrate de que estás accediendo desde una experiencia embebida en Whop.</p>
      </main>
    );
  }

  let decoded = null;
  try {
    decoded = jwt.decode(jwtToken);
  } catch (err: any) {
    return (
      <main style={{ padding: "2rem" }}>
        <h1>Error al decodificar JWT</h1>
        <p>{err.message}</p>
      </main>
    );
  }

  return (
    <main style={{ padding: "2rem" }}>
      <h1>Datos del Usuario (desde JWT en Cookie)</h1>
      <pre style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
        {JSON.stringify(decoded, null, 2)}
      </pre>
    </main>
  );
}
