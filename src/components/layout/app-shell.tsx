import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";

export function AppShell({
  title,
  subtitle,
  children,
  fullBleed = false,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  fullBleed?: boolean;
}) {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="lg:pl-64">
        <Topbar title={title} subtitle={subtitle} />
        {fullBleed ? (
          <main>{children}</main>
        ) : (
          <main className="mx-auto max-w-[1400px] p-5 lg:p-8">{children}</main>
        )}
      </div>
    </div>
  );
}
