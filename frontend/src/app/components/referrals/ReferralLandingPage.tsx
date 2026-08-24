"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { useSWRAxios } from "@/app/hooks/useSWRAxios";
import { API_PATHS } from "@/app/constants/apiKeys";
import api from "@/app/helpers/axiosFetch";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Container from "@mui/material/Container";
import Paper from "@mui/material/Paper";
import Skeleton from "@mui/material/Skeleton";

interface PublicReferral {
  slug: string;
  displayCode: string;
  referrerName: string;
  friendDiscountKrw: number;
}

const REF_COOKIE = "ss_ref_slug";

export default function ReferralLandingPage({ slug }: { slug: string }) {
  const t = useTranslations("referrals");
  const { data, isLoading, error } = useSWRAxios<PublicReferral>(
    API_PATHS.PUBLIC_REFERRAL(slug)
  );

  useEffect(() => {
    if (!slug) return;
    document.cookie = `${REF_COOKIE}=${encodeURIComponent(slug)}; path=/; max-age=${60 * 60 * 24 * 30}; SameSite=Lax`;
    api.post(API_PATHS.PUBLIC_REFERRAL_CLICK(slug)).catch(() => undefined);
  }, [slug]);

  const registerHref = `/register?ref=${encodeURIComponent(slug)}`;

  if (isLoading) {
    return (
      <Container maxWidth="md" sx={{ py: 6 }}>
        <Skeleton variant="rounded" height={320} />
      </Container>
    );
  }

  if (error || !data) {
    return (
      <Container maxWidth="md" sx={{ py: 6 }}>
        <Typography>Referral link not found.</Typography>
      </Container>
    );
  }

  return (
    <Box
      sx={{
        bgcolor: "background.default",
        minHeight: "100vh",
        py: { xs: 4, md: 6 },
      }}
    >
      <Container maxWidth="md">
        <Stack spacing={4}>
          <Paper sx={{ p: { xs: 3, md: 4 }, borderRadius: 3 }}>
            <Typography variant="overline" color="primary">
              {t("programName")}
            </Typography>
            <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
              {t("landingHero")}
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 2 }}>
              {t("landingSubtitle")}
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
              {t("landingDiscount")}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              {t("landingInvitedBy", { name: data.referrerName })}
            </Typography>
            <Button
              component={Link}
              href={registerHref}
              variant="contained"
              size="large"
            >
              {t("landingClaim")}
            </Button>
          </Paper>

          <Paper sx={{ p: { xs: 3, md: 4 }, borderRadius: 3 }}>
            <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
              {t("landingWhatIs")}
            </Typography>
            <Typography color="text.secondary">
              {t("landingWhatIsBody")}
            </Typography>
          </Paper>

          <Paper sx={{ p: { xs: 3, md: 4 }, borderRadius: 3 }}>
            <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
              {t("landingWhyTitle")}
            </Typography>
            <Stack spacing={1}>
              <Typography>{t("landingListen")}</Typography>
              <Typography>{t("landingShadow")}</Typography>
              <Typography>{t("landingPronunciation")}</Typography>
              <Typography>{t("landingConfidence")}</Typography>
            </Stack>
          </Paper>

          <Paper
            sx={{ p: { xs: 3, md: 4 }, borderRadius: 3, textAlign: "center" }}
          >
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
              {t("landingRewardTitle")}
            </Typography>
            <Typography
              variant="h4"
              color="primary"
              sx={{ fontWeight: 800, mb: 1 }}
            >
              ₩{data.friendDiscountKrw.toLocaleString()} OFF
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 3 }}>
              {t("landingRewardBody")}
            </Typography>
            <Button
              component={Link}
              href={registerHref}
              variant="contained"
              size="large"
            >
              {t("landingCta")}
            </Button>
          </Paper>

          <Paper sx={{ p: { xs: 3, md: 4 }, borderRadius: 3 }}>
            <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
              {t("landingHowTitle")}
            </Typography>
            <Stack spacing={1.5}>
              <Typography>1. {t("landingStep1")}</Typography>
              <Typography>2. {t("landingStep2")}</Typography>
              <Typography>3. {t("landingStep3")}</Typography>
            </Stack>
          </Paper>
        </Stack>
      </Container>
    </Box>
  );
}
