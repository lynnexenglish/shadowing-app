import type { Metadata } from "next";
import LandingPage from "../components/marketing/LandingPage";
import { SOCIAL_PREVIEW_IMAGE } from "../constants/socialPreview";

/** Link preview image for /en and /ko home — WhatsApp, iMessage, Facebook, etc. */
export const metadata: Metadata = {
  metadataBase: new URL("https://www.shadowspeaklearn.com"),
  openGraph: {
    images: [
      {
        url: SOCIAL_PREVIEW_IMAGE,
        width: 1024,
        height: 1220,
        alt: "ShadowSpeak with Lynnex English",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    images: [SOCIAL_PREVIEW_IMAGE],
  },
};

export default function Home() {
  return <LandingPage />;
}
