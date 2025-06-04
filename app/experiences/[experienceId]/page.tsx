import { whopApi } from "@/lib/whop-api";
import { verifyUserToken } from "@whop/api";
import { headers } from "next/headers";

export default async function ExperiencePage({
  params,
}: {
  params: Promise<{ experienceId: string }>;
}) {
  const headersList = await headers();

  // [1] LOG TODOS LOS HEADERS PARA DEPURACIÓN
  for (const [key, value] of headersList.entries()) {
    console.log(`[HEADER] ${key}: ${value}`);
  }

  // [2] CORRECTO: Obtener token desde 'x-whop-user-token'
  const token = headersList.get("x-whop-user-token");

  const { experienceId } = await params;
  const { userId } = await verifyUserToken(headersList);

  const result = await whopApi.checkIfUserHasAccessToExperience({
    userId,
    experienceId,
  });

  const user = (await whopApi.getUser({ userId })).publicUser;
  const experience = (await whopApi.getExperience({ experienceId })).experience;
  const { accessLevel } = result.hasAccessToExperience;

  // === MÉTODO 1: GRAPHQL usando el token correcto ===
  let email = "not_found";

  if (token) {
    console.log("[WHOP] Token de usuario (x-whop-user-token):", token);

    const gqlQuery = {
      query: `
        query {
          viewer {
            user {
              email
            }
          }
        }
      `,
    };

    try {
      const res = await fetch("https://api.whop.com/graphql", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(gqlQuery),
      });

      console.log("[WHOP] Status respuesta GraphQL:", res.status);
      const data = await res.json();
      console.log("[WHOP] Datos GraphQL:", JSON.stringify(data, null, 2));

      email = data?.data?.viewer?.user?.email || "not_found";
    } catch (err) {
      console.error("[WHOP] Error en GraphQL con token:", err);
    }
  } else {
    console.warn("[WHOP] No se encontró 'x-whop-user-token' en headers.");
  }

  return (
    <div className="flex justify-center items-center h-screen px-8 text-white">
      <h1 className="text-xl text-center max-w-3xl">
        Hi <strong>{user.name}</strong>, you{" "}
        <strong>
          {result.hasAccessToExperience.hasAccess ? "have" : "do not have"} access
        </strong>{" "}
        to this experience. Your access level to this whop is:{" "}
        <strong>{accessLevel}</strong>.<br />
        <br />
        Your user ID is <strong>{userId}</strong><br />
        Your username is <strong>@{user.username}</strong><br />
        Your email is <strong>{email}</strong><br />
        <br />
        You are viewing the experience: <strong>{experience.name}</strong>
      </h1>
    </div>
  );
}
