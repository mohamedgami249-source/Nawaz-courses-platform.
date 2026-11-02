import { db } from "@/db";
import { courses, lessons, profiles, enrollments } from "@/db/schema";
import { eq } from "drizzle-orm";
import type { Course } from "@/lib/types";

export async function getCourses(): Promise<Course[]> {
  const [courseRows, lessonRows, profileRows, enrollmentRows] = await Promise.all([
    db.select().from(courses), db.select().from(lessons), db.select().from(profiles), db.select().from(enrollments),
  ]);
  return courseRows.map((course) => {
    const courseLessons = lessonRows.filter((lesson) => lesson.courseId === course.id).sort((a, b) => a.orderIndex - b.orderIndex);
    return { ...course, instructorName: profileRows.find((p) => p.id === course.instructorId)?.fullName ?? "مدرب مستقل", lessonCount: courseLessons.length, totalDuration: courseLessons.reduce((sum, lesson) => sum + lesson.duration, 0), enrolledCount: enrollmentRows.filter((e) => e.courseId === course.id).length, lessons: courseLessons };
  }).sort((a, b) => Number(b.featured) - Number(a.featured) || b.createdAt.getTime() - a.createdAt.getTime());
}

export async function getCourse(id: string) {
  const all = await getCourses();
  return all.find((course) => course.id === id) ?? null;
}

export async function isEnrolled(studentId: string, courseId: string) {
  const rows = await db.select().from(enrollments).where(eq(enrollments.studentId, studentId));
  return rows.some((row) => row.courseId === courseId);
}
