"use client";

import { useTranslations } from "next-intl";

import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { FiChevronDown } from "react-icons/fi";

const FAQ_KEYS = [
  "whatIsIt",
  "coursesAvailable",
  "existingStudent",
  "courseBenefits",
  "courseMedia",
  "shadowingMethod",
  "liveSessions",
  "levelRequired",
  "paymentOptions",
  "refundPolicy",
] as const;

export default function HelpSupportPage() {
  const tStudent = useTranslations("student");
  const tFaq = useTranslations("landing.faq");

  return (
    <Box sx={{ maxWidth: 760 }}>
      <Typography
        variant="h4"
        component="h1"
        sx={{ fontWeight: 600, color: "text.primary", mb: 1 }}
      >
        {tStudent("helpSupport")}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        {tFaq("subtitle")}
      </Typography>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
        {FAQ_KEYS.map((key) => (
          <Accordion
            key={key}
            disableGutters
            elevation={0}
            sx={{
              border: "1px solid",
              borderColor: "divider",
              borderRadius: "8px !important",
              "&:before": { display: "none" },
              overflow: "hidden",
            }}
          >
            <AccordionSummary
              expandIcon={<FiChevronDown size={18} />}
              sx={{
                px: 2,
                py: 0.5,
                "& .MuiAccordionSummary-content": { my: 1.25 },
              }}
            >
              <Typography sx={{ fontWeight: 600, fontSize: "0.95rem" }}>
                {tFaq(`${key}.question`)}
              </Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ px: 2, pt: 0, pb: 2 }}>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ lineHeight: 1.7 }}
              >
                {tFaq(`${key}.answer`)}
              </Typography>
            </AccordionDetails>
          </Accordion>
        ))}
      </Box>
    </Box>
  );
}
