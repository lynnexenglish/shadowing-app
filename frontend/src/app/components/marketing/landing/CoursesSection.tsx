"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { motion, useReducedMotion } from "framer-motion";

import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import {
  FiArrowRight,
  FiAward,
  FiBookOpen,
  FiCheck,
  FiHeadphones,
} from "react-icons/fi";

import { mailtoCourse } from "./links";
import {
  AccentIcon,
  GhostButton,
  GrainOverlay,
  MeshBlob,
  Shell,
  SectionHeading,
} from "./primitives";
import {
  accentStyles,
  BRAND,
  displayFont,
  fadeUp,
  glassLight,
  GOLD,
  hoverLiftSx,
  INK,
  stagger,
  SURFACE,
  TEXT,
  sectionPy,
  type AccentTone,
} from "./tokens";

const MotionBox = motion.create(Box);

type CourseKey = "membership" | "phrasalVerbs" | "shadowing";

const META: Record<CourseKey, { icon: React.ReactNode; tone: AccentTone }> = {
  membership: { icon: <FiAward size={24} />, tone: "gold" },
  phrasalVerbs: { icon: <FiBookOpen size={24} />, tone: "coral" },
  shadowing: { icon: <FiHeadphones size={24} />, tone: "blue" },
};

const keys: CourseKey[] = ["membership", "shadowing", "phrasalVerbs"];

function PriceTag({
  price,
  note,
  tone,
}: {
  price: string;
  note?: string;
  tone: AccentTone;
}) {
  const a = accentStyles[tone];
  return (
    <Stack direction="row" spacing={1} alignItems="baseline" flexWrap="wrap">
      <Typography
        component="span"
        sx={{
          fontFamily: displayFont,
          fontWeight: 800,
          fontSize: { xs: "1.65rem", md: "1.85rem" },
          lineHeight: 1,
          letterSpacing: "-0.04em",
          color: a.color,
        }}
      >
        {price}
      </Typography>
      {note && (
        <Typography
          component="span"
          sx={{ fontSize: "0.82rem", fontWeight: 500, color: TEXT.muted }}
        >
          {note}
        </Typography>
      )}
    </Stack>
  );
}

function BenefitList({ items, tone }: { items: string[]; tone: AccentTone }) {
  const a = accentStyles[tone];
  return (
    <Stack
      spacing={1.1}
      component="ul"
      sx={{ listStyle: "none", m: 0, p: 0, flexGrow: 1 }}
    >
      {items.map((item) => (
        <Stack
          key={item}
          component="li"
          direction="row"
          spacing={1.1}
          alignItems="flex-start"
        >
          <Box
            aria-hidden
            sx={{
              width: 18,
              height: 18,
              borderRadius: "50%",
              display: "grid",
              placeItems: "center",
              flexShrink: 0,
              mt: "2px",
              bgcolor: a.bg,
              color: a.color,
            }}
          >
            <FiCheck size={11} strokeWidth={3} />
          </Box>
          <Typography
            sx={{
              fontSize: "0.82rem",
              lineHeight: 1.55,
              color: TEXT.secondary,
            }}
          >
            {item}
          </Typography>
        </Stack>
      ))}
    </Stack>
  );
}

function CourseCard({
  title,
  description,
  price,
  priceNote,
  benefits,
  href,
  icon,
  tone,
  signUpLabel,
  includesLabel,
  badge,
  reduce,
}: {
  title: string;
  description: string;
  price: string;
  priceNote: string;
  benefits: string[];
  href: string;
  icon: React.ReactNode;
  tone: AccentTone;
  signUpLabel: string;
  includesLabel: string;
  badge?: string;
  reduce: boolean;
}) {
  const a = accentStyles[tone];

  return (
    <MotionBox
      className="lift-group"
      variants={fadeUp}
      whileHover={reduce ? undefined : { y: -6 }}
      transition={{ type: "spring", stiffness: 320, damping: 26 }}
      sx={{
        height: "100%",
        minHeight: { md: 520 },
        display: "flex",
        flexDirection: "column",
        position: "relative",
        overflow: "hidden",
        borderRadius: 4,
        p: { xs: 2.75, md: 3 },
        ...glassLight,
        borderTop: `3px solid ${a.color}`,
        ...hoverLiftSx,
        "&::after": {
          content: '""',
          position: "absolute",
          inset: 0,
          borderRadius: "inherit",
          pointerEvents: "none",
          background: `radial-gradient(120% 90% at 100% 0%, ${a.bg} 0%, transparent 60%)`,
        },
      }}
    >
      <Box sx={{ position: "relative", zIndex: 1, mb: 2 }}>
        <AccentIcon icon={icon} tone={tone} size={52} />
      </Box>

      <Box
        sx={{
          position: "relative",
          zIndex: 1,
          display: "flex",
          flexDirection: "column",
          flexGrow: 1,
          minWidth: 0,
        }}
      >
        <Stack
          direction="row"
          spacing={1}
          alignItems="flex-start"
          flexWrap="wrap"
          useFlexGap
          sx={{ mb: 1, minHeight: { md: "2.5em" }, rowGap: 0.75 }}
        >
          <Typography
            sx={{
              fontFamily: displayFont,
              fontWeight: 700,
              fontSize: { xs: "1.1rem", md: "1.2rem" },
              color: INK[800],
              lineHeight: 1.25,
              flex: "1 1 auto",
              minWidth: 0,
            }}
          >
            {title}
          </Typography>
          {badge && (
            <Box
              sx={{
                px: 1.2,
                py: 0.45,
                borderRadius: 999,
                bgcolor: GOLD.main,
                color: INK[900],
                fontSize: "0.58rem",
                fontWeight: 800,
                letterSpacing: 0.6,
                textTransform: "uppercase",
                whiteSpace: "nowrap",
                flexShrink: 0,
                mt: 0.15,
              }}
            >
              {badge}
            </Box>
          )}
        </Stack>

        <Typography
          sx={{
            fontSize: "0.86rem",
            color: TEXT.secondary,
            lineHeight: 1.65,
            mb: 2,
            minHeight: { md: "4.5em" },
          }}
        >
          {description}
        </Typography>

        <Box sx={{ mb: 2 }}>
          <PriceTag price={price} note={priceNote} tone={tone} />
        </Box>

        <Typography
          sx={{
            fontSize: "0.64rem",
            fontWeight: 700,
            letterSpacing: 1.4,
            textTransform: "uppercase",
            color: TEXT.muted,
            mb: 1.25,
          }}
        >
          {includesLabel}
        </Typography>

        <BenefitList items={benefits} tone={tone} />

        <Box sx={{ mt: "auto", pt: 3 }}>
          <GhostButton
            href={href}
            fullWidth
            endIcon={<FiArrowRight size={15} />}
          >
            {signUpLabel}
          </GhostButton>
        </Box>
      </Box>
    </MotionBox>
  );
}

export default function CoursesSection() {
  const t = useTranslations("landing.courses");
  const reduce = useReducedMotion();

  const course = (key: CourseKey) => ({
    title: t(`${key}.title`),
    description: t(`${key}.description`),
    price: t(`${key}.price`),
    priceNote: t(`${key}.priceNote`),
    benefits: [
      t(`${key}.benefit1`),
      t(`${key}.benefit2`),
      t(`${key}.benefit3`),
      ...(key === "shadowing"
        ? [t(`${key}.benefit4`), t(`${key}.benefit5`)]
        : [t(`${key}.benefit4`)]),
    ],
    href: mailtoCourse(t(`${key}.title`)),
  });

  return (
    <Box
      id="online-classes"
      component="section"
      sx={{
        position: "relative",
        overflow: "hidden",
        py: sectionPy,
        background: `linear-gradient(180deg, ${SURFACE.tinted} 0%, ${SURFACE.base} 30%, ${SURFACE.base} 100%)`,
      }}
    >
      <MeshBlob
        top="-4%"
        right="-8%"
        size={{ xs: 260, md: 460 }}
        color={`${BRAND.violet}1F`}
      />
      <MeshBlob
        bottom="8%"
        left="-10%"
        size={{ xs: 240, md: 400 }}
        color={`${GOLD.main}1A`}
        delay={3}
      />
      <GrainOverlay opacity={0.028} />

      <Shell>
        <SectionHeading
          eyebrow={t("eyebrow")}
          title={t("title")}
          highlight={t("titleHighlight")}
          subtitle={t("subtitle")}
          tone="violet"
        />

        <MotionBox
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.08 }}
          variants={stagger}
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              md: "repeat(3, minmax(0, 1fr))",
            },
            gap: { xs: 2, md: 2.5 },
            alignItems: "stretch",
          }}
        >
          {keys.map((key) => {
            const c = course(key);
            const meta = META[key];
            return (
              <CourseCard
                key={key}
                {...c}
                icon={meta.icon}
                tone={meta.tone}
                signUpLabel={t("signUpCta")}
                includesLabel={t("includesLabel")}
                badge={
                  key === "phrasalVerbs" ? t("bundledCourseBadge") : undefined
                }
                reduce={reduce ?? false}
              />
            );
          })}
        </MotionBox>
      </Shell>
    </Box>
  );
}
