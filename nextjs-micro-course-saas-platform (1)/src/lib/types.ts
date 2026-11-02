export type Lesson = { id: string; courseId: string; title: string; videoUrl: string | null; attachmentUrl: string | null; orderIndex: number; duration: number };
export type Course = { id: string; instructorId: string; instructorName: string; title: string; description: string; category: string; price: string; thumbnailUrl: string; level: string; rating: string; reviews: number; featured: boolean; lessonCount: number; totalDuration: number; enrolledCount?: number; lessons?: Lesson[] };
export type Enrollment = { id: string; courseId: string; completedLessonIds: string[]; course: Course };
export type Profile = { id: string; email: string; fullName: string; role: "student" | "instructor" };
