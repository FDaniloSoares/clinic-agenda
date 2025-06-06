"use server";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

import { db } from "@/db";
import { pacientsTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/safe-action";

import { schema } from "./schema";

export const upsertPatient = actionClient
  .schema(schema)
  .action(async ({ parsedInput: input }) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.clinic?.id) {
      throw new Error(
        "Você precisa estar logado e ter uma clínica selecionada",
      );
    }

    const { id, ...data } = input;

    if (id) {
      const patient = await db.query.pacientsTable.findFirst({
        where: eq(pacientsTable.id, id),
      });

      if (!patient) {
        throw new Error("Paciente não encontrado");
      }

      if (patient.clinicId !== session.user.clinic.id) {
        throw new Error("Você não tem permissão para editar este paciente");
      }

      await db
        .update(pacientsTable)
        .set({
          ...data,
          updatedAt: new Date(),
        })
        .where(eq(pacientsTable.id, id));

      revalidatePath("/patients");
      return { message: "Paciente atualizado com sucesso" };
    }

    await db.insert(pacientsTable).values({
      ...data,
      clinicId: session.user.clinic.id,
    });

    revalidatePath("/patients");
    return { message: "Paciente criado com sucesso" };
  });
