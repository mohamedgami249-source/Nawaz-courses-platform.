import { db } from "@/db";
import { enrollments, lessonProgress } from "@/db/schema";
import { getCourses } from "@/lib/course-queries";
import { ensureSeed } from "@/lib/seed";
import { forbidden, getActor, unauthorized } from "@/lib/server";
import { eq, and } from "drizzle-orm";

export const dynamic = "force-dynamic";
export async function GET(request: Request) {
  await ensureSeed();
  const actor = await getActor(request);
  if (!actor) return unauthorized();
  if (actor.role !== "student") return forbidden();
  const [rows, progress, allCourses] = await Promise.all([db.select().from(enrollments).where(eq(enrollments.studentId, actor.id)), db.select().from(lessonProgress).where(eq(lessonProgress.studentId, actor.id)), getCourses()]);
  return Response.json({ enrollments: rows.map((row) => ({ id: row.id, courseId: row.courseId, completedLessonIds: progress.filter((p) => allCourses.find((c) => c.id === row.courseId)?.lessons?.some((l) => l.id === p.lessonId)).map((p) => p.lessonId), course: allCourses.find((c) => c.id === row.courseId) })).filter((row) => row.course) });
}

export async function POST(request: Request) {
  await ensureSeed();
  const actor = await getActor(request);
  if (!actor) return unauthorized();
  if (actor.role !== "student") return forbidden();
  const { courseId } = await request.json();
  const allCourses = await getCourses();
  if (!allCourses.some((c) => c.id === courseId)) return Response.json({ error: "الدورة غير موجودة" }, { status: 404 });
  await db.insert(enrollments).values({ studentId: actor.id, courseId }).onConflictDoNothing();
  const [enrollment] = await db.select().from(enrollments).where(and(eq(enrollments.studentId, actor.id), eq(enrollments.courseId, courseId))).limit(1);
  return Response.json({ enrollment });
}
