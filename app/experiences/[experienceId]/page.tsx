import { whopApi } from "@/lib/whop-api";
import { verifyUserToken } from "@whop/api";
import { headers } from "next/headers";

export default async function ExperiencePage({
  params,
}: {
  params: Promise<{ experienceId: string }>;
}) {
  const headersList = await headers();

  // [1] Mostrar todos los headers para debugging
  for (const [key, value] of headersList.entries()) {
    console.log(`[HEADER] ${key}: ${value}`);
  }

  // [2] Obtener experiencia y userId
  const { experienceId } = await params;
  const { userId } = await verifyUserToken(headersList);

  const result = await whopApi.checkIfUserHasAccessToExperience({
    userId,
    experienceId,
  });

  const user = (await whopApi.getUser({ userId })).publicUser;
  const experience = (await whopApi.getExperience({ experienceId })).experience;
  const { accessLevel } = result.hasAccessToExperience;

  // [3] Intentamos obtener el email vía API REST (requiere WHOP_API_KEY)
  let email = "not_found";

  if (process.env.WHOP_API_KEY) {
    try {
      const res = await fetch(`https://api.whop.com/v5/app/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${process.env.WHOP_API_KEY}`,
        },
      });

      console.log("[WHOP] Status respuesta REST:", res.status);
      const data = await res.json();
      console.log("[WHOP] Datos REST:", JSON.stringify(data, null, 2));

      email = data?.email || "not_found";
    } catch (err) {
      console.error("[WHOP] Error al obtener email con API Key:", err);
    }
  } else {
    console.warn("[WHOP] WHOP_API_KEY no está definida en el entorno.");
  }

  // [4] Render final
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
