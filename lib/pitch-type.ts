import type { PitchType } from "@/generated/prisma/client";

export const PITCH_TYPE_LABELS: Record<PitchType, string> = {
  FIVE_A_SIDE: "5-a-side",
  SIX_A_SIDE: "6-a-side",
  SEVEN_A_SIDE: "7-a-side",
  EIGHT_A_SIDE: "8-a-side",
  NINE_A_SIDE: "9-a-side",
  TEN_A_SIDE: "10-a-side",
  ELEVEN_A_SIDE: "11-a-side",
};

export const PITCH_TYPE_OPTIONS: PitchType[] = [
  "FIVE_A_SIDE",
  "SIX_A_SIDE",
  "SEVEN_A_SIDE",
  "EIGHT_A_SIDE",
  "NINE_A_SIDE",
  "TEN_A_SIDE",
  "ELEVEN_A_SIDE",
];
