import { RequireRole } from "@/components/auth/require-admin";

export default function Layout({ children }: { children: React.ReactNode }) {
  return <RequireRole roles={["vp", "operations", "area_manager"]}>{children}</RequireRole>;
}
