import { Router, Request, Response, NextFunction } from "express";
import createError from "http-errors";
import asyncHandler from "../handlers/asyncHandler.js";
import { requireTeacher } from "../middleware/auth.js";
import { referralRepository } from "../repositories/referralRepository.js";

const router = Router();

function requireStudent(req: Request, res: Response, next: NextFunction) {
  if (req?.user?.role !== "student") {
    return res.status(403).json({
      success: false,
      message: "Forbidden: Students only",
    });
  }
  next();
}

router.get(
  "/me",
  requireStudent,
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const username = req.user!.username;

    await referralRepository.getOrCreateCodeForUser(userId, username);
    const dashboard = await referralRepository.getStudentDashboard(userId);

    res.json({
      success: true,
      data: dashboard,
    });
  })
);

router.get(
  "/me/message",
  requireStudent,
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const username = req.user!.username;
    const code = await referralRepository.getOrCreateCodeForUser(
      userId,
      username
    );
    const baseUrl =
      process.env.PUBLIC_SITE_URL || "https://www.shadowspeaklearn.com";
    const link = `${baseUrl}/en/ref/${code.slug}`;

    res.json({
      success: true,
      data: {
        en: `Hey! I've been using Shadowspeak to practice my English.\n\nI thought you might like it too.\n\nYou can get ₩10,000 OFF your first plan with my link: ${link}\n\nGive it a try!`,
        ko: `영어 공부하고 있으면 이거 한번 해봐!\n\nShadowspeak에서 듣기, 쉐도잉, 발음, 스피킹 연습할 수 있어.\n\n내 링크로 가입하면 ₩10,000 할인받을 수 있어!\n\n${link}`,
        link,
      },
    });
  })
);

router.get(
  "/admin",
  requireTeacher,
  asyncHandler(async (_req: Request, res: Response) => {
    const referrals = await referralRepository.getAdminList();
    res.json({ success: true, data: referrals });
  })
);

router.get(
  "/admin/stats",
  requireTeacher,
  asyncHandler(async (_req: Request, res: Response) => {
    const stats = await referralRepository.getAdminStats();
    res.json({ success: true, data: stats });
  })
);

router.get(
  "/admin/deleted",
  requireTeacher,
  asyncHandler(async (_req: Request, res: Response) => {
    const referrals = await referralRepository.getAdminDeletedList();
    res.json({ success: true, data: referrals });
  })
);

router.post(
  "/admin/delete",
  requireTeacher,
  asyncHandler(async (req: Request, res: Response) => {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.some((id) => typeof id !== "string")) {
      throw createError(400, "ids must be an array of referral ids");
    }
    const deletedIds = await referralRepository.softDeleteReferrals(ids);
    res.json({ success: true, data: { deletedIds } });
  })
);

router.post(
  "/admin/restore",
  requireTeacher,
  asyncHandler(async (req: Request, res: Response) => {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.some((id) => typeof id !== "string")) {
      throw createError(400, "ids must be an array of referral ids");
    }
    const restoredIds = await referralRepository.restoreReferrals(ids);
    res.json({ success: true, data: { restoredIds } });
  })
);

router.patch(
  "/admin/:id/mark-pending",
  requireTeacher,
  asyncHandler(async (req: Request, res: Response) => {
    const { purchase_note: purchaseNote } = req.body;
    const referral = await referralRepository.markPending(
      req.params.id,
      typeof purchaseNote === "string" ? purchaseNote : undefined
    );
    if (!referral) {
      throw createError(404, "Referral not found or cannot be marked pending");
    }
    res.json({ success: true, data: referral });
  })
);

router.patch(
  "/admin/:id/approve",
  requireTeacher,
  asyncHandler(async (req: Request, res: Response) => {
    const referral = await referralRepository.approveReferral(
      req.params.id,
      req.user!.id
    );
    if (!referral) {
      throw createError(
        404,
        "Referral not found or not in pending status"
      );
    }
    res.json({ success: true, data: referral });
  })
);

router.patch(
  "/admin/:id/reject",
  requireTeacher,
  asyncHandler(async (req: Request, res: Response) => {
    const referral = await referralRepository.rejectReferral(
      req.params.id,
      req.user!.id
    );
    if (!referral) {
      throw createError(404, "Referral not found or cannot be rejected");
    }
    res.json({ success: true, data: referral });
  })
);

export default router;
