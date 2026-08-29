import pool from "../db.js";
import { QueryResult } from "pg";
import crypto from "crypto";

export type ReferralStatus =
  | "invited"
  | "joined"
  | "pending"
  | "reward_earned"
  | "rejected"
  | "cancelled";

export type RewardStatus = "pending" | "available" | "used" | "cancelled";

export interface ReferralCode {
  id: string;
  user_id: string;
  internal_id: string;
  display_code: string;
  slug: string;
  created_at: string;
}

export interface ReferralRow {
  id: string;
  referrer_user_id: string;
  referred_user_id: string | null;
  referral_code_id: string;
  status: ReferralStatus;
  friend_discount_krw: number;
  referrer_reward_krw: number;
  purchase_note: string | null;
  approved_by: string | null;
  approved_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ReferralReward {
  id: string;
  user_id: string;
  referral_id: string;
  amount_krw: number;
  status: RewardStatus;
  milestone_type: string;
  approved_by: string | null;
  approved_at: string | null;
  created_at: string;
}

const STANDARD_REWARD = 10000;
const FRIEND_DISCOUNT = 10000;

const MILESTONES = [
  { count: 3, amount: 0, type: "milestone_3", label: "FREE 1-Month Premium" },
  { count: 5, amount: 50000, type: "milestone_5", label: "₩50,000 credit" },
  {
    count: 10,
    amount: 100000,
    type: "milestone_10",
    label: "₩100,000 credit + Ambassador",
    ambassador: true,
  },
] as const;

function randomAlnum(length: number): string {
  return crypto
    .randomBytes(length)
    .toString("base64url")
    .replace(/[^a-zA-Z0-9]/g, "")
    .slice(0, length)
    .toUpperCase();
}

function sanitizeUsername(username: string): string {
  return username.replace(/[^a-zA-Z0-9]/g, "");
}

function buildDisplayCode(username: string): string {
  const clean = sanitizeUsername(username).toUpperCase().slice(0, 14);
  return `SPEAKWITH${clean || "FRIEND"}`;
}

function buildSlug(username: string): string {
  const base = sanitizeUsername(username).toLowerCase().slice(0, 12) || "user";
  return `${base}${Math.floor(Math.random() * 90 + 10)}`;
}

async function ensureUniqueSlug(baseSlug: string): Promise<string> {
  let slug = baseSlug;
  for (let i = 0; i < 8; i++) {
    const existing = await pool.query(
      "SELECT id FROM referral_codes WHERE slug = $1",
      [slug]
    );
    if (existing.rows.length === 0) return slug;
    slug = `${baseSlug}${Math.floor(Math.random() * 900 + 100)}`;
  }
  return `${baseSlug}${randomAlnum(4).toLowerCase()}`;
}

function statusRank(column: string): string {
  return `CASE ${column}
    WHEN 'reward_earned' THEN 1
    WHEN 'pending' THEN 2
    WHEN 'joined' THEN 3
    WHEN 'invited' THEN 4
    WHEN 'rejected' THEN 5
    WHEN 'cancelled' THEN 6
    ELSE 7
  END`;
}

const HIDE_STALE_ORPHAN_INVITES_SQL = `
  AND NOT (
    r.status = 'invited'
    AND r.referred_user_id IS NULL
    AND EXISTS (
      SELECT 1
      FROM referrals r2
      WHERE r2.referrer_user_id = r.referrer_user_id
        AND r2.deleted_at IS NULL
        AND r2.referred_user_id IS NOT NULL
        AND r2.id <> r.id
    )
  )
  AND NOT (
    r.status = 'invited'
    AND r.referred_user_id IS NULL
    AND EXISTS (
      SELECT 1
      FROM referrals r2
      WHERE r2.referrer_user_id = r.referrer_user_id
        AND r2.deleted_at IS NULL
        AND r2.status = 'invited'
        AND r2.referred_user_id IS NULL
        AND r2.id <> r.id
        AND r2.created_at > r.created_at
    )
  )`;

const HIDE_DUPLICATE_REFERRED_FRIEND_SQL = `
  AND NOT (
    r.referred_user_id IS NOT NULL
    AND EXISTS (
      SELECT 1
      FROM referrals r2
      WHERE r2.referrer_user_id = r.referrer_user_id
        AND r2.referred_user_id = r.referred_user_id
        AND r2.deleted_at IS NULL
        AND r2.id <> r.id
        AND (
          ${statusRank("r2.status")} < ${statusRank("r.status")}
          OR (
            ${statusRank("r2.status")} = ${statusRank("r.status")}
            AND r2.updated_at > r.updated_at
          )
        )
    )
  )`;

export const referralRepository = {
  async findCodeByUserId(userId: string): Promise<ReferralCode | null> {
    const result: QueryResult<ReferralCode> = await pool.query(
      "SELECT * FROM referral_codes WHERE user_id = $1",
      [userId]
    );
    return result.rows[0] ?? null;
  },

  async findCodeBySlug(slug: string): Promise<
    (ReferralCode & { referrer_name: string; referrer_username: string }) | null
  > {
    const result = await pool.query(
      `SELECT rc.*, u.name AS referrer_name, u.username AS referrer_username
       FROM referral_codes rc
       JOIN users u ON u.id = rc.user_id
       WHERE rc.slug = $1`,
      [slug]
    );
    return result.rows[0] ?? null;
  },

  async getOrCreateCodeForUser(
    userId: string,
    username: string
  ): Promise<ReferralCode> {
    const existing = await this.findCodeByUserId(userId);
    if (existing) return existing;

    const internalId = `RF-${randomAlnum(6)}`;
    const displayCode = buildDisplayCode(username);
    const slug = await ensureUniqueSlug(buildSlug(username));

    const result: QueryResult<ReferralCode> = await pool.query(
      `INSERT INTO referral_codes (user_id, internal_id, display_code, slug)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [userId, internalId, displayCode, slug]
    );
    return result.rows[0];
  },

  async logClick(referralCodeId: string, ipHash?: string): Promise<void> {
    await pool.query(
      `INSERT INTO referral_clicks (referral_code_id, ip_hash) VALUES ($1, $2)`,
      [referralCodeId, ipHash ?? null]
    );
  },

  async recordInvited(referralCodeId: string, referrerUserId: string): Promise<void> {
    const openInvite = await pool.query(
      `SELECT id FROM referrals
       WHERE referral_code_id = $1 AND referred_user_id IS NULL AND status = 'invited'
       ORDER BY created_at DESC LIMIT 1`,
      [referralCodeId]
    );
    if (openInvite.rows.length > 0) return;

    await pool.query(
      `INSERT INTO referrals (
         referrer_user_id, referral_code_id, status,
         friend_discount_krw, referrer_reward_krw
       ) VALUES ($1, $2, 'invited', $3, $4)`,
      [referrerUserId, referralCodeId, FRIEND_DISCOUNT, STANDARD_REWARD]
    );
  },

  async linkSignup(
    referredUserId: string,
    slug: string,
    email?: string
  ): Promise<void> {
    const code = await this.findCodeBySlug(slug);
    if (!code) return;

    if (code.user_id === referredUserId) return;

    const existingPair = await pool.query(
      `SELECT id FROM referrals
       WHERE referrer_user_id = $1
         AND referred_user_id = $2
         AND deleted_at IS NULL`,
      [code.user_id, referredUserId]
    );
    if (existingPair.rows.length > 0) return;

    const priorReferral = await pool.query(
      `SELECT id FROM referrals
       WHERE referred_user_id = $1 AND deleted_at IS NULL`,
      [referredUserId]
    );
    if (priorReferral.rows.length > 0) return;

    if (email) {
      const referrer = await pool.query(
        "SELECT email FROM users WHERE id = $1",
        [code.user_id]
      );
      const referrerEmail = referrer.rows[0]?.email;
      if (referrerEmail && referrerEmail === email) return;
    }

    const pendingInvite = await pool.query(
      `SELECT id FROM referrals
       WHERE referral_code_id = $1 AND referred_user_id IS NULL AND status = 'invited'
       ORDER BY created_at DESC LIMIT 1`,
      [code.id]
    );

    if (pendingInvite.rows.length > 0) {
      await pool.query(
        `UPDATE referrals SET referred_user_id = $1, status = 'joined', updated_at = NOW()
         WHERE id = $2`,
        [referredUserId, pendingInvite.rows[0].id]
      );
      return;
    }

    await pool.query(
      `INSERT INTO referrals (
         referrer_user_id, referred_user_id, referral_code_id, status,
         friend_discount_krw, referrer_reward_krw
       ) VALUES ($1, $2, $3, 'joined', $4, $5)`,
      [
        code.user_id,
        referredUserId,
        code.id,
        FRIEND_DISCOUNT,
        STANDARD_REWARD,
      ]
    );
  },

  async getStudentDashboard(userId: string) {
    const code = await this.findCodeByUserId(userId);
    const referrals = await pool.query(
      `SELECT r.*, u.name AS referred_name, u.username AS referred_username
       FROM referrals r
       LEFT JOIN users u ON u.id = r.referred_user_id
       WHERE r.referrer_user_id = $1
         AND r.deleted_at IS NULL
         ${HIDE_STALE_ORPHAN_INVITES_SQL}
         ${HIDE_DUPLICATE_REFERRED_FRIEND_SQL}
       ORDER BY r.created_at DESC`,
      [userId]
    );

    const rewards = await pool.query(
      `SELECT * FROM referral_rewards WHERE user_id = $1 ORDER BY created_at DESC`,
      [userId]
    );

    const successfulCount = await pool.query(
      `SELECT COUNT(*)::int AS count FROM referrals
       WHERE referrer_user_id = $1 AND status = 'reward_earned' AND deleted_at IS NULL`,
      [userId]
    );

    const wallet = this.summarizeWallet(rewards.rows);
    const count = successfulCount.rows[0]?.count ?? 0;
    const nextMilestone = MILESTONES.find((m) => m.count > count);

    const ambassador = await pool.query(
      "SELECT is_ambassador FROM users WHERE id = $1",
      [userId]
    );

    return {
      code,
      referrals: referrals.rows,
      rewards: rewards.rows,
      successfulCount: count,
      wallet,
      nextMilestone: nextMilestone
        ? {
            count: nextMilestone.count,
            remaining: nextMilestone.count - count,
            label: nextMilestone.label,
          }
        : null,
      isAmbassador: Boolean(ambassador.rows[0]?.is_ambassador),
      milestones: MILESTONES,
    };
  },

  summarizeWallet(rewards: ReferralReward[]) {
    let available = 0;
    let pending = 0;
    let lifetime = 0;

    for (const r of rewards) {
      if (r.status === "available") available += r.amount_krw;
      if (r.status === "pending") pending += r.amount_krw;
      if (r.status === "available" || r.status === "used")
        lifetime += r.amount_krw;
    }

    return { available, pending, lifetime };
  },

  async getAdminList() {
    const result = await pool.query(
      `SELECT r.*,
              referrer.name AS referrer_name,
              referrer.username AS referrer_username,
              referred.name AS referred_name,
              referred.username AS referred_username
       FROM referrals r
       JOIN users referrer ON referrer.id = r.referrer_user_id
       LEFT JOIN users referred ON referred.id = r.referred_user_id
       WHERE r.deleted_at IS NULL
         ${HIDE_STALE_ORPHAN_INVITES_SQL}
         ${HIDE_DUPLICATE_REFERRED_FRIEND_SQL}
       ORDER BY r.updated_at DESC`
    );
    return result.rows;
  },

  async getAdminDeletedList() {
    const result = await pool.query(
      `SELECT r.*,
              referrer.name AS referrer_name,
              referrer.username AS referrer_username,
              referred.name AS referred_name,
              referred.username AS referred_username
       FROM referrals r
       JOIN users referrer ON referrer.id = r.referrer_user_id
       LEFT JOIN users referred ON referred.id = r.referred_user_id
       WHERE r.deleted_at IS NOT NULL
       ORDER BY r.deleted_at DESC`
    );
    return result.rows;
  },

  async softDeleteReferrals(ids: string[]): Promise<string[]> {
    if (ids.length === 0) return [];

    const result = await pool.query(
      `UPDATE referrals
       SET deleted_at = NOW(), updated_at = NOW()
       WHERE id = ANY($1::uuid[]) AND deleted_at IS NULL
       RETURNING id`,
      [ids]
    );
    return result.rows.map((row) => row.id);
  },

  async restoreReferrals(ids: string[]): Promise<string[]> {
    if (ids.length === 0) return [];

    const result = await pool.query(
      `UPDATE referrals
       SET deleted_at = NULL, updated_at = NOW()
       WHERE id = ANY($1::uuid[]) AND deleted_at IS NOT NULL
       RETURNING id`,
      [ids]
    );
    return result.rows.map((row) => row.id);
  },

  async getAdminStats() {
    const [totals, clicks, topReferrers] = await Promise.all([
      pool.query(`
        SELECT
          COUNT(*)::int AS total,
          COUNT(*) FILTER (WHERE status = 'invited')::int AS invited,
          COUNT(*) FILTER (WHERE status = 'joined')::int AS joined,
          COUNT(*) FILTER (WHERE status = 'pending')::int AS pending,
          COUNT(*) FILTER (WHERE status = 'reward_earned')::int AS earned,
          COUNT(*) FILTER (WHERE status = 'rejected')::int AS rejected
        FROM referrals
        WHERE deleted_at IS NULL
      `),
      pool.query("SELECT COUNT(*)::int AS clicks FROM referral_clicks"),
      pool.query(`
        SELECT u.name, u.username, COUNT(r.id) FILTER (WHERE r.status = 'reward_earned')::int AS successful,
               COALESCE(SUM(rr.amount_krw) FILTER (WHERE rr.status IN ('available','used')), 0)::int AS total_earned
        FROM users u
        JOIN referrals r ON r.referrer_user_id = u.id AND r.deleted_at IS NULL
        LEFT JOIN referral_rewards rr ON rr.user_id = u.id
        GROUP BY u.id, u.name, u.username
        HAVING COUNT(r.id) FILTER (WHERE r.status = 'reward_earned') > 0
        ORDER BY successful DESC
        LIMIT 10
      `),
    ]);

    const rewardsIssued = await pool.query(
      `SELECT COALESCE(SUM(amount_krw), 0)::int AS total
       FROM referral_rewards WHERE status IN ('available', 'used', 'pending')`
    );

    return {
      referrals: totals.rows[0],
      clicks: clicks.rows[0]?.clicks ?? 0,
      rewardsIssuedKrw: rewardsIssued.rows[0]?.total ?? 0,
      topReferrers: topReferrers.rows,
    };
  },

  async markPending(
    referralId: string,
    purchaseNote?: string
  ): Promise<ReferralRow | null> {
    const result = await pool.query(
      `UPDATE referrals
       SET status = 'pending', purchase_note = COALESCE($2, purchase_note), updated_at = NOW()
       WHERE id = $1 AND status IN ('joined', 'invited') AND deleted_at IS NULL
       RETURNING *`,
      [referralId, purchaseNote ?? null]
    );
    return result.rows[0] ?? null;
  },

  async rejectReferral(
    referralId: string,
    teacherId: string
  ): Promise<ReferralRow | null> {
    const result = await pool.query(
      `UPDATE referrals
       SET status = 'rejected', approved_by = $2, approved_at = NOW(), updated_at = NOW()
       WHERE id = $1 AND status IN ('pending', 'joined', 'invited') AND deleted_at IS NULL
       RETURNING *`,
      [referralId, teacherId]
    );

    await pool.query(
      `UPDATE referral_rewards SET status = 'cancelled'
       WHERE referral_id = $1 AND status = 'pending'`,
      [referralId]
    );

    return result.rows[0] ?? null;
  },

  async approveReferral(
    referralId: string,
    teacherId: string
  ): Promise<ReferralRow | null> {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      const refResult = await client.query(
        `UPDATE referrals
         SET status = 'reward_earned', approved_by = $2, approved_at = NOW(), updated_at = NOW()
         WHERE id = $1 AND status = 'pending' AND deleted_at IS NULL
         RETURNING *`,
        [referralId, teacherId]
      );

      const referral: ReferralRow | undefined = refResult.rows[0];
      if (!referral) {
        await client.query("ROLLBACK");
        return null;
      }

      await client.query(
        `INSERT INTO referral_rewards (
           user_id, referral_id, amount_krw, status, milestone_type, approved_by, approved_at
         ) VALUES ($1, $2, $3, 'available', 'standard', $4, NOW())`,
        [
          referral.referrer_user_id,
          referral.id,
          referral.referrer_reward_krw,
          teacherId,
        ]
      );

      const countResult = await client.query(
        `SELECT COUNT(*)::int AS count FROM referrals
         WHERE referrer_user_id = $1 AND status = 'reward_earned' AND deleted_at IS NULL`,
        [referral.referrer_user_id]
      );
      const count = countResult.rows[0]?.count ?? 0;

      for (const milestone of MILESTONES) {
        if (count !== milestone.count) continue;

        const existing = await client.query(
          `SELECT id FROM referral_rewards
           WHERE user_id = $1 AND milestone_type = $2`,
          [referral.referrer_user_id, milestone.type]
        );
        if (existing.rows.length > 0) continue;

        if (milestone.amount > 0) {
          await client.query(
            `INSERT INTO referral_rewards (
               user_id, referral_id, amount_krw, status, milestone_type, approved_by, approved_at
             ) VALUES ($1, $2, $3, 'available', $4, $5, NOW())`,
            [
              referral.referrer_user_id,
              referral.id,
              milestone.amount,
              milestone.type,
              teacherId,
            ]
          );
        }

        if ("ambassador" in milestone && milestone.ambassador) {
          await client.query(
            "UPDATE users SET is_ambassador = TRUE WHERE id = $1",
            [referral.referrer_user_id]
          );
        }
      }

      await client.query("COMMIT");
      return referral;
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  },
};
