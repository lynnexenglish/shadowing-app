import { Router, Request, Response } from "express";
import createError from "http-errors";
import asyncHandler from "../handlers/asyncHandler.js";
import { referralRepository } from "../repositories/referralRepository.js";
import crypto from "crypto";

const router = Router();

router.get(
  "/:slug",
  asyncHandler(async (req: Request, res: Response) => {
    const code = await referralRepository.findCodeBySlug(req.params.slug);
    if (!code) {
      throw createError(404, "Referral link not found");
    }

    res.json({
      success: true,
      data: {
        slug: code.slug,
        displayCode: code.display_code,
        referrerName: code.referrer_name,
        friendDiscountKrw: 10000,
      },
    });
  })
);

router.post(
  "/:slug/click",
  asyncHandler(async (req: Request, res: Response) => {
    const code = await referralRepository.findCodeBySlug(req.params.slug);
    if (!code) {
      throw createError(404, "Referral link not found");
    }

    const ip =
      (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
      req.socket.remoteAddress ||
      "";
    const ipHash = ip
      ? crypto.createHash("sha256").update(ip).digest("hex").slice(0, 16)
      : undefined;

    await referralRepository.logClick(code.id, ipHash);
    await referralRepository.recordInvited(code.id, code.user_id);

    res.json({
      success: true,
      data: {
        slug: code.slug,
        referrerName: code.referrer_name,
      },
    });
  })
);

export default router;
