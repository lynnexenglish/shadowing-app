"use client";

import { useTranslations } from "next-intl";
import { motion, useReducedMotion } from "framer-motion";

import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { FiCheck, FiClock, FiMessageSquare, FiPhone } from "react-icons/fi";

import { FastSpringCheckoutButton } from "./FastSpringCheckoutButton";
import { FASTSPRING_PRODUCTS } from "@/app/constants/fastspring";
import { GrainOverlay, MeshBlob, Shell, SectionHeading } from "./primitives";
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

type PackageKey = "basic" | "standard" | "plus" | "premium" | "intensive";

const PACKAGES: Array<{
  key: PackageKey;
  tone: AccentTone;
  featured?: boolean;
}> = [
  { key: "basic", tone: "emerald" },
  { key: "standard", tone: "blue", featured: true },
  { key: "plus", tone: "violet" },
  { key: "premium", tone: "gold" },
  { key: "intensive", tone: "coral" },
];

const PHONE_PRODUCT_PATH: Record<PackageKey, string> = {
  basic: FASTSPRING_PRODUCTS.phoneCalls.basic,
  standard: FASTSPRING_PRODUCTS.phoneCalls.standard,
  plus: FASTSPRING_PRODUCTS.phoneCalls.plus,
  premium: FASTSPRING_PRODUCTS.phoneCalls.premium,
  intensive: FASTSPRING_PRODUCTS.phoneCalls.intensive,
};

const FEATURE_KEYS = Array.from({ length: 6 }, (_, i) => `benefit${i + 1}`);

const PITCH_POINTS = [
  { key: "pitchPoint1", icon: <FiClock size={16} /> },
  { key: "pitchPoint2", icon: <FiPhone size={16} /> },
  { key: "pitchPoint3", icon: <FiMessageSquare size={16} /> },
] as const;

function PackageBadge({
  index,
  packageName,
  duration,
  tone,
}: {
  index: number;
  packageName: string;
  duration: string;
  tone: AccentTone;
}) {
  const a = accentStyles[tone];

  return (
    <Stack spacing={1.1}>
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
            fontWeight: 800,
            letterSpacing: 0.8,
            textTransform: "uppercase",
            lineHeight: 1.2,
            whiteSpace: "nowrap",
          }}
        >
          {packageName}
        </Typography>
      </Stack>
      <Typography
        sx={{
          fontSize: "0.78rem",
          fontWeight: 600,
          color: TEXT.secondary,
        }}
      >
        {duration}
      </Typography>
    </Stack>
  );
}

function PriceTag({
  price,
  note,
  tone,
  featured = false,
}: {
  price: string;
  note: string;
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
      <Typography
        component="span"
        sx={{ fontSize: "0.82rem", fontWeight: 600, color: TEXT.muted }}
      >
        {note}
      </Typography>
    </Stack>
  );
}

function PhoneTierCard({
  tierIndex,
  packageName,
  description,
  price,
  sessions,
  duration,
  features,
  productPath,
  tone,
  featured,
  popularBadge,
  signUpLabel,
  includesLabel,
  reduce,
}: {
  tierIndex: number;
  packageName: string;
  description: string;
  price: string;
  sessions: string;
  duration: string;
  features: string[];
  productPath: string;
  tone: AccentTone;
  featured?: boolean;
  popularBadge: string;
  signUpLabel: string;
  includesLabel: string;
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
        <PackageBadge
          index={tierIndex}
          packageName={packageName}
          duration={duration}
          tone={tone}
        />
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
          {features.map((benefit) => (
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
        </Stack>

        <Box sx={{ mt: "auto", pt: 3 }}>
          <FastSpringCheckoutButton
            productPath={productPath}
            label={signUpLabel}
            featured={featured}
          />
        </Box>
      </Box>
    </MotionBox>
  );
}

export default function PhoneCallsSection() {
  const t = useTranslations("landing.phoneCalls");
  const tLanding = useTranslations("landing");
  const tFeatures = useTranslations("landing.phoneCalls.features");
  const reduce = useReducedMotion();

  const features = FEATURE_KEYS.map((key) => tFeatures(key));

  return (
    <Box
      id="phone-calls"
      component="section"
      sx={{
        position: "relative",
        overflow: "hidden",
        py: sectionPy,
        color: INK[800],
        background: `linear-gradient(180deg, ${SURFACE.base} 0%, ${SURFACE.tinted} 100%)`,
      }}
    >
      <MeshBlob
        top="-8%"
        right="-6%"
        size={{ xs: 240, md: 400 }}
        color={`${BRAND.blue}16`}
      />
      <MeshBlob
        bottom="-10%"
        left="-8%"
        size={{ xs: 260, md: 420 }}
        color={`${BRAND.blue}12`}
        delay={2}
      />
      <GrainOverlay opacity={0.02} />

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
            tone="cyan"
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
                      color: BRAND.blue,
                      bgcolor: `${BRAND.blue}14`,
                      border: `1px solid ${BRAND.blue}28`,
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

            <Box
              sx={{
                display: "inline-flex",
                px: 1.75,
                py: 0.75,
                borderRadius: 999,
                bgcolor: "rgba(245,166,35,0.14)",
                border: "1px solid rgba(245,166,35,0.35)",
              }}
            >
              <Typography
                sx={{
                  fontSize: "0.82rem",
                  fontWeight: 800,
                  letterSpacing: 0.3,
                  color: GOLD.dark,
                  textTransform: "uppercase",
                }}
              >
                {t("freeAssessment")}
              </Typography>
            </Box>
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
              sm: "repeat(2, minmax(0, 1fr))",
              lg: "repeat(3, minmax(0, 1fr))",
            },
            gap: { xs: 2, md: 2.5 },
            alignItems: "start",
          }}
        >
          {PACKAGES.map(({ key, tone, featured }, index) => (
            <PhoneTierCard
              key={key}
              tierIndex={index}
              packageName={t(`packages.${key}.name`)}
              description={t(`packages.${key}.description`)}
              price={t(`packages.${key}.price`)}
              sessions={t(`packages.${key}.sessions`)}
              duration={t(`packages.${key}.duration`)}
              features={features}
              productPath={PHONE_PRODUCT_PATH[key]}
              tone={tone}
              featured={featured}
              popularBadge={t("popularBadge")}
              signUpLabel={tLanding("purchaseCta")}
              includesLabel={t("includesLabel")}
              reduce={reduce ?? false}
            />
          ))}
        </MotionBox>
      </Shell>
    </Box>
  );
}
