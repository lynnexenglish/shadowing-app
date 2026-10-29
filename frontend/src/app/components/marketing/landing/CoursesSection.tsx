"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { motion, useReducedMotion } from "framer-motion";

import Box from "@mui/material/Box";
import Dialog from "@mui/material/Dialog";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import {
  FiAward,
  FiBookOpen,
  FiCheck,
  FiHeadphones,
  FiX,
} from "react-icons/fi";

import { EmailEnquiryButton } from "./EmailContactActions";
import { PaypalBuyNowButton } from "./PaypalBuyNowButton";
import { PaypalSubscribeButton } from "./PaypalSubscribeButton";
import { smartEmailLinkProps } from "./links";
import {
  AccentIcon,
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

/** Cards show a short preview; ...more opens a dialog with the full details. */
const VISIBLE_BENEFITS = 2;
const COLLAPSED_DESC_LINES = 2;

const moreToggleSx = (color: string) => ({
  alignSelf: "flex-start",
  fontSize: "0.82rem",
  fontWeight: 600,
  color,
  bgcolor: "transparent",
  border: 0,
  p: 0,
  cursor: "pointer",
  textDecoration: "underline",
  textUnderlineOffset: "3px",
  "&:hover": { opacity: 0.85 },
});

function PriceTag({
  price,
  originalPrice,
  saleLabel,
  note,
  tone,
}: {
  price: string;
  originalPrice?: string;
  saleLabel?: string;
  note?: string;
  tone: AccentTone;
}) {
  const a = accentStyles[tone];
  const onSale = Boolean(originalPrice && saleLabel);

  return (
    <Stack spacing={0.85}>
      {onSale && (
        <Box
          component="span"
          sx={{
            alignSelf: "flex-start",
            px: 1.15,
            py: 0.4,
            borderRadius: 999,
            bgcolor: GOLD.main,
            color: INK[900],
            fontSize: "0.68rem",
            fontWeight: 800,
            letterSpacing: 0.7,
            textTransform: "uppercase",
            boxShadow: `0 0 0 3px ${GOLD.main}33`,
          }}
        >
          {saleLabel}
        </Box>
      )}
      <Stack
        direction="row"
        spacing={1.25}
        alignItems="baseline"
        flexWrap="wrap"
      >
        {onSale && (
          <Typography
            component="span"
            sx={{
              fontFamily: displayFont,
              fontWeight: 700,
              fontSize: { xs: "1.05rem", md: "1.15rem" },
              lineHeight: 1,
              color: TEXT.muted,
              textDecoration: "line-through",
              textDecorationThickness: 2,
            }}
          >
            {originalPrice}
          </Typography>
        )}
        <Typography
          component="span"
          sx={{
            fontFamily: displayFont,
            fontWeight: 800,
            fontSize: { xs: "1.65rem", md: "1.85rem" },
            lineHeight: 1,
            letterSpacing: "-0.04em",
            color: onSale ? GOLD.main : a.color,
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
    </Stack>
  );
}

function BenefitList({ items, tone }: { items: string[]; tone: AccentTone }) {
  const a = accentStyles[tone];
  return (
    <Stack spacing={1.1} component="ul" sx={{ listStyle: "none", m: 0, p: 0 }}>
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

type TitledItem = { title: string; text: string };

/** Full membership write-up shown in the details popup. */
type MembershipDetails = {
  tagline: string;
  introMore: string;
  includedTitle: string;
  included: TitledItem[];
  howTitle: string;
  steps: TitledItem[];
  pricingTitle: string;
  pricingLabel: string;
  pricingText: string;
  facts: { label: string; value: string }[];
  gainTitle: string;
  gains: string[];
  ctaTitle: string;
  ctaText: string;
  slogan: string;
  brandLine: string;
};

const sectionLabelSx = {
  fontSize: "0.64rem",
  fontWeight: 700,
  letterSpacing: 1.4,
  textTransform: "uppercase",
  color: TEXT.muted,
  mb: 1.5,
} as const;

function DetailsSection({
  title,
  tone,
  children,
}: {
  title: string;
  tone: AccentTone;
  children: React.ReactNode;
}) {
  const a = accentStyles[tone];
  return (
    <Box sx={{ mt: 3, pt: 2.5, borderTop: `1px solid ${a.bg}` }}>
      <Typography sx={sectionLabelSx}>{title}</Typography>
      {children}
    </Box>
  );
}

function MembershipDetailsBody({
  details,
  description,
  price,
  priceNote,
  tone,
}: {
  details: MembershipDetails;
  description: string;
  price: string;
  priceNote: string;
  tone: AccentTone;
}) {
  const a = accentStyles[tone];
  const bodySx = { fontSize: "0.9rem", color: TEXT.secondary, lineHeight: 1.7 };

  return (
    <>
      <Typography
        sx={{
          mt: 2.5,
          fontFamily: displayFont,
          fontWeight: 700,
          fontSize: "1rem",
          color: a.color,
        }}
      >
        {details.tagline}
      </Typography>
      <Stack spacing={1.25} sx={{ mt: 1 }}>
        <Typography sx={bodySx}>{description}</Typography>
        <Typography sx={bodySx}>{details.introMore}</Typography>
      </Stack>

      <DetailsSection title={details.includedTitle} tone={tone}>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
            gap: 1.5,
          }}
        >
          {details.included.map((item) => (
            <Stack key={item.title} direction="row" spacing={1.1}>
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
              <Box>
                <Typography
                  sx={{ fontSize: "0.85rem", fontWeight: 700, color: INK[800] }}
                >
                  {item.title}
                </Typography>
                <Typography
                  sx={{
                    fontSize: "0.8rem",
                    lineHeight: 1.55,
                    color: TEXT.secondary,
                  }}
                >
                  {item.text}
                </Typography>
              </Box>
            </Stack>
          ))}
        </Box>
      </DetailsSection>

      <DetailsSection title={details.howTitle} tone={tone}>
        <Stack
          component="ol"
          spacing={1.25}
          sx={{ listStyle: "none", m: 0, p: 0 }}
        >
          {details.steps.map((step, i) => (
            <Stack
              key={step.title}
              component="li"
              direction="row"
              spacing={1.25}
              alignItems="flex-start"
            >
              <Box
                aria-hidden
                sx={{
                  width: 24,
                  height: 24,
                  borderRadius: "50%",
                  display: "grid",
                  placeItems: "center",
                  flexShrink: 0,
                  bgcolor: a.color,
                  color: "#fff",
                  fontSize: "0.72rem",
                  fontWeight: 800,
                }}
              >
                {i + 1}
              </Box>
              <Typography sx={{ ...bodySx, fontSize: "0.86rem" }}>
                <Box component="strong" sx={{ color: INK[800] }}>
                  {step.title}
                </Box>{" "}
                — {step.text}
              </Typography>
            </Stack>
          ))}
        </Stack>
      </DetailsSection>

      <DetailsSection title={details.pricingTitle} tone={tone}>
        <Box sx={{ p: 2, borderRadius: 3, bgcolor: a.bg }}>
          <Typography
            sx={{ fontSize: "0.78rem", fontWeight: 700, color: INK[800] }}
          >
            {details.pricingLabel}
          </Typography>
          <Box sx={{ mt: 0.75 }}>
            <PriceTag price={price} note={priceNote} tone={tone} />
          </Box>
          <Typography sx={{ ...bodySx, fontSize: "0.84rem", mt: 1.25 }}>
            {details.pricingText}
          </Typography>
        </Box>
        <Box
          component="dl"
          sx={{
            m: 0,
            mt: 1.75,
            display: "grid",
            gridTemplateColumns: "max-content 1fr",
            columnGap: 2,
            rowGap: 1,
          }}
        >
          {details.facts.map((fact) => (
            <React.Fragment key={fact.label}>
              <Box
                component="dt"
                sx={{ fontSize: "0.82rem", fontWeight: 700, color: INK[800] }}
              >
                {fact.label}
              </Box>
              <Box
                component="dd"
                sx={{ m: 0, fontSize: "0.82rem", color: TEXT.secondary }}
              >
                {fact.value}
              </Box>
            </React.Fragment>
          ))}
        </Box>
      </DetailsSection>

      <DetailsSection title={details.gainTitle} tone={tone}>
        <BenefitList items={details.gains} tone={tone} />
      </DetailsSection>

      <Box
        sx={{
          mt: 3,
          p: 2.5,
          borderRadius: 3,
          textAlign: "center",
          border: `1px solid ${a.bg}`,
        }}
      >
        <Typography
          sx={{
            fontFamily: displayFont,
            fontWeight: 700,
            fontSize: "1.05rem",
            color: INK[800],
          }}
        >
          {details.ctaTitle}
        </Typography>
        <Typography sx={{ ...bodySx, fontSize: "0.86rem", mt: 0.75 }}>
          {details.ctaText}
        </Typography>
        <Typography
          sx={{
            mt: 1.25,
            fontWeight: 700,
            fontSize: "0.92rem",
            color: a.color,
          }}
        >
          {details.slogan}
        </Typography>
        <Typography sx={{ mt: 0.5, fontSize: "0.75rem", color: TEXT.muted }}>
          {details.brandLine}
        </Typography>
      </Box>
    </>
  );
}

function CourseDetailsDialog({
  open,
  onClose,
  title,
  description,
  price,
  originalPrice,
  saleLabel,
  priceNote,
  benefits,
  icon,
  tone,
  badge,
  includesLabel,
  closeLabel,
  membershipDetails,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description: string;
  price: string;
  originalPrice?: string;
  saleLabel?: string;
  priceNote: string;
  benefits: string[];
  icon: React.ReactNode;
  tone: AccentTone;
  badge?: string;
  includesLabel: string;
  closeLabel: string;
  membershipDetails?: MembershipDetails;
}) {
  const a = accentStyles[tone];

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      scroll="body"
      aria-labelledby={`course-details-${title}`}
      slotProps={{
        paper: {
          sx: {
            borderRadius: 4,
            borderTop: `3px solid ${a.color}`,
            bgcolor: SURFACE.base,
            backgroundImage: `radial-gradient(120% 70% at 100% 0%, ${a.bg} 0%, transparent 55%)`,
            m: { xs: 2, sm: 4 },
            width: { xs: "calc(100% - 32px)", sm: undefined },
          },
        },
      }}
    >
      <Box sx={{ position: "relative", p: { xs: 2.75, md: 3.5 } }}>
        <IconButton
          onClick={onClose}
          aria-label={closeLabel}
          sx={{ position: "absolute", top: 12, right: 12, color: TEXT.muted }}
        >
          <FiX size={20} />
        </IconButton>

        <Stack
          direction="row"
          spacing={1.75}
          alignItems="center"
          sx={{ pr: 5 }}
        >
          <AccentIcon icon={icon} tone={tone} size={48} />
          <Box sx={{ minWidth: 0 }}>
            <Typography
              id={`course-details-${title}`}
              sx={{
                fontFamily: displayFont,
                fontWeight: 700,
                fontSize: { xs: "1.15rem", md: "1.3rem" },
                color: INK[800],
                lineHeight: 1.25,
              }}
            >
              {title}
            </Typography>
            {badge && (
              <Box
                component="span"
                sx={{
                  display: "inline-block",
                  mt: 0.75,
                  px: 1.2,
                  py: 0.4,
                  borderRadius: 999,
                  bgcolor: GOLD.main,
                  color: INK[900],
                  fontSize: "0.58rem",
                  fontWeight: 800,
                  letterSpacing: 0.6,
                  textTransform: "uppercase",
                }}
              >
                {badge}
              </Box>
            )}
          </Box>
        </Stack>

        {membershipDetails ? (
          <MembershipDetailsBody
            details={membershipDetails}
            description={description}
            price={price}
            priceNote={priceNote}
            tone={tone}
          />
        ) : (
          <>
            <Box sx={{ mt: 2.5 }}>
              <PriceTag
                price={price}
                originalPrice={originalPrice}
                saleLabel={saleLabel}
                note={priceNote}
                tone={tone}
              />
            </Box>

            <Typography
              sx={{
                mt: 2.5,
                fontSize: "0.92rem",
                color: TEXT.secondary,
                lineHeight: 1.75,
              }}
            >
              {description}
            </Typography>

            <DetailsSection title={includesLabel} tone={tone}>
              <BenefitList items={benefits} tone={tone} />
            </DetailsSection>
          </>
        )}
      </Box>
    </Dialog>
  );
}

function CourseCard({
  title,
  description,
  price,
  originalPrice,
  saleLabel,
  priceNote,
  bankTransferNote,
  bankTransferCta,
  benefits,
  icon,
  tone,
  signUpLabel,
  includesLabel,
  badge,
  featured,
  reduce,
  showMoreLabel,
  closeLabel,
  subscribe,
  buyNow,
  membershipDetails,
}: {
  title: string;
  description: string;
  price: string;
  originalPrice?: string;
  saleLabel?: string;
  priceNote: string;
  bankTransferNote?: string;
  bankTransferCta?: string;
  benefits: string[];
  icon: React.ReactNode;
  tone: AccentTone;
  signUpLabel: string;
  includesLabel: string;
  badge?: string;
  featured?: boolean;
  reduce: boolean;
  showMoreLabel: string;
  closeLabel: string;
  /** Monthly membership: PayPal Subscribe button instead of the email enquiry. */
  subscribe?: React.ComponentProps<typeof PaypalSubscribeButton>;
  /** One-time courses: PayPal Buy Now button instead of the email enquiry. */
  buyNow?: Omit<React.ComponentProps<typeof PaypalBuyNowButton>, "featured">;
  membershipDetails?: MembershipDetails;
}) {
  const a = accentStyles[tone];
  const [detailsOpen, setDetailsOpen] = React.useState(false);

  const hasLongDescription = description.length > 90;
  const hasMoreDetails =
    hasLongDescription || benefits.length > VISIBLE_BENEFITS;

  return (
    <MotionBox
      className="lift-group"
      variants={fadeUp}
      whileHover={reduce ? undefined : { y: -6 }}
      transition={{ type: "spring", stiffness: 320, damping: 26 }}
      sx={{
        height: "100%",
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
      <Box sx={{ position: "relative", zIndex: 1, mb: 1.5 }}>
        <AccentIcon icon={icon} tone={tone} size={44} />
      </Box>

      <Box
        sx={{
          position: "relative",
          zIndex: 1,
          display: "flex",
          flexDirection: "column",
          flexGrow: 1,
          minWidth: 0,
          minHeight: 0,
        }}
      >
        <Stack
          direction="row"
          spacing={1}
          alignItems="flex-start"
          flexWrap="wrap"
          useFlexGap
          sx={{
            mb: 1,
            minHeight: { md: "2.5em" },
            rowGap: 0.75,
            flexShrink: 0,
          }}
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

        <Box sx={{ mb: 2, flexShrink: 0 }}>
          <Typography
            sx={{
              fontSize: "0.86rem",
              color: TEXT.secondary,
              lineHeight: 1.65,
              display: "-webkit-box",
              WebkitLineClamp: COLLAPSED_DESC_LINES,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              minHeight: `calc(0.86rem * 1.65 * ${COLLAPSED_DESC_LINES})`,
            }}
          >
            {description}
          </Typography>
          {hasLongDescription && (
            <Typography
              component="button"
              type="button"
              onClick={() => setDetailsOpen(true)}
              sx={{ ...moreToggleSx(a.color), mt: 0.75 }}
            >
              {showMoreLabel}
            </Typography>
          )}
        </Box>

        <Box sx={{ mb: 2, flexShrink: 0 }}>
          <PriceTag
            price={price}
            originalPrice={originalPrice}
            saleLabel={saleLabel}
            note={priceNote}
            tone={tone}
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

        <BenefitList items={benefits.slice(0, VISIBLE_BENEFITS)} tone={tone} />

        {hasMoreDetails && (
          <Typography
            component="button"
            type="button"
            onClick={() => setDetailsOpen(true)}
            sx={{ ...moreToggleSx(a.color), mt: 1.25 }}
          >
            {showMoreLabel}
          </Typography>
        )}

        <Box sx={{ mt: "auto", pt: 2.5 }}>
          {subscribe ? (
            <PaypalSubscribeButton {...subscribe} />
          ) : buyNow ? (
            <PaypalBuyNowButton {...buyNow} featured={featured} />
          ) : (
            <EmailEnquiryButton
              subject={`Course enquiry: ${title}`}
              signUpLabel={signUpLabel}
              featured={featured}
            />
          )}
          {bankTransferNote && bankTransferCta && (
            <Typography
              sx={{
                mt: 1.5,
                fontSize: "0.78rem",
                lineHeight: 1.55,
                color: TEXT.muted,
                textAlign: "center",
              }}
            >
              {bankTransferNote}{" "}
              <Box
                component="a"
                {...smartEmailLinkProps(`Bank transfer: ${title}`)}
                sx={{
                  color: a.color,
                  fontWeight: 700,
                  textDecoration: "underline",
                  textUnderlineOffset: "2px",
                  "&:hover": { opacity: 0.85 },
                }}
              >
                {bankTransferCta}
              </Box>
            </Typography>
          )}
        </Box>
      </Box>

      <CourseDetailsDialog
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        title={title}
        description={description}
        price={price}
        originalPrice={originalPrice}
        saleLabel={saleLabel}
        priceNote={priceNote}
        benefits={benefits}
        icon={icon}
        tone={tone}
        badge={badge}
        includesLabel={includesLabel}
        closeLabel={closeLabel}
        membershipDetails={membershipDetails}
      />
    </MotionBox>
  );
}

export default function CoursesSection() {
  const t = useTranslations("landing.courses");
  const reduce = useReducedMotion();

  const membershipDetails: MembershipDetails = {
    tagline: t("membership.tagline"),
    introMore: t("membership.introMore"),
    includedTitle: t("membership.includedTitle"),
    included: t.raw("membership.included") as TitledItem[],
    howTitle: t("membership.howTitle"),
    steps: t.raw("membership.steps") as TitledItem[],
    pricingTitle: t("membership.pricingTitle"),
    pricingLabel: t("membership.pricingLabel"),
    pricingText: t("membership.pricingText"),
    facts: t.raw("membership.facts") as MembershipDetails["facts"],
    gainTitle: t("membership.gainTitle"),
    gains: t.raw("membership.gains") as string[],
    ctaTitle: t("membership.ctaTitle"),
    ctaText: t("membership.ctaText"),
    slogan: t("membership.slogan"),
    brandLine: t("membership.brandLine"),
  };

  const course = (key: CourseKey) => ({
    title: t(`${key}.title`),
    description: t(`${key}.description`),
    price: t(`${key}.price`),
    priceNote: t(`${key}.priceNote`),
    bankTransferNote: t("bankTransferNote"),
    bankTransferCta: t("bankTransferCta"),
    ...(key === "membership"
      ? {
          subscribe: {
            successTitle: t("membership.subscribedTitle"),
            successMessage: t("membership.subscribedMessage"),
            subscriptionIdLabel: t("membership.subscriptionIdLabel"),
            errorMessage: t("membership.paypalError"),
          },
          membershipDetails,
        }
      : { buyNow: { productKey: key, label: t("paypalCta") } }),
    benefits:
      key === "membership"
        ? membershipDetails.included.map((item) => item.title)
        : [
            t(`${key}.benefit1`),
            t(`${key}.benefit2`),
            t(`${key}.benefit3`),
            t(`${key}.benefit4`),
            ...(key === "shadowing" ? [t(`${key}.benefit5`)] : []),
          ],
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
                  key === "membership"
                    ? t("membership.badge")
                    : key === "phrasalVerbs"
                      ? t("bundledCourseBadge")
                      : undefined
                }
                reduce={reduce ?? false}
                showMoreLabel={t("showMore")}
                closeLabel={t("closeDetails")}
              />
            );
          })}
        </MotionBox>
      </Shell>
    </Box>
  );
}
