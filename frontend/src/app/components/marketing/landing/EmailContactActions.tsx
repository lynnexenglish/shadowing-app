"use client";

import type { ReactNode } from "react";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import { useTranslations } from "next-intl";
import { FiArrowRight, FiMail } from "react-icons/fi";

import {
  CONTACT_EMAIL,
  SOCIAL_ICON_COLORS,
  mailto,
  smartEmailLinkProps,
} from "./links";
import { GhostButton, GoldButton } from "./primitives";
import { TEXT } from "./tokens";

function SmartEmailAnchor({
  subject,
  children,
  sx,
}: {
  subject?: string;
  children: ReactNode;
  sx?: object;
}) {
  return (
    <Box
      component="a"
      {...smartEmailLinkProps(subject)}
      sx={{
        color: "inherit",
        textDecoration: "none",
        cursor: "pointer",
        "&:hover": { opacity: 0.88, textDecoration: "underline" },
        ...sx,
      }}
    >
      {children}
    </Box>
  );
}

export function UtilityBarEmailContact({ subject }: { subject?: string }) {
  return (
    <Stack
      direction="row"
      spacing={0.75}
      alignItems="center"
      sx={{ minWidth: 0 }}
    >
      <FiMail size={13} color={SOCIAL_ICON_COLORS.email} />
      <SmartEmailAnchor
        subject={subject}
        sx={{
          fontSize: "0.74rem",
          fontWeight: 700,
          color: "#fff",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          maxWidth: { md: 200, lg: "none" },
        }}
      >
        {CONTACT_EMAIL}
      </SmartEmailAnchor>
    </Stack>
  );
}

export function DrawerEmailContact({ subject }: { subject?: string }) {
  return (
    <Stack direction="row" spacing={1} alignItems="center">
      <FiMail size={14} color={SOCIAL_ICON_COLORS.email} />
      <SmartEmailAnchor
        subject={subject}
        sx={{
          color: "#fff",
          opacity: 0.9,
          fontSize: "0.85rem",
          fontWeight: 600,
          wordBreak: "break-all",
        }}
      >
        {CONTACT_EMAIL}
      </SmartEmailAnchor>
    </Stack>
  );
}

export function FooterEmailContact() {
  return (
    <SmartEmailAnchor
      sx={{
        fontSize: "0.84rem",
        fontWeight: 600,
        color: TEXT.secondary,
        lineHeight: 1.4,
        overflowWrap: "anywhere",
      }}
    >
      {CONTACT_EMAIL}
    </SmartEmailAnchor>
  );
}

export function EmailEnquiryButton({
  subject,
  featured = false,
  fullWidth = true,
  signUpLabel,
}: {
  subject: string;
  featured?: boolean;
  fullWidth?: boolean;
  signUpLabel: string;
}) {
  const Primary = featured ? GoldButton : GhostButton;
  const href = mailto(subject);

  return (
    <Primary
      href={href}
      fullWidth={fullWidth}
      endIcon={<FiArrowRight size={15} />}
      sx={{ width: fullWidth ? "100%" : undefined }}
    >
      {signUpLabel}
    </Primary>
  );
}

export function HeroEmailContactButton({ subject }: { subject: string }) {
  const tHero = useTranslations("landing");

  return (
    <Box
      component="a"
      {...smartEmailLinkProps(subject)}
      sx={{
        display: "inline-flex",
        width: { xs: "100%", sm: "auto" },
        alignItems: "center",
        justifyContent: "center",
        gap: 1.4,
        px: { xs: 2.75, md: 4.25 },
        py: { xs: 1.5, md: 1.95 },
        borderRadius: 999,
        backgroundImage: "linear-gradient(135deg, #6D34E0 0%, #2B7FFF 100%)",
        color: "#fff",
        fontSize: { xs: "0.9rem", md: "0.96rem" },
        fontWeight: 700,
        minHeight: 48,
        textDecoration: "none",
        boxShadow: "0 12px 30px -10px rgba(109,52,224,0.6)",
        transition:
          "transform 0.25s ease, box-shadow 0.25s ease, filter 0.25s ease",
        "@media (prefers-reduced-motion: no-preference)": {
          "&:hover": { transform: "translateY(-2px)" },
        },
        "&:hover": {
          filter: "saturate(1.08)",
          boxShadow: "0 18px 38px -12px rgba(109,52,224,0.68)",
        },
      }}
    >
      {tHero("hero.cta")}
      <FiArrowRight size={18} />
    </Box>
  );
}
