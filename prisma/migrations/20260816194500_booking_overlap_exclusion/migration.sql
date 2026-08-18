-- Bookings can now span more than one slot (e.g. a 2-hour booking), so two
-- DIFFERENT start times can still overlap in time (a 2-hour booking at 14:00
-- and a 1-hour booking at 15:00 both pass the old "exact startTime" check
-- but genuinely conflict). Replace the exact-match unique index with a real
-- range-overlap exclusion constraint, which catches every overlap regardless
-- of start time.
--
-- startTime/endTime are "HH:mm" text (validated at the app layer), parsed
-- here via substring + int cast rather than a ::time cast — Postgres won't
-- allow ::time in an index/constraint expression ("must be marked
-- IMMUTABLE"), but substring + integer casting are both immutable.
DROP INDEX IF EXISTS "uniq_active_booking_slot";

CREATE EXTENSION IF NOT EXISTS btree_gist;

ALTER TABLE "Booking" ADD CONSTRAINT "no_overlapping_active_bookings"
EXCLUDE USING gist (
  "pitchId" WITH =,
  "date" WITH =,
  int4range(
    (substring("startTime" from 1 for 2)::int * 60 + substring("startTime" from 4 for 2)::int),
    (substring("endTime" from 1 for 2)::int * 60 + substring("endTime" from 4 for 2)::int)
  ) WITH &&
) WHERE ("status" IN ('PENDING_PAYMENT', 'AWAITING_CONFIRMATION', 'CONFIRMED'));
