"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { FiHeadphones, FiMessageCircle, FiMic, FiRadio } from "react-icons/fi";

import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import { GrainOverlay, MeshBlob, SectionHeading, Shell } from "./primitives";
import {
  accentStyles,
  BORDER,
  BRAND,
  brandGradient,
  displayFont,
  fadeUp,
  INK,
  SHADOW,
  stagger,
  SURFACE,
  TEXT,
  sectionPy,
  type AccentTone,
} from "./tokens";

const MotionBox = motion.create(Box);
const MotionStack = motion.create(Stack);

const STEP_MS = 2200;

const STEPS: Array<{ key: string; icon: React.ReactNode; tone: AccentTone }> = [
  {
    key: "pronunciation",
    icon: <FiMic size={26} strokeWidth={2} />,
    tone: "blue",
  },
  {
    key: "shadowing",
    icon: <FiRadio size={26} strokeWidth={2} />,
    tone: "violet",
  },
  {
    key: "recording",
    icon: <FiHeadphones size={26} strokeWidth={2} />,
    tone: "cyan",
  },
  {
    key: "feedback",
    icon: <FiMessageCircle size={26} strokeWidth={2} />,
    tone: "coral",
  },
];

function StepIcon({
  icon,
  tone,
  isActive,
  size = 72,
}: {
  icon: React.ReactNode;
  tone: AccentTone;
  isActive: boolean;
  size?: number;
}) {
  const a = accentStyles[tone];

  return (
    <MotionStack
      alignItems="center"
      justifyContent="center"
      animate={{ scale: isActive ? 1.08 : 1 }}
      transition={{ type: "spring", stiffness: 380, damping: 26 }}
      sx={{
        position: "relative",
        width: size,
        height: size,
        borderRadius: "50%",
        flexShrink: 0,
        color: a.color,
        bgcolor: SURFACE.white,
        border: `2px solid ${isActive ? a.color : a.border}`,
        boxShadow: isActive
          ? `${a.glow}, 0 0 0 4px ${SURFACE.white}`
          : `0 0 0 4px ${SURFACE.white}, ${SHADOW.soft}`,
        transition: "border-color 0.45s ease, box-shadow 0.45s ease",
        zIndex: 2,
        isolation: "isolate",
      }}
    >
      <Box
        aria-hidden
        sx={{
          position: "absolute",
          inset: 5,
          borderRadius: "50%",
          bgcolor: a.bg,
        }}
      />
      <Box
        sx={{
          position: "relative",
          zIndex: 1,
          display: "grid",
          placeItems: "center",
        }}
      >
        {icon}
      </Box>
    </MotionStack>
  );
}

function StepCard({
  stepKey,
  index,
  tone,
  icon,
  isActive,
  layout,
}: {
  stepKey: string;
  index: number;
  tone: AccentTone;
  icon: React.ReactNode;
  isActive: boolean;
  layout: "horizontal" | "vertical";
}) {
  const t = useTranslations("landing.features");
  const a = accentStyles[tone];
  const reduce = useReducedMotion();

  return (
    <MotionBox
      animate={{ y: reduce ? 0 : isActive ? -8 : 0 }}
      transition={{ type: "spring", stiffness: 360, damping: 28 }}
      sx={{
        display: "flex",
        flexDirection: layout === "horizontal" ? "column" : "row",
        alignItems: layout === "horizontal" ? "center" : "flex-start",
        gap: layout === "horizontal" ? 0 : 2.5,
        width: "100%",
      }}
    >
      {layout === "vertical" && (
        <StepIcon icon={icon} tone={tone} isActive={isActive} size={58} />
      )}

      <Box
        sx={{
          width: "100%",
          flexGrow: 1,
          borderRadius: 3.5,
          border: `1px solid ${isActive ? a.border : BORDER.light}`,
          bgcolor: SURFACE.white,
          boxShadow: isActive ? `${SHADOW.medium}, ${a.glow}` : SHADOW.soft,
          p: layout === "horizontal" ? 3 : { xs: 2, sm: 2.75 },
          textAlign: layout === "horizontal" ? "center" : "left",
          transition: "border-color 0.45s ease, box-shadow 0.45s ease",
          ...(layout === "horizontal" ? { mt: 3 } : {}),
        }}
      >
        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
          justifyContent={layout === "horizontal" ? "center" : "flex-start"}
          sx={{ mb: 1.25 }}
        >
          <Box
            sx={{
              px: 1.1,
              py: 0.35,
              borderRadius: 999,
              fontSize: "0.62rem",
              fontWeight: 800,
              letterSpacing: 1.4,
              textTransform: "uppercase",
              color: isActive ? "#fff" : a.color,
              bgcolor: isActive ? a.color : a.bg,
              border: `1px solid ${isActive ? a.color : a.border}`,
              transition: "all 0.45s ease",
            }}
          >
            {t("stepLabel")} {index + 1}
          </Box>
        </Stack>

        <Typography
          sx={{
            fontFamily: displayFont,
            fontWeight: 800,
            fontSize: layout === "horizontal" ? "1.1rem" : "1.02rem",
            color: INK[800],
            lineHeight: 1.3,
            mb: 1.1,
          }}
        >
          {t(`${stepKey}.title`)}
        </Typography>

        <Typography
          sx={{
            fontSize: layout === "horizontal" ? "0.88rem" : "0.85rem",
            color: TEXT.secondary,
            lineHeight: 1.68,
          }}
        >
          {t(`${stepKey}.description`)}
        </Typography>
      </Box>
    </MotionBox>
  );
}

export default function PracticeSection() {
  const t = useTranslations("landing.features");
  const reduce = useReducedMotion();
  const sectionRef = React.useRef<HTMLDivElement | null>(null);
  const inView = useInView(sectionRef, { amount: 0.2, once: false });
  const [activeIndex, setActiveIndex] = React.useState(0);

  React.useEffect(() => {
    if (reduce || !inView) return;

    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % STEPS.length);
    }, STEP_MS);

    return () => window.clearInterval(timer);
  }, [reduce, inView]);

  const railFill = (activeIndex + 1) / STEPS.length;

  return (
    <Box
      id="practice"
      component="section"
      ref={sectionRef}
      sx={{
        position: "relative",
        overflow: "hidden",
        py: sectionPy,
        background: `linear-gradient(180deg, ${SURFACE.white} 0%, ${SURFACE.base} 45%, ${SURFACE.tinted} 100%)`,
      }}
    >
      <MeshBlob
        bottom="-12%"
        left="-8%"
        size={{ xs: 280, md: 460 }}
        color={`${BRAND.blue}18`}
        delay={1}
      />
      <MeshBlob
        top="4%"
        right="-5%"
        size={{ xs: 240, md: 400 }}
        color={`${BRAND.violet}14`}
        delay={2.5}
      />
      <GrainOverlay opacity={0.022} />

      <Shell>
        <SectionHeading
          eyebrow={t("eyebrow")}
          title={t("title")}
          highlight={t("titleHighlight")}
          subtitle={t("subtitle")}
          align="center"
          tone="cyan"
          maxWidth={560}
        />

        {/* Desktop — horizontal flow */}
        <Box
          sx={{ display: { xs: "none", lg: "block" }, position: "relative" }}
        >
          <Box
            aria-hidden
            sx={{
              position: "absolute",
              top: 36,
              left: "10%",
              right: "10%",
              height: 4,
              borderRadius: 999,
              bgcolor: "rgba(10,37,64,0.06)",
              zIndex: 0,
            }}
          />
          <Box
            aria-hidden
            sx={{
              position: "absolute",
              top: 36,
              left: "10%",
              width: "80%",
              height: 4,
              borderRadius: 999,
              overflow: "hidden",
              zIndex: 0,
            }}
          >
            <MotionBox
              animate={{ scaleX: reduce ? 1 : railFill }}
              transition={{ type: "spring", stiffness: 120, damping: 22 }}
              sx={{
                width: "100%",
                height: "100%",
                borderRadius: 999,
                background: brandGradient,
                boxShadow: "0 0 16px rgba(43,127,255,0.35)",
                transformOrigin: "0% 50%",
              }}
            />
          </Box>

          <MotionBox
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15 }}
            variants={stagger}
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: 2.5,
              pt: 1,
              position: "relative",
              zIndex: 1,
            }}
          >
            {STEPS.map((step, index) => {
              const isActive = activeIndex === index;

              return (
                <MotionBox
                  key={step.key}
                  variants={fadeUp}
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                  }}
                >
                  <StepIcon
                    icon={step.icon}
                    tone={step.tone}
                    isActive={isActive}
                  />
                  <StepCard
                    stepKey={step.key}
                    index={index}
                    tone={step.tone}
                    icon={step.icon}
                    isActive={isActive}
                    layout="horizontal"
                  />
                </MotionBox>
              );
            })}
          </MotionBox>
        </Box>

        {/* Mobile / tablet — vertical timeline */}
        <Box
          sx={{
            display: { xs: "block", lg: "none" },
            position: "relative",
            pl: { xs: 0.5, sm: 1 },
          }}
        >
          <Box
            aria-hidden
            sx={{
              position: "absolute",
              left: { xs: 22, sm: 28 },
              top: 28,
              bottom: 28,
              width: 4,
              borderRadius: 999,
              bgcolor: "rgba(10,37,64,0.06)",
              zIndex: 0,
            }}
          />
          <Box
            aria-hidden
            sx={{
              position: "absolute",
              left: { xs: 22, sm: 28 },
              top: 28,
              bottom: 28,
              width: 4,
              borderRadius: 999,
              overflow: "hidden",
              zIndex: 0,
            }}
          >
            <MotionBox
              animate={{ scaleY: reduce ? 1 : railFill }}
              transition={{ type: "spring", stiffness: 120, damping: 22 }}
              sx={{
                width: "100%",
                height: "100%",
                borderRadius: 999,
                background: brandGradient,
                boxShadow: "0 0 12px rgba(43,127,255,0.3)",
                transformOrigin: "0% 0%",
              }}
            />
          </Box>

          <MotionBox
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            variants={stagger}
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 2.5,
              position: "relative",
              zIndex: 1,
            }}
          >
            {STEPS.map((step, index) => (
              <MotionBox key={step.key} variants={fadeUp}>
                <StepCard
                  stepKey={step.key}
                  index={index}
                  tone={step.tone}
                  icon={step.icon}
                  isActive={activeIndex === index}
                  layout="vertical"
                />
              </MotionBox>
            ))}
          </MotionBox>
        </Box>
      </Shell>
    </Box>
  );
}
