"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";

import Box from "@mui/material/Box";

import { GrainOverlay, MeshBlob, Shell, SectionHeading } from "./primitives";
import { BRAND, fadeUp, sectionPy, SURFACE } from "./tokens";

const MotionBox = motion.create(Box);

const PHONE_IMAGES = [
  { src: "/images/phone-call-1.jpg", altKey: "image1Alt" as const },
  { src: "/images/phone-call-2.jpg", altKey: "image2Alt" as const },
] as const;

export default function PhoneCallsSection() {
  const t = useTranslations("landing.phoneCalls");

  return (
    <Box
      id="phone-calls"
      component="section"
      sx={{
        position: "relative",
        overflow: "hidden",
        py: sectionPy,
        background: `linear-gradient(180deg, ${SURFACE.base} 0%, ${SURFACE.tinted} 100%)`,
      }}
    >
      <MeshBlob
        top="-8%"
        right="-6%"
        size={{ xs: 240, md: 400 }}
        color={`${BRAND.blue}16`}
      />
      <GrainOverlay opacity={0.02} />

      <Shell>
        <SectionHeading
          eyebrow={t("eyebrow")}
          title={t("title")}
          highlight={t("titleHighlight")}
          subtitle={t("subtitle")}
          tone="cyan"
        />

        <MotionBox
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.12 }}
          variants={fadeUp}
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, minmax(0, 1fr))",
            },
            gap: { xs: 2, md: 2.5 },
            alignItems: "start",
            maxWidth: { sm: 720, md: 840 },
            mx: "auto",
          }}
        >
          {PHONE_IMAGES.map(({ src, altKey }) => (
            <Box
              key={src}
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                borderRadius: 3,
                overflow: "hidden",
                bgcolor: SURFACE.white,
                boxShadow: "0 8px 32px -12px rgba(10,37,64,0.12)",
                p: { xs: 1, md: 1.25 },
              }}
            >
              <Image
                src={src}
                alt={t(altKey)}
                width={693}
                height={1024}
                sizes="(max-width: 600px) 88vw, (max-width: 900px) 44vw, 380px"
                style={{
                  width: "100%",
                  height: "auto",
                  maxHeight: "min(48vh, 420px)",
                  objectFit: "contain",
                  display: "block",
                }}
              />
            </Box>
          ))}
        </MotionBox>
      </Shell>
    </Box>
  );
}
