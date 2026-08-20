"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { LuPlane } from "react-icons/lu";

import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import {
  FiAward,
  FiBriefcase,
  FiMessageCircle,
  FiUser,
  FiUsers,
} from "react-icons/fi";

import { GrainOverlay, MeshBlob, Shell } from "./primitives";
import {
  accentStyles,
  BORDER,
  BRAND,
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

/** Time each card stays highlighted before the next one activates. */
const STEP_MS = 850;

const ITEMS: Array<{
  key: string;
  tone: AccentTone;
  icon: React.ReactNode;
}> = [
  {
    key: "conversation",
    tone: "blue",
    icon: <FiMessageCircle size={28} strokeWidth={2} />,
  },
  {
    key: "oneOnOne",
    tone: "violet",
    icon: <FiUser size={28} strokeWidth={2} />,
  },
  {
    key: "group",
    tone: "emerald",
    icon: <FiUsers size={28} strokeWidth={2} />,
  },
  {
    key: "travel",
    tone: "cyan",
    icon: <LuPlane size={26} strokeWidth={2} />,
  },
  {
    key: "business",
    tone: "gold",
    icon: <FiBriefcase size={26} strokeWidth={2} />,
  },
  { key: "toeic", tone: "coral", icon: <FiAward size={26} strokeWidth={2} /> },
];

export default function OfferingsSection() {
  const t = useTranslations("landing.offerings");
  const reduce = useReducedMotion();
  const sectionRef = React.useRef<HTMLDivElement | null>(null);
  const inView = useInView(sectionRef, { amount: 0.25, once: false });
  const [activeIndex, setActiveIndex] = React.useState(0);

  React.useEffect(() => {
    if (reduce || !inView) return;

    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % ITEMS.length);
    }, STEP_MS);

    return () => window.clearInterval(timer);
  }, [reduce, inView]);

  return (
    <Box
      id="offerings"
      component="section"
      ref={sectionRef}
      sx={{
        position: "relative",
        overflow: "hidden",
        py: sectionPy,
        background: `linear-gradient(180deg, ${SURFACE.base} 0%, ${SURFACE.white} 42%, ${SURFACE.white} 100%)`,
      }}
    >
      <MeshBlob
        top="-12%"
        right="4%"
        size={{ xs: 220, md: 380 }}
        color={`${BRAND.blue}14`}
      />
      <MeshBlob
        bottom="-18%"
        left="-6%"
        size={{ xs: 200, md: 340 }}
        color={`${BRAND.violet}12`}
        delay={2}
      />
      <GrainOverlay opacity={0.02} />

      <Shell sx={{ position: "relative", zIndex: 1 }}>
        <MotionBox
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={stagger}
          sx={{ textAlign: "center", mb: { xs: 4, md: 5.5 } }}
        >
          <Typography
            component={motion.h2}
            variants={fadeUp}
            sx={{
              fontFamily: displayFont,
              fontWeight: 800,
              fontSize: { xs: "1.55rem", sm: "1.85rem", md: "2.15rem" },
              letterSpacing: "0.05em",
              textTransform: "uppercase",
              color: INK[800],
              lineHeight: 1.15,
              mb: 1.75,
            }}
          >
            {t("heading")}
          </Typography>
          <Typography
            component={motion.p}
            variants={fadeUp}
            sx={{
              fontSize: { xs: "0.95rem", md: "1.05rem" },
              lineHeight: 1.7,
              color: TEXT.secondary,
              maxWidth: 540,
              mx: "auto",
            }}
          >
            {t("subtitle")}
          </Typography>
        </MotionBox>

        <MotionBox
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.06 }}
          variants={stagger}
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "repeat(2, minmax(0, 1fr))",
              sm: "repeat(3, minmax(0, 1fr))",
              lg: "repeat(6, minmax(0, 1fr))",
            },
            gap: { xs: 1.5, md: 2, lg: 2.25 },
          }}
        >
          {ITEMS.map(({ key, tone, icon }, index) => {
            const a = accentStyles[tone];
            const isActive = activeIndex === index;

            return (
              <MotionBox
                key={key}
                variants={fadeUp}
                animate={{ y: reduce ? 0 : isActive ? -6 : 0 }}
                whileHover={reduce ? undefined : { y: -8 }}
                transition={{ type: "spring", stiffness: 380, damping: 28 }}
                sx={{
                  scrollSnapAlign: "unset",
                  minHeight: { xs: 220, sm: 260, md: 300 },
                  borderRadius: 3,
                  bgcolor: SURFACE.white,
                  px: { xs: 2, md: 2.25, lg: 2.5 },
                  py: { xs: 3, md: 3.5 },
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  textAlign: "center",
                  border: `1px solid ${isActive ? a.border : BORDER.light}`,
                  boxShadow: isActive
                    ? `${SHADOW.medium}, ${a.glow}`
                    : SHADOW.soft,
                  transition: "border-color 0.45s ease, box-shadow 0.45s ease",
                }}
              >
                <MotionStack
                  alignItems="center"
                  justifyContent="center"
                  animate={{
                    scale: reduce ? 1 : isActive ? 1.06 : 1,
                  }}
                  transition={{ type: "spring", stiffness: 380, damping: 26 }}
                  sx={{
                    width: { xs: 68, md: 76 },
                    height: { xs: 68, md: 76 },
                    borderRadius: "50%",
                    mb: 2.5,
                    flexShrink: 0,
                    color: a.color,
                    bgcolor: a.bg,
                    border: `1px solid ${isActive ? a.border : "rgba(10,37,64,0.08)"}`,
                    boxShadow: isActive
                      ? a.glow
                      : "inset 0 1px 0 rgba(255,255,255,0.85)",
                  }}
                >
                  {icon}
                </MotionStack>

                <Typography
                  sx={{
                    fontWeight: 800,
                    fontSize: { xs: "0.86rem", md: "0.92rem", lg: "0.96rem" },
                    lineHeight: 1.35,
                    color: INK[800],
                    mb: 1.25,
                    textWrap: "balance",
                  }}
                >
                  {t(`${key}.title`)}
                </Typography>

                <Typography
                  sx={{
                    fontSize: { xs: "0.78rem", md: "0.82rem" },
                    lineHeight: 1.65,
                    color: TEXT.secondary,
                    textWrap: "balance",
                    mt: "auto",
                  }}
                >
                  {t(`${key}.description`)}
                </Typography>
              </MotionBox>
            );
          })}
        </MotionBox>
      </Shell>
    </Box>
  );
}
