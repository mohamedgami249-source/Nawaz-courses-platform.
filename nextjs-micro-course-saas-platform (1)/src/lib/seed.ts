import { db } from "@/db";
import { courses, lessons, profiles } from "@/db/schema";
import { DEMO_INSTRUCTOR_ID, DEMO_STUDENT_ID, OTHER_INSTRUCTOR_ID, sampleCourses } from "@/lib/catalog";
import { supabaseConfigured } from "@/lib/server";

let seeded = false;
export async function ensureSeed() {
  if (seeded || supabaseConfigured) return;
  await db.insert(profiles).values([
    { id: DEMO_STUDENT_ID, email: "student@demo.local", fullName: "أحمد محمد", role: "student" },
    { id: DEMO_INSTRUCTOR_ID, email: "instructor@demo.local", fullName: "سارة أحمد", role: "instructor" },
    { id: OTHER_INSTRUCTOR_ID, email: "mohammed@demo.local", fullName: "محمد خالد", role: "instructor" },
  ]).onConflictDoNothing();
  for (const item of sampleCourses) {
    const { lessons: lessonTitles, ...course } = item;
    await db.insert(courses).values(course).onConflictDoNothing();
    // Deterministic lesson IDs keep this seed safe across restarts and concurrent requests.
    await db.insert(lessons).values(lessonTitles.map((title, index) => ({
      id: `${item.id.slice(0, 1)}${String(index + 1).padStart(1, "0")}${item.id.slice(2)}`,
      courseId: item.id,
      title,
      orderIndex: index,
      duration: [8, 12, 15, 11, 18, 10][index] ?? 10,
    }))).onConflictDoNothing();
  }
  seeded = true;
}
