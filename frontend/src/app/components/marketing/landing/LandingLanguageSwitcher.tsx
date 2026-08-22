"use client";

import * as React from "react";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import { FiGlobe, FiCheck } from "react-icons/fi";

import { useLandingLocaleSwitch } from "./LandingLocaleProvider";
import type { LandingLocale } from "./landingMessages";

const languages = [
  { code: "en" as const, label: "English", flag: "🇺🇸" },
  { code: "ko" as const, label: "한국어", flag: "🇰🇷" },
];

export default function LandingLanguageSwitcher() {
  const { locale, switchLocale } = useLandingLocaleSwitch();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const currentLanguage = languages.find((lang) => lang.code === locale);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLanguageChange = (newLocale: LandingLocale) => {
    handleClose();
    switchLocale(newLocale);
  };

  return (
    <>
      <Tooltip
        title={`Language: ${currentLanguage?.label}`}
        slotProps={{ tooltip: { className: "landing-page-font" } }}
      >
        <IconButton
          onClick={handleClick}
          color="inherit"
          aria-label="change language"
          sx={{
            color: "inherit",
            width: 44,
            height: 44,
            transition: "transform 0.2s ease-in-out",
            "&:hover": {
              transform: "scale(1.1)",
              backgroundColor: "rgba(10,37,64,0.08)",
            },
          }}
        >
          <FiGlobe size={20} />
        </IconButton>
      </Tooltip>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        disableScrollLock
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        slotProps={{
          paper: {
            className: "landing-page-font",
            sx: {
              borderRadius: "8px",
              minWidth: 160,
              mt: 1,
            },
          },
        }}
      >
        {languages.map((lang) => (
          <MenuItem
            key={lang.code}
            onClick={() => handleLanguageChange(lang.code)}
            selected={lang.code === locale}
            sx={{
              borderRadius: "8px",
              mx: 1,
              my: 0.5,
              "&.Mui-selected": {
                backgroundColor: "primary.light",
                "&:hover": {
                  backgroundColor: "primary.light",
                },
              },
            }}
          >
            <ListItemIcon sx={{ fontSize: "1.25rem", minWidth: 36 }}>
              {lang.flag}
            </ListItemIcon>
            <ListItemText primary={lang.label} />
            {lang.code === locale && (
              <Box
                component="span"
                sx={{ ml: 1, color: "primary.main", display: "flex" }}
              >
                <FiCheck size={16} />
              </Box>
            )}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}
