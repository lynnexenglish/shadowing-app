"use client";

import { useEffect, useMemo, useState } from "react";
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
import type { ChipProps } from "@mui/material/Chip";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TablePagination from "@mui/material/TablePagination";
import Skeleton from "@mui/material/Skeleton";
import TextField from "@mui/material/TextField";
import Checkbox from "@mui/material/Checkbox";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import DialogTitle from "@mui/material/DialogTitle";
import CircularProgress from "@mui/material/CircularProgress";
import useAlertMessageStyles from "@/app/hooks/useAlertMessageStyles";
import {
  FiUsers,
  FiClock,
  FiCreditCard,
  FiLink,
  FiTrash2,
} from "react-icons/fi";

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
  deleted_at?: string | null;
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

const PAGE_SIZE = 10;

function formatKrw(amount: number) {
  return `₩${amount.toLocaleString()}`;
}

function formatDate(value: string) {
  return new Date(value).toLocaleString();
}

function ReferralStatusChip({
  status,
  referredName,
  referredUsername,
  t,
}: {
  status: string;
  referredName: string | null;
  referredUsername: string | null;
  t: ReturnType<typeof useTranslations>;
}) {
  const hasReferredUser = Boolean(referredName || referredUsername);
  const isOrphanInvite = status === "invited" && !hasReferredUser;

  const config: Record<
    string,
    { label: string; color: ChipProps["color"]; variant: "filled" | "outlined" }
  > = {
    invited: {
      label: isOrphanInvite ? t("statusLinkClicked") : t("statusInvited"),
      color: "default",
      variant: "outlined",
    },
    joined: {
      label: t("statusJoined"),
      color: "info",
      variant: "filled",
    },
    pending: {
      label: t("statusPending"),
      color: "warning",
      variant: "filled",
    },
    reward_earned: {
      label: t("statusRewardEarned"),
      color: "success",
      variant: "filled",
    },
    rejected: {
      label: t("statusRejected"),
      color: "error",
      variant: "outlined",
    },
    cancelled: {
      label: t("statusCancelled"),
      color: "default",
      variant: "outlined",
    },
  };

  const chip = config[status] ?? {
    label: status,
    color: "default" as const,
    variant: "outlined" as const,
  };

  return (
    <Chip
      label={chip.label}
      size="small"
      color={chip.color}
      variant={chip.variant}
      sx={{ fontWeight: 600, minWidth: 108 }}
    />
  );
}

export default function TeacherReferralsDashboard() {
  const t = useTranslations("referrals");
  const tCommon = useTranslations("common");
  const {
    StyledDialog,
    StyledDialogContent,
    StyledDialogActions,
    StyledButton,
    StyledErrorButton,
  } = useAlertMessageStyles();
  const {
    data: referrals,
    isLoading,
    mutate,
  } = useSWRAxios<AdminReferral[]>(API_PATHS.REFERRALS_ADMIN);
  const { data: deletedReferrals, mutate: mutateDeleted } = useSWRAxios<
    AdminReferral[]
  >(API_PATHS.REFERRALS_ADMIN_DELETED);
  const {
    data: stats,
    isLoading: statsLoading,
    mutate: mutateStats,
  } = useSWRAxios<AdminStats>(API_PATHS.REFERRALS_ADMIN_STATS);
  const [noteById, setNoteById] = useState<Record<string, string>>({});
  const [actionId, setActionId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [undoOpen, setUndoOpen] = useState(false);
  const [lastDeletedIds, setLastDeletedIds] = useState<string[]>([]);
  const [restoreNotice, setRestoreNotice] = useState<string | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [allReferralsPage, setAllReferralsPage] = useState(0);
  const [deletedReferralsPage, setDeletedReferralsPage] = useState(0);

  const refresh = async () => {
    await Promise.all([mutate(), mutateDeleted(), mutateStats()]);
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

  const displayReferrals = referrals ?? [];
  const displayDeletedReferrals = deletedReferrals ?? [];
  const pendingList = displayReferrals.filter((r) => r.status === "pending");

  const allReferralsMaxPage = Math.max(
    0,
    Math.ceil(displayReferrals.length / PAGE_SIZE) - 1
  );
  const deletedReferralsMaxPage = Math.max(
    0,
    Math.ceil(displayDeletedReferrals.length / PAGE_SIZE) - 1
  );

  useEffect(() => {
    if (allReferralsPage > allReferralsMaxPage) {
      setAllReferralsPage(allReferralsMaxPage);
    }
  }, [allReferralsPage, allReferralsMaxPage]);

  useEffect(() => {
    if (deletedReferralsPage > deletedReferralsMaxPage) {
      setDeletedReferralsPage(deletedReferralsMaxPage);
    }
  }, [deletedReferralsPage, deletedReferralsMaxPage]);

  const paginatedReferrals = useMemo(() => {
    const start = allReferralsPage * PAGE_SIZE;
    return displayReferrals.slice(start, start + PAGE_SIZE);
  }, [displayReferrals, allReferralsPage]);

  const paginatedDeletedReferrals = useMemo(() => {
    const start = deletedReferralsPage * PAGE_SIZE;
    return displayDeletedReferrals.slice(start, start + PAGE_SIZE);
  }, [displayDeletedReferrals, deletedReferralsPage]);

  const paginatedReferralIds = useMemo(
    () => paginatedReferrals.map((row) => row.id),
    [paginatedReferrals]
  );

  const allSelected =
    paginatedReferralIds.length > 0 &&
    paginatedReferralIds.every((id) => selectedIds.includes(id));
  const someSelected =
    paginatedReferralIds.some((id) => selectedIds.includes(id)) && !allSelected;

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds((prev) =>
        prev.filter((id) => !paginatedReferralIds.includes(id))
      );
      return;
    }

    setSelectedIds((prev) => [...new Set([...prev, ...paginatedReferralIds])]);
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleDeleteSelected = async () => {
    if (selectedIds.length === 0) return;

    setIsDeleting(true);
    try {
      const res = await api.post(API_PATHS.REFERRALS_ADMIN_DELETE, {
        ids: selectedIds,
      });
      const deletedIds: string[] = res.data?.data?.deletedIds ?? [];
      if (deletedIds.length > 0) {
        setLastDeletedIds(deletedIds);
        setUndoOpen(true);
      }
      setSelectedIds([]);
      await refresh();
    } finally {
      setIsDeleting(false);
      setDeleteConfirmOpen(false);
    }
  };

  const handleCloseDeleteDialog = () => {
    if (isDeleting) return;
    setDeleteConfirmOpen(false);
  };

  const handleRestore = async (ids: string[]) => {
    if (ids.length === 0) return;

    setIsRestoring(true);
    try {
      const res = await api.post(API_PATHS.REFERRALS_ADMIN_RESTORE, { ids });
      const restoredIds: string[] = res.data?.data?.restoredIds ?? [];
      if (restoredIds.length > 0) {
        setRestoreNotice(t("restoredCount", { count: restoredIds.length }));
        setLastDeletedIds((prev) =>
          prev.filter((id) => !restoredIds.includes(id))
        );
      }
      await refresh();
    } finally {
      setIsRestoring(false);
    }
  };

  const handleUndoLastDelete = async () => {
    setUndoOpen(false);
    await handleRestore(lastDeletedIds);
  };

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

      <MainCard
        title={t("allReferrals")}
        secondary={
          <Box
            sx={{
              height: 32,
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
            }}
          >
            {selectedIds.length > 0 && (
              <Button
                size="small"
                color="error"
                variant="contained"
                startIcon={<FiTrash2 size={14} />}
                disabled={isDeleting}
                onClick={() => setDeleteConfirmOpen(true)}
              >
                {t("deleteSelected", { count: selectedIds.length })}
              </Button>
            )}
          </Box>
        }
      >
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  checked={allSelected}
                  indeterminate={someSelected}
                  onChange={toggleSelectAll}
                  inputProps={{ "aria-label": t("selectAll") }}
                />
              </TableCell>
              <TableCell>{t("referrer")}</TableCell>
              <TableCell>{t("referredFriend")}</TableCell>
              <TableCell>{t("status")}</TableCell>
              <TableCell>{t("amount")}</TableCell>
              <TableCell>{t("actions")}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedReferrals.map((row) => (
              <TableRow key={row.id} selected={selectedIds.includes(row.id)}>
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={selectedIds.includes(row.id)}
                    onChange={() => toggleSelectOne(row.id)}
                  />
                </TableCell>
                <TableCell>{row.referrer_name}</TableCell>
                <TableCell>
                  {row.referred_name || row.referred_username || "-"}
                </TableCell>
                <TableCell>
                  <ReferralStatusChip
                    status={row.status}
                    referredName={row.referred_name}
                    referredUsername={row.referred_username}
                    t={t}
                  />
                </TableCell>
                <TableCell>{formatKrw(row.referrer_reward_krw)}</TableCell>
                <TableCell>
                  {row.status === "joined" && (
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
        <TablePagination
          component="div"
          count={displayReferrals.length}
          page={allReferralsPage}
          onPageChange={(_, page) => setAllReferralsPage(page)}
          rowsPerPage={PAGE_SIZE}
          rowsPerPageOptions={[PAGE_SIZE]}
          labelDisplayedRows={({ from, to, count }) =>
            t("paginationLabel", { from, to, count })
          }
        />
      </MainCard>

      <MainCard title={t("deletedReferrals")}>
        {displayDeletedReferrals.length === 0 ? (
          <Typography color="text.secondary">
            {t("noDeletedReferrals")}
          </Typography>
        ) : (
          <>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>{t("referrer")}</TableCell>
                  <TableCell>{t("referredFriend")}</TableCell>
                  <TableCell>{t("status")}</TableCell>
                  <TableCell>{t("amount")}</TableCell>
                  <TableCell>{t("deletedAt")}</TableCell>
                  <TableCell>{t("actions")}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedDeletedReferrals.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>{row.referrer_name}</TableCell>
                    <TableCell>
                      {row.referred_name || row.referred_username || "-"}
                    </TableCell>
                    <TableCell>
                      <ReferralStatusChip
                        status={row.status}
                        referredName={row.referred_name}
                        referredUsername={row.referred_username}
                        t={t}
                      />
                    </TableCell>
                    <TableCell>{formatKrw(row.referrer_reward_krw)}</TableCell>
                    <TableCell>
                      {row.deleted_at ? formatDate(row.deleted_at) : "-"}
                    </TableCell>
                    <TableCell>
                      <Button
                        size="small"
                        variant="outlined"
                        disabled={isRestoring}
                        onClick={() => handleRestore([row.id])}
                      >
                        {t("restore")}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <TablePagination
              component="div"
              count={displayDeletedReferrals.length}
              page={deletedReferralsPage}
              onPageChange={(_, page) => setDeletedReferralsPage(page)}
              rowsPerPage={PAGE_SIZE}
              rowsPerPageOptions={[PAGE_SIZE]}
              labelDisplayedRows={({ from, to, count }) =>
                t("paginationLabel", { from, to, count })
              }
            />
          </>
        )}
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

      <StyledDialog
        open={deleteConfirmOpen}
        onClose={handleCloseDeleteDialog}
        aria-labelledby="delete-referrals-dialog-title"
        disableEscapeKeyDown={isDeleting}
      >
        <DialogTitle
          id="delete-referrals-dialog-title"
          sx={{ fontWeight: 600, fontSize: "1.25rem", pb: 1 }}
        >
          {isDeleting ? t("deleting") : t("confirmDeleteReferralsTitle")}
        </DialogTitle>
        <StyledDialogContent>
          {isDeleting ? (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                py: 3,
              }}
            >
              <CircularProgress />
            </Box>
          ) : (
            <Typography>
              {t("confirmDeleteReferralsMessage", {
                count: selectedIds.length,
              })}
            </Typography>
          )}
        </StyledDialogContent>
        {!isDeleting && (
          <StyledDialogActions>
            <StyledButton variant="outlined" onClick={handleCloseDeleteDialog}>
              {tCommon("cancel")}
            </StyledButton>
            <StyledErrorButton
              variant="contained"
              onClick={handleDeleteSelected}
            >
              {t("deleteSelected", { count: selectedIds.length })}
            </StyledErrorButton>
          </StyledDialogActions>
        )}
      </StyledDialog>

      <Snackbar
        open={undoOpen}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        onClose={() => setUndoOpen(false)}
      >
        <Alert
          severity="info"
          variant="filled"
          action={
            <Button color="inherit" size="small" onClick={handleUndoLastDelete}>
              {t("undo")}
            </Button>
          }
          sx={{ width: "100%" }}
        >
          {t("deletedCount", { count: lastDeletedIds.length })}
        </Alert>
      </Snackbar>

      <Snackbar
        open={Boolean(restoreNotice)}
        autoHideDuration={4000}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        onClose={() => setRestoreNotice(null)}
      >
        <Alert
          severity="success"
          variant="filled"
          onClose={() => setRestoreNotice(null)}
          sx={{ width: "100%" }}
        >
          {restoreNotice}
        </Alert>
      </Snackbar>
    </Stack>
  );
}
