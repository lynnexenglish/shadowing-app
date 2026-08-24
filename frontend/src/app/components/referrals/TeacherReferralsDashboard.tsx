"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useSWRAxios } from "@/app/hooks/useSWRAxios";
import { API_PATHS } from "@/app/constants/apiKeys";
import api from "@/app/helpers/axiosFetch";
import MainCard from "@/app/components/ui/MainCard";
import StatsCardRow from "@/app/components/ui/StatsCardRow";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Chip from "@mui/material/Chip";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Skeleton from "@mui/material/Skeleton";
import TextField from "@mui/material/TextField";
import { FiUsers, FiClock, FiCreditCard, FiLink } from "react-icons/fi";

interface AdminReferral {
  id: string;
  status: string;
  referrer_name: string;
  referrer_username: string;
  referred_name: string | null;
  referred_username: string | null;
  referrer_reward_krw: number;
  purchase_note: string | null;
  created_at: string;
  updated_at: string;
}

interface AdminStats {
  referrals: {
    total: number;
    invited: number;
    joined: number;
    pending: number;
    earned: number;
    rejected: number;
  };
  clicks: number;
  rewardsIssuedKrw: number;
  topReferrers: Array<{
    name: string;
    username: string;
    successful: number;
    total_earned: number;
  }>;
}

function formatKrw(amount: number) {
  return `₩${amount.toLocaleString()}`;
}

export default function TeacherReferralsDashboard() {
  const t = useTranslations("referrals");
  const {
    data: referrals,
    isLoading,
    mutate,
  } = useSWRAxios<AdminReferral[]>(API_PATHS.REFERRALS_ADMIN);
  const {
    data: stats,
    isLoading: statsLoading,
    mutate: mutateStats,
  } = useSWRAxios<AdminStats>(API_PATHS.REFERRALS_ADMIN_STATS);
  const [noteById, setNoteById] = useState<Record<string, string>>({});
  const [actionId, setActionId] = useState<string | null>(null);

  const refresh = async () => {
    await Promise.all([mutate(), mutateStats()]);
  };

  const runAction = async (
    id: string,
    action: "pending" | "approve" | "reject"
  ) => {
    setActionId(id);
    try {
      if (action === "pending") {
        await api.patch(API_PATHS.REFERRALS_ADMIN_MARK_PENDING(id), {
          purchase_note: noteById[id] || undefined,
        });
      } else if (action === "approve") {
        await api.patch(API_PATHS.REFERRALS_ADMIN_APPROVE(id));
      } else {
        await api.patch(API_PATHS.REFERRALS_ADMIN_REJECT(id));
      }
      await refresh();
    } finally {
      setActionId(null);
    }
  };

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

  const pendingList = referrals?.filter((r) => r.status === "pending") ?? [];

  if (isLoading || statsLoading) {
    return (
      <Stack spacing={2}>
        <Skeleton variant="rounded" height={108} />
        <Skeleton variant="rounded" height={300} />
      </Stack>
    );
  }

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h4" sx={{ fontWeight: 600, mb: 0.5 }}>
          {t("teacherTitle")}
        </Typography>
        <Typography color="text.secondary">{t("teacherSubtitle")}</Typography>
      </Box>

      <StatsCardRow
        stats={[
          {
            title: t("totalReferrals"),
            value: stats?.referrals.total ?? 0,
            icon: <FiUsers size={22} />,
            color: "primary",
          },
          {
            title: t("pendingApproval"),
            value: stats?.referrals.pending ?? 0,
            icon: <FiClock size={22} />,
            color: "warning",
          },
          {
            title: t("rewardsIssued"),
            value: formatKrw(stats?.rewardsIssuedKrw ?? 0),
            icon: <FiCreditCard size={22} />,
            color: "success",
          },
          {
            title: t("linkClicks"),
            value: stats?.clicks ?? 0,
            icon: <FiLink size={22} />,
            color: "secondary",
          },
        ]}
      />

      <MainCard title={t("pendingQueue")}>
        {pendingList.length === 0 ? (
          <Typography color="text.secondary">{t("noPending")}</Typography>
        ) : (
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>{t("referrer")}</TableCell>
                <TableCell>{t("referredFriend")}</TableCell>
                <TableCell>{t("amount")}</TableCell>
                <TableCell>{t("actions")}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {pendingList.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>{row.referrer_name}</TableCell>
                  <TableCell>
                    {row.referred_name || row.referred_username || "-"}
                  </TableCell>
                  <TableCell>{formatKrw(row.referrer_reward_krw)}</TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1}>
                      <Button
                        size="small"
                        variant="contained"
                        disabled={actionId === row.id}
                        onClick={() => runAction(row.id, "approve")}
                      >
                        {t("approve")}
                      </Button>
                      <Button
                        size="small"
                        color="error"
                        variant="outlined"
                        disabled={actionId === row.id}
                        onClick={() => runAction(row.id, "reject")}
                      >
                        {t("reject")}
                      </Button>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </MainCard>

      <MainCard title={t("allReferrals")}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>{t("referrer")}</TableCell>
              <TableCell>{t("referredFriend")}</TableCell>
              <TableCell>{t("status")}</TableCell>
              <TableCell>{t("amount")}</TableCell>
              <TableCell>{t("actions")}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {(referrals ?? []).map((row) => (
              <TableRow key={row.id}>
                <TableCell>{row.referrer_name}</TableCell>
                <TableCell>
                  {row.referred_name || row.referred_username || "-"}
                </TableCell>
                <TableCell>
                  <Chip label={statusLabel(row.status)} size="small" />
                </TableCell>
                <TableCell>{formatKrw(row.referrer_reward_krw)}</TableCell>
                <TableCell>
                  {(row.status === "joined" || row.status === "invited") && (
                    <Stack direction="row" spacing={1} alignItems="center">
                      <TextField
                        size="small"
                        placeholder={t("markPendingNote")}
                        value={noteById[row.id] ?? ""}
                        onChange={(e) =>
                          setNoteById((prev) => ({
                            ...prev,
                            [row.id]: e.target.value,
                          }))
                        }
                      />
                      <Button
                        size="small"
                        variant="outlined"
                        disabled={actionId === row.id}
                        onClick={() => runAction(row.id, "pending")}
                      >
                        {t("markPending")}
                      </Button>
                    </Stack>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </MainCard>

      <MainCard title={t("topReferrers")}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>{t("referrer")}</TableCell>
              <TableCell>{t("successful")}</TableCell>
              <TableCell>{t("totalEarned")}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {(stats?.topReferrers ?? []).map((row) => (
              <TableRow key={row.username}>
                <TableCell>{row.name}</TableCell>
                <TableCell>{row.successful}</TableCell>
                <TableCell>{formatKrw(row.total_earned)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </MainCard>
    </Stack>
  );
}
