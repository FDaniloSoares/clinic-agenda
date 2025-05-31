import { z } from "zod";

export const upsertDoctorSchema = z
  .object({
    id: z.string().uuid().optional(),
    name: z.string().trim().min(1, {
      message: "Nome é obrigatório",
    }),
    speciality: z
      .string()
      .trim()
      .min(1, { message: "Especialidade é obrigatória" }),
    appointmentPriceInCents: z.number().min(1, {
      message: "Preço da consulta é obrigatório",
    }),
    availableFromWeekday: z.number().min(0).max(6),
    availableToWeekday: z.number().min(0).max(6),
    availableFromTime: z.string().min(1, {
      message: "Hora de início é obrigatório",
    }),
    availableToTime: z.string().min(1, {
      message: "Hora de término é obrigatório",
    }),
  })
  .refine(
    (data) => {
      if (data.availableFromTime < data.availableToTime) {
        return true;
      }
      return false;
    },
    {
      message: "O horário final deve ser posterior ao horário de início",
      path: ["availableToTime"],
    },
  );
