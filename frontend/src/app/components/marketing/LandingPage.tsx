import dynamic from "next/dynamic";

import LandingNav from "./landing/LandingNav";
import HeroSection from "./landing/HeroSection";
import ProofStrip from "./landing/ProofStrip";
import LandingAnchorScroll from "./landing/LandingAnchorScroll";
import LandingLoginPrefetch from "./landing/LandingLoginPrefetch";
import LandingLocaleProvider from "./landing/LandingLocaleProvider";
import { HairlineDivider } from "./landing/primitives";
import { INK, SURFACE } from "./landing/tokens";

/** Below-the-fold sections — code-split so first paint only loads hero + nav. */
const OfferingsSection = dynamic(() => import("./landing/OfferingsSection"));
const PracticeSection = dynamic(() => import("./landing/PracticeSection"));
const CoursesSection = dynamic(() => import("./landing/CoursesSection"));
const CoachingSection = dynamic(() => import("./landing/CoachingSection"));
// const ComingSoonSection = dynamic(() => import("./landing/ComingSoonSection"));
const VideoReviewSection = dynamic(
  () => import("./landing/VideoReviewSection")
);
const RecentReviewsSection = dynamic(
  () => import("./landing/RecentReviewsSection")
);
const TestimonialsSection = dynamic(
  () => import("./landing/TestimonialsSection")
);
const AboutSection = dynamic(() => import("./landing/AboutSection"));
const FaqSection = dynamic(() => import("./landing/FaqSection"));
const ClosingSection = dynamic(() => import("./landing/ClosingSection"));

/**
 * Marketing landing page (route: `/[locale]`).
 * Server component shell — only above-the-fold sections load in the initial bundle.
 */
export default function LandingPage() {
  return (
    <div
      style={{
        backgroundColor: SURFACE.base,
        color: INK[800],
        overflowX: "clip",
        width: "100%",
        maxWidth: "100%",
      }}
      className="landing-page"
    >
      <LandingLocaleProvider>
        <LandingAnchorScroll />
        <LandingLoginPrefetch />
        <LandingNav />
        <HeroSection />
        <ProofStrip />
        <OfferingsSection />
        <PracticeSection />
        <HairlineDivider />
        <CoursesSection />
        <CoachingSection />
        {/* <ComingSoonSection /> */}
        <VideoReviewSection />
        <RecentReviewsSection />
        <TestimonialsSection />
        <AboutSection />
        <FaqSection />
        <ClosingSection />
      </LandingLocaleProvider>
    </div>
  );
}
