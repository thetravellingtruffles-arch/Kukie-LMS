import { RequireRole } from "@/components/auth/require-admin";

export default function Layout({ children }: { children: React.ReactNode }) {
  return <RequireRole roles={["admin", "studio_editor"]}>{children}</RequireRole>;
}
