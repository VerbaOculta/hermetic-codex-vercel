import { whopApi } from "@/lib/whop-api";
import { verifyUserToken } from "@whop/api";
import { headers } from "next/headers";

export default async function ExperiencePage({
  params,
}: {
  params: Promise<{ experienceId: string }>;
}) {
  // 1. Obtener headers y extraer el token
  const headersList = await headers();
  const authHeader = headersList.get("authorization");
  const token = authHeader?.replace("Bearer ", "");

  // 2. Obtener experienceId del path
  const { experienceId } = await params;

  // 3. Verificar token (para obtener userId)
  const { userId } = await verifyUserToken(headersList);

  // 4. Validar acceso
  const result = await whopApi.checkIfUserHasAccessToExperience({
    userId,
    experienceId,
  });

  // 5. Obtener datos públicos del usuario y experiencia
  const user = (await whopApi.getUser({ userId })).publicUser;
  const experience = (await whopApi.getExperience({ experienceId })).experience;
  const { accessLevel } = result.hasAccessToExperience;

  // 6. Obtener correo vía GraphQL
  let email = "not_found";
  if (token) {
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

      const data = await res.json();
      email = data?.data?.viewer?.user?.email || "not_found";
    } catch (err) {
      console.error("Error fetching email from GraphQL", err);
    }
  }

  // 7. Renderizar
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
