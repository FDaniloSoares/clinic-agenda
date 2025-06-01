"use server";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

import { db } from "@/db";
import { doctorsTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/safe-action";

import { upsertDoctorSchema } from "./schema";

dayjs.extend(utc);

export const upsertDoctor = actionClient
  .schema(upsertDoctorSchema)
  .action(async ({ parsedInput: data }) => {
    const availableFromTimeUTC = dayjs()
      .set("hour", parseInt(data.availableFromTime.split(":")[0]))
      .set("minute", parseInt(data.availableFromTime.split(":")[1]))
      .set("second", parseInt(data.availableFromTime.split(":")[2]))
      .utc();

    const availableToTimeUTC = dayjs()
      .set("hour", parseInt(data.availableToTime.split(":")[0]))
      .set("minute", parseInt(data.availableToTime.split(":")[1]))
      .set("second", parseInt(data.availableToTime.split(":")[2]))
      .utc();

    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error("Unauthorized");
    }

    if (!session.user.clinic) {
      throw new Error("Clinic not found");
    }

    await db
      .insert(doctorsTable)
      .values({
        ...data,
        id: data.id,
        clinicId: session?.user.clinic?.id,
        availableFromTime: availableFromTimeUTC.format("HH:mm:ss"),
        availableToTime: availableToTimeUTC.format("HH:mm:ss"),
      })
      .onConflictDoUpdate({
        target: [doctorsTable.id],
        set: {
          ...data,
          availableFromTime: availableFromTimeUTC.format("HH:mm:ss"),
          availableToTime: availableToTimeUTC.format("HH:mm:ss"),
        },
      });
    revalidatePath("/doctors");
  });
