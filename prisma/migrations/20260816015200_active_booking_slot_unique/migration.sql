-- Prevent two active bookings (held, awaiting confirmation, or confirmed) from
-- occupying the same pitch/date/start-time, at the database level. A plain
-- Prisma @@unique can't express "unique only among these statuses", so this
-- is a hand-written partial index rather than something schema.prisma models.
CREATE UNIQUE INDEX "uniq_active_booking_slot"
ON "Booking" ("pitchId", "date", "startTime")
WHERE "status" IN ('PENDING_PAYMENT', 'AWAITING_CONFIRMATION', 'CONFIRMED');
