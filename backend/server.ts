import express, { Request, Response } from "express";
import cors from "cors";
import router from "./router.js";
import {
  apiLimiter,
  authLimiter,
  uploadLimiter,
} from "./middleware/rateLimiter.js";
import { protect } from "./auth.js";
import { signin, registerStudent } from "./handlers/user.js";
import pool from "./db.js";
import handleError from "./handlers/handleError.js";
import logger from "./helpers/logger.js";
import { configureAzureCors } from "./services/azureBlobStorage.js";
import publicReviewsRouter from "./routes/publicReviews.js";
import publicReferralsRouter from "./routes/publicReferrals.js";
const app = express();

// Initialize database tables if they do not already exist
const initDatabase = async () => {
  try {
    // Check if tables exist, if not create them
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        username VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255),
        role VARCHAR(50) DEFAULT 'student',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS lessons (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),   
        title VARCHAR(255) NOT NULL,
        image VARCHAR(255),
        video_id VARCHAR(255),
        lesson_start_time INTEGER,
        lesson_end_time INTEGER,        
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS assignments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        student_id UUID REFERENCES users(id) ON DELETE CASCADE,
        lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
        completed BOOLEAN DEFAULT FALSE,
        status VARCHAR(50) DEFAULT 'new',
        assigned_by UUID REFERENCES users(id) ON DELETE SET NULL,
        assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        completed_at TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(student_id, lesson_id),
        audio_file TEXT,
        feedback TEXT
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS practice_words (
        id SERIAL PRIMARY KEY,
        student_id UUID REFERENCES users(id) ON DELETE CASCADE,
        word TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Migration: Add Cloudinary video support columns to lessons table
    // These run safely - if column exists, it just skips
    const addColumnIfNotExists = async (
      table: string,
      column: string,
      definition: string,
    ) => {
      const checkColumn = await pool.query(
        `SELECT column_name FROM information_schema.columns
         WHERE table_name = $1 AND column_name = $2`,
        [table, column],
      );
      if (checkColumn.rows.length === 0) {
        await pool.query(
          `ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`,
        );
        logger.info(`Added column ${column} to ${table}`);
      }
    };

    // Add Cloudinary support columns
    await addColumnIfNotExists(
      "lessons",
      "video_type",
      "VARCHAR(20) DEFAULT 'youtube'",
    );
    await addColumnIfNotExists(
      "lessons",
      "cloudinary_public_id",
      "VARCHAR(255)",
    );
    await addColumnIfNotExists("lessons", "cloudinary_url", "TEXT");

    // Add script text support columns
    await addColumnIfNotExists("lessons", "script_text", "TEXT");
    await addColumnIfNotExists(
      "lessons",
      "script_type",
      "VARCHAR(10) DEFAULT 'image'",
    );

    // Add category column for lesson organization
    await addColumnIfNotExists("lessons", "category", "VARCHAR(100)");

    // Add native_language column for ESL Coach personalization
    await addColumnIfNotExists("users", "native_language", "VARCHAR(100)");

    // Lists table for organizing lessons
    await pool.query(`
      CREATE TABLE IF NOT EXISTS lists (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        teacher_id UUID REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Junction table for list-lesson many-to-many relationship
    await pool.query(`
      CREATE TABLE IF NOT EXISTS list_lessons (
        list_id UUID REFERENCES lists(id) ON DELETE CASCADE,
        lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
        added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (list_id, lesson_id)
      );
    `);

    // Add position column to list_lessons for ordering lessons within a course
    await addColumnIfNotExists("list_lessons", "position", "INTEGER DEFAULT 0");

    // Add list_id to assignments to track which course an assignment came from
    await addColumnIfNotExists(
      "assignments",
      "list_id",
      "UUID REFERENCES lists(id) ON DELETE SET NULL"
    );

    // Feedback replies table for conversation threads on assignments
    await pool.query(`
      CREATE TABLE IF NOT EXISTS feedback_replies (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        assignment_id UUID REFERENCES assignments(id) ON DELETE CASCADE,
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Audio segments table for phrase practice pipeline
    await pool.query(`
      CREATE TABLE IF NOT EXISTS audio_segments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
        label TEXT NOT NULL,
        start_time FLOAT NOT NULL,
        end_time FLOAT NOT NULL,
        position INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Index for fast segment lookup by lesson
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_audio_segments_lesson_id
      ON audio_segments(lesson_id);
    `);

    // Add audio_url to lessons for extracted audio from Cloudinary videos
    await addColumnIfNotExists("lessons", "audio_url", "TEXT");

    // Add segment_id to practice_words to link phrases to audio segments
    await addColumnIfNotExists(
      "practice_words",
      "segment_id",
      "UUID REFERENCES audio_segments(id) ON DELETE SET NULL"
    );

    await pool.query(`
      CREATE TABLE IF NOT EXISTS practice_results (
        id SERIAL PRIMARY KEY,
        practice_word_id INTEGER REFERENCES practice_words(id) ON DELETE CASCADE,
        accuracy_score NUMERIC(5,2) NOT NULL,
        fluency_score NUMERIC(5,2) NOT NULL,
        completeness_score NUMERIC(5,2) NOT NULL,
        pronunciation_score NUMERIC(5,2) NOT NULL,
        words_breakdown JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS student_reviews (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        student_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
        rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
        review_text TEXT NOT NULL,
        display_on_website BOOLEAN DEFAULT FALSE,
        submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await addColumnIfNotExists("users", "is_ambassador", "BOOLEAN DEFAULT FALSE");

    await pool.query(`
      CREATE TABLE IF NOT EXISTS referral_codes (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        internal_id VARCHAR(32) UNIQUE NOT NULL,
        display_code VARCHAR(64) UNIQUE NOT NULL,
        slug VARCHAR(64) UNIQUE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS referrals (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        referrer_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        referred_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
        referral_code_id UUID NOT NULL REFERENCES referral_codes(id) ON DELETE CASCADE,
        status VARCHAR(32) NOT NULL DEFAULT 'invited',
        friend_discount_krw INTEGER NOT NULL DEFAULT 10000,
        referrer_reward_krw INTEGER NOT NULL DEFAULT 10000,
        purchase_note TEXT,
        approved_by UUID REFERENCES users(id) ON DELETE SET NULL,
        approved_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS referral_rewards (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        referral_id UUID REFERENCES referrals(id) ON DELETE SET NULL,
        amount_krw INTEGER NOT NULL DEFAULT 0,
        status VARCHAR(32) NOT NULL DEFAULT 'pending',
        milestone_type VARCHAR(32) NOT NULL DEFAULT 'standard',
        approved_by UUID REFERENCES users(id) ON DELETE SET NULL,
        approved_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS referral_clicks (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        referral_code_id UUID NOT NULL REFERENCES referral_codes(id) ON DELETE CASCADE,
        ip_hash VARCHAR(64),
        clicked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON referrals(referrer_user_id);
    `);
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_referrals_status ON referrals(status);
    `);
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_referral_codes_slug ON referral_codes(slug);
    `);

    // Azure-transcribed reference text for the lesson's own audio (audio_url),
    // cached on first AI-feedback request so later requests skip re-transcribing.
    await addColumnIfNotExists("lessons", "verified_transcript", "TEXT");

    logger.info("Database tables initialized");
  } catch (error) {
    logger.error("Error initializing database:", error);
  }
};

initDatabase();

configureAzureCors()
  .then(() => logger.info("Azure CORS configured"))
  .catch((err) => logger.error("Azure CORS setup failed:", err));

app.set("trust proxy", 1);

// Middleware
app.use(
  cors({
    origin: [
      "https://shadowspeaklearn.com",
      "https://www.shadowspeaklearn.com",
      "http://localhost:3000",
      "http://localhost:3001",
      "https://shadowing-app-sandy.vercel.app/"
    ],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }),
);
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

app.get("/", (_req: Request, res: Response) => {
  res.json({
    status: "OK",
    message: "ESL Shadowing API server is running",
    timestamp: new Date().toISOString(),
  });
});

app.use("/api/upload-image", uploadLimiter);
app.use("/api/upload-audio", uploadLimiter);
app.use("/api/upload-video", uploadLimiter);
app.use("/api/public", apiLimiter, publicReviewsRouter);
app.use("/api/public/referrals", apiLimiter, publicReferralsRouter);
app.use("/api", apiLimiter, protect, router);
app.post("/signin", authLimiter, signin);
app.post("/register", authLimiter, registerStudent);

app.use(handleError);

export default app;
export { pool as db };
