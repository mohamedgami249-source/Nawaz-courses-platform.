import { getCourse } from "@/lib/course-queries";
import { ensureSeed } from "@/lib/seed";

export const dynamic = "force-dynamic";
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  await ensureSeed();
  const { id } = await params;
  const course = await getCourse(id);
  if (!course) return Response.json({ error: "لم يتم العثور على الدورة" }, { status: 404 });
  const { lessons: privateLessons, ...publicCourse } = course;
  return Response.json({ course: { ...publicCourse, lessons: privateLessons?.map(({ videoUrl, attachmentUrl, ...lesson }) => lesson) } });
}
