import type { PitchType } from "@/generated/prisma/client";

export const PITCH_TYPE_LABELS: Record<PitchType, string> = {
  FIVE_A_SIDE: "5-a-side",
  SEVEN_A_SIDE: "7-a-side",
  ELEVEN_A_SIDE: "11-a-side",
};

export const PITCH_TYPE_OPTIONS: PitchType[] = ["FIVE_A_SIDE", "SEVEN_A_SIDE", "ELEVEN_A_SIDE"];
