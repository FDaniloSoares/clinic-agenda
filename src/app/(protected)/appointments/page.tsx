import { eq } from "drizzle-orm";
import { Plus } from "lucide-react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import {
  PageActions,
  PageContainer,
  PageContent,
  PageDescription,
  PageHeader,
  PageHeaderContent,
  PageTitle,
} from "@/components/ui/page-container";
import { db } from "@/db";
import { appointmentsTable, doctorsTable, pacientsTable } from "@/db/schema";
import { auth } from "@/lib/auth";

import { AddAppointmentForm } from "./_components/add-appointment-form";
import { appointmentsTableColumns } from "./_components/appointment-columns";

export default async function AppointmentsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/authentication");
  }

  if (!session?.user?.clinic) {
    redirect("/clinic-form");
  }

  const doctors = await db.query.doctorsTable.findMany({
    where: eq(doctorsTable.clinicId, session.user.clinic.id),
  });

  const patients = await db.query.pacientsTable.findMany({
    where: eq(pacientsTable.clinicId, session.user.clinic.id),
  });

  const appointments = await db.query.appointmentsTable.findMany({
    where: eq(appointmentsTable.clinicId, session.user.clinic.id),
    with: {
      doctor: true,
      patient: true,
    },
  });

  return (
    <PageContainer>
      <PageHeader>
        <PageHeaderContent>
          <PageTitle>Appointments</PageTitle>
          <PageDescription>Manage clinic appointments</PageDescription>
        </PageHeaderContent>
        <PageActions>
          <AddAppointmentForm doctors={doctors} patients={patients}>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New appointment
            </Button>
          </AddAppointmentForm>
        </PageActions>
      </PageHeader>
      <PageContent>
        <DataTable columns={appointmentsTableColumns} data={appointments} />
      </PageContent>
    </PageContainer>
  );
}
