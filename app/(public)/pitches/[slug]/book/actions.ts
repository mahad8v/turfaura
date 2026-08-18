"use server";

import { redirect } from "next/navigation";
import { createBookingWithHold } from "@/lib/booking";

export interface BookingFormState {
  error?: string;
}

const ERROR_MESSAGES: Record<string, string> = {
  SLOT_TAKEN: "Sorry, that slot was just taken. Please pick another time.",
  PITCH_NOT_FOUND: "This pitch is no longer available.",
  SLOT_OUT_OF_RANGE: "That time isn't available for this pitch.",
};

export async function createBooking(
  pitchId: string,
  date: string,
  startTime: string,
  durationMinutes: number,
  _prevState: BookingFormState | null,
  formData: FormData,
): Promise<BookingFormState> {
  const customerName = String(formData.get("customerName") ?? "").trim();
  const customerPhone = String(formData.get("customerPhone") ?? "").trim();

  if (!customerName) return { error: "Name is required." };
  if (!customerPhone) return { error: "Phone number is required." };

  const result = await createBookingWithHold({
    pitchId,
    date,
    startTime,
    durationMinutes,
    customerName,
    customerPhone,
  });
  if (!result.ok) {
    return { error: ERROR_MESSAGES[result.error] ?? "Could not create the booking." };
  }

  redirect(`/receipt/${result.reference}`);
}
