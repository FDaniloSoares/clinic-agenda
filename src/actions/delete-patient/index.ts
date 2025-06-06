"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { pacientsTable } from "@/db/schema";

export async function deletePatient(id: string) {
  try {
    await db.delete(pacientsTable).where(eq(pacientsTable.id, id));
    revalidatePath("/patients");
    return { error: null };
  } catch (error) {
    console.error("Error deleting patient:", error);
    return { error: "Erro ao excluir paciente." };
  }
}
