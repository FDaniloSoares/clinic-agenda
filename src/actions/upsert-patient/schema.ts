import { z } from "zod";

export const schema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1, "Nome é obrigatório"),
  email: z.string().email("Email inválido"),
  phoneNumber: z.string().min(1, "Número de telefone é obrigatório"),
  sex: z.enum(["male", "female", "other"], {
    required_error: "Sexo é obrigatório",
  }),
});

export type Schema = z.infer<typeof schema>;
