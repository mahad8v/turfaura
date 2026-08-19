-- Turf hours here typically run 10am to 4am the next morning. Support for a
-- close time past midnight is now real (see lib/time.ts's extended >24:00
-- notation), so the default reflects it — only affects new pitches created
-- without explicit hours; existing rows are untouched.
ALTER TABLE "Pitch" ALTER COLUMN "openTime" SET DEFAULT '10:00';
ALTER TABLE "Pitch" ALTER COLUMN "closeTime" SET DEFAULT '28:00';
