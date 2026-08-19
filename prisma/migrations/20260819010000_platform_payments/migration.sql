-- The platform's own monthly listing fee an owner pays TurfAura, tracked
-- separately from booking cash revenue (see lib/platform-fee.ts for the
-- tiered pricing this records).
CREATE TABLE "PlatformPayment" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'GMD',
    "paid" BOOLEAN NOT NULL DEFAULT false,
    "paidAt" TIMESTAMP(3),
    "markedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlatformPayment_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "PlatformPayment_ownerId_year_month_key" ON "PlatformPayment"("ownerId", "year", "month");

CREATE INDEX "PlatformPayment_ownerId_idx" ON "PlatformPayment"("ownerId");

ALTER TABLE "PlatformPayment" ADD CONSTRAINT "PlatformPayment_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "Owner"("id") ON DELETE CASCADE ON UPDATE CASCADE;
