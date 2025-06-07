"use server";

import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { z } from "zod";

import { db } from "@/db";
import { appointmentsTable, doctorsTable } from "@/db/schema";
import { generateTimeSlots } from "@/helpers/time";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/safe-action";

dayjs.extend(utc);
dayjs.extend(timezone);

export const getAvailableTimes = actionClient
  .schema(
    z.object({
      doctorId: z.string(),
      date: z.date(),
    }),
  )
  .action(async ({ parsedInput }) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      throw new Error("Unauthorized");
    }
    if (!session?.user?.clinic) {
      throw new Error("Clinic not found");
    }

    // verificar se o médico tem diponibilidade para o dia
    const selectedDayOfWeek = dayjs(parsedInput.date).day();

    const doctor = await db.query.doctorsTable.findFirst({
      where: eq(doctorsTable.id, parsedInput.doctorId),
    });

    if (!doctor) {
      throw new Error("Doctor not found");
    }

    const doctorIsAvailable =
      selectedDayOfWeek >= doctor.availableFromWeekday &&
      selectedDayOfWeek <= doctor.availableToWeekday;

    if (!doctorIsAvailable) {
      return [];
    }

    // verificar se o médico tem agendamentos para o dia
    const appointments = await db.query.appointmentsTable.findMany({
      where: eq(appointmentsTable.doctorId, parsedInput.doctorId),
    });

    // verificar se o médico tem agendamentos para o dia
    const appointmentsOnSelectedDay = appointments
      .filter((appointment) => {
        return dayjs(appointment.date).isSame(parsedInput.date, "day");
      })
      .map((appointment) => dayjs(appointment.date).format("HH:mm:ss"));

    const timeSlots = generateTimeSlots();

    const doctorAvailableFrom = dayjs
      .utc()
      .set("hour", parseInt(doctor.availableFromTime.split(":")[0]))
      .set("minute", parseInt(doctor.availableFromTime.split(":")[1]))
      .set("second", 0)
      .local();

    const doctorAvailableTo = dayjs
      .utc()
      .set("hour", parseInt(doctor.availableToTime.split(":")[0]))
      .set("minute", parseInt(doctor.availableToTime.split(":")[1]))
      .set("second", 0)
      .local();

    const doctorTimeSlots = timeSlots.filter((time) => {
      const timeAsDate = dayjs
        .utc()
        .set("hour", parseInt(time.split(":")[0]))
        .set("minute", parseInt(time.split(":")[1]))
        .set("second", 0);

      return (
        timeAsDate.format("HH:mm:ss") >=
          doctorAvailableFrom.format("HH:mm:ss") &&
        timeAsDate.format("HH:mm:ss") <= doctorAvailableTo.format("HH:mm:ss")
      );
    });

    return doctorTimeSlots.map((time) => {
      return {
        value: time,
        isAvailable: !appointmentsOnSelectedDay.includes(time),
      };
    });
  });
