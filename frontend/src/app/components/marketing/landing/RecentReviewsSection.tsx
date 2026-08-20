"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";

import Box from "@mui/material/Box";
import Rating from "@mui/material/Rating";
import Typography from "@mui/material/Typography";
import { FiStar } from "react-icons/fi";

import { GrainOverlay, MeshBlob, SectionHeading, Shell } from "./primitives";
import {
  BRAND,
  fadeUp,
  GOLD,
  INK,
  stagger,
  SURFACE,
  TEXT,
  sectionPy,
} from "./tokens";

const MotionBox = motion.create(Box);

interface PublicReview {
  rating: number;
  review_text: string;
  author_name: string;
  submitted_at: string;
}

export default function RecentReviewsSection() {
  const t = useTranslations("landing.recentReviews");
  const [reviews, setReviews] = useState<PublicReview[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const base = process.env.NEXT_PUBLIC_API_URL || "";
    fetch(`${base}/api/public/recent-reviews`)
      .then((res) => res.json())
      .then((json) => {
        if (json?.success && Array.isArray(json.data)) {
          setReviews(json.data);
        }
      })
      .catch(() => setReviews([]))
      .finally(() => setLoaded(true));
  }, []);

  if (!loaded || reviews.length === 0) {
    return null;
  }

  return (
    <Box
      component="section"
      sx={{
        position: "relative",
        overflow: "hidden",
        py: sectionPy,
        background: `linear-gradient(180deg, ${SURFACE.base} 0%, ${SURFACE.white} 100%)`,
      }}
    >
      <MeshBlob
        top="-8%"
        right="-6%"
        size={{ xs: 240, md: 380 }}
        color={`${GOLD.main}14`}
      />
      <GrainOverlay opacity={0.02} />

      <Shell>
        <SectionHeading
          eyebrow={t("eyebrow")}
          title={t("title")}
          highlight={t("titleHighlight")}
          align="center"
          tone="gold"
          maxWidth={520}
        />

        <MotionBox
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          variants={stagger}
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, 1fr)",
              lg: "repeat(3, 1fr)",
            },
            gap: { xs: 2, md: 2.5 },
            mt: { xs: 4, md: 5 },
          }}
        >
          {reviews.map((review) => (
            <MotionBox
              key={`${review.author_name}-${review.submitted_at}`}
              variants={fadeUp}
              sx={{
                p: { xs: 2.5, md: 3 },
                borderRadius: 3,
                bgcolor: SURFACE.white,
                border: `1px solid rgba(10,37,64,0.08)`,
                boxShadow: "0 8px 24px rgba(10,37,64,0.06)",
              }}
            >
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}
              >
                <Box
                  aria-hidden
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    display: "grid",
                    placeItems: "center",
                    bgcolor: "rgba(245,166,35,0.12)",
                    color: GOLD.main,
                  }}
                >
                  <FiStar size={14} />
                </Box>
                <Typography sx={{ fontWeight: 700, color: INK[800] }}>
                  {review.author_name}
                </Typography>
              </Box>
              <Rating
                value={review.rating}
                readOnly
                size="small"
                sx={{ mb: 1.5, color: BRAND.blue }}
              />
              <Typography
                sx={{
                  fontSize: "0.92rem",
                  lineHeight: 1.65,
                  color: TEXT.secondary,
                }}
              >
                {review.review_text}
              </Typography>
            </MotionBox>
          ))}
        </MotionBox>
      </Shell>
    </Box>
  );
}
