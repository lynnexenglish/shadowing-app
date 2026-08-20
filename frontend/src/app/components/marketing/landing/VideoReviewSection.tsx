"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import YouTube from "react-youtube";
import { motion, useReducedMotion } from "framer-motion";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { FiPlay } from "react-icons/fi";

import { LISETTE_TESTIMONIAL_VIDEO_ID } from "./links";
import { Eyebrow, GrainOverlay, MeshBlob, Shell } from "./primitives";
import {
  BRAND,
  displayFont,
  fadeUp,
  glassLight,
  INK,
  SHADOW,
  slideIn,
  stagger,
  SURFACE,
  TEXT,
  BORDER,
  sectionPy,
} from "./tokens";

const MotionBox = motion.create(Box);

export default function VideoReviewSection() {
  const t = useTranslations("landing.videoReview");
  const reduce = useReducedMotion();

  return (
    <Box
      id="reviews"
      component="section"
      sx={{
        position: "relative",
        overflow: "hidden",
        py: sectionPy,
        background: `linear-gradient(180deg, ${SURFACE.white} 0%, ${SURFACE.base} 100%)`,
      }}
    >
      <MeshBlob
        top="-8%"
        right="-6%"
        size={{ xs: 260, md: 420 }}
        color={`${BRAND.violet}14`}
      />
      <MeshBlob
        bottom="-10%"
        left="-8%"
        size={{ xs: 240, md: 380 }}
        color={`${BRAND.blue}12`}
        delay={2}
      />
      <GrainOverlay opacity={0.022} />

      <Shell sx={{ position: "relative", zIndex: 1 }}>
        <MotionBox
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={stagger}
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", lg: "1fr 1.05fr" },
            gap: { xs: 4, md: 5, lg: 6 },
            alignItems: "center",
          }}
        >
          {/* Copy */}
          <MotionBox variants={slideIn(true)} sx={{ minWidth: 0 }}>
            <Eyebrow tone="violet">{t("eyebrow")}</Eyebrow>
            <Typography
              component="h2"
              sx={{
                fontFamily: displayFont,
                fontWeight: 800,
                fontSize: { xs: "1.85rem", md: "2.35rem" },
                lineHeight: 1.12,
                letterSpacing: "-0.03em",
                color: INK[800],
                mb: 2,
              }}
            >
              {t("name")}
            </Typography>
            <Typography
              sx={{
                fontSize: { xs: "0.98rem", md: "1.05rem" },
                lineHeight: 1.75,
                color: TEXT.secondary,
                textWrap: "pretty",
              }}
            >
              {t("body")}
            </Typography>
          </MotionBox>

          {/* Video */}
          <MotionBox
            variants={fadeUp}
            whileHover={reduce ? undefined : { y: -4 }}
            transition={{ type: "spring", stiffness: 320, damping: 26 }}
            sx={{
              minWidth: 0,
              borderRadius: 4,
              overflow: "hidden",
              ...glassLight,
              border: `1px solid ${BORDER.light}`,
              boxShadow: SHADOW.medium,
            }}
          >
            <Box
              sx={{
                position: "relative",
                width: "100%",
                aspectRatio: "16 / 9",
                bgcolor: INK[900],
                "& > div": {
                  width: "100% !important",
                  height: "100% !important",
                },
                "& iframe": {
                  width: "100% !important",
                  height: "100% !important",
                },
              }}
            >
              <YouTube
                videoId={LISETTE_TESTIMONIAL_VIDEO_ID}
                opts={{
                  width: "100%",
                  height: "100%",
                  playerVars: {
                    rel: 0,
                    modestbranding: 1,
                    playsinline: 1,
                  },
                }}
                style={{ width: "100%", height: "100%" }}
                title={t("videoLabel")}
                aria-label={t("videoLabel")}
              />
            </Box>
            <Box
              sx={{
                px: 2,
                py: 1.25,
                display: "flex",
                alignItems: "center",
                gap: 1,
                bgcolor: SURFACE.white,
                borderTop: `1px solid ${BORDER.light}`,
              }}
            >
              <Box
                aria-hidden
                sx={{
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  display: "grid",
                  placeItems: "center",
                  bgcolor: "rgba(43,127,255,0.1)",
                  color: BRAND.blue,
                }}
              >
                <FiPlay size={13} />
              </Box>
              <Typography
                sx={{
                  fontSize: "0.78rem",
                  fontWeight: 600,
                  color: TEXT.secondary,
                }}
              >
                {t("videoCaption")}
              </Typography>
            </Box>
          </MotionBox>
        </MotionBox>
      </Shell>
    </Box>
  );
}
