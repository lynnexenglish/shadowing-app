import ReferralLandingPage from "@/app/components/referrals/ReferralLandingPage";

export default async function RefPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <ReferralLandingPage slug={slug} />;
}
