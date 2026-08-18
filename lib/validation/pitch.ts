import { z } from "zod";

export const pitchFormSchema = z
  .object({
    name: z.string().trim().min(2, "Name is required."),
    description: z.string().trim().optional(),
    address: z.string().trim().min(2, "Address is required."),
    area: z.string().trim().min(1, "Area/neighbourhood is required."),
    type: z.enum(["FIVE_A_SIDE", "SEVEN_A_SIDE", "ELEVEN_A_SIDE"]),
    lat: z.coerce.number().min(-90, "Latitude must be between -90 and 90.").max(90),
    lng: z.coerce.number().min(-180, "Longitude must be between -180 and 180.").max(180),
    basePricePerHour: z.coerce.number().positive("Price must be greater than 0."),
    currency: z
      .string()
      .trim()
      .toUpperCase()
      .length(3, "Use a 3-letter currency code, e.g. GMD.")
      .default("GMD"),
    slotDurationMinutes: z.coerce.number().int().positive(),
    openTime: z.string().regex(/^\d{2}:\d{2}$/, "Use HH:mm."),
    closeTime: z.string().regex(/^\d{2}:\d{2}$/, "Use HH:mm."),
  })
  .refine((data) => data.openTime < data.closeTime, {
    message: "Opening time must be before closing time.",
    path: ["closeTime"],
  });

export type PitchFormValues = z.infer<typeof pitchFormSchema>;

export function parsePitchForm(formData: FormData) {
  const raw = Object.fromEntries(formData.entries());
  return pitchFormSchema.safeParse(raw);
}

export function firstZodError(error: z.ZodError): string {
  return error.issues[0]?.message ?? "Please check the form and try again.";
}
