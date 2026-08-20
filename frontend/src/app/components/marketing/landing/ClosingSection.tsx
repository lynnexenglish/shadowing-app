"use client";

/**
 * ANALYSIS — Closing CTA + footer
 *
 * Was working: the gradient mesh and dot texture gave the CTA some depth, the
 * contact panel used dark glass, and the social links were present.
 *
 * Was weak:
 *  - the CTA body reused `hero.subtitle` — the fourth appearance of that exact
 *    sentence on a single page.
 *  - the contact panel was a flat four-row list: same 44px circle, same text
 *    link, four times, with the Facebook *group* missing from it entirely even
 *    though the link existed in the file.
 *  - the bottom footer was a thin strip with no navigation, so the only way
 *    back up the page from the bottom was to scroll.
 *  - three social buttons were rendered as MUI `Button`s with no accessible
 *    text, relying solely on `aria-label`.
 *
 * Plan: dedicated closing copy; the contact panel becomes a 2x2 grid of channel
 * cards, each on its own brand colour, with the Facebook group restored; and a
 * proper footer with column navigation, the payment note, and sign-in.
 */

import * as React from "react";
import Image from "next/image";
import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { motion, useReducedMotion } from "framer-motion";

import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import {
  FiArrowRight,
  FiArrowUpRight,
  FiMail,
  FiMapPin,
  FiPhone,
  FiUsers,
} from "react-icons/fi";
import { FaFacebookF, FaInstagram, FaYoutube } from "react-icons/fa";
import { SiNaver } from "react-icons/si";

import {
  CONTACT_EMAIL,
  CONTACT_PHONE_DISPLAY,
  FACEBOOK_GROUP_URL,
  FACEBOOK_PAGE_URL,
  INSTAGRAM_URL,
  LANDING_SOCIAL_LINKS,
  NAVIKX_URL,
  SOCIAL_ICON_COLORS,
  YOUTUBE_URL,
  mailto,
  mailtoGeneral,
  telKorea,
  instantActionLinkProps,
} from "./links";
import {
  Eyebrow,
  GoldButton,
  GrainOverlay,
  Magnetic,
  MeshBlob,
  Shell,
} from "./primitives";
import {
  BORDER,
  BRAND,
  brandGradient,
  displayFont,
  fadeUp,
  GOLD,
  INK,
  SHADOW,
  stagger,
  SURFACE,
  TEXT,
} from "./tokens";

const MotionBox = motion.create(Box);

const FOOTER_SOCIAL_ICONS = {
  youtube: FaYoutube,
  facebook: FaFacebookF,
  instagram: FaInstagram,
  blog: SiNaver,
} as const;
const FOOTER_LINKS = [
  { id: "home", key: "nav.home" },
  { id: "courses", key: "nav.courses" },
  { id: "coaching", key: "nav.coaching" },
  { id: "testimonials", key: "nav.testimonials" },
  { id: "about", key: "nav.about" },
  { id: "faq", key: "nav.faq" },
] as const;

function FooterHeading({ children }: { children: React.ReactNode }) {
  return (
    <Typography
      component="h3"
      sx={{
        fontSize: "0.68rem",
        fontWeight: 800,
        letterSpacing: 1.4,
        textTransform: "uppercase",
        color: TEXT.muted,
        mb: 1.75,
      }}
    >
      {children}
    </Typography>
  );
}

function FooterContactRow({
  href,
  icon,
  children,
}: {
  href?: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  const shared = {
    display: "inline-flex",
    alignItems: "center",
    gap: 1.1,
    fontSize: "0.84rem",
    fontWeight: 600,
    color: TEXT.secondary,
    lineHeight: 1.4,
    overflowWrap: "anywhere",
    textDecoration: "none",
    transition: "color 0.2s ease",
    "&:hover": href ? { color: BRAND.blue } : undefined,
  } as const;

  const iconWell = (
    <Box
      aria-hidden
      sx={{
        width: 30,
        height: 30,
        borderRadius: "50%",
        flexShrink: 0,
        display: "grid",
        placeItems: "center",
        bgcolor: SURFACE.base,
        border: `1px solid ${BORDER.light}`,
        color: INK[800],
      }}
    >
      {icon}
    </Box>
  );

  if (href) {
    return (
      <Box
        component="a"
        href={href}
        {...instantActionLinkProps(href)}
        sx={shared}
      >
        {iconWell}
        {children}
      </Box>
    );
  }

  return (
    <Box sx={shared}>
      {iconWell}
      {children}
    </Box>
  );
}

function DesignedByBadge() {
  const reduce = useReducedMotion();

  return (
    <Box
      component={motion.a}
      href={NAVIKX_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Designed by NavikX Technologies — opens navikx.com"
      whileHover={reduce ? undefined : { y: -3, scale: 1.02 }}
      whileTap={reduce ? undefined : { scale: 0.98 }}
      transition={{ type: "spring", stiffness: 420, damping: 28 }}
      sx={{
        position: "relative",
        display: "inline-flex",
        alignItems: "center",
        gap: 1.75,
        px: 2.25,
        py: 1.1,
        pr: 1.35,
        borderRadius: 999,
        textDecoration: "none",
        color: "#fff",
        overflow: "hidden",
        background: `linear-gradient(135deg, ${INK[800]} 0%, #163B52 42%, ${INK[700]} 100%)`,
        border: "1px solid rgba(255,255,255,0.16)",
        boxShadow: `${SHADOW.medium}, 0 0 0 1px rgba(43,127,255,0.08) inset`,
        transition: "box-shadow 0.35s ease, border-color 0.35s ease",
        "&::before": {
          content: '""',
          position: "absolute",
          inset: 0,
          borderRadius: "inherit",
          background: `linear-gradient(120deg, transparent 30%, rgba(255,255,255,0.09) 50%, transparent 70%)`,
          opacity: 0.7,
          pointerEvents: "none",
        },
        "&:hover": {
          borderColor: "rgba(245,166,35,0.45)",
          boxShadow: `${SHADOW.lift}, ${SHADOW.glow}`,
          "& .navikx-arrow": {
            bgcolor: GOLD.main,
            color: INK[900],
            transform: "translate(2px, -2px)",
          },
        },
        "&:focus-visible": {
          outline: `2px solid ${GOLD.main}`,
          outlineOffset: 3,
        },
      }}
    >
      <Box
        aria-hidden
        sx={{
          position: "relative",
          zIndex: 1,
          width: 38,
          height: 38,
          borderRadius: "50%",
          flexShrink: 0,
          display: "grid",
          placeItems: "center",
          background: `linear-gradient(145deg, ${GOLD.light} 0%, ${GOLD.main} 55%, ${GOLD.dark} 100%)`,
          color: INK[900],
          fontSize: "0.74rem",
          fontWeight: 900,
          letterSpacing: "-0.04em",
          boxShadow: `0 4px 14px rgba(245,166,35,0.45), inset 0 1px 0 rgba(255,255,255,0.35)`,
        }}
      >
        NX
      </Box>

      <Box sx={{ position: "relative", zIndex: 1, minWidth: 0, pr: 0.5 }}>
        <Typography
          sx={{
            fontSize: "0.52rem",
            fontWeight: 800,
            letterSpacing: 1.4,
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.52)",
            lineHeight: 1.2,
            mb: 0.2,
          }}
        >
          Designed by
        </Typography>
        <Typography
          sx={{
            fontSize: "0.86rem",
            fontWeight: 800,
            color: "#fff",
            lineHeight: 1.2,
            whiteSpace: "nowrap",
            letterSpacing: "-0.01em",
          }}
        >
          NavikX Technologies
        </Typography>
      </Box>

      <Box
        className="navikx-arrow"
        aria-hidden
        sx={{
          position: "relative",
          zIndex: 1,
          width: 34,
          height: 34,
          borderRadius: "50%",
          flexShrink: 0,
          display: "grid",
          placeItems: "center",
          bgcolor: "rgba(255,255,255,0.1)",
          border: "1px solid rgba(255,255,255,0.18)",
          color: "#fff",
          transition:
            "transform 0.3s ease, background-color 0.3s ease, color 0.3s ease",
        }}
      >
        <FiArrowUpRight size={16} strokeWidth={2.5} />
      </Box>
    </Box>
  );
}

export default function ClosingSection() {
  const t = useTranslations("landing");
  const tFooter = useTranslations("landing.footer");

  const channels = [
    {
      href: mailto(),
      icon: <FiMail size={20} />,
      label: tFooter("emailLabel"),
      value: CONTACT_EMAIL,
      color: GOLD.main,
      bg: "rgba(245,166,35,0.14)",
      border: "rgba(245,166,35,0.3)",
      external: false,
    },
    {
      href: telKorea(),
      icon: <FiPhone size={20} />,
      label: tFooter("phoneLabel"),
      value: CONTACT_PHONE_DISPLAY,
      color: SOCIAL_ICON_COLORS.phone,
      bg: "rgba(76,175,80,0.12)",
      border: "rgba(76,175,80,0.28)",
      external: false,
    },
    {
      href: YOUTUBE_URL,
      icon: <FaYoutube size={20} />,
      label: t("community.youtube"),
      value: "@FluencyAccentCoach",
      color: SOCIAL_ICON_COLORS.youtube,
      bg: "rgba(255,0,0,0.1)",
      border: "rgba(255,0,0,0.22)",
      external: true,
    },
    {
      href: FACEBOOK_PAGE_URL,
      icon: <FaFacebookF size={18} />,
      label: t("community.facebookPage"),
      value: "Analisse84",
      color: SOCIAL_ICON_COLORS.facebook,
      bg: "rgba(24,119,242,0.12)",
      border: "rgba(24,119,242,0.28)",
      external: true,
    },
    {
      href: INSTAGRAM_URL,
      icon: <FaInstagram size={20} />,
      label: t("community.instagram"),
      value: "@analisse88",
      color: SOCIAL_ICON_COLORS.instagram,
      bg: "rgba(228,64,95,0.12)",
      border: "rgba(228,64,95,0.28)",
      external: true,
    },
    {
      href: FACEBOOK_GROUP_URL,
      icon: <FiUsers size={20} />,
      label: t("community.facebookGroup"),
      value: t("proof.item6"),
      color: "#A78BFF",
      bg: "rgba(167,139,255,0.14)",
      border: "rgba(167,139,255,0.3)",
      external: true,
    },
  ];

  return (
    <>
      {/* Closing CTA */}
      <Box
        id="contact"
        component="section"
        sx={{
          position: "relative",
          overflow: "hidden",
          py: { xs: 6, md: 8 },
          color: INK[800],
          background: `linear-gradient(180deg, ${SURFACE.tinted} 0%, ${SURFACE.base} 100%)`,
        }}
      >
        <MeshBlob
          top="-14%"
          left="8%"
          size={{ xs: 300, md: 520 }}
          color={`${BRAND.blue}16`}
        />
        <MeshBlob
          bottom="-18%"
          right="4%"
          size={{ xs: 280, md: 460 }}
          color={`${BRAND.violet}12`}
          delay={2.5}
        />
        <GrainOverlay opacity={0.022} />

        <Shell>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", lg: "1fr 1.05fr" },
              gap: { xs: 4, md: 5 },
              alignItems: { xs: "stretch", md: "start" },
            }}
          >
            <MotionBox
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.25 }}
              variants={stagger}
            >
              <Eyebrow tone="gold">{tFooter("eyebrow")}</Eyebrow>

              <Typography
                component={motion.h2}
                variants={fadeUp}
                sx={{
                  fontFamily: displayFont,
                  fontWeight: 800,
                  fontSize: { xs: "2rem", md: "2.75rem" },
                  lineHeight: 1.05,
                  letterSpacing: "-0.04em",
                  color: INK[800],
                  mb: 1.75,
                }}
              >
                {tFooter("cta")}{" "}
                <Box
                  component="span"
                  sx={{
                    background: brandGradient,
                    WebkitBackgroundClip: "text",
                    backgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    color: "transparent",
                  }}
                >
                  {tFooter("ctaHighlight")}
                </Box>
              </Typography>

              <Typography
                component={motion.p}
                variants={fadeUp}
                sx={{
                  fontSize: { xs: "0.96rem", md: "1.02rem" },
                  lineHeight: 1.65,
                  color: TEXT.secondary,
                  mb: 2.5,
                  maxWidth: 480,
                }}
              >
                {tFooter("body")}
              </Typography>

              <MotionBox variants={fadeUp}>
                <Magnetic>
                  <GoldButton
                    size="md"
                    href={mailtoGeneral()}
                    endIcon={<FiArrowRight size={16} />}
                  >
                    {t("hero.cta")}
                  </GoldButton>
                </Magnetic>
              </MotionBox>

              <Typography
                component={motion.p}
                variants={fadeUp}
                sx={{
                  fontSize: "0.76rem",
                  color: TEXT.muted,
                  mt: 1.5,
                }}
              >
                {tFooter("responseNote")}
              </Typography>
            </MotionBox>

            {/* Contact channels — compact 3-column grid */}
            <MotionBox
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              variants={stagger}
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "repeat(2, 1fr)",
                  lg: "repeat(3, 1fr)",
                },
                gap: { xs: 1.25, md: 1.5 },
              }}
            >
              {channels.map((channel) => (
                <Box
                  key={channel.href}
                  component="a"
                  href={channel.href}
                  {...instantActionLinkProps(channel.href)}
                  {...(channel.external
                    ? { target: "_blank", rel: "noopener noreferrer" }
                    : {})}
                  sx={{
                    borderRadius: 3,
                    p: { xs: 1.35, md: 1.5 },
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 1.15,
                    textDecoration: "none",
                    color: INK[800],
                    bgcolor: SURFACE.white,
                    border: `1px solid ${BORDER.light}`,
                    boxShadow: "none",
                    minHeight: 0,
                    transition:
                      "border-color 0.35s ease, background-color 0.35s ease, transform 0.2s ease",
                    "@media (prefers-reduced-motion: no-preference)": {
                      "&:hover": { transform: "translateY(-2px)" },
                    },
                    "&:hover": {
                      borderColor: channel.border,
                      bgcolor: channel.bg,
                    },
                    "&:focus-visible": {
                      outline: `2px solid ${channel.color}`,
                      outlineOffset: 3,
                    },
                  }}
                >
                  <Box
                    aria-hidden
                    sx={{
                      width: 36,
                      height: 36,
                      borderRadius: "50%",
                      display: "grid",
                      placeItems: "center",
                      flexShrink: 0,
                      color: channel.color,
                      bgcolor: channel.bg,
                      border: `1px solid ${channel.border}`,
                      "& svg": { width: 16, height: 16 },
                    }}
                  >
                    {channel.icon}
                  </Box>
                  <Box sx={{ minWidth: 0, flexGrow: 1 }}>
                    <Typography
                      sx={{
                        fontWeight: 700,
                        fontSize: "0.8rem",
                        lineHeight: 1.25,
                        mb: 0.15,
                      }}
                    >
                      {channel.label}
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: "0.72rem",
                        color: TEXT.secondary,
                        lineHeight: 1.35,
                        wordBreak: "break-word",
                      }}
                    >
                      {channel.value}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      color: TEXT.muted,
                      flexShrink: 0,
                      lineHeight: 0,
                    }}
                  >
                    <FiArrowUpRight size={14} />
                  </Box>
                </Box>
              ))}
            </MotionBox>
          </Box>
        </Shell>
      </Box>

      {/* Footer */}
      <Box
        component="footer"
        sx={{
          bgcolor: SURFACE.white,
          borderTop: `1px solid ${BORDER.light}`,
        }}
      >
        <Shell>
          <Box
            sx={{
              py: { xs: 4, md: 5 },
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "1fr 1fr",
                lg: "minmax(0, 1.15fr) minmax(0, 0.85fr) minmax(0, 0.95fr)",
              },
              gap: { xs: 3.5, md: 4, lg: 5 },
            }}
          >
            <Box sx={{ gridColumn: { xs: "1", sm: "1 / -1", lg: "auto" } }}>
              <Box
                sx={{
                  position: "relative",
                  width: { xs: 156, sm: 168 },
                  height: { xs: 42, sm: 44 },
                  mb: 1.5,
                }}
              >
                <Image
                  src="/logo.png"
                  alt={t("brand")}
                  fill
                  sizes="168px"
                  style={{
                    objectFit: "contain",
                    objectPosition: "left center",
                  }}
                />
              </Box>
              <Typography
                sx={{
                  fontSize: "0.82rem",
                  color: TEXT.secondary,
                  lineHeight: 1.65,
                  maxWidth: 300,
                  mb: 2,
                }}
              >
                {t("community.subtitle")}
              </Typography>
              <Stack direction="row" spacing={0.75} sx={{ flexWrap: "wrap" }}>
                {LANDING_SOCIAL_LINKS.map((social) => {
                  const Icon = FOOTER_SOCIAL_ICONS[social.platform];
                  return (
                    <Box
                      key={social.href}
                      component="a"
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={t(`community.${social.labelKey}`)}
                      sx={{
                        width: 32,
                        height: 32,
                        borderRadius: "50%",
                        display: "grid",
                        placeItems: "center",
                        color: SOCIAL_ICON_COLORS[social.platform],
                        bgcolor: SURFACE.base,
                        border: `1px solid ${BORDER.light}`,
                        textDecoration: "none",
                        transition: "border-color 0.2s ease, opacity 0.2s ease",
                        "&:hover": {
                          borderColor: BORDER.dashed,
                          opacity: 0.88,
                        },
                      }}
                    >
                      <Icon
                        size={
                          social.platform === "facebook"
                            ? 13
                            : social.platform === "blog"
                              ? 15
                              : 14
                        }
                      />
                    </Box>
                  );
                })}
                <Box
                  component="a"
                  href={FACEBOOK_GROUP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={t("community.facebookGroup")}
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    display: "grid",
                    placeItems: "center",
                    color: "#7C6DF0",
                    bgcolor: SURFACE.base,
                    border: `1px solid ${BORDER.light}`,
                    textDecoration: "none",
                    transition: "border-color 0.2s ease, opacity 0.2s ease",
                    "&:hover": {
                      borderColor: BORDER.dashed,
                      opacity: 0.88,
                    },
                  }}
                >
                  <FiUsers size={14} />
                </Box>
              </Stack>
            </Box>

            <Box>
              <FooterHeading>{tFooter("exploreTitle")}</FooterHeading>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                  columnGap: 2,
                  rowGap: 0.85,
                }}
              >
                {FOOTER_LINKS.map((link) => (
                  <Box
                    key={link.id}
                    component="a"
                    href={`#${link.id}`}
                    sx={{
                      fontSize: "0.84rem",
                      fontWeight: 600,
                      color: TEXT.secondary,
                      textDecoration: "none",
                      transition: "color 0.2s ease",
                      "&:hover": { color: BRAND.blue },
                    }}
                  >
                    {t(link.key)}
                  </Box>
                ))}
              </Box>
            </Box>

            <Box>
              <FooterHeading>{tFooter("contactTitle")}</FooterHeading>
              <Stack spacing={1.15} alignItems="flex-start">
                <FooterContactRow href={mailto()} icon={<FiMail size={13} />}>
                  {CONTACT_EMAIL}
                </FooterContactRow>
                <FooterContactRow
                  href={telKorea()}
                  icon={<FiPhone size={13} />}
                >
                  {CONTACT_PHONE_DISPLAY}
                </FooterContactRow>
                <FooterContactRow icon={<FiMapPin size={13} />}>
                  {t("hero.location")}
                </FooterContactRow>
                <Box
                  component={Link}
                  href="/login"
                  prefetch
                  sx={{
                    mt: 0.75,
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 0.5,
                    fontSize: "0.8rem",
                    fontWeight: 700,
                    color: INK[800],
                    textDecoration: "none",
                    transition: "color 0.2s ease",
                    "&:hover": { color: BRAND.blue },
                  }}
                >
                  {tFooter("signIn")}
                  <FiArrowUpRight size={13} />
                </Box>
              </Stack>
            </Box>
          </Box>

          <Box
            sx={{
              pt: 3,
              pb: 2.25,
              borderTop: `1px solid ${BORDER.light}`,
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "1fr auto 1fr" },
              alignItems: "center",
              gap: 2,
            }}
          >
            <Typography
              sx={{
                fontSize: "0.76rem",
                color: TEXT.muted,
                textAlign: { xs: "center", sm: "left" },
              }}
            >
              © {new Date().getFullYear()} {t("brand")} {t("brandTagline")}.{" "}
              {tFooter("rights")}
            </Typography>

            <Box sx={{ justifySelf: "center" }}>
              <DesignedByBadge />
            </Box>

            <Box
              aria-hidden
              sx={{
                width: 60,
                height: 3,
                borderRadius: 999,
                background: brandGradient,
                opacity: 0.6,
                justifySelf: { xs: "center", sm: "end" },
                display: { xs: "none", sm: "block" },
              }}
            />
          </Box>
        </Shell>
      </Box>
    </>
  );
}
