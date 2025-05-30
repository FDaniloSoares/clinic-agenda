import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";

import SignOutButton from "./_components/sign-out-button";

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
    <div className="flex flex-col gap-4">
      <h1>Dashboard</h1>
      <p>{session?.user?.name}</p>
      <p>{session?.user?.email}</p>
      <SignOutButton />
    </div>
  );
};

export default DashboardPage;
