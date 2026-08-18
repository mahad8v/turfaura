-- Removes the Wave payment/deposit/refund model entirely in favor of a
-- cash-after-play flow: customers book a slot, the owner WhatsApps them to
-- confirm, then approves it (or it auto-expires if they never respond).
--
-- Booking rows are pre-production seed/demo data — truncate rather than try
-- to migrate them column-by-column across an incompatible status enum.
TRUNCATE TABLE "Booking";

-- Drop the old overlap-exclusion constraint first: it references
-- Booking.status by value, and its WHERE clause needs to change to match
-- the new enum below.
ALTER TABLE "Booking" DROP CONSTRAINT IF EXISTS "no_overlapping_active_bookings";

-- Refund tracking no longer applies (nothing is collected up front to refund).
DROP TABLE IF EXISTS "RefundTier";
DROP TABLE IF EXISTS "RefundRule";

-- Deposits and Wave payment links are gone from pitches.
ALTER TABLE "Pitch" DROP COLUMN "depositType";
ALTER TABLE "Pitch" DROP COLUMN "depositValue";
ALTER TABLE "Pitch" DROP COLUMN "wavePaymentLink";
ALTER TABLE "Pitch" DROP COLUMN "wavePhoneNumber";

-- Wave defaults are gone from owners.
ALTER TABLE "Owner" DROP COLUMN "defaultWavePaymentLink";
ALTER TABLE "Owner" DROP COLUMN "defaultWavePhoneNumber";

-- Payment/refund tracking columns are gone from bookings; the hold-until
-- column is repurposed as the owner-approval deadline, and approval tracking
-- replaces payment-confirmation tracking.
ALTER TABLE "Booking" DROP COLUMN "depositAmount";
ALTER TABLE "Booking" DROP COLUMN "paymentProvider";
ALTER TABLE "Booking" DROP COLUMN "paymentReference";
ALTER TABLE "Booking" DROP COLUMN "paymentSubmittedAt";
ALTER TABLE "Booking" DROP COLUMN "paymentConfirmedAt";
ALTER TABLE "Booking" DROP COLUMN "paymentConfirmedBy";
ALTER TABLE "Booking" DROP COLUMN "refundStatus";
ALTER TABLE "Booking" DROP COLUMN "refundPercent";
ALTER TABLE "Booking" DROP COLUMN "refundAmount";
ALTER TABLE "Booking" DROP COLUMN "refundRequestedAt";
ALTER TABLE "Booking" DROP COLUMN "refundProcessedAt";
ALTER TABLE "Booking" DROP COLUMN "refundNote";
ALTER TABLE "Booking" RENAME COLUMN "holdExpiresAt" TO "expiresAt";
ALTER TABLE "Booking" ADD COLUMN "approvedAt" TIMESTAMP(3);
ALTER TABLE "Booking" ADD COLUMN "approvedBy" TEXT;

-- Replace BookingStatus with the smaller cash-booking set of values. The
-- table was just truncated above, so there's no existing data to remap.
ALTER TABLE "Booking" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Booking" ALTER COLUMN "status" TYPE TEXT USING "status"::TEXT;
DROP TYPE "BookingStatus";
CREATE TYPE "BookingStatus" AS ENUM ('PENDING', 'CONFIRMED', 'CANCELLED', 'EXPIRED');
ALTER TABLE "Booking" ALTER COLUMN "status" TYPE "BookingStatus" USING "status"::"BookingStatus";
ALTER TABLE "Booking" ALTER COLUMN "status" SET DEFAULT 'PENDING';

-- Now-unused enums.
DROP TYPE IF EXISTS "RefundStatus";
DROP TYPE IF EXISTS "PaymentProviderKind";
DROP TYPE IF EXISTS "DepositType";

-- Recreate the overlap-exclusion constraint against the new active statuses.
CREATE EXTENSION IF NOT EXISTS btree_gist;
ALTER TABLE "Booking" ADD CONSTRAINT "no_overlapping_active_bookings"
EXCLUDE USING gist (
  "pitchId" WITH =,
  "date" WITH =,
  int4range(
    (substring("startTime" from 1 for 2)::int * 60 + substring("startTime" from 4 for 2)::int),
    (substring("endTime" from 1 for 2)::int * 60 + substring("endTime" from 4 for 2)::int)
  ) WITH &&
) WHERE ("status" IN ('PENDING', 'CONFIRMED'));
