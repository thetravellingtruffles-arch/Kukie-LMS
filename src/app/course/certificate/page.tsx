import { AppShell } from "@/components/layout/app-shell";
import { CertificateClient } from "@/components/certificate/certificate-client";

export default function CertificatePage() {
  return (
    <AppShell title="Certificate" subtitle="Module 001 · Issue & verify">
      <CertificateClient />
    </AppShell>
  );
}
