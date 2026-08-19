"use client";

/**
 * ANALYSIS — Testimonials
 *
 * Was working: this was already the closest section to the brief — an infinite
 * marquee that paused on hover, with varied card widths and gradient edge fades.
 *
 * Was weak:
 *  - a single row of ten quotes at 75s felt slow and left a lot of dead vertical
 *    space above and below the track.
 *  - every card had exactly the same dark-glass treatment, so "varied width" was
 *    the only variation.
 *  - no author identity beyond a name, so the wall of quotes read anonymously.
 *
 * Plan: split into two counter-scrolling rows (top left-to-right, bottom
 * right-to-left) at different speeds, which fills the space and reads as motion
 * rather than a conveyor belt. Both rows pause together on hover or keyboard
 * focus. Add an initial-avatar per author on its own accent colour, and promote
 * every third card to a gold-edged "featured" treatment for texture.
 */

import * as React from "react";
import { useTranslations } from "next-intl";
import { motion, useReducedMotion } from "framer-motion";

import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { FiStar } from "react-icons/fi";

import { GrainOverlay, MeshBlob, SectionHeading, Shell } from "./primitives";
import {
  accentStyles,
  BRAND,
  GOLD,
  INK,
  SURFACE,
  BORDER,
  sectionPy,
  type AccentTone,
} from "./tokens";

const MotionBox = motion.create(Box);

const TONES: AccentTone[] = [
  "blue",
  "violet",
  "cyan",
  "coral",
  "emerald",
  "gold",
];

type Quote = { key: string; quote: string; author: string };

function TestimonialCard({
  item,
  index,
  featured,
}: {
  item: Quote;
  index: number;
  featured: boolean;
}) {
  const reduce = useReducedMotion();
  const tone = TONES[index % TONES.length];
  const a = accentStyles[tone];

  return (
    <MotionBox
      whileHover={reduce ? undefined : { y: -6, scale: 1.015 }}
      transition={{ type: "spring", stiffness: 340, damping: 24 }}
      sx={{
        flexShrink: 0,
        width: { xs: 286, md: featured ? 380 : 330 },
        mx: { xs: 1, md: 1.25 },
        my: 1,
        p: { xs: 2.5, md: 3 },
        borderRadius: 4,
        display: "flex",
        flexDirection: "column",
        bgcolor: SURFACE.white,
        border: featured
          ? "1px solid rgba(245,166,35,0.24)"
          : `1px solid ${BORDER.light}`,
        boxShadow: "none",
        filter: "none",
      }}
    >
      <Stack direction="row" spacing={0.4} sx={{ mb: 2 }}>
        {Array.from({ length: 5 }).map((_, i) => (
          <FiStar key={i} size={13} color={GOLD.main} fill={GOLD.main} />
        ))}
      </Stack>

      <Typography
        sx={{
          color: INK[800],
          fontSize: featured ? "0.94rem" : "0.88rem",
          lineHeight: 1.75,
          flexGrow: 1,
          mb: 2.5,
        }}
      >
        &ldquo;{item.quote}&rdquo;
      </Typography>

      <Stack direction="row" spacing={1.5} alignItems="center">
        <Box
          aria-hidden
          sx={{
            width: 36,
            height: 36,
            borderRadius: "50%",
            display: "grid",
            placeItems: "center",
            flexShrink: 0,
            fontSize: "0.85rem",
            fontWeight: 800,
            color: a.color,
            bgcolor: a.bg,
            border: `1px solid ${a.border}`,
          }}
        >
          {item.author.slice(0, 1)}
        </Box>
        <Typography
          sx={{
            fontWeight: 700,
            fontSize: "0.85rem",
            color: featured ? GOLD.dark : INK[800],
          }}
        >
          {item.author}
        </Typography>
      </Stack>
    </MotionBox>
  );
}

/**
 * One marquee row. Both rows live inside a shared hover scope so hovering
 * either one pauses both — pausing only the row under the cursor looked broken.
 */
function Row({
  items,
  duration,
  reverse,
  offset,
}: {
  items: Quote[];
  duration: number;
  reverse?: boolean;
  offset: number;
}) {
  const loop = [...items, ...items];
  return (
    <Box
      className="marquee-track"
      sx={{
        display: "flex",
        alignItems: "stretch",
        width: "max-content",
        animation: `testimonialScroll ${duration}s linear infinite`,
        animationDirection: reverse ? "reverse" : "normal",
        "@keyframes testimonialScroll": {
          from: { transform: "translate3d(0,0,0)" },
          to: { transform: "translate3d(-50%,0,0)" },
        },
        "@media (prefers-reduced-motion: reduce)": {
          animation: "none",
          width: "100%",
          flexWrap: "wrap",
          justifyContent: "center",
        },
      }}
    >
      {loop.map((item, index) => (
        <TestimonialCard
          key={`${item.key}-${index}`}
          item={item}
          index={index + offset}
          featured={(index + offset) % 3 === 1}
        />
      ))}
    </Box>
  );
}

export default function TestimonialsSection() {
  const t = useTranslations("landing.testimonials");

  const all: Quote[] = [
    {
      key: "student1",
      quote: t("student1.quote"),
      author: t("student1.author"),
    },
    {
      key: "student2",
      quote: t("student2.quote"),
      author: t("student2.author"),
    },
    {
      key: "student3",
      quote: t("student3.quote"),
      author: t("student3.author"),
    },
    {
      key: "student4",
      quote: t("student4.quote"),
      author: t("student4.author"),
    },
    {
      key: "student5",
      quote: t("student5.quote"),
      author: t("student5.author"),
    },
    {
      key: "student6",
      quote: t("student6.quote"),
      author: t("student6.author"),
    },
    {
      key: "student7",
      quote: t("student7.quote"),
      author: t("student7.author"),
    },
    {
      key: "student8",
      quote: t("student8.quote"),
      author: t("student8.author"),
    },
    {
      key: "student9",
      quote: t("student9.quote"),
      author: t("student9.author"),
    },
    {
      key: "student10",
      quote: t("student10.quote"),
      author: t("student10.author"),
    },
  ];

  const topRow = all.slice(0, 5);
  const bottomRow = all.slice(5);

  return (
    <Box
      id="testimonials"
      component="section"
      sx={{
        position: "relative",
        overflow: "hidden",
        py: sectionPy,
        background: `linear-gradient(180deg, ${SURFACE.base} 0%, ${SURFACE.tinted} 100%)`,
      }}
    >
      <MeshBlob
        top="4%"
        left="-6%"
        size={{ xs: 300, md: 500 }}
        color={`${BRAND.blue}16`}
      />
      <MeshBlob
        bottom="-12%"
        right="-6%"
        size={{ xs: 280, md: 440 }}
        color={`${BRAND.violet}12`}
        delay={2.5}
      />
      <GrainOverlay opacity={0.022} />

      <Shell>
        <SectionHeading
          eyebrow={t("eyebrow")}
          title={t("title")}
          highlight={t("titleHighlight")}
          align="center"
          tone="blue"
        />
      </Shell>

      {/* Shared hover scope so both rows pause together. */}
      <Box
        sx={{
          position: "relative",
          zIndex: 1,
          display: "flex",
          flexDirection: "column",
          gap: { xs: 1, md: 1.5 },
          "&:hover .marquee-track, &:focus-within .marquee-track": {
            animationPlayState: "paused",
          },
          // Dissolve both rows into the section edges.
          maskImage:
            "linear-gradient(to right, transparent, #000 6%, #000 94%, transparent)",
          WebkitMaskImage:
            "linear-gradient(to right, transparent, #000 6%, #000 94%, transparent)",
        }}
      >
        <Box sx={{ overflow: "hidden" }}>
          <Row items={topRow} duration={58} offset={0} />
        </Box>
        <Box sx={{ overflow: "hidden" }}>
          <Row items={bottomRow} duration={72} offset={3} reverse />
        </Box>
      </Box>
    </Box>
  );
}
