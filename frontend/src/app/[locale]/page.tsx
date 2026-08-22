import type { Metadata } from "next";
import LandingPage from "../components/marketing/LandingPage";

/** Link preview image for /en and /ko home — WhatsApp, iMessage, Facebook, etc. */
export const metadata: Metadata = {
  metadataBase: new URL("https://www.shadowspeaklearn.com"),
  openGraph: {
    images: [
      {
        url: "/images/hero.jpg",
        width: 1023,
        height: 1537,
        alt: "ShadowSpeak with Lynnex English",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/images/hero.jpg"],
  },
};

export default function Home() {
  return <LandingPage />;
}
