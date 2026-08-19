import { z } from "zod";
import { extendPastMidnight } from "../time";

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
  .refine((data) => data.openTime !== data.closeTime, {
    message: "Opening and closing time can't be the same.",
    path: ["closeTime"],
  })
  .transform((data) => {
    // A close time at or before the open time means the pitch closes after
    // midnight (e.g. opens 10:00, closes 04:00 the next morning) — store it
    // in extended ">24:00" notation (see lib/time.ts) so every downstream
    // time comparison can keep treating the operating window as one
    // ordinary, non-wrapping range instead of needing day-wrap-aware logic.
    if (data.closeTime <= data.openTime) {
      return { ...data, closeTime: extendPastMidnight(data.closeTime) };
    }
    return data;
  });

export type PitchFormValues = z.infer<typeof pitchFormSchema>;

export function parsePitchForm(formData: FormData) {
  const raw = Object.fromEntries(formData.entries());
  return pitchFormSchema.safeParse(raw);
}

export function firstZodError(error: z.ZodError): string {
  return error.issues[0]?.message ?? "Please check the form and try again.";
}
