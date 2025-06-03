import { whopApi } from "@/lib/whop-api";
import { verifyUserToken } from "@whop/api";
import { headers } from "next/headers";

export default async function ExperiencePage({
  params,
}: {
  params: Promise<{ experienceId: string }>;
}) {
  // 1. Obtener headers y parámetro
  const headersList = await headers();
  const { experienceId } = await params;

  // 2. Verificar token y extraer userId
  const { userId } = await verifyUserToken(headersList);

  // 3. Validar acceso a la experiencia
  const result = await whopApi.checkIfUserHasAccessToExperience({
    userId,
    experienceId,
  });

  // 4. Obtener datos privados del usuario (incluye email)
  const user = (await whopApi.getUserPrivate({ userId })).user;

  // 5. Obtener detalles de la experiencia
  const experience = (await whopApi.getExperience({ experienceId })).experience;

  const { accessLevel } = result.hasAccessToExperience;

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
        Your email is <strong>{user.email}</strong><br />
        <br />
        You are viewing the experience: <strong>{experience.name}</strong>
      </h1>
    </div>
  );
}
