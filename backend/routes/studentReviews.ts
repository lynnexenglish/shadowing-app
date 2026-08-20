import { Router, Request, Response, NextFunction } from "express";
import createError from "http-errors";
import asyncHandler from "../handlers/asyncHandler.js";
import { studentReviewRepository } from "../repositories/studentReviewRepository.js";

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

router.use(requireStudent);

router.get(
  "/me",
  asyncHandler(async (req: Request, res: Response) => {
    const studentId = req.user!.id;
    const [eligible, review] = await Promise.all([
      studentReviewRepository.hasCompletedLesson(studentId),
      studentReviewRepository.findByStudentId(studentId),
    ]);

    res.json({
      success: true,
      data: { eligible, review },
    });
  })
);

router.post(
  "/",
  asyncHandler(async (req: Request, res: Response) => {
    const studentId = req.user!.id;
    const { rating, review_text: reviewText } = req.body;

    const eligible = await studentReviewRepository.hasCompletedLesson(studentId);
    if (!eligible) {
      throw createError(
        403,
        "Complete at least one lesson before submitting feedback"
      );
    }

    const existing = await studentReviewRepository.findByStudentId(studentId);
    if (existing) {
      throw createError(409, "You have already submitted your feedback");
    }

    const parsedRating = Number(rating);
    if (
      !Number.isInteger(parsedRating) ||
      parsedRating < 1 ||
      parsedRating > 5
    ) {
      throw createError(400, "Rating must be an integer from 1 to 5");
    }

    const text = typeof reviewText === "string" ? reviewText.trim() : "";
    if (!text) {
      throw createError(400, "Review text is required");
    }
    if (text.length > 2000) {
      throw createError(400, "Review must be 2000 characters or less");
    }

    const review = await studentReviewRepository.create(
      studentId,
      parsedRating,
      text
    );

    res.status(201).json({
      success: true,
      data: review,
    });
  })
);

export default router;
