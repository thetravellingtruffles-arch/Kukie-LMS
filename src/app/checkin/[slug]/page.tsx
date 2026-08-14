import { SelfRegisterClient } from "@/components/attendance/self-register-client";

export default async function CheckinPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return (
    <div className="min-h-dvh bg-[#ede8e4]">
      <SelfRegisterClient slug={slug} />
    </div>
  );
}
