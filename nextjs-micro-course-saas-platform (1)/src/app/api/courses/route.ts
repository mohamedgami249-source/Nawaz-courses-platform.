import { db } from "@/db";
import { courses, lessons } from "@/db/schema";
import { getCourses } from "@/lib/course-queries";
import { ensureSeed } from "@/lib/seed";
import { forbidden, getActor, unauthorized } from "@/lib/server";

export const dynamic = "force-dynamic";
export async function GET() {
  await ensureSeed();
  const catalog = await getCourses();
  return Response.json({ courses: catalog.map(({ lessons: privateLessons, ...course }) => ({ ...course, lessons: privateLessons?.map(({ videoUrl, attachmentUrl, ...lesson }) => lesson) })) });
}

export async function POST(request: Request) {
  await ensureSeed();
  const actor = await getActor(request);
  if (!actor) return unauthorized();
  if (actor.role !== "instructor") return forbidden();
  const body = await request.json();
  const title = String(body.title ?? "").trim();
  const description = String(body.description ?? "").trim();
  const price = Number(body.price);
  if (title.length < 4 || description.length < 20 || !Number.isFinite(price) || price < 0 || price > 99999) return Response.json({ error: "يرجى إدخال عنوان ووصف وسعر صالح" }, { status: 400 });
  const thumbnailUrl = String(body.thumbnailUrl ?? "").trim() || "https://images.pexels.com/photos/590022/pexels-photo-590022.jpeg?auto=compress&cs=tinysrgb&w=900";
  const lessonList = Array.isArray(body.lessons) ? body.lessons.filter((l: { title?: string }) => typeof l.title === "string" && l.title.trim()) : [];
  if (!lessonList.length) return Response.json({ error: "أضف درساً واحداً على الأقل" }, { status: 400 });
  const [course] = await db.insert(courses).values({ instructorId: actor.id, title, description, price: price.toFixed(2), category: String(body.category || "تطوير الذات"), thumbnailUrl, level: String(body.level || "جميع المستويات"), featured: false }).returning();
  await db.insert(lessons).values(lessonList.map((lesson: { title: string; videoUrl?: string; attachmentUrl?: string; duration?: number }, index: number) => ({ courseId: course.id, title: lesson.title.trim(), videoUrl: lesson.videoUrl?.trim() || null, attachmentUrl: lesson.attachmentUrl?.trim() || null, duration: Math.max(1, Math.min(600, Number(lesson.duration) || 10)), orderIndex: index })));
  return Response.json({ course }, { status: 201 });
}
