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
  const { experienceId } = await params;
  const { userId } = await verifyUserToken(headersList);

  // Enviar notificación dentro del ecosistema Whop
  try {
    console.log("[WHOP] Enviando push notification...");
  
    const result = await whopApi.sendPushNotification({
      input: {
        userIds: [userId],
        experienceId,
        senderUserId: userId, // IMPORTANTE: necesario para que se envíe correctamente
        title: "✨ El Codex Hermético te espera",
        subtitle: "Tu portal ha sido activado",
        content: "Haz clic para comenzar tu viaje simbólico.",
        link: "/puerta-codex"
      }
    });
  
    console.log("[WHOP] Resultado notificación:", JSON.stringify(result, null, 2));
  } catch (error) {
    console.error("[WHOP] Error al enviar notificación:", error);
  }


  const result = await whopApi.checkIfUserHasAccessToExperience({
    userId,
    experienceId,
  });

  const user = (await whopApi.getUser({ userId })).publicUser;
  const experience = (await whopApi.getExperience({ experienceId })).experience;
  const { accessLevel } = result.hasAccessToExperience;

  // Obtener email vía API REST (requiere WHOP_API_KEY)
  let email = "not_found";

  if (process.env.WHOP_API_KEY) {
    try {
      const res = await fetch(`https://api.whop.com/v5/app/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${process.env.WHOP_API_KEY}`,
        },
      });

      const data = await res.json();
      email = data?.email || "not_found";
    } catch (err) {
      console.error("[WHOP] Error al obtener email con API Key:", err);
    }
  }

  // === Leer y preparar HTML base ===
  const templatePath = path.join(process.cwd(), "templates", "portal.html");
  const htmlTemplate = await fs.readFile(templatePath, "utf8");

  // Reemplazar los placeholders
  const finalHTML = htmlTemplate
    .replace("{{name}}", user.name || "")
    .replace("{{email}}", email)
    .replace("{{username}}", user.username || "")
    .replace("{{experience}}", experience.name || "")
    .replace("{{accessLevel}}", accessLevel || "");

  return (
    <div dangerouslySetInnerHTML={{ __html: finalHTML }} />
  );
}
