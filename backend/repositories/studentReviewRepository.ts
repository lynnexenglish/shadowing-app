import { QueryResult } from "pg";
import { db } from "../server.js";

export interface StudentReview {
  id: string;
  student_id: string;
  rating: number;
  review_text: string;
  display_on_website: boolean;
  submitted_at: Date;
}

export interface PublicStudentReview {
  rating: number;
  review_text: string;
  author_name: string;
  submitted_at: Date;
}

export interface StudentReviewWithName extends StudentReview {
  student_name: string;
}

export const studentReviewRepository = {
  hasCompletedLesson: async (studentId: string): Promise<boolean> => {
    const result = await db.query(
      `SELECT 1 FROM assignments
       WHERE student_id = $1 AND completed = true
       LIMIT 1`,
      [studentId]
    );
    return result.rows.length > 0;
  },

  findByStudentId: async (studentId: string): Promise<StudentReview | null> => {
    const result: QueryResult<StudentReview> = await db.query(
      `SELECT * FROM student_reviews WHERE student_id = $1`,
      [studentId]
    );
    return result.rows[0] || null;
  },

  findByStudentIdWithName: async (
    studentId: string
  ): Promise<StudentReviewWithName | null> => {
    const result: QueryResult<StudentReviewWithName> = await db.query(
      `SELECT sr.*, u.name AS student_name
       FROM student_reviews sr
       JOIN users u ON u.id = sr.student_id
       WHERE sr.student_id = $1`,
      [studentId]
    );
    return result.rows[0] || null;
  },

  create: async (
    studentId: string,
    rating: number,
    reviewText: string
  ): Promise<StudentReview> => {
    const result: QueryResult<StudentReview> = await db.query(
      `INSERT INTO student_reviews (student_id, rating, review_text)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [studentId, rating, reviewText]
    );
    return result.rows[0];
  },

  updateDisplayOnWebsite: async (
    studentId: string,
    displayOnWebsite: boolean
  ): Promise<StudentReview | null> => {
    const result: QueryResult<StudentReview> = await db.query(
      `UPDATE student_reviews
       SET display_on_website = $1
       WHERE student_id = $2
       RETURNING *`,
      [displayOnWebsite, studentId]
    );
    return result.rows[0] || null;
  },

  findPublicRecent: async (limit = 20): Promise<PublicStudentReview[]> => {
    const result: QueryResult<PublicStudentReview> = await db.query(
      `SELECT sr.rating, sr.review_text, u.name AS author_name, sr.submitted_at
       FROM student_reviews sr
       JOIN users u ON u.id = sr.student_id
       WHERE sr.display_on_website = true
       ORDER BY sr.submitted_at DESC
       LIMIT $1`,
      [limit]
    );
    return result.rows;
  },
};
