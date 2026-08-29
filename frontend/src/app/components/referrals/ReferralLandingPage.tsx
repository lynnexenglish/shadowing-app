"use client";

import { useEffect, useMemo } from "react";
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
import Grid from "@mui/material/Grid";
import { FiMonitor, FiUsers, FiPhone, FiArrowRight } from "react-icons/fi";

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

  const courseOptions = useMemo(
    () => [
      {
        key: "online",
        href: "/#online-classes",
        Icon: FiMonitor,
        label: t("landingOnlineCourses"),
        description: t("landingOnlineCoursesDesc"),
      },
      {
        key: "offline",
        href: "/#coaching",
        Icon: FiUsers,
        label: t("landingOfflineCourses"),
        description: t("landingOfflineCoursesDesc"),
      },
      {
        key: "phone",
        href: "/#phone-calls",
        Icon: FiPhone,
        label: t("landingPhoneCallsCourses"),
        description: t("landingPhoneCallsCoursesDesc"),
      },
    ],
    [t]
  );

  if (isLoading) {
    return (
      <Container
        maxWidth="md"
        sx={{ py: 6, fontFamily: '"Century Gothic Web", sans-serif' }}
        className="referral-landing-page"
      >
        <Skeleton variant="rounded" height={320} />
      </Container>
    );
  }

  if (error || !data) {
    return (
      <Container
        maxWidth="md"
        sx={{ py: 6, fontFamily: '"Century Gothic Web", sans-serif' }}
        className="referral-landing-page"
      >
        <Typography>Referral link not found.</Typography>
      </Container>
    );
  }

  return (
    <Box
      className="referral-landing-page"
      sx={{
        fontFamily: '"Century Gothic Web", sans-serif',
        bgcolor: "background.default",
        minHeight: "100vh",
        py: { xs: 4, md: 6 },
      }}
    >
      <Container maxWidth="md">
        <Stack spacing={3}>
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
            <Typography
              variant="h5"
              sx={{ fontWeight: 700, mb: 1.5, color: "text.primary" }}
            >
              {t("landingDiscount")}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t("landingInvitedBy", { name: data.referrerName })}
            </Typography>
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
            <Typography variant="h5" sx={{ fontWeight: 600, mb: 0.5 }}>
              {t("landingCoursesTitle")}
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 3 }}>
              {t("landingCoursesSubtitle")}
            </Typography>
            <Grid container spacing={2}>
              {courseOptions.map(({ key, label, description, href, Icon }) => (
                <Grid key={key} size={{ xs: 12, md: 4 }}>
                  <Box
                    sx={{
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      p: 2.5,
                      borderRadius: 2,
                      border: "1px solid",
                      borderColor: "grey.200",
                      bgcolor: "grey.50",
                    }}
                  >
                    <Box
                      sx={{
                        width: 44,
                        height: 44,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: 2,
                        bgcolor: "primary.main",
                        color: "primary.contrastText",
                        mb: 1.5,
                      }}
                    >
                      <Icon size={22} />
                    </Box>
                    <Typography sx={{ fontWeight: 700, mb: 0.75 }}>
                      {label}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 2, flex: 1 }}
                    >
                      {description}
                    </Typography>
                    <Button
                      component={Link}
                      href={href}
                      variant="contained"
                      fullWidth
                      endIcon={<FiArrowRight size={16} />}
                    >
                      {t("landingBrowseCourses")}
                    </Button>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Stack>
      </Container>
    </Box>
  );
}
