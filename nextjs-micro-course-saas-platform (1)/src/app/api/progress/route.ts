import { db } from "@/db";
import { lessonProgress } from "@/db/schema";
import { getCourse, isEnrolled } from "@/lib/course-queries";
import { ensureSeed } from "@/lib/seed";
import { forbidden, getActor, unauthorized } from "@/lib/server";
import { and, eq } from "drizzle-orm";

export async function POST(request: Request) {
  await ensureSeed();
  const actor = await getActor(request);
  if (!actor) return unauthorized();
  if (actor.role !== "student") return forbidden();
  const { courseId, lessonId, completed } = await request.json();
  const course = typeof courseId === "string" ? await getCourse(courseId) : null;
  if (!course?.lessons?.some((lesson) => lesson.id === lessonId) || !(await isEnrolled(actor.id, courseId))) return forbidden();
  if (completed) await db.insert(lessonProgress).values({ studentId: actor.id, lessonId }).onConflictDoNothing();
  else await db.delete(lessonProgress).where(and(eq(lessonProgress.studentId, actor.id), eq(lessonProgress.lessonId, lessonId)));
  return Response.json({ success: true });
}
