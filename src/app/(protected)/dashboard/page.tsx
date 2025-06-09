import { headers } from "next/headers";
import { redirect } from "next/navigation";

import {
  PageActions,
  PageContainer,
  PageContent,
  PageDescription,
  PageHeader,
  PageHeaderContent,
  PageTitle,
} from "@/components/ui/page-container";
import { auth } from "@/lib/auth";

import { DatePicker } from "./_components/date-picker";

const DashboardPage = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/authentication");
  }

  // ELIMINADO POIS ISSO É FEITO NO PLUGIN DO BETTER AUTH EM auth.ts
  // preciso pegar as clínicas do usuário
  // const clinics = await db.query.UserToClinicTable.findMany({
  //   where: eq(UserToClinicTable.userId, session.user.id),
  // });

  if (!session?.user?.clinic) {
    redirect("/clinic-form");
  }

  return (
    <PageContainer>
      <PageHeader>
        <PageHeaderContent>
          <PageTitle>Pacientes</PageTitle>
          <PageDescription>
            Gerencie os pacientes da sua clínica
          </PageDescription>
        </PageHeaderContent>

        <PageActions>
          <DatePicker />
        </PageActions>
      </PageHeader>

      <PageContent>
        <div>oi</div>
      </PageContent>
    </PageContainer>
  );
};

export default DashboardPage;
