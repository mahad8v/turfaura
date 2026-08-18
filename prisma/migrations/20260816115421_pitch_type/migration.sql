-- CreateEnum
CREATE TYPE "PitchType" AS ENUM ('FIVE_A_SIDE', 'SEVEN_A_SIDE', 'ELEVEN_A_SIDE');

-- AlterTable
ALTER TABLE "Pitch" ADD COLUMN     "type" "PitchType" NOT NULL DEFAULT 'FIVE_A_SIDE';
