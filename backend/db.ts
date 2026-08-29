import pkg from "pg";
const { Pool } = pkg;
import type { QueryResult, QueryResultRow } from "pg";
import dotenv from "dotenv";
import logger from "./helpers/logger.js";

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 60000,
  idleTimeoutMillis: 20000,
  max: 10,
  keepAlive: true,
  keepAliveInitialDelayMillis: 10000,
});

pool.on("connect", () => {
  logger.info("Connected to PostgreSQL database");
});

pool.on("error", (err: Error) => {
  logger.error("PostgreSQL connection error:", err);
});

const TRANSIENT_DB_ERRORS = [
  "Connection terminated unexpectedly",
  "Connection terminated due to connection timeout",
  "read ECONNRESET",
  "Query read timeout",
  "timeout exceeded when trying to connect",
  "ECONNRESET",
  "ETIMEDOUT",
  "socket hang up",
];

function isTransientDbError(err: unknown): boolean {
  const message = err instanceof Error ? err.message : String(err);
  return TRANSIENT_DB_ERRORS.some((token) => message.includes(token));
}

async function sleep(ms: number) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

async function queryWithRetry<R extends QueryResultRow = QueryResultRow>(
  text: string,
  params?: unknown[],
  retries = 2
): Promise<QueryResult<R>> {
  let lastError: unknown;

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      return await pool.query<R>(text, params);
    } catch (err) {
      lastError = err;
      if (!isTransientDbError(err) || attempt === retries) {
        throw err;
      }
      await sleep(400 * (attempt + 1));
    }
  }

  throw lastError;
}

const db = {
  query: queryWithRetry as typeof pool.query,
  connect: () => pool.connect(),
  end: () => pool.end(),
};

export default db;
