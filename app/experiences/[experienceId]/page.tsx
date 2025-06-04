import { whopApi } from "@/lib/whop-api";
import { verifyUserToken } from "@whop/api";
import { headers } from "next/headers";
import { promises as fs } from "fs";
import path from "path";

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

  // [4] Cargar y renderizar portal.html
  const filePath = path.join(process.cwd(), "templates", "portal.html");
  let html = await fs.readFile(filePath, "utf8");

  html = html
    .replace("{{name}}", user.name || "Seeker")
    .replace("{{email}}", email || "not_found")
    .replace("{{username}}", user.username || "unknown")
    .replace("{{experience}}", experience.name || "Unknown Experience")
    .replace("{{accessLevel}}", accessLevel || "unknown");

  return new Response(html, {
    headers: {
      "Content-Type": "text/html",
    },
  });
}
