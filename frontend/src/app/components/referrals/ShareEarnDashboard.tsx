"use client";

import { useCallback, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useSWRAxios } from "@/app/hooks/useSWRAxios";
import { API_PATHS } from "@/app/constants/apiKeys";
import MainCard from "@/app/components/ui/MainCard";
import StatsCardRow from "@/app/components/ui/StatsCardRow";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Grid from "@mui/material/Grid";
import LinearProgress from "@mui/material/LinearProgress";
import Chip from "@mui/material/Chip";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Skeleton from "@mui/material/Skeleton";
import api from "@/app/helpers/axiosFetch";
import { shareReferralViaKakao } from "@/app/helpers/shareKakao";
import { FiUsers, FiCreditCard, FiClock, FiTrendingUp } from "react-icons/fi";

interface ReferralDashboard {
  code: {
    display_code: string;
    slug: string;
  } | null;
  referrals: Array<{
    id: string;
    status: string;
    referred_name: string | null;
    referred_username: string | null;
    created_at: string;
  }>;
  successfulCount: number;
  wallet: { available: number; pending: number; lifetime: number };
  nextMilestone: {
    count: number;
    remaining: number;
    label: string;
  } | null;
  isAmbassador: boolean;
}

function formatKrw(amount: number) {
  return `₩${amount.toLocaleString()}`;
}

async function copyText(text: string) {
  await navigator.clipboard.writeText(text);
}

function CopyField({
  label,
  value,
  copyKey,
  copiedKey,
  onCopy,
  copyLabel,
  copiedLabel,
}: {
  label: string;
  value: string;
  copyKey: string;
  copiedKey: string | null;
  onCopy: (key: string, text: string) => void;
  copyLabel: string;
  copiedLabel: string;
}) {
  return (
    <Box>
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ mb: 0.5, display: "block" }}
      >
        {label}
      </Typography>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          p: 1.5,
          bgcolor: "grey.50",
          border: "1px solid",
          borderColor: "grey.200",
          borderRadius: 1.5,
        }}
      >
        <Typography
          variant="body2"
          sx={{
            flex: 1,
            fontWeight: copyKey === "code" ? 700 : 400,
            letterSpacing: copyKey === "code" ? 0.5 : 0,
            wordBreak: "break-all",
            fontFamily: copyKey === "code" ? "monospace" : "inherit",
          }}
        >
          {value}
        </Typography>
        <Button
          size="small"
          variant="outlined"
          onClick={() => onCopy(copyKey, value)}
          sx={{ flexShrink: 0, minWidth: 88 }}
        >
          {copiedKey === copyKey ? copiedLabel : copyLabel}
        </Button>
      </Box>
    </Box>
  );
}

export default function ShareEarnDashboard() {
  const t = useTranslations("referrals");
  const locale = useLocale();
  const { data, isLoading } = useSWRAxios<ReferralDashboard>(
    API_PATHS.REFERRALS_ME
  );
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [kakaoLoading, setKakaoLoading] = useState(false);

  const referralLink = useMemo(() => {
    if (!data?.code?.slug || typeof window === "undefined") return "";
    return `${window.location.origin}/${locale}/ref/${data.code.slug}`;
  }, [data?.code?.slug, locale]);

  const handleCopy = useCallback(async (key: string, text: string) => {
    await copyText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  }, []);

  const handleCopyMessage = useCallback(async () => {
    const res = await api.get(API_PATHS.REFERRALS_MESSAGE);
    const messages = res.data.data as { en: string; ko: string };
    const text = locale === "ko" ? messages.ko : messages.en;
    await handleCopy("message", text);
  }, [handleCopy, locale]);

  const getShareMessage = useCallback(async () => {
    const res = await api.get(API_PATHS.REFERRALS_MESSAGE);
    const messages = res.data.data as { en: string; ko: string };
    return locale === "ko" ? messages.ko : messages.en;
  }, [locale]);

  const handleShareKakao = useCallback(async () => {
    if (!referralLink) return;
    setKakaoLoading(true);
    try {
      const message = await getShareMessage();
      const siteOrigin =
        process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
        window.location.origin;
      const result = await shareReferralViaKakao({
        title: t("programName"),
        description: message.split("\n\n")[0] || message,
        link: referralLink,
        imageUrl: `${siteOrigin}/images/preview.jpg`,
      });
      if (result === "copied") {
        setCopiedKey("kakao");
        setTimeout(() => setCopiedKey(null), 2000);
      }
    } catch {
      await handleCopyMessage();
    } finally {
      setKakaoLoading(false);
    }
  }, [referralLink, getShareMessage, t, handleCopyMessage]);

  const progressPercent = useMemo(() => {
    if (!data?.nextMilestone) return 100;
    const target = data.nextMilestone.count;
    const current = data.successfulCount;
    return Math.min(100, (current / target) * 100);
  }, [data]);

  const statusLabel = (status: string) => {
    const map: Record<string, string> = {
      invited: t("statusInvited"),
      joined: t("statusJoined"),
      pending: t("statusPending"),
      reward_earned: t("statusRewardEarned"),
      rejected: t("statusRejected"),
      cancelled: t("statusCancelled"),
    };
    return map[status] ?? status;
  };

  if (isLoading) {
    return (
      <Stack spacing={2}>
        <Skeleton variant="rounded" height={80} />
        <Grid container spacing={2}>
          {[1, 2, 3, 4].map((i) => (
            <Grid key={i} size={{ xs: 12, sm: 6, md: 3 }}>
              <Skeleton variant="rounded" height={108} />
            </Grid>
          ))}
        </Grid>
        <Skeleton variant="rounded" height={180} />
      </Stack>
    );
  }

  const successfulCount = data?.successfulCount ?? 0;

  return (
    <Stack spacing={3}>
      <Box>
        <Stack
          direction="row"
          alignItems="center"
          spacing={1.5}
          flexWrap="wrap"
          useFlexGap
        >
          <Typography variant="h4" sx={{ fontWeight: 600 }}>
            {t("studentTitle")}
          </Typography>
          {data?.isAmbassador && (
            <Chip label={t("ambassadorBadge")} color="warning" size="small" />
          )}
        </Stack>
        <Typography color="text.secondary" sx={{ mt: 0.5 }}>
          {t("studentSubtitle")}
        </Typography>
      </Box>

      <StatsCardRow
        stats={[
          {
            title: t("successfulReferralsLabel"),
            value: successfulCount,
            icon: <FiUsers size={22} />,
            color: "primary",
          },
          {
            title: t("availableCredit"),
            value: formatKrw(data?.wallet.available ?? 0),
            icon: <FiCreditCard size={22} />,
            color: "success",
          },
          {
            title: t("pendingCredit"),
            value: formatKrw(data?.wallet.pending ?? 0),
            icon: <FiClock size={22} />,
            color: "warning",
          },
          {
            title: t("lifetimeEarned"),
            value: formatKrw(data?.wallet.lifetime ?? 0),
            icon: <FiTrendingUp size={22} />,
            color: "secondary",
          },
        ]}
      />

      {data?.nextMilestone && (
        <Box>
          <Typography
            variant="caption"
            sx={{
              mb: 0.75,
              display: "block",
              color: "error.main",
              fontWeight: 600,
            }}
          >
            {t("nextMilestone", {
              remaining: data.nextMilestone.remaining,
              reward: data.nextMilestone.label,
            })}
          </Typography>
          <LinearProgress
            variant="determinate"
            value={progressPercent}
            sx={{ height: 6, borderRadius: 3 }}
          />
        </Box>
      )}

      <MainCard title={t("yourCode")}>
        <Stack spacing={2}>
          <CopyField
            label={t("yourCode")}
            value={data?.code?.display_code ?? "-"}
            copyKey="code"
            copiedKey={copiedKey}
            onCopy={handleCopy}
            copyLabel={t("copyCode")}
            copiedLabel={t("copied")}
          />
          <CopyField
            label={t("yourLink")}
            value={referralLink}
            copyKey="link"
            copiedKey={copiedKey}
            onCopy={handleCopy}
            copyLabel={t("copyLink")}
            copiedLabel={t("copied")}
          />
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <Button
              size="small"
              variant="contained"
              disabled={kakaoLoading || !referralLink}
              onClick={handleShareKakao}
              sx={{
                bgcolor: "#FEE500",
                color: "#191919",
                fontWeight: 600,
                "&:hover": { bgcolor: "#F5DC00" },
              }}
            >
              {copiedKey === "kakao" ? t("shareKakaoCopied") : t("shareKakao")}
            </Button>
            <Button
              size="small"
              variant="contained"
              href={`https://wa.me/?text=${encodeURIComponent(referralLink)}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              {t("shareWhatsApp")}
            </Button>
            <Button
              size="small"
              variant="outlined"
              href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralLink)}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              {t("shareFacebook")}
            </Button>
            <Button
              size="small"
              variant="outlined"
              href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(referralLink)}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              {t("shareX")}
            </Button>
            <Button variant="outlined" size="small" onClick={handleCopyMessage}>
              {copiedKey === "message" ? t("copied") : t("copyMessage")}
            </Button>
          </Stack>
        </Stack>
      </MainCard>

      <MainCard title={t("referralListTitle")}>
        {!data?.referrals?.length ? (
          <Typography color="text.secondary">{t("noReferrals")}</Typography>
        ) : (
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>{t("referredFriend")}</TableCell>
                <TableCell>{t("status")}</TableCell>
                <TableCell>{t("date")}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.referrals.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>
                    {row.referred_name ||
                      row.referred_username ||
                      t("unknownFriend")}
                  </TableCell>
                  <TableCell>
                    <Chip label={statusLabel(row.status)} size="small" />
                  </TableCell>
                  <TableCell>
                    {new Date(row.created_at).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </MainCard>

      <Typography variant="caption" color="text.secondary">
        {t("termsBody")}
      </Typography>
    </Stack>
  );
}
