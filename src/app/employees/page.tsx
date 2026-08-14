import { AppShell } from "@/components/layout/app-shell";
import { EmployeeDirectory } from "@/components/employees/employee-directory";

export default function EmployeesPage() {
  return (
    <AppShell title="Employee Profiles" subtitle="Learning passports across all stores">
      <EmployeeDirectory />
    </AppShell>
  );
}
