-- Lets an owner pick which of their pitches the dashboard is scoped to,
-- switched from Settings and persisted on the account.
ALTER TABLE "Owner" ADD COLUMN "activePitchId" TEXT;
