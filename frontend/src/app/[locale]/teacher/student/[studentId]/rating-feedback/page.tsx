"use client";

import { use } from "react";
import { useTranslations } from "next-intl";
import { mutate } from "swr";

import Box from "@mui/material/Box";
import Rating from "@mui/material/Rating";
import Switch from "@mui/material/Switch";
import FormControlLabel from "@mui/material/FormControlLabel";
import Typography from "@mui/material/Typography";

import Breadcrumbs from "@/app/components/ui/Breadcrumbs";
import MainCard from "@/app/components/ui/MainCard";
import Transitions from "@/app/components/ui/Transitions";
import { API_PATHS } from "@/app/constants/apiKeys";
import { useSWRAxios } from "@/app/hooks/useSWRAxios";
import { useSWRMutationHook } from "@/app/hooks/useSWRMutation";
import { Student } from "@/app/Types";

interface StudentReviewWithName {
  id: string;
  student_id: string;
  rating: number;
  review_text: string;
  display_on_website: boolean;
  submitted_at: string;
  student_name: string;
}

interface RatingFeedbackPageProps {
  params: Promise<{ studentId: string }>;
}

function formatDate(dateString: string, locale: string) {
  return new Date(dateString).toLocaleDateString(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function TeacherStudentRatingFeedbackPage({
  params,
}: RatingFeedbackPageProps) {
  const { studentId: id } = use(params);
  const t = useTranslations("teacher");
  const tNav = useTranslations("navigation");

  const { data: student } = useSWRAxios<Student>(API_PATHS.TEACHER_STUDENT(id));
  const { data: review, isLoading } = useSWRAxios<StudentReviewWithName | null>(
    API_PATHS.TEACHER_STUDENT_RATING_FEEDBACK(id)
  );

  const { trigger, isMutating } = useSWRMutationHook<
    StudentReviewWithName,
    { display_on_website: boolean }
  >(
    API_PATHS.TEACHER_STUDENT_RATING_FEEDBACK_DISPLAY(id),
    { method: "PATCH" },
    { throwOnError: false }
  );

  const locale =
    typeof navigator !== "undefined" ? navigator.language : "en-US";

  const handleToggle = async (checked: boolean) => {
    await trigger({ display_on_website: checked });
    await mutate(API_PATHS.TEACHER_STUDENT_RATING_FEEDBACK(id));
  };

  return (
    <Transitions type="fade">
      <Box>
        <Breadcrumbs
          items={[
            { label: tNav("students"), href: "/teacher/students" },
            {
              label: student?.username || "...",
              href: `/teacher/student/${id}`,
            },
            { label: t("ratingFeedback") },
          ]}
        />

        <Typography variant="h4" sx={{ fontWeight: 600, mb: 3, mt: 2 }}>
          {t("ratingFeedback")}
        </Typography>

        <MainCard>
          {isLoading ? (
            <Typography color="text.secondary">...</Typography>
          ) : !review ? (
            <Typography color="text.secondary">
              {t("ratingFeedbackNone")}
            </Typography>
          ) : (
            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {t("submittedOn", {
                  date: formatDate(review.submitted_at, locale),
                })}
              </Typography>
              <Rating value={review.rating} readOnly sx={{ mb: 2 }} />
              <Typography sx={{ lineHeight: 1.7, mb: 3 }}>
                {review.review_text}
              </Typography>
              <FormControlLabel
                control={
                  <Switch
                    checked={review.display_on_website}
                    onChange={(e) => handleToggle(e.target.checked)}
                    disabled={isMutating}
                  />
                }
                label={t("displayOnWebsite")}
              />
            </Box>
          )}
        </MainCard>
      </Box>
    </Transitions>
  );
}
