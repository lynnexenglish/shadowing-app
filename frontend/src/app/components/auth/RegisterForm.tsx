"use client";
import { useEffect, useState, useRef } from "react";
import { useRouter, Link } from "@/i18n/routing";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useAuthContext } from "../../AuthContext";
import redirectBasedOnRole from "../../helpers/redirectBasedOnRole";
import logger from "../../helpers/logger";
import { AuthResponse } from "@/app/Types";
import { useSWRMutationHook } from "@/app/hooks/useSWRMutation";
import { API_PATHS } from "@/app/constants/apiKeys";

import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import { FiEye, FiEyeOff, FiUserPlus } from "react-icons/fi";
import Image from "next/image";
import DarkModeToggle from "../ui/DarkModeToggle";
import LanguageSwitcher from "../ui/LanguageSwitcher";

export default function RegisterForm() {
  const t = useTranslations("auth");
  const tErrors = useTranslations("errors");
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const { updateToken, token } = useAuthContext();
  const [showPassword, setShowPassword] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { isMutating, trigger } = useSWRMutationHook<
    AuthResponse,
    {
      name: string;
      username: string;
      password: string;
      referralSlug?: string;
    }
  >(API_PATHS.REGISTER, { method: "POST" });
  const [isNavigating, setIsNavigating] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const isLoading = isMutating || isNavigating;

  useEffect(() => {
    try {
      if (token) {
        const route = redirectBasedOnRole(token);
        router.push(route);
      }
      if (inputRef.current) {
        inputRef.current.focus();
      }
    } catch (error) {
      logger.error("Invalid token:", error);
      setIsNavigating(false);
      updateToken(null);
    }
  }, [router, token, updateToken]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setErrorMessage("");

    try {
      const refFromUrl = searchParams.get("ref")?.trim();
      let refFromCookie: string | undefined;
      if (typeof document !== "undefined") {
        const match = document.cookie.match(/(?:^|; )ss_ref_slug=([^;]+)/);
        if (match?.[1]) {
          refFromCookie = decodeURIComponent(match[1]);
        }
      }

      const response = await trigger({
        name: name,
        username: username,
        password: password,
        referralSlug: refFromUrl || refFromCookie,
      });

      if (response) {
        const { token } = response;
        updateToken(token);
        const route = redirectBasedOnRole(token);
        setIsNavigating(true);
        router.push(route);
      }
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : tErrors("somethingWentWrong")
      );
    }
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "background.default",
        p: 2,
        position: "relative",
      }}
    >
      {/* Top right controls */}
      <Box
        sx={{
          position: "absolute",
          top: 16,
          right: 16,
          zIndex: 1,
          display: "flex",
          gap: 1,
        }}
      >
        <LanguageSwitcher />
        <DarkModeToggle />
      </Box>

      <Card
        sx={{
          maxWidth: 400,
          width: "100%",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
        }}
      >
        <CardContent sx={{ p: 4 }}>
          {/* Logo/Brand */}
          <Box sx={{ textAlign: "center", mb: 4 }}>
            <Box
              sx={{
                position: "relative",
                width: "100%",
                maxWidth: 260,
                height: 72,
                mx: "auto",
                mb: 1.5,
              }}
            >
              <Image
                src="/logo.png"
                alt="ShadowSpeak with Lynnex English"
                fill
                sizes="260px"
                priority
                style={{ objectFit: "contain" }}
              />
            </Box>
            <Typography variant="body2" color="text.secondary">
              {t("signUpToStart")}
            </Typography>
          </Box>

          {/* Error Alert */}
          {errorMessage && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {errorMessage}
            </Alert>
          )}

          {/* Form */}
          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label={t("name")}
              id="name"
              name="name"
              placeholder={t("enterName")}
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setErrorMessage("");
              }}
              disabled={isLoading}
              required
              inputRef={inputRef}
              autoComplete="name"
              sx={{ mb: 2.5 }}
            />

            <TextField
              fullWidth
              label={t("username")}
              id="username"
              name="username"
              placeholder={t("enterUsername")}
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                setErrorMessage("");
              }}
              disabled={isLoading}
              required
              autoComplete="username"
              sx={{ mb: 2.5 }}
            />

            <TextField
              fullWidth
              label={t("password")}
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder={t("enterPassword")}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setErrorMessage("");
              }}
              disabled={isLoading}
              required
              autoComplete="new-password"
              sx={{ mb: 1 }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label={
                        showPassword ? t("hidePassword") : t("showPassword")
                      }
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      disabled={isLoading}
                    >
                      {showPassword ? (
                        <FiEyeOff size={18} />
                      ) : (
                        <FiEye size={18} />
                      )}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: "block", mb: 3 }}
            >
              {t("minCharacters")}
            </Typography>

            <Button
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              disabled={isLoading}
              startIcon={
                isLoading ? (
                  <CircularProgress size={20} color="inherit" />
                ) : (
                  <FiUserPlus size={18} />
                )
              }
              sx={{
                py: 1.5,
                textTransform: "none",
                fontWeight: 600,
                fontSize: "1rem",
              }}
            >
              {isLoading ? t("creatingAccount") : t("createAccount")}
            </Button>

            {/* Link back to login */}
            <Box sx={{ textAlign: "center", mt: 3 }}>
              <Typography variant="body2" color="text.secondary">
                {t("alreadyHaveAccount")}{" "}
                <Link
                  href="/"
                  style={{
                    fontWeight: 600,
                    textDecoration: "none",
                    color: "#1E88E5",
                  }}
                >
                  {t("login")}
                </Link>
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
