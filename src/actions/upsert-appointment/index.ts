"use server";

import { headers } from "next/headers";
import { z } from "zod";

import { db } from "@/db";
import { appointmentsTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/safe-action";

const schema = z.object({
  patientId: z.string({
    required_error: "Selecione um paciente",
  }),
  doctorId: z.string({
    required_error: "Selecione um médico",
  }),
  appointmentPriceInCents: z.number({
    required_error: "Informe o valor da consulta",
  }),
  date: z.date({
    required_error: "Selecione uma data",
  }),
});

export const upsertAppointment = actionClient
  .schema(schema)
  .action(async ({ parsedInput: data }) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error("Unauthorized");
    }

    if (!session?.user?.clinic) {
      throw new Error("No clinic selected");
    }

    const appointment = await db
      .insert(appointmentsTable)
      .values({
        clinicId: session.user.clinic.id,
        patientId: data.patientId,
        doctorId: data.doctorId,
        date: data.date,
      })
      .returning();

    return {
      appointment: appointment[0],
    };
  });
