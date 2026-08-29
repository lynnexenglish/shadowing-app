/**
 * One-off incremental handoff migration (Aug 27 delta).
 * Uploads 7 new media files and applies targeted DB changes only.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";
import dotenv from "dotenv";
import pg from "pg";
import { BlobServiceClient } from "@azure/storage-blob";
import { v2 as cloudinary } from "cloudinary";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BACKEND = path.join(__dirname, "..");
const HANDOFF = path.join(BACKEND, "../../handoff_new");
const DUMP = path.join(HANDOFF, "shadowspeak_db_20260827.dump");

dotenv.config({ path: path.join(BACKEND, ".env") });

const OLD_AZURE = "stivannissim958926278595";
const NEW_AZURE =
  process.env.AZURE_STORAGE_ACCOUNT_NAME || "shadowspeakstorage2026";
const OLD_CLOUD = "dbcya4cps";
const NEW_CLOUD = process.env.CLOUDINARY_CLOUD_NAME;

const NEW_LESSON_ID = "394e1a83-99fd-476b-92c0-ebcfc94e63d0";
const UPDATED_LESSON_IDS = [
  "5d17bae3-85e5-42d5-b5ef-52555a85f817",
  "d27c0504-8961-49c3-9f63-e0392c9b148b",
  "3f288c68-a6dd-414c-857d-185c0cda51d6",
  "01496cd8-297f-40a2-b80c-a583aea1e08f",
];
const SEGMENT_LESSON_IDS = [
  "01496cd8-297f-40a2-b80c-a583aea1e08f",
  NEW_LESSON_ID,
];

const AZURE_AUDIO_FILES = [
  "Harvey_Exposes_The_Truth__15_1787009325715.mp3",
  "Harvey_Exposes_The_Truth__16_1787012244653.mp3",
  "d7713df7-e87b-49fd-8051-b804af2b6974_3f288c68-a6dd-414c-857d-185c0cda51d6_1786535440474.webm",
  "d7713df7-e87b-49fd-8051-b804af2b6974_5d17bae3-85e5-42d5-b5ef-52555a85f817_1787061989486.webm",
  "d7713df7-e87b-49fd-8051-b804af2b6974_f920134a-977b-402c-a699-c8ea9d7cb79d_1787837272704.webm",
];

const CLOUDINARY_VIDEOS = [
  {
    file: "Harvey_Exposes_The_Truth__15_1787009325715.mp4",
    publicId: "lessons/Harvey_Exposes_The_Truth__15_1787009325715",
  },
  {
    file: "Harvey_Exposes_The_Truth__16_1787012244653.mp4",
    publicId: "lessons/Harvey_Exposes_The_Truth__16_1787012244653",
  },
];

function rewriteUrls(value) {
  if (value === "\\N" || value == null) return null;
  return value
    .replaceAll(
      `https://${OLD_AZURE}.blob.core.windows.net`,
      `https://${NEW_AZURE}.blob.core.windows.net`,
    )
    .replaceAll(
      `https://res.cloudinary.com/${OLD_CLOUD}`,
      `https://res.cloudinary.com/${NEW_CLOUD}`,
    );
}

function parseCopyTable(dumpPath, table) {
  const sqlPath = path.join("/tmp", `handoff_${table}.sql`);
  execSync(
    `pg_restore --data-only --table=${table} -f "${sqlPath}" "${dumpPath}"`,
  );
  const lines = fs.readFileSync(sqlPath, "utf8").split("\n");
  let header = null;
  const rows = [];
  let inCopy = false;
  for (const line of lines) {
    if (line.startsWith("COPY ")) {
      header = line;
      inCopy = true;
      continue;
    }
    if (inCopy) {
      if (line === "\\.") break;
      if (line) rows.push(line);
    }
  }
  const colMatch = header.match(/\(([^)]+)\)/);
  const columns = colMatch[1].split(", ").map((c) => c.replace(/"/g, ""));
  return { columns, rows };
}

function rowToObject(columns, row) {
  const parts = row.split("\t");
  const obj = {};
  columns.forEach((col, i) => {
    obj[col] = parts[i] === "\\N" ? null : parts[i];
  });
  return obj;
}

function contentTypeForAudio(name) {
  if (name.endsWith(".mp3")) return "audio/mpeg";
  if (name.endsWith(".webm")) return "audio/webm";
  return "application/octet-stream";
}

async function uploadAzureAudio() {
  const conn = process.env.AZURE_STORAGE_CONNECTION_STRING;
  if (!conn) throw new Error("AZURE_STORAGE_CONNECTION_STRING missing");
  const client = BlobServiceClient.fromConnectionString(conn);
  const container = client.getContainerClient("audio");

  for (const name of AZURE_AUDIO_FILES) {
    const local = path.join(HANDOFF, "media/azure/audio", name);
    if (!fs.existsSync(local)) throw new Error(`Missing azure file: ${local}`);
    const buf = fs.readFileSync(local);
    const blob = container.getBlockBlobClient(name);
    await blob.uploadData(buf, {
      blobHTTPHeaders: { blobContentType: contentTypeForAudio(name) },
    });
    console.log(`  uploaded azure/audio/${name}`);
  }
}

async function uploadCloudinaryVideos() {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  for (const { file, publicId } of CLOUDINARY_VIDEOS) {
    const local = path.join(HANDOFF, "media/cloudinary/video/lessons", file);
    if (!fs.existsSync(local)) throw new Error(`Missing cloudinary file: ${local}`);
    await new Promise((resolve, reject) => {
      cloudinary.uploader.upload(
        local,
        {
          resource_type: "video",
          public_id: publicId,
          overwrite: true,
        },
        (err, result) => {
          if (err) reject(err);
          else {
            console.log(`  uploaded cloudinary ${publicId}`);
            resolve(result);
          }
        },
      );
    });
  }
}

async function applyDatabase(client, oldDumpPath) {
  const oldAssignments = parseCopyTable(oldDumpPath, "assignments");
  const newAssignments = parseCopyTable(DUMP, "assignments");
  const oldAssignIds = new Set(
    oldAssignments.rows.map((r) => r.split("\t")[0]),
  );
  const newAssignRows = newAssignments.rows.filter(
    (r) => !oldAssignIds.has(r.split("\t")[0]),
  );

  const newLessons = parseCopyTable(DUMP, "lessons");
  const newSegments = parseCopyTable(DUMP, "audio_segments");

  await client.query("BEGIN");

  try {
    // Insert new lesson only if missing
    const newLessonRow = newLessons.rows.find((r) =>
      r.startsWith(NEW_LESSON_ID),
    );
    if (!newLessonRow) throw new Error("New lesson row not found in dump");
    const lessonObj = rowToObject(newLessons.columns, newLessonRow);
    for (const key of ["image", "cloudinary_url", "audio_url"]) {
      if (lessonObj[key]) lessonObj[key] = rewriteUrls(lessonObj[key]);
    }

    const exists = await client.query(
      "SELECT id FROM lessons WHERE id = $1",
      [NEW_LESSON_ID],
    );
    if (exists.rows.length === 0) {
      await client.query(
        `INSERT INTO lessons (
          id, title, image, video_id, lesson_start_time, lesson_end_time,
          created_at, updated_at, video_type, cloudinary_public_id, cloudinary_url,
          script_text, script_type, category, audio_url, verified_transcript
        ) VALUES (
          $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16
        )`,
        [
          lessonObj.id,
          lessonObj.title,
          lessonObj.image,
          lessonObj.video_id,
          lessonObj.lesson_start_time
            ? Number(lessonObj.lesson_start_time)
            : null,
          lessonObj.lesson_end_time ? Number(lessonObj.lesson_end_time) : null,
          lessonObj.created_at,
          lessonObj.updated_at,
          lessonObj.video_type,
          lessonObj.cloudinary_public_id,
          lessonObj.cloudinary_url,
          lessonObj.script_text,
          lessonObj.script_type,
          lessonObj.category,
          lessonObj.audio_url,
          lessonObj.verified_transcript,
        ],
      );
      console.log("  inserted lesson", NEW_LESSON_ID);
    } else {
      console.log("  lesson already exists, skip insert", NEW_LESSON_ID);
    }

    // Update 4 changed lessons
    for (const lessonId of UPDATED_LESSON_IDS) {
      const row = newLessons.rows.find((r) => r.startsWith(lessonId));
      if (!row) continue;
      const o = rowToObject(newLessons.columns, row);
      for (const key of ["image", "cloudinary_url", "audio_url"]) {
        if (o[key]) o[key] = rewriteUrls(o[key]);
      }
      await client.query(
        `UPDATE lessons SET
          title = $2, image = $3, video_id = $4, lesson_start_time = $5,
          lesson_end_time = $6, updated_at = $7, video_type = $8,
          cloudinary_public_id = $9, cloudinary_url = $10, script_text = $11,
          script_type = $12, category = $13, audio_url = $14, verified_transcript = $15
        WHERE id = $1`,
        [
          o.id,
          o.title,
          o.image,
          o.video_id,
          o.lesson_start_time ? Number(o.lesson_start_time) : null,
          o.lesson_end_time ? Number(o.lesson_end_time) : null,
          o.updated_at,
          o.video_type,
          o.cloudinary_public_id,
          o.cloudinary_url,
          o.script_text,
          o.script_type,
          o.category,
          o.audio_url,
          o.verified_transcript,
        ],
      );
      console.log("  updated lesson", lessonId);
    }

    // Replace segments for Harvey 15 and insert for Harvey 16
    for (const lessonId of SEGMENT_LESSON_IDS) {
      const del = await client.query(
        "DELETE FROM audio_segments WHERE lesson_id = $1",
        [lessonId],
      );
      console.log(
        `  deleted ${del.rowCount} segments for lesson ${lessonId}`,
      );

      const segRows = newSegments.rows.filter((r) => {
        const o = rowToObject(newSegments.columns, r);
        return o.lesson_id === lessonId;
      });

      for (const row of segRows) {
        const s = rowToObject(newSegments.columns, row);
        await client.query(
          `INSERT INTO audio_segments (id, lesson_id, label, start_time, end_time, position, created_at)
           VALUES ($1,$2,$3,$4,$5,$6,$7)
           ON CONFLICT (id) DO NOTHING`,
          [
            s.id,
            s.lesson_id,
            s.label,
            Number(s.start_time),
            Number(s.end_time),
            Number(s.position),
            s.created_at,
          ],
        );
      }
      console.log(`  inserted ${segRows.length} segments for lesson ${lessonId}`);
    }

    // Insert new assignments only
    for (const row of newAssignRows) {
      const a = rowToObject(newAssignments.columns, row);
      if (a.audio_file) a.audio_file = rewriteUrls(a.audio_file);

      const existsAssign = await client.query(
        "SELECT id FROM assignments WHERE id = $1",
        [a.id],
      );
      if (existsAssign.rows.length > 0) {
        console.log("  assignment exists by id, skip", a.id);
        continue;
      }

      const existsPair = await client.query(
        "SELECT id FROM assignments WHERE student_id = $1 AND lesson_id = $2",
        [a.student_id, a.lesson_id],
      );
      if (existsPair.rows.length > 0) {
        console.log(
          "  assignment exists for student+lesson, skip",
          a.id,
          `(existing ${existsPair.rows[0].id})`,
        );
        continue;
      }

      await client.query(
        `INSERT INTO assignments (
          id, student_id, lesson_id, completed, status, assigned_by,
          assigned_at, completed_at, updated_at, audio_file, feedback, list_id
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`,
        [
          a.id,
          a.student_id,
          a.lesson_id,
          a.completed === "t",
          a.status,
          a.assigned_by,
          a.assigned_at,
          a.completed_at,
          a.updated_at,
          a.audio_file,
          a.feedback,
          a.list_id,
        ],
      );
      console.log("  inserted assignment", a.id);
    }

    await client.query("COMMIT");
    console.log("  database transaction committed");
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  }
}

async function verify(client) {
  const referrals = await client.query(
    "SELECT COUNT(*)::int AS n FROM referrals",
  );
  const users = await client.query("SELECT COUNT(*)::int AS n FROM users");
  const maria = await client.query(
    "SELECT id FROM users WHERE id = $1",
    ["2260bca8-9b44-4e4a-b092-45e9fa264f4f"],
  );
  const harvey16 = await client.query(
    "SELECT id, title, cloudinary_public_id, audio_url FROM lessons WHERE id = $1",
    [NEW_LESSON_ID],
  );
  const seg15 = await client.query(
    "SELECT COUNT(*)::int AS n FROM audio_segments WHERE lesson_id = $1",
    ["01496cd8-297f-40a2-b80c-a583aea1e08f"],
  );
  const seg16 = await client.query(
    "SELECT COUNT(*)::int AS n FROM audio_segments WHERE lesson_id = $1",
    [NEW_LESSON_ID],
  );

  console.log("\n=== VERIFICATION ===");
  console.log("referrals count:", referrals.rows[0].n);
  console.log("users count:", users.rows[0].n);
  console.log("Maria user preserved:", maria.rows.length > 0);
  console.log("Harvey lesson 16:", harvey16.rows[0] || "MISSING");
  console.log("Harvey 15 segments:", seg15.rows[0].n, "(expect 11)");
  console.log("Harvey 16 segments:", seg16.rows[0].n, "(expect 27)");

  if (harvey16.rows[0]) {
    const url = harvey16.rows[0].audio_url || "";
    if (url.includes(OLD_AZURE) || url.includes(OLD_CLOUD)) {
      throw new Error("Harvey 16 still has old storage URLs");
    }
  }
}

async function main() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL missing");
  if (!NEW_CLOUD) throw new Error("CLOUDINARY_CLOUD_NAME missing");

  const oldDump = path.join(BACKEND, "../../handoff_old/shadowspeak_db_20260811.dump");
  if (!fs.existsSync(oldDump)) throw new Error("handoff_old dump missing");

  console.log("Step 1: Upload Azure audio (5 files)...");
  await uploadAzureAudio();

  console.log("Step 2: Upload Cloudinary videos (2 files)...");
  await uploadCloudinaryVideos();

  console.log("Step 3: Apply database changes...");
  const pool = new pg.Client({ connectionString: process.env.DATABASE_URL });
  await pool.connect();
  try {
    await applyDatabase(pool, oldDump);
    await verify(pool);
  } finally {
    await pool.end();
  }

  console.log("\nMigration complete.");
}

main().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
