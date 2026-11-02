import { createClient } from "@supabase/supabase-js";
import { db } from "@/db";
import { profiles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { DEMO_INSTRUCTOR_ID, DEMO_STUDENT_ID } from "@/lib/catalog";

export const supabaseConfigured = !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export async function getActor(request: Request) {
  if (!supabaseConfigured) {
    const demo = request.headers.get("x-demo-user");
    if (demo !== "student" && demo !== "instructor") return null;
    const id = demo === "instructor" ? DEMO_INSTRUCTOR_ID : DEMO_STUDENT_ID;
    const [profile] = await db.select().from(profiles).where(eq(profiles.id, id)).limit(1);
    return profile ?? null;
  }
  const token = request.headers.get("authorization")?.replace(/^Bearer /i, "");
  if (!token) return null;
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user?.email) return null;
  const user = data.user;
  const email = user.email!;
  const [existing] = await db.select().from(profiles).where(eq(profiles.id, user.id)).limit(1);
  if (existing) return existing;
  const role = user.user_metadata?.role === "instructor" ? "instructor" : "student";
  const [profile] = await db.insert(profiles).values({ id: user.id, email, fullName: user.user_metadata?.full_name || email.split("@")[0], role }).onConflictDoNothing().returning();
  return profile ?? (await db.select().from(profiles).where(eq(profiles.id, user.id)).limit(1))[0];
}

export const unauthorized = () => Response.json({ error: "يرجى تسجيل الدخول أولاً" }, { status: 401 });
export const forbidden = () => Response.json({ error: "ليس لديك صلاحية للوصول" }, { status: 403 });
