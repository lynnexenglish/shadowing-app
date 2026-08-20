"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { mutate } from "swr";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Rating from "@mui/material/Rating";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";

import { API_PATHS } from "@/app/constants/apiKeys";
import { useSWRAxios } from "@/app/hooks/useSWRAxios";
import { useSWRMutationHook } from "@/app/hooks/useSWRMutation";

interface StudentReview {
  id: string;
  student_id: string;
  rating: number;
  review_text: string;
  display_on_website: boolean;
  submitted_at: string;
}

interface RatingFeedbackMe {
  eligible: boolean;
  review: StudentReview | null;
}

function formatDate(dateString: string, locale: string) {
  return new Date(dateString).toLocaleDateString(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function RatingsFeedbackPage() {
  const t = useTranslations("student");
  const [rating, setRating] = useState<number | null>(null);
  const [reviewText, setReviewText] = useState("");
  const [error, setError] = useState<string | null>(null);

  const { data, isLoading } = useSWRAxios<RatingFeedbackMe>(
    API_PATHS.STUDENT_RATING_FEEDBACK_ME
  );

  const { trigger, isMutating } = useSWRMutationHook<StudentReview>(
    API_PATHS.STUDENT_RATING_FEEDBACK,
    { method: "POST" },
    { throwOnError: false }
  );

  const handleSubmit = async () => {
    setError(null);
    if (!rating) {
      setError("Please select a rating.");
      return;
    }
    if (!reviewText.trim()) {
      setError("Please write your feedback.");
      return;
    }

    try {
      await trigger({ rating, review_text: reviewText.trim() });
      await mutate(API_PATHS.STUDENT_RATING_FEEDBACK_ME);
      setRating(null);
      setReviewText("");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not submit feedback."
      );
    }
  };

  const locale =
    typeof navigator !== "undefined" ? navigator.language : "en-US";

  return (
    <Box sx={{ maxWidth: 560 }}>
      <Typography
        variant="h4"
        component="h1"
        sx={{ fontWeight: 600, color: "text.primary", mb: 3 }}
      >
        {t("ratingsFeedback")}
      </Typography>

      {isLoading ? (
        <Typography color="text.secondary">...</Typography>
      ) : data?.review ? (
        <Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {t("ratingsFeedbackSubmittedOn", {
              date: formatDate(data.review.submitted_at, locale),
            })}
          </Typography>
          <Typography sx={{ fontWeight: 600, mb: 1 }}>
            {t("ratingsFeedbackRatingLabel")}
          </Typography>
          <Rating value={data.review.rating} readOnly sx={{ mb: 2 }} />
          <Typography sx={{ fontWeight: 600, mb: 1 }}>
            {t("ratingsFeedbackReviewLabel")}
          </Typography>
          <Typography sx={{ lineHeight: 1.7, color: "text.secondary" }}>
            {data.review.review_text}
          </Typography>
        </Box>
      ) : !data?.eligible ? (
        <Typography color="text.secondary">
          {t("ratingsFeedbackNotEligible")}
        </Typography>
      ) : (
        <Box>
          <Typography sx={{ fontWeight: 600, mb: 1 }}>
            {t("ratingsFeedbackRatingLabel")}
          </Typography>
          <Rating
            value={rating}
            onChange={(_, value) => setRating(value)}
            sx={{ mb: 3 }}
          />
          <TextField
            label={t("ratingsFeedbackReviewLabel")}
            multiline
            minRows={4}
            fullWidth
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            inputProps={{ maxLength: 2000 }}
            sx={{ mb: 2 }}
          />
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={isMutating}
          >
            {isMutating
              ? t("ratingsFeedbackSubmitting")
              : t("ratingsFeedbackSubmit")}
          </Button>
        </Box>
      )}
    </Box>
  );
}
