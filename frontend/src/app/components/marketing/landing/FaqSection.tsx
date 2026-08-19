"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { FiMinus, FiPlus } from "react-icons/fi";

import { GrainOverlay, MeshBlob, SectionHeading, Shell } from "./primitives";
import {
  BRAND,
  EASE,
  GOLD,
  INK,
  SHADOW,
  SURFACE,
  TEXT,
  glassLight,
  sectionPy,
} from "./tokens";

const MotionBox = motion.create(Box);

/** Left column first, then right — 5 items each. */
const FAQ_KEYS = [
  "whatIsIt",
  "shadowingMethod",
  "levelRequired",
  "coursesAvailable",
  "liveSessions",
  "accentTraining",
  "paymentOptions",
  "howLong",
  "refundPolicy",
  "existingStudent",
] as const;

type FaqKey = (typeof FAQ_KEYS)[number];

function FaqItem({
  faqKey,
  question,
  answer,
  open,
  onToggle,
}: {
  faqKey: FaqKey;
  question: string;
  answer: string;
  open: boolean;
  onToggle: () => void;
}) {
  const reduce = useReducedMotion();

  return (
    <Box
      component="article"
      sx={{
        borderRadius: 3.5,
        overflow: "hidden",
        transition: "box-shadow 0.35s ease, border-color 0.35s ease",
        ...(open
          ? {
              ...glassLight,
              boxShadow: SHADOW.medium,
              border: `1px solid rgba(245,166,35,0.35)`,
            }
          : {
              bgcolor: "rgba(255,255,255,0.72)",
              border: "1px solid rgba(10,37,64,0.08)",
              boxShadow: SHADOW.soft,
              "&:hover": {
                borderColor: "rgba(43,127,255,0.22)",
                boxShadow: SHADOW.medium,
              },
            }),
      }}
    >
      <Box
        component="button"
        type="button"
        id={`faq-${faqKey}-trigger`}
        aria-expanded={open}
        aria-controls={`faq-${faqKey}-panel`}
        onClick={onToggle}
        sx={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 2,
          px: { xs: 2.25, md: 2.75 },
          py: { xs: 2, md: 2.25 },
          border: "none",
          bgcolor: "transparent",
          cursor: "pointer",
          textAlign: "left",
          color: INK[900],
          "&:focus-visible": {
            outline: `2px solid ${BRAND.blue}`,
            outlineOffset: -2,
          },
        }}
      >
        <Typography
          component="span"
          sx={{
            fontWeight: 700,
            fontSize: { xs: "0.92rem", md: "0.98rem" },
            lineHeight: 1.45,
            letterSpacing: "-0.01em",
            pr: 1,
          }}
        >
          {question}
        </Typography>
        <Box
          aria-hidden
          sx={{
            flexShrink: 0,
            width: 32,
            height: 32,
            borderRadius: "50%",
            display: "grid",
            placeItems: "center",
            bgcolor: open ? "rgba(245,166,35,0.14)" : "rgba(43,127,255,0.08)",
            color: open ? GOLD.main : BRAND.blue,
            transition: "background-color 0.3s ease, color 0.3s ease",
          }}
        >
          {open ? <FiMinus size={16} /> : <FiPlus size={16} />}
        </Box>
      </Box>

      <AnimatePresence initial={false}>
        {open && (
          <MotionBox
            id={`faq-${faqKey}-panel`}
            role="region"
            aria-labelledby={`faq-${faqKey}-trigger`}
            initial={reduce ? false : { height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={reduce ? undefined : { height: 0, opacity: 0 }}
            transition={{ duration: 0.38, ease: EASE }}
            sx={{ overflow: "hidden" }}
          >
            <Typography
              sx={{
                px: { xs: 2.25, md: 2.75 },
                pb: { xs: 2.25, md: 2.75 },
                pt: 2,
                color: TEXT.secondary,
                fontSize: { xs: "0.88rem", md: "0.92rem" },
                lineHeight: 1.72,
                borderTop: `1px solid rgba(10,37,64,0.06)`,
              }}
            >
              {answer}
            </Typography>
          </MotionBox>
        )}
      </AnimatePresence>
    </Box>
  );
}

export default function FaqSection() {
  const t = useTranslations("landing.faq");
  const [openKey, setOpenKey] = React.useState<FaqKey | null>("whatIsIt");

  const leftKeys = FAQ_KEYS.slice(0, 5);
  const rightKeys = FAQ_KEYS.slice(5, 10);

  const renderColumn = (keys: readonly FaqKey[]) => (
    <Stack spacing={1.75}>
      {keys.map((key) => (
        <FaqItem
          key={key}
          faqKey={key}
          question={t(`${key}.question`)}
          answer={t(`${key}.answer`)}
          open={openKey === key}
          onToggle={() => setOpenKey((prev) => (prev === key ? null : key))}
        />
      ))}
    </Stack>
  );

  return (
    <Box
      id="faq"
      component="section"
      sx={{
        position: "relative",
        overflow: "hidden",
        py: sectionPy,
        background: `linear-gradient(180deg, ${SURFACE.tinted} 0%, ${SURFACE.base} 48%, ${SURFACE.white} 100%)`,
      }}
    >
      <MeshBlob
        top="-12%"
        left="-6%"
        size={{ xs: 260, md: 420 }}
        color={`${GOLD.main}18`}
        delay={1.5}
      />
      <MeshBlob
        bottom="-8%"
        right="-4%"
        size={{ xs: 240, md: 400 }}
        color={`${BRAND.violet}16`}
        delay={3}
      />
      <GrainOverlay />

      <Shell>
        <SectionHeading
          eyebrow={t("eyebrow")}
          title={t("title")}
          highlight={t("titleHighlight")}
          subtitle={t("subtitle")}
          align="center"
          tone="gold"
          maxWidth={560}
        />

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr" },
            gap: { xs: 1.75, lg: 2.5 },
            alignItems: "start",
          }}
        >
          {renderColumn(leftKeys)}
          {renderColumn(rightKeys)}
        </Box>
      </Shell>
    </Box>
  );
}
