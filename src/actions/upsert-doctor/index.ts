"use server";
import { headers } from "next/headers";

import { db } from "@/db";
import { doctorsTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/safe-action";

import { upsertDoctorSchema } from "./schema";

export const upsertDoctor = actionClient
  .schema(upsertDoctorSchema)
  .action(async ({ parsedInput: data }) => {
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
        id: data.id,
        ...data,
        clinicId: session?.user.clinic?.id,
      })
      .onConflictDoUpdate({
        target: [doctorsTable.id],
        set: {
          ...data,
        },
      });
  });
