import { Router, Request, Response } from "express";
import asyncHandler from "../handlers/asyncHandler.js";
import { studentReviewRepository } from "../repositories/studentReviewRepository.js";

const router = Router();

router.get(
  "/recent-reviews",
  asyncHandler(async (_req: Request, res: Response) => {
    const reviews = await studentReviewRepository.findPublicRecent();
    res.json({
      success: true,
      data: reviews,
    });
  })
);

export default router;
