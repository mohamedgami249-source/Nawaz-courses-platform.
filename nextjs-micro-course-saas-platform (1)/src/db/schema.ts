import { pgTable, uuid, text, integer, numeric, timestamp, uniqueIndex, boolean } from "drizzle-orm/pg-core";

export const profiles = pgTable("profiles", {
  id: uuid("id").primaryKey(),
  email: text("email").notNull(),
  fullName: text("full_name").notNull(),
  role: text("role", { enum: ["student", "instructor"] }).notNull().default("student"),
  avatarUrl: text("avatar_url"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const courses = pgTable("courses", {
  id: uuid("id").primaryKey().defaultRandom(),
  instructorId: uuid("instructor_id").notNull().references(() => profiles.id),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull().default("تطوير الذات"),
  price: numeric("price", { precision: 10, scale: 2 }).notNull().default("0"),
  thumbnailUrl: text("thumbnail_url").notNull(),
  level: text("level").notNull().default("جميع المستويات"),
  rating: numeric("rating", { precision: 3, scale: 1 }).notNull().default("4.8"),
  reviews: integer("reviews").notNull().default(0),
  featured: boolean("featured").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const lessons = pgTable("lessons", {
  id: uuid("id").primaryKey().defaultRandom(),
  courseId: uuid("course_id").notNull().references(() => courses.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  videoUrl: text("video_url"),
  attachmentUrl: text("attachment_url"),
  orderIndex: integer("order_index").notNull().default(0),
  duration: integer("duration").notNull().default(10),
});

export const enrollments = pgTable("enrollments", {
  id: uuid("id").primaryKey().defaultRandom(),
  studentId: uuid("student_id").notNull().references(() => profiles.id),
  courseId: uuid("course_id").notNull().references(() => courses.id, { onDelete: "cascade" }),
  enrolledAt: timestamp("enrolled_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [uniqueIndex("enrollments_student_course_unique").on(table.studentId, table.courseId)]);

export const lessonProgress = pgTable("lesson_progress", {
  id: uuid("id").primaryKey().defaultRandom(),
  studentId: uuid("student_id").notNull().references(() => profiles.id),
  lessonId: uuid("lesson_id").notNull().references(() => lessons.id, { onDelete: "cascade" }),
  completedAt: timestamp("completed_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [uniqueIndex("lesson_progress_student_lesson_unique").on(table.studentId, table.lessonId)]);
