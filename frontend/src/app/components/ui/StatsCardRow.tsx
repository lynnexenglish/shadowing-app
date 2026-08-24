"use client";

import { ReactNode } from "react";
import Box from "@mui/material/Box";
import StatsCard from "./StatsCard";

export interface StatsCardItem {
  title: string;
  value: string | number;
  icon: ReactNode;
  color?: "primary" | "secondary" | "success" | "warning" | "error";
  subtitle?: string;
  onClick?: () => void;
}

interface StatsCardRowProps {
  stats: StatsCardItem[];
}

export default function StatsCardRow({ stats }: StatsCardRowProps) {
  return (
    <Box
      sx={{
        display: "flex",
        width: "100%",
        gap: 2,
        flexDirection: { xs: "column", sm: "row" },
        alignItems: "stretch",
      }}
    >
      {stats.map((stat) => (
        <Box
          key={stat.title}
          sx={{
            flex: 1,
            minWidth: 0,
            display: "flex",
          }}
        >
          <StatsCard {...stat} />
        </Box>
      ))}
    </Box>
  );
}
