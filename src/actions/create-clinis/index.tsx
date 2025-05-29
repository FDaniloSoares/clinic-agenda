"use server";

import { headers } from "next/headers";

import { db } from "@/db";
import { clinicsTable, UserToClinicTable } from "@/db/schema";
import { auth } from "@/lib/auth";

export async function createClinic(name: string) {
  // verficar se usuario esta autenticado
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Usuário não autenticado");
  }

  const [clinic] = await db.insert(clinicsTable).values({ name }).returning();

  await db.insert(UserToClinicTable).values({
    userId: session.user.id,
    clinicId: clinic.id,
  });
}
