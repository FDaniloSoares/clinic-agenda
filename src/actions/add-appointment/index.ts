"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { z } from "zod";

import { db } from "@/db";
import { appointmentsTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/safe-action";

import { getAvailableTimes } from "../get-available-times";

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
  horario: z.string({
    required_error: "Selecione um horário",
  }),
});

export const addAppointment = actionClient
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

    const availableTimes = await getAvailableTimes({
      doctorId: data.doctorId,
      date: data.date,
    });

    const isTimeAvailable = availableTimes?.data?.some(
      (time) => time.value === data.horario && time.isAvailable,
    );

    if (!isTimeAvailable) {
      throw new Error("Horário indisponível");
    }

    // Combine date and time
    const [hours, minutes] = data.horario.split(":");
    const appointmentDate = new Date(data.date);
    appointmentDate.setHours(parseInt(hours, 10));
    appointmentDate.setMinutes(parseInt(minutes, 10));
    appointmentDate.setSeconds(0);
    appointmentDate.setMilliseconds(0);

    const appointment = await db
      .insert(appointmentsTable)
      .values({
        clinicId: session.user.clinic.id,
        patientId: data.patientId,
        doctorId: data.doctorId,
        appointmentPriceInCents: data.appointmentPriceInCents,
        date: appointmentDate,
      })
      .returning();

    revalidatePath("/appointments");
    revalidatePath("/dashboard");
    return {
      appointment: appointment[0],
    };
  });
