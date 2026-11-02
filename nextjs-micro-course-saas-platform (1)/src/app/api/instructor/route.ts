import { db } from "@/db";
import { enrollments } from "@/db/schema";
import { getCourses } from "@/lib/course-queries";
import { ensureSeed } from "@/lib/seed";
import { forbidden, getActor, unauthorized } from "@/lib/server";

export const dynamic = "force-dynamic";
export async function GET(request: Request) {
  await ensureSeed();
  const actor = await getActor(request);
  if (!actor) return unauthorized();
  if (actor.role !== "instructor") return forbidden();
  const myCourses = (await getCourses()).filter((c) => c.instructorId === actor.id);
  const allEnrollments = await db.select().from(enrollments);
  const relevant = allEnrollments.filter((e) => myCourses.some((c) => c.id === e.courseId));
  return Response.json({ courses: myCourses, totalStudents: new Set(relevant.map((e) => e.studentId)).size, totalEnrollments: relevant.length, revenue: relevant.reduce((sum, e) => sum + Number(myCourses.find((c) => c.id === e.courseId)?.price || 0), 0) });
}
