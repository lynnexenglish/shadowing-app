"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { motion, useReducedMotion } from "framer-motion";

import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import {
  FiArrowRight,
  FiCheck,
  FiClock,
  FiInfo,
  FiMessageSquare,
  FiTarget,
} from "react-icons/fi";

import { mailtoCoaching } from "./links";
import {
  GhostButton,
  GoldButton,
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
  BORDER,
  sectionPy,
  type AccentTone,
} from "./tokens";

const MotionBox = motion.create(Box);

type TierKey = "starter" | "intermediate" | "advanced";

const TIERS: Array<{ key: TierKey; tone: AccentTone; featured?: boolean }> = [
  { key: "starter", tone: "cyan" },
  { key: "intermediate", tone: "gold", featured: true },
  { key: "advanced", tone: "violet" },
];

const FEATURE_KEYS = Array.from({ length: 11 }, (_, i) => `benefit${i + 1}`);
const VISIBLE_FEATURES = 3;

const PITCH_POINTS = [
  { key: "pitchPoint1", icon: <FiClock size={16} /> },
  { key: "pitchPoint2", icon: <FiTarget size={16} /> },
  { key: "pitchPoint3", icon: <FiMessageSquare size={16} /> },
] as const;

function PriceTag({
  price,
  note,
  tone,
  featured = false,
}: {
  price: string;
  note?: string;
  tone: AccentTone;
  featured?: boolean;
}) {
  const a = accentStyles[tone];
  return (
    <Stack spacing={0.5}>
      <Typography
        component="span"
        sx={{
          fontFamily: displayFont,
          fontWeight: 800,
          fontSize: { xs: "1.65rem", md: "1.85rem" },
          lineHeight: 1,
          letterSpacing: "-0.04em",
          color: featured ? GOLD.dark : a.color,
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

function SessionsBadge({
  index,
  sessions,
  tone,
}: {
  index: number;
  sessions: string;
  tone: AccentTone;
}) {
  const a = accentStyles[tone];
  return (
    <Stack
      direction="row"
      alignItems="center"
      spacing={1.25}
      sx={{
        display: "inline-flex",
        width: "fit-content",
        maxWidth: "100%",
        px: 1.5,
        py: 0.85,
        borderRadius: 999,
        flexShrink: 0,
        bgcolor: a.bg,
        border: `1px solid ${a.border}`,
        color: a.color,
      }}
    >
      <Typography
        sx={{
          fontFamily: displayFont,
          fontWeight: 800,
          fontSize: "1.1rem",
          lineHeight: 1,
          letterSpacing: "-0.03em",
        }}
      >
        {String(index + 1).padStart(2, "0")}
      </Typography>
      <Box
        aria-hidden
        sx={{
          width: "1px",
          alignSelf: "stretch",
          my: 0.25,
          bgcolor: a.border,
        }}
      />
      <Typography
        sx={{
          fontSize: "0.72rem",
          fontWeight: 700,
          letterSpacing: 0.5,
          textTransform: "uppercase",
          lineHeight: 1.2,
          whiteSpace: "nowrap",
        }}
      >
        {sessions}
      </Typography>
    </Stack>
  );
}

function TierCard({
  tierIndex,
  description,
  price,
  sessions,
  visibleFeatures,
  hasMore,
  isExpanded,
  onToggleFeatures,
  href,
  tone,
  featured,
  popularBadge,
  signUpLabel,
  includesLabel,
  showMoreLabel,
  showLessLabel,
  reduce,
}: {
  tierIndex: number;
  description: string;
  price: string;
  sessions: string;
  visibleFeatures: string[];
  hasMore: boolean;
  isExpanded: boolean;
  onToggleFeatures: () => void;
  href: string;
  tone: AccentTone;
  featured?: boolean;
  popularBadge: string;
  signUpLabel: string;
  includesLabel: string;
  showMoreLabel: string;
  showLessLabel: string;
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
        minHeight: { md: 520 },
        display: "flex",
        flexDirection: "column",
        alignSelf: "start",
        width: "100%",
        position: "relative",
        overflow: "hidden",
        borderRadius: 4,
        p: { xs: 2.75, md: 3 },
        ...glassLight,
        borderTop: `3px solid ${featured ? GOLD.main : a.color}`,
        ...(featured
          ? {
              border: `1px solid rgba(245,166,35,0.24)`,
              borderTop: `3px solid ${GOLD.main}`,
            }
          : {}),
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
      {featured && (
        <Box
          sx={{
            position: "absolute",
            top: 12,
            right: 12,
            zIndex: 2,
            px: 1.4,
            py: 0.4,
            borderRadius: 999,
            bgcolor: GOLD.main,
            color: INK[900],
            fontSize: "0.6rem",
            fontWeight: 800,
            letterSpacing: 0.8,
            textTransform: "uppercase",
          }}
        >
          {popularBadge}
        </Box>
      )}

      <Box sx={{ position: "relative", zIndex: 1, mb: 2 }}>
        <SessionsBadge index={tierIndex} sessions={sessions} tone={tone} />
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
          <PriceTag
            price={price}
            note={sessions}
            tone={tone}
            featured={featured}
          />
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

        <Stack
          spacing={1.1}
          component="ul"
          sx={{ listStyle: "none", m: 0, p: 0, flexGrow: 1 }}
        >
          {visibleFeatures.map((benefit) => (
            <Stack
              key={benefit}
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
                {benefit}
              </Typography>
            </Stack>
          ))}
          {hasMore && (
            <Box component="li" sx={{ listStyle: "none" }}>
              <Typography
                component="button"
                type="button"
                onClick={onToggleFeatures}
                sx={{
                  fontSize: "0.82rem",
                  fontWeight: 600,
                  color: a.color,
                  bgcolor: "transparent",
                  border: 0,
                  p: 0,
                  cursor: "pointer",
                  textDecoration: "underline",
                  textUnderlineOffset: "3px",
                  "&:hover": { opacity: 0.85 },
                }}
              >
                {isExpanded ? showLessLabel : showMoreLabel}
              </Typography>
            </Box>
          )}
        </Stack>

        <Box sx={{ mt: "auto", pt: 3 }}>
          {featured ? (
            <GoldButton
              href={href}
              fullWidth
              endIcon={<FiArrowRight size={15} />}
              sx={{ width: "100%" }}
            >
              {signUpLabel}
            </GoldButton>
          ) : (
            <GhostButton
              href={href}
              fullWidth
              endIcon={<FiArrowRight size={15} />}
            >
              {signUpLabel}
            </GhostButton>
          )}
        </Box>
      </Box>
    </MotionBox>
  );
}

export default function CoachingSection() {
  const t = useTranslations("landing.coachingPackages");
  const tFeatures = useTranslations("landing.coachingPackages.features");
  const reduce = useReducedMotion();
  const [expandedTiers, setExpandedTiers] = React.useState<
    Record<TierKey, boolean>
  >({
    starter: false,
    intermediate: false,
    advanced: false,
  });

  const features = FEATURE_KEYS.map((key) => tFeatures(key));
  const hasMore = features.length > VISIBLE_FEATURES;

  const toggleTierFeatures = (tier: TierKey) => {
    setExpandedTiers((prev) => ({ ...prev, [tier]: !prev[tier] }));
  };

  return (
    <Box
      id="coaching"
      component="section"
      sx={{
        position: "relative",
        overflow: "hidden",
        py: sectionPy,
        color: INK[800],
        background: `linear-gradient(180deg, ${SURFACE.tinted} 0%, ${SURFACE.base} 100%)`,
      }}
    >
      <MeshBlob
        top="-10%"
        left="-6%"
        size={{ xs: 300, md: 520 }}
        color={`${BRAND.blue}18`}
      />
      <MeshBlob
        bottom="-12%"
        right="-8%"
        size={{ xs: 280, md: 460 }}
        color={`${BRAND.violet}14`}
        delay={2.5}
      />
      <GrainOverlay opacity={0.022} />

      <Shell>
        <MotionBox
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          variants={stagger}
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              lg: "minmax(0, 1fr) minmax(0, 1fr)",
            },
            gap: { xs: 3, lg: 4 },
            alignItems: "center",
            mb: { xs: 4, md: 5 },
          }}
        >
          <SectionHeading
            eyebrow={t("eyebrow")}
            title={t("title")}
            highlight={t("titleHighlight")}
            subtitle={t("subtitle")}
            tone="gold"
            maxWidth={9999}
            sx={{ mb: 0 }}
          />

          <MotionBox
            variants={fadeUp}
            sx={{
              height: "100%",
              borderRadius: 3.5,
              p: { xs: 2.5, md: 3 },
              bgcolor: SURFACE.white,
              border: `1px solid ${BORDER.light}`,
            }}
          >
            <Typography
              sx={{
                fontFamily: displayFont,
                fontWeight: 700,
                fontSize: "1.05rem",
                lineHeight: 1.35,
                color: INK[800],
                mb: 1.25,
              }}
            >
              {t("pitchTitle")}
            </Typography>
            <Typography
              sx={{
                fontSize: "0.88rem",
                lineHeight: 1.7,
                color: TEXT.secondary,
                mb: 2.5,
              }}
            >
              {t("pitchBody")}
            </Typography>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={{ xs: 1.5, sm: 2 }}
              flexWrap="wrap"
              useFlexGap
              sx={{ mb: 2.5 }}
            >
              {PITCH_POINTS.map((point) => (
                <Stack
                  key={point.key}
                  direction="row"
                  spacing={1.5}
                  alignItems="center"
                  sx={{ flex: { sm: "1 1 0" }, minWidth: 0 }}
                >
                  <Box
                    aria-hidden
                    sx={{
                      width: 30,
                      height: 30,
                      borderRadius: "50%",
                      display: "grid",
                      placeItems: "center",
                      flexShrink: 0,
                      color: GOLD.dark,
                      bgcolor: "rgba(245,166,35,0.12)",
                      border: "1px solid rgba(245,166,35,0.24)",
                    }}
                  >
                    {point.icon}
                  </Box>
                  <Typography
                    sx={{
                      fontSize: "0.88rem",
                      fontWeight: 600,
                      color: INK[800],
                    }}
                  >
                    {t(point.key)}
                  </Typography>
                </Stack>
              ))}
            </Stack>
            <Stack direction="row" spacing={1.25} alignItems="flex-start">
              <Box sx={{ color: TEXT.muted, mt: "2px", flexShrink: 0 }}>
                <FiInfo size={14} />
              </Box>
              <Typography
                sx={{
                  fontSize: "0.76rem",
                  lineHeight: 1.6,
                  color: TEXT.muted,
                }}
              >
                {t("cancellationNote")}
              </Typography>
            </Stack>
          </MotionBox>
        </MotionBox>

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
            alignItems: "start",
          }}
        >
          {TIERS.map(({ key, tone, featured }, index) => {
            const isExpanded = expandedTiers[key];
            const visibleFeatures = isExpanded
              ? features
              : features.slice(0, VISIBLE_FEATURES);

            return (
              <TierCard
                key={key}
                tierIndex={index}
                description={t(`${key}.description`)}
                price={t(`${key}.price`)}
                sessions={t(`${key}.sessions`)}
                visibleFeatures={visibleFeatures}
                hasMore={hasMore}
                isExpanded={isExpanded}
                onToggleFeatures={() => toggleTierFeatures(key)}
                href={mailtoCoaching(t(`${key}.title`))}
                tone={tone}
                featured={featured}
                popularBadge={t("popularBadge")}
                signUpLabel={t("signUpCta")}
                includesLabel={t("includesLabel")}
                showMoreLabel={t("showMore")}
                showLessLabel={t("showLess")}
                reduce={reduce ?? false}
              />
            );
          })}
        </MotionBox>
      </Shell>
    </Box>
  );
}
