import { RequireAdmin } from "@/components/auth/require-admin";

export default function Layout({ children }: { children: React.ReactNode }) {
  return <RequireAdmin>{children}</RequireAdmin>;
}
