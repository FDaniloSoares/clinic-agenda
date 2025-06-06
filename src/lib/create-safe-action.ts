import { createSafeActionClient } from "next-safe-action";
import { z } from "zod";

export class ActionError extends Error {}

export const createSafeAction = <TInput, TOutput>(
  schema: z.Schema<TInput>,
  handler: (validatedData: TInput) => Promise<TOutput>,
) => {
  const safeAction = createSafeActionClient();

  return safeAction(async (data: TInput) => {
    const validationResult = await schema.safeParseAsync(data);

    if (!validationResult.success) {
      throw new ActionError(
        "Validation failed: " + JSON.stringify(validationResult.error),
      );
    }

    return handler(validationResult.data);
  });
};
