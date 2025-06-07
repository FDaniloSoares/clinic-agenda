import { eq } from "drizzle-orm";
import { Plus } from "lucide-react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
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
import { doctorsTable, pacientsTable } from "@/db/schema";
import { auth } from "@/lib/auth";

import { UpsertAppointmentForm } from "./_components/upsert-appointment-form";

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

  return (
    <PageContainer>
      <PageHeader>
        <PageHeaderContent>
          <PageTitle>Agendamentos</PageTitle>
          <PageDescription>Gerencie os agendamentos da clínica</PageDescription>
        </PageHeaderContent>
        <PageActions>
          <UpsertAppointmentForm doctors={doctors} patients={patients}>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Novo agendamento
            </Button>
          </UpsertAppointmentForm>
        </PageActions>
      </PageHeader>
      <PageContent>aqui</PageContent>
    </PageContainer>
  );
}
