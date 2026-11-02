import { ensureSeed } from "@/lib/seed";
import { getActor, unauthorized } from "@/lib/server";

export const dynamic = "force-dynamic";
export async function GET(request: Request) {
  await ensureSeed();
  const actor = await getActor(request);
  if (!actor) return unauthorized();
  return Response.json({ profile: actor });
}
